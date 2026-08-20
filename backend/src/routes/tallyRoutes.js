const express = require('express');
const axios = require('axios');
const { adaptDashboardTemplates } = require('../services/tallyDashboardAdapters');
const { adaptOutstanding } = require('../services/tallyOutstandingAdapters');
const { adaptCashBank } = require('../services/tallyCashBankAdapters');

const router = express.Router();

const DASHBOARD_TEMPLATE_IDS = [1, 5, 10, 11, 13, 14, 23, 30];
const OUTSTANDING_TEMPLATE_IDS = [3, 7, 32, 37, 41, 42];
const CASH_BANK_TEMPLATE_IDS = [17, 27, 38];
const AUTH_REFRESH_BUFFER_MS = 60 * 1000;
const TEMPLATE_CACHE_TTL_MS = 2 * 60 * 1000;

let cachedAuth = null;
let authRequest = null;
const templateCache = new Map();
const templateRequests = new Map();

const unwrapWebhookResponse = (payload) => {
  if (payload && typeof payload === 'object' && payload.body && typeof payload.body === 'object') {
    return payload.body;
  }
  return payload;
};

const getWebhookConfig = () => {
  const webhookUrl = process.env.TALLY_TOKEN_WEBHOOK_URL;
  const tokenKey = process.env.TALLY_TOKEN_KEY;

  if (!webhookUrl || !tokenKey) {
    throw new Error('Tally webhook is not configured. Set TALLY_TOKEN_WEBHOOK_URL and TALLY_TOKEN_KEY in backend/.env.');
  }

  return { webhookUrl, tokenKey };
};

const getTallyAuth = async () => {
  const expiresAt = cachedAuth?.expiresAt || 0;
  if (cachedAuth?.accessToken && cachedAuth?.agentId && Date.now() < expiresAt - AUTH_REFRESH_BUFFER_MS) {
    return cachedAuth;
  }
  if (authRequest) return authRequest;

  authRequest = (async () => {
  const { webhookUrl, tokenKey } = getWebhookConfig();
  const response = await axios.post(
    webhookUrl,
    {},
    {
      params: { key: tokenKey },
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    },
  );

  const result = unwrapWebhookResponse(response.data);

  if (!result?.accessToken || !result?.agentId) {
    throw new Error('Tally webhook did not return an accessToken and agentId.');
  }

    // The Pucho token is a JWT. Its expiry is only used on the server to avoid
    // sending a webhook request for every page load.
    const [, encodedPayload] = result.accessToken.split('.');
    const payload = encodedPayload ? JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) : {};
    cachedAuth = { ...result, expiresAt: Number(payload.exp || 0) * 1000 };
    return cachedAuth;
  })();

  try {
    return await authRequest;
  } finally {
    authRequest = null;
  }
};

const executeTemplate = async (templateNo, auth) => {
  const cached = templateCache.get(templateNo);
  if (cached && Date.now() < cached.expiresAt) return cached.data;
  if (templateRequests.has(templateNo)) return templateRequests.get(templateNo);

  const request = axios.post(
    'https://core-api.pucho.ai/fapi/v1/pucho_piece/execute_tally_template_v3',
    { templateNo, agentId: auth.agentId, type: 'OS_RUN' },
    {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      timeout: 30000,
    },
  ).then((response) => {
      if (response.data?.status !== 'success') {
        throw new Error(response.data?.message || `Tally template ${templateNo} did not succeed.`);
      }
      templateCache.set(templateNo, { data: response.data, expiresAt: Date.now() + TEMPLATE_CACHE_TTL_MS });
      return response.data;
    });
  templateRequests.set(templateNo, request);

  try {
    return await request;
  } finally {
    templateRequests.delete(templateNo);
  }
};

// Dashboard-only gateway. The browser never receives the webhook key or a Pucho bearer token.
router.post('/dashboard/templates', async (req, res) => {
  const requestedIds = req.body?.templateNos || DASHBOARD_TEMPLATE_IDS;
  const templateNos = [...new Set(requestedIds.map(Number))];

  if (!templateNos.length || templateNos.some((id) => !DASHBOARD_TEMPLATE_IDS.includes(id))) {
    return res.status(400).json({
      success: false,
      error: `Only Dashboard templates are permitted: ${DASHBOARD_TEMPLATE_IDS.join(', ')}.`,
    });
  }

  let auth;
  try {
    auth = await getTallyAuth();
  } catch (error) {
    return res.status(502).json({ success: false, error: error.message });
  }

  const results = await Promise.allSettled(templateNos.map((templateNo) => executeTemplate(templateNo, auth)));
  const templates = Object.fromEntries(results.map((result, index) => {
    const templateNo = templateNos[index];
    return [templateNo, result.status === 'fulfilled'
      ? { status: 'success', data: result.value }
      : { status: 'error', error: result.reason?.message || 'Tally template request failed.' }];
  }));

  const successfulTemplates = Object.fromEntries(
    Object.entries(templates)
      .filter(([, result]) => result.status === 'success')
      .map(([templateNo, result]) => [templateNo, result.data]),
  );

  res.json({
    success: true,
    data: {
      templates,
      dashboard: adaptDashboardTemplates(successfulTemplates),
    },
  });
});

router.post('/outstanding/templates', async (req, res) => {
  let auth;
  try {
    auth = await getTallyAuth();
  } catch (error) {
    return res.status(502).json({ success: false, error: error.message });
  }

  const results = await Promise.allSettled(OUTSTANDING_TEMPLATE_IDS.map((templateNo) => executeTemplate(templateNo, auth)));
  const templates = Object.fromEntries(results.map((result, index) => {
    const templateNo = OUTSTANDING_TEMPLATE_IDS[index];
    return [templateNo, result.status === 'fulfilled'
      ? { status: 'success', data: result.value }
      : { status: 'error', error: result.reason?.message || 'Tally template request failed.' }];
  }));
  const successfulTemplates = Object.fromEntries(
    Object.entries(templates).filter(([, result]) => result.status === 'success').map(([templateNo, result]) => [templateNo, result.data]),
  );
  res.json({ success: true, data: { templates, outstanding: adaptOutstanding(successfulTemplates) } });
});

router.post('/cash-bank/templates', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const results = await Promise.allSettled(CASH_BANK_TEMPLATE_IDS.map((templateNo) => executeTemplate(templateNo, auth)));
    const templates = Object.fromEntries(results.map((result, index) => {
      const templateNo = CASH_BANK_TEMPLATE_IDS[index];
      return [templateNo, result.status === 'fulfilled' ? { status: 'success', data: result.value } : { status: 'error', error: result.reason?.message || 'Tally template request failed.' }];
    }));
    const successfulTemplates = Object.fromEntries(Object.entries(templates).filter(([, result]) => result.status === 'success').map(([templateNo, result]) => [templateNo, result.data]));
    res.json({ success: true, data: { templates, cashBank: adaptCashBank(successfulTemplates) } });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

router.post('/payment-vouchers/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const result = await executeTemplate(8, auth);
    const vouchers = (result.content || []).map((row, index) => ({
      id: `tally-payment-${index}-${row.voucher_number || ''}`,
      voucherNo: row.voucher_number,
      date: row.voucher_date,
      partyName: row.ledger_name,
      amount: Math.abs(Number.parseFloat(row.amount) || 0),
      status: 'PAID',
    }));
    res.json({ success: true, data: { vouchers } });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

router.post('/pending-sales/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const result = await executeTemplate(20, auth);
    const orders = (result.content || []).map((row, index) => ({
      id: `tally-sales-order-${index}-${row.order_number || ''}`,
      number: row.order_number,
      date: row.voucher_date,
      party: row.party_name,
      amount: Number.parseFloat(row.amount) || 0,
      status: row.dispatch_status || 'Pending',
      dueDate: row.due_date,
      items: row.items,
      orderedQty: Number.parseFloat(row.ordered_qty) || 0,
      dispatchedQty: Number.parseFloat(row.dispatched_qty) || 0,
      pendingQty: Number.parseFloat(row.pending_qty) || 0,
    }));
    res.json({ success: true, data: { orders } });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

router.post('/trends/templates', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const [sales, purchases] = await Promise.all([executeTemplate(39, auth), executeTemplate(40, auth)]);
    res.json({ success: true, data: { sales: sales.content || [], purchases: purchases.content || [] } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/gst-liability/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const result = await executeTemplate(25, auth);
    const taxes = (result.content || []).map((row) => ({ name: row.ledger_name, balance: Number.parseFloat(row.net_tax_liability) || 0, inwardItc: Number.parseFloat(row.inward_itc) || 0, outwardTax: Number.parseFloat(row.outward_tax) || 0 }));
    res.json({ success: true, data: { taxes } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/stock-batches/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const result = await executeTemplate(22, auth);
    // Template 22 can contain tens of thousands of movement rows. Bound the
    // response so the report stays responsive while still rendering live data.
    res.json({ success: true, data: { batches: (result.content || []).slice(0, 2000) } });
  }
  catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/parties/templates', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const [customers, vendors, missing] = await Promise.all([executeTemplate(19, auth), executeTemplate(26, auth), executeTemplate(16, auth)]);
    const mapParty = (row, type, index) => ({ id: `tally-party-${type}-${index}`, name: row.customer_name || row.ledger_name, type, gstin: row.gstin, address: row.address, mobile: row.mobile, email: row.email, balance: Number.parseFloat(row.ledger_balance) || 0 });
    res.json({ success: true, data: { parties: [...(customers.content || []).map((row, index) => mapParty(row, 'Customer', index)), ...(vendors.content || []).map((row, index) => mapParty(row, 'Supplier', index))], missingFields: missing.content || [] } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

module.exports = router;
