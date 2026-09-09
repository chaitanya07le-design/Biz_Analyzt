const express = require('express');
const axios = require('axios');
const { adaptDashboardTemplates } = require('../services/tallyDashboardAdapters');
const { adaptOutstanding } = require('../services/tallyOutstandingAdapters');
const { adaptCashBank } = require('../services/tallyCashBankAdapters');

const router = express.Router();

const DASHBOARD_TEMPLATE_IDS = [1, 5, 10, 11, 13, 14, 23, 30];
const OUTSTANDING_TEMPLATE_IDS = [2, 3, 4, 7, 32, 34, 35, 37, 41, 42];
const CASH_BANK_TEMPLATE_IDS = [17, 27, 38, 50, 84];
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

const executeTemplate = async (templateNo, auth, variables = {}) => {
  const cacheKey = `${templateNo}:${JSON.stringify(variables || {})}`;
  const cached = templateCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.data;
  if (templateRequests.has(cacheKey)) return templateRequests.get(cacheKey);

  const request = axios.post(
    'https://core-api.pucho.ai/fapi/v1/pucho_piece/execute_tally_template_v3',
    { templateNo, agentId: auth.agentId, type: 'OS_RUN', variables },
    {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      timeout: 30000,
    },
  ).then((response) => {
      if (response.data?.status !== 'success') {
        throw new Error(response.data?.message || `Tally template ${templateNo} did not succeed.`);
      }
      templateCache.set(cacheKey, { data: response.data, expiresAt: Date.now() + TEMPLATE_CACHE_TTL_MS });
      return response.data;
    });
  templateRequests.set(cacheKey, request);

  try {
    return await request;
  } finally {
    templateRequests.delete(cacheKey);
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

router.post('/sales-vouchers/templates', async (req, res) => {
  try {
    const auth = await getTallyAuth();

    // Fetch T51 (line items, PartyID, narration) and T23 (HSN, CGST/SGST/IGST, GSTIN) concurrently
    // T51 needs a broad date range to get all vouchers
    const [t51Result, t23Result] = await Promise.all([
      executeTemplate(51, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' }),
      executeTemplate(23, auth),
    ]);

    const t51Rows = t51Result.content || [];
    const t23Rows = t23Result.content || [];

    // Build T23 lookup map keyed by invoice_number for O(1) join
    const t23Map = {};
    t23Rows.forEach((row) => {
      const key = (row.invoice_number || '').trim();
      if (key) t23Map[key] = row;
    });

    // Group T51 rows by voucher_number — each voucher has multiple line item rows
    const voucherMap = new Map();
    t51Rows.forEach((row, index) => {
      const voucherNo = (row.voucher_number || `tally-sales-${index}`).trim();
      if (!voucherMap.has(voucherNo)) {
        // First row for this voucher — build the header
        const t23 = t23Map[voucherNo] || {};
        voucherMap.set(voucherNo, {
          id: `tally-sales-${voucherMap.size}`,
          voucherNo,
          date: row.voucher_date || null,
          party: row.party_name || '—',
          partyId: row.party_id || null,
          amount: Number.parseFloat(row.net_amount_inr || row.gross_total_inr || 0) || 0,
          grossTotal: Number.parseFloat(row.gross_total_inr || 0) || 0,
          totalGst: Number.parseFloat(row.total_gst_inr || 0) || 0,
          roundOff: Number.parseFloat(row.round_off_inr || 0) || 0,
          status: row.is_cancelled_flag === 1 ? 'CANCELLED' : 'POSTED',
          narration: row.narration || '',
          referenceNumber: row.reference_number || '',
          salesPerson: row.sales_person || null,
          // From T23: GST breakdown + GSTIN + HSN
          gstin: t23.gstin || null,
          hsnCode: t23.hsn_sac_code || null,
          placeOfSupply: t23.place_of_supply || null,
          taxableAmount: Number.parseFloat(t23.taxable_amount || row.gross_total_inr || 0) || 0,
          cgst: Number.parseFloat(t23.cgst_amount || 0) || 0,
          sgst: Number.parseFloat(t23.sgst_amount || 0) || 0,
          igst: Number.parseFloat(t23.igst_amount || 0) || 0,
          cess: Number.parseFloat(t23.cess_amount || 0) || 0,
          period: t23.period || null,
          // Line items array — will be populated below
          lineItems: [],
        });
      }

      // Push line item into the voucher
      const voucher = voucherMap.get(voucherNo);
      if (row.item_name) {
        voucher.lineItems.push({
          itemId: row.item_id || null,
          itemName: row.item_name || '—',
          unit: row.unit || '—',
          quantity: Number.parseFloat(row.quantity || 0) || 0,
          rate: Number.parseFloat(row.rate_per_unit || 0) || 0,
          amount: Number.parseFloat(row.amount_inr || 0) || 0,
          gstRate: Number.parseFloat(row.gst_rate_percent || 0) || 0,
          gstAmount: Number.parseFloat(row.gst_amount_inr || 0) || 0,
          ledgerName: row.ledger_name || null,
        });
      }
    });

    const vouchers = [...voucherMap.values()].map((v) => ({
      ...v,
      items: v.lineItems.length, // count of line items
    }));

    res.json({ success: true, data: { vouchers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});


router.post('/purchase-vouchers/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const result = await executeTemplate(24, auth);
    const vouchers = (result.content || []).map((row, index) => ({ id: `tally-purchase-${index}`, voucherNo: row.invoice_number || `Purchase-${index + 1}`, date: row.invoice_date, party: row.vendor_name || row.party_name || '—', amount: Number.parseFloat(row.total_invoice_value || row.taxable_amount || 0) || 0, status: row.gap_type || 'POSTED', items: 0 }));
    res.json({ success: true, data: { vouchers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/profit-loss/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const row = (await executeTemplate(30, auth)).content?.[0] || {};
    const number = (value) => Number.parseFloat(value) || 0;
    res.json({ success: true, data: {
      sales: number(row.sales_accounts), purchases: number(row.purchase_accounts),
      directExpenses: number(row.direct_expenses), directIncome: number(row.direct_incomes),
      indirectExpenses: number(row.indirect_expenses), indirectIncome: number(row.indirect_incomes),
      openingStock: number(row.opening_stock), closingStock: number(row.closing_stock),
      grossProfit: number(row.gross_profit), netProfit: number(row.net_profit),
    } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/day-book/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(33, auth)).content || [];
    const entries = rows.map((row, index) => {
      const sales = Number.parseFloat(row.total_sales) || 0;
      const purchases = Number.parseFloat(row.total_purchase) || 0;
      const receipts = Number.parseFloat(row.total_receipt) || 0;
      const payments = Number.parseFloat(row.total_payment) || 0;
      const expenses = Number.parseFloat(row.total_expense) || 0;
      return { id: `tally-daybook-${index}`, voucherNo: 'Monthly Tally Summary', date: row.month, category: 'Monthly Summary', partyName: '—', netAmount: sales + purchases + receipts + payments + expenses, narration: `Sales ${sales}; Purchases ${purchases}; Receipts ${receipts}; Payments ${payments}; Expenses ${expenses}` };
    });
    res.json({ success: true, data: { entries } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/expenses/templates', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const [today, ledgers] = await Promise.allSettled([executeTemplate(6, auth), executeTemplate(12, auth)]);
    const rows = ledgers.status === 'fulfilled' ? ledgers.value.content || [] : [];
    const expenses = rows.map((row, index) => ({
      id: `tally-expense-${index}`,
      name: row['Ledger Name'] || row.ledger_name || row.ledger || 'Expense ledger',
      group: row.group_name || row.group || 'Unclassified',
      amount: Number.parseFloat(row['Actual Amount'] || row.actual_amount || row.amount || 0) || 0,
    }));
    const todayRows = today.status === 'fulfilled' ? today.value.content || [] : [];
    res.json({ success: true, data: { expenses, today: todayRows } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/stock-status/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(9, auth)).content || [];
    const items = new Map();
    rows.forEach((row) => {
      const name = row.stock_item || 'Unnamed item';
      const current = items.get(name) || { id: `tally-stock-${items.size}`, name, quantity: 0, locations: new Set() };
      current.quantity += Number.parseFloat(row.closing_qty) || 0;
      if (row.godown_name) current.locations.add(row.godown_name);
      items.set(name, current);
    });
    res.json({ success: true, data: { items: [...items.values()].map((item) => ({ ...item, locations: [...item.locations] })) } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/party-statement/template', async (req, res) => {
  const partyName = String(req.body?.partyName || '').trim().toLowerCase();
  if (!partyName) return res.status(400).json({ success: false, error: 'partyName is required.' });
  try {
    const auth = await getTallyAuth();
    const [ledgerResult, billsResult] = await Promise.all([executeTemplate(28, auth), executeTemplate(2, auth)]);
    const rows = ledgerResult.content || [];
    let transactions = rows
      .filter((row) => [row.party_ledger, row.ledger_name].some((value) => String(value || '').trim().toLowerCase() === partyName))
      .slice(0, 2000)
      .map((row, index) => ({ id: `tally-party-transaction-${index}`, date: row.date, voucherNo: row.voucher_number || '—', type: row.voucher_type || 'Journal', particulars: row.narration || row.ledger_name || '—', debit: Number.parseFloat(row.debit) || 0, credit: Number.parseFloat(row.credit) || 0, amount: (Number.parseFloat(row.debit) || 0) - (Number.parseFloat(row.credit) || 0), balance: Number.parseFloat(row.closing_balance) || 0 }));
    if (transactions.length === 0) {
      transactions = (billsResult.content || [])
        .filter((row) => String(row.customer_name || row.party_name || '').trim().toLowerCase() === partyName)
        .map((row, index) => {
          const outstanding = Number.parseFloat(row.outstanding_balance || row.outstanding_amount || row.receivable_amount || 0) || 0;
          return { id: `tally-party-bill-${index}`, date: row.bill_date || row.reference_date || row.voucher_date, voucherNo: row.ref_no || row.voucher_number || row.bill_no || '—', type: 'Outstanding Bill', particulars: `Due: ${row.due_date || '—'}`, debit: outstanding, credit: 0, amount: outstanding, balance: outstanding };
        });
    }
    res.json({ success: true, data: { transactions } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/party-statement/full', async (req, res) => {
  const partyName = String(req.body?.partyName || '').trim().toLowerCase();
  if (!partyName) return res.status(400).json({ success: false, error: 'partyName is required.' });
  try {
    const auth = await getTallyAuth();
    
    // Call both templates concurrently
    // Template 48: Master fields, Template 28: Transactions
    const [ledgersResult, txnsResult, billsResult] = await Promise.all([
      executeTemplate(48, auth),
      executeTemplate(28, auth, { ledger_name: partyName }), // Tally expects the parameter
      executeTemplate(2, auth) // Fallback for outstanding bills if no transactions
    ]);
    
    // Process Ledger Master (Template 48)
    const allLedgers = ledgersResult.content || [];
    const matchedLedger = allLedgers.find(row => 
      String(row.ledger_name || '').trim().toLowerCase() === partyName
    ) || {};
    
    const ledger = {
      id: matchedLedger.LedgerID || null,
      name: matchedLedger.ledger_name || partyName,
      group: matchedLedger.parent_group_name || '—',
      type: matchedLedger.group_type || '—',
      openingBalance: Number.parseFloat(matchedLedger.opening_balance_inr || 0) || 0,
      closingBalance: Number.parseFloat(matchedLedger.ClosingBalance || 0) || 0,
      nature: matchedLedger.Nature || '—',
      statementType: matchedLedger.StatementType || '—'
    };

    // Process Transactions (Template 28)
    // Sometimes template 28 returns all transactions if the parameter is ignored, so we still filter.
    const rows = txnsResult.content || [];
    let transactions = rows
      .filter((row) => [row.party_ledger, row.ledger_name].some((value) => String(value || '').trim().toLowerCase() === partyName))
      .slice(0, 2000)
      .map((row, index) => ({ 
        id: `tally-party-transaction-${index}`, 
        date: row.date, 
        voucherNo: row.voucher_number || '—', 
        type: row.voucher_type || 'Journal', 
        particulars: row.narration || row.ledger_name || '—', 
        debit: Number.parseFloat(row.debit) || 0, 
        credit: Number.parseFloat(row.credit) || 0, 
        amount: (Number.parseFloat(row.debit) || 0) - (Number.parseFloat(row.credit) || 0), 
        balance: Number.parseFloat(row.closing_balance) || 0 
      }));
      
    // Fallback if no transactions found
    if (transactions.length === 0) {
      transactions = (billsResult.content || [])
        .filter((row) => String(row.customer_name || row.party_name || '').trim().toLowerCase() === partyName)
        .map((row, index) => {
          const outstanding = Number.parseFloat(row.outstanding_balance || row.outstanding_amount || row.receivable_amount || 0) || 0;
          return { 
            id: `tally-party-bill-${index}`, 
            date: row.bill_date || row.reference_date || row.voucher_date, 
            voucherNo: row.ref_no || row.voucher_number || row.bill_no || '—', 
            type: 'Outstanding Bill', 
            particulars: `Due: ${row.due_date || '—'}`, 
            debit: outstanding, 
            credit: 0, 
            amount: outstanding, 
            balance: outstanding 
          };
        });
    }
    
    res.json({ success: true, data: { ledger, transactions } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/voucher-audit/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(36, auth)).content || [];
    const vouchers = rows.map((row, index) => ({ id: `tally-audit-${index}`, date: row.date || row.voucher_date, voucherNo: row.voucher_no || row.voucher_number || '—', type: row.type || row.voucher_type || '—', party: row.party || row.party_name || '—', amount: Number.parseFloat(row.amount) || 0, createdAt: row.creation_time || row.altered_time || null }));
    res.json({ success: true, data: { vouchers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/sales-quotations/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(31, auth)).content || [];
    const quotations = rows.map((row, index) => ({ id: `tally-quotation-${index}`, number: row.quotation_number || row.voucher_number || row.quote_no || '—', date: row.quotation_date || row.voucher_date || row.date, party: row.party_name || row.customer_name || '—', amount: Number.parseFloat(row.total_amount || row.total_invoice_value || row.amount || 0) || 0, status: row.status || row.quotation_status || '—' }));
    res.json({ success: true, data: { quotations } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/customer-purchase-history/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(29, auth)).content || [];
    const history = rows.map((row, index) => ({
      id: `tally-customer-purchase-${index}`,
      customer: row['Party Name'] || '—',
      item: row['Stock Item Name'] || '—',
      date: row['Last Purchase Date'] || null,
      email: row['Email'] || null,
      voucherNo: row['Voucher Number'] || null,
      quantity: Number.parseFloat(row['Quantity Purchased']) || 0,
      amount: 0, // Template 29 does not provide an amount/price field
    }));
    res.json({ success: true, data: { history } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/sales-register/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(15, auth)).content || [];
    const register = rows.map((row, index) => ({
      id: `tally-sales-register-${index}`,
      date: row.voucher_date || row.invoice_date || row.date,
      voucherNo: row.voucher_number || row.invoice_number || '—',
      party: row.customer_name || row.party_name || '—',
      amount: Number.parseFloat(row.total_invoice_value || row.amount || row.invoice_value || 0) || 0,
    }));
    res.json({ success: true, data: { register } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/vendor-purchase-history/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(21, auth)).content || [];
    const history = rows.map((row, index) => ({
      id: `tally-vendor-purchase-${index}`,
      vendor: row.vendor_name || row.party_name || row.ledger_name || '—',
      voucherNo: row.voucher_number || row.invoice_number || '—',
      date: row.voucher_date || row.invoice_date || row.date,
      amount: Number.parseFloat(row.total_invoice_value || row.amount || row.taxable_amount || 0) || 0,
    }));
    res.json({ success: true, data: { history } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/gst-reconciliation/template', async (req, res) => {
  const { fromDate, toDate } = req.body || {};
  if (!fromDate || !toDate) return res.status(400).json({ success: false, error: 'fromDate and toDate are required.' });
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(44, auth, { cust_from_date: fromDate, cust_to_date: toDate })).content || [];
    const reconciliation = rows.map((row, index) => ({
      id: `tally-gst-recon-${index}`,
      gstin: row.supplier_gstin || '—',
      party: row.supplier_name || '—',
      supplierInvoiceNo: row.supplier_invoice_number || '—',
      supplierInvoiceDate: row.supplier_invoice_date || null,
      salesInvoiceNo: row.sales_invoice_number || '—',
      salesParty: row.sales_party || '—',
      salesInvoiceDate: row.sales_invoice_date || null,
      taxableValue: Number.parseFloat(row.taxable_amount || 0) || 0,
      igst: Number.parseFloat(row.igst_amount || 0) || 0,
      cgst: Number.parseFloat(row.cgst_amount || 0) || 0,
      sgst: Number.parseFloat(row.sgst_amount || 0) || 0,
      taxAmount: Number.parseFloat(row.tax_amount || 0) || 0,
      matchStatus: row.sales_voucher_guid ? 'Matched' : 'Unmatched',
    }));
    res.json({ success: true, data: { reconciliation } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/reimbursement-audit/template', async (req, res) => {
  const { fromDate, toDate } = req.body || {};
  if (!fromDate || !toDate) return res.status(400).json({ success: false, error: 'fromDate and toDate are required.' });
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(45, auth, { cust_from_date: fromDate, cust_to_date: toDate })).content || [];
    const audit = rows.map((row, index) => ({
      id: `tally-reimburse-${index}`,
      employee: row.employee_name || row.ledger_name || '—',
      date: row.voucher_date || row.date,
      voucherNo: row.voucher_number || '—',
      amount: Number.parseFloat(row.amount || row.total_amount || 0) || 0,
      description: row.narration || row.description || '—',
      status: row.status || '—',
    }));
    res.json({ success: true, data: { audit } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/ledgers/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(48, auth)).content || [];
    const ledgers = rows.map((row, index) => ({
      id: `tally-ledger-${index}`,
      name: row.ledger_name || '—',
      group: row.parent_group_name || row.under_group_name || '—',
      type: (row.group_type || '').toLowerCase(),
      balance: Number.parseFloat(row.opening_balance_inr || 0) || 0,
    }));
    res.json({ success: true, data: { ledgers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/items/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(55, auth)).content || [];
    const items = rows.map((row, index) => ({
      id: `tally-item-${index}`,
      name: row.item_name || '—',
      group: row.item_stock_group_name || row.stock_group_name || '—',
      stock: Number.parseFloat(row.current_stock_quantity || 0) || 0,
      unit: row.unit_of_measure || 'Nos',
      rate: Number.parseFloat(row.sale_rate_inr || 0) || 0,
      gst: Number.parseFloat(row.gst_rate_percent || 0) || 0,
    }));
    res.json({ success: true, data: { items } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/accounts/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(50, auth)).content || [];
    const accounts = rows.map((row, index) => ({
      id: `tally-account-${index}`,
      name: row.ledger_name || '—',
      type: row.account_type === 'Cash' ? 'Cash' : 'Bank',
      balance: Number.parseFloat(row.current_balance_inr || 0) || 0,
      accountNo: row.bank_account_number || '',
      branch: row.branch_name || '',
    }));
    res.json({ success: true, data: { accounts } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 62 — Trial Balance (date range)
router.post('/trial-balance/template', async (req, res) => {
  const fromDate = (req.body || {}).fromDate || '2024-01-01';
  const toDate = (req.body || {}).toDate || '2026-12-31';
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(62, auth, { cust_from_date: fromDate, cust_to_date: toDate })).content || [];
    const trialBalance = rows.map((row, index) => ({
      id: `tally-tb-${index}`,
      ledgerName: row.ledger_name || row.ledger || '—',
      groupName: row.group_name || row.group || '—',
      debit: Number.parseFloat(row.debit || row.debit_amount || 0) || 0,
      credit: Number.parseFloat(row.credit || row.credit_amount || 0) || 0,
      balance: Number.parseFloat(row.balance || row.closing_balance || 0) || 0,
    }));
    res.json({ success: true, data: { trialBalance } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 53 — Receipt & Payment vouchers (date range)
router.post('/receipt-payment-vouchers/template', async (req, res) => {
  const fromDate = (req.body || {}).fromDate || '2024-01-01';
  const toDate = (req.body || {}).toDate || '2026-12-31';
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(53, auth, { cust_from_date: fromDate, cust_to_date: toDate })).content || [];
    const vouchers = rows.map((row, index) => ({
      id: `tally-rcpt-pay-${index}`,
      date: row.voucher_date || null,
      voucherNo: row.voucher_number || '—',
      type: row.voucher_type || '—',
      party: row.party_name || '—',
      amount: Number.parseFloat(row.total_amount_inr || 0) || 0,
    }));
    res.json({ success: true, data: { vouchers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 54 — Journal, Debit Note, Credit Note vouchers (date range)
router.post('/journal-dn-cn-vouchers/template', async (req, res) => {
  const fromDate = (req.body || {}).fromDate || '2024-01-01';
  const toDate = (req.body || {}).toDate || '2026-12-31';
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(54, auth, { cust_from_date: fromDate, cust_to_date: toDate })).content || [];
    const vouchers = rows.map((row, index) => ({
      id: `tally-journal-${index}`,
      date: row.voucher_date || null,
      voucherNo: row.voucher_number || '—',
      type: row.voucher_type || '—',
      party: row.party_name || '—',
      amount: Number.parseFloat(row.total_amount_inr || 0) || 0,
    }));
    res.json({ success: true, data: { vouchers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 59 — Customer Movement rollup (computed)
router.post('/customer-movement-rollup/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(59, auth)).content || [];
    const movement = rows.map((row, index) => ({
      id: `tally-move-${index}`,
      partyName: row.party_name || row.party || '—',
      status: row.status || '—',
      daysSinceLastTxn: parseInt(row.days_since_last_txn || row.days || 0) || 0,
      salesValue: Number.parseFloat(row.sales_value || row.total_sales || 0) || 0,
      txnCount: parseInt(row.transaction_count || row.txn_count || 0) || 0,
    }));
    res.json({ success: true, data: { movement } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 60 — By Item rollup (computed)
router.post('/by-item-rollup/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(60, auth)).content || [];
    const items = rows.map((row, index) => ({
      id: `tally-byitem-${index}`,
      itemName: row.item_name || row.item || '—',
      qtySold: Number.parseFloat(row.qty_sold || row.quantity_sold || 0) || 0,
      salesValue: Number.parseFloat(row.sales_value || row.total_sales || 0) || 0,
    }));
    res.json({ success: true, data: { items } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 61 — Geographic rollup (computed)
router.post('/geographic-rollup/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(61, auth)).content || [];
    const geo = rows.map((row, index) => ({
      id: `tally-geo-${index}`,
      state: row.state || '—',
      city: row.city || '—',
      partyCount: parseInt(row.customer_count || 0) || 0,
      salesValue: Number.parseFloat(row.total_sales_inr || 0) || 0,
      purchaseValue: Number.parseFloat(row.total_purchases_inr || 0) || 0,
    }));
    res.json({ success: true, data: { geo } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 49 — All parties with contact details + credit terms
router.post('/party-details/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(49, auth)).content || [];
    console.log('[Template 49] distinct party_type values:', JSON.stringify([...new Set(rows.map(r => r.party_type))].slice(0, 30)));
    const parties = rows.map((row, index) => ({
      id: `tally-party-detail-${index}`,
      name: row.party_name || row.ledger_name || '—',
      type: (() => {
        const pt = (row.party_type || '').toLowerCase();
        if (pt.includes('debtor') || pt.includes('customer') || pt.includes('receivable') || pt.includes('buyer')) return 'Customer';
        if (pt.includes('creditor') || pt.includes('supplier') || pt.includes('vendor') || pt.includes('payable') || pt.includes('seller')) return 'Supplier';
        if ((pt.includes('debtor') || pt.includes('customer')) && (pt.includes('creditor') || pt.includes('supplier'))) return 'Both';
        return 'Customer'; // default for unrecognized — will be flagged by debug log
      })(),
      gstin: row.gstin || '—',
      address: row.full_address || row.address || '—',
      mobile: row.phone_number || row.mobile || row.phone || '—',
      email: row.email || '—',
      creditDays: parseInt(row.credit_days || 0) || 0,
      balance: Number.parseFloat(row.opening_balance_inr || 0) || 0,
    }));
    res.json({ success: true, data: { parties } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 56 — Receivables and payables aging
router.post('/aging-report/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(56, auth)).content || [];
    console.log('[Template 56] field keys:', JSON.stringify(Object.keys(rows[0] || {})));
    console.log('[Template 56] total rows:', rows.length);
    const aging = rows.map((row, index) => ({
      id: `tally-aging-${index}`,
      partyName: row.party_name || row.name || '—',
      type: row.type || row.party_type || '—',
      totalDue: Number.parseFloat(row.total_due || row.amount || 0) || 0,
      notDue: Number.parseFloat(row.not_due || 0) || 0,
      overdue0to30: Number.parseFloat(row.overdue_0_30 || row.bucket1 || 0) || 0,
      overdue31to60: Number.parseFloat(row.overdue_31_60 || row.bucket2 || 0) || 0,
      overdue61to90: Number.parseFloat(row.overdue_61_90 || row.bucket3 || 0) || 0,
      over90: Number.parseFloat(row.over_90 || row.bucket4 || 0) || 0,
    }));
    res.json({ success: true, data: { aging } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 58 — Batch-wise stock details
router.post('/batch-stock/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(58, auth)).content || [];
    const batches = rows.map((row, index) => ({
      id: `tally-batch-${index}`,
      itemName: row.item_name || '—',
      batchNo: row.batch_id || '—',
      godown: row.godown_location || '—',
      quantity: Number.parseFloat(row.quantity_remaining || 0) || 0,
      value: Math.abs(Number.parseFloat(row.total_value_inr || 0)) || 0,
      inwardDate: row.inward_date || null,
    }));
    res.json({ success: true, data: { batches } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 57 — Dashboard summary (date range)
router.post('/dashboard-summary/template', async (req, res) => {
  const fromDate = (req.body || {}).fromDate || '2024-01-01';
  const toDate = (req.body || {}).toDate || '2026-12-31';
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(57, auth, { cust_from_date: fromDate, cust_to_date: toDate })).content || [];
    console.log('[Template 57] field keys:', JSON.stringify(Object.keys(rows[0] || {})));
    console.log('[Template 57] total rows:', rows.length);
    const summary = {
      totalSales: Number.parseFloat(rows[0]?.total_sales || rows[0]?.sales || 0) || 0,
      totalPurchases: Number.parseFloat(rows[0]?.total_purchases || rows[0]?.purchases || 0) || 0,
      totalReceivables: Number.parseFloat(rows[0]?.total_receivables || rows[0]?.receivables || 0) || 0,
      totalPayables: Number.parseFloat(rows[0]?.total_payables || rows[0]?.payables || 0) || 0,
      cashInHand: Number.parseFloat(rows[0]?.cash_in_hand || rows[0]?.cash || 0) || 0,
      bankBalance: Number.parseFloat(rows[0]?.bank_balance || rows[0]?.bank || 0) || 0,
      grossProfit: Number.parseFloat(rows[0]?.gross_profit || 0) || 0,
      netProfit: Number.parseFloat(rows[0]?.net_profit || 0) || 0,
    };
    res.json({ success: true, data: { summary } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 77 — Item-wise & Party-wise Sales
router.post('/item-party-wise-sales/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(77, auth)).content || [];
    console.log('[Template 77] total rows:', rows.length);
    console.log('[Template 77] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    const itemWise = [];
    const partyWise = [];

    rows.forEach((row, index) => {
      const reportType = (row.report_type || '').toUpperCase();
      if (reportType === 'ITEM_WISE') {
        itemWise.push({
          id: `tally-itemwise-${index}`,
          itemName: row.item_name || '—',
          brand: row.brand || null,
          unit: row.unit || '—',
          saleRate: Number.parseFloat(row.sale_rate || 0) || 0,
          gst: row.gst || '—',
          hsn: row.hsn || '—',
          totalQty: Number.parseFloat(row.total_qty || 0) || 0,
          totalAmount: Number.parseFloat(row.total_amount || 0) || 0,
          voucherCount: parseInt(row.voucher_count || 0) || 0,
          lastSaleDate: row.last_sale_date || null,
        });
      } else if (reportType === 'PARTY_WISE') {
        partyWise.push({
          id: `tally-partywise-${index}`,
          partyName: row.party_name || '—',
          partyId: row.party_id || null,
          totalSalesAmount: Number.parseFloat(row.total_sales_amount || 0) || 0,
          voucherCount: parseInt(row.voucher_count || 0) || 0,
          lastVoucherDate: row.last_voucher_date || null,
          voucherType: row.voucher_type || '—',
        });
      }
    });

    res.json({ success: true, data: { itemWise, partyWise } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 78 — Delivery Note vouchers
router.post('/delivery-note-vouchers/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(78, auth, {
      cust_from_date: req.body?.fromDate || '2024-01-01',
      cust_to_date: req.body?.toDate || '2026-12-31',
    })).content || [];
    console.log('[Template 78] total rows:', rows.length);
    console.log('[Template 78] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    const vouchers = rows.map((row, index) => ({
      id: `tally-dn-${index}`,
      voucherNo: row.VoucherNo || '—',
      date: row.VoucherDate || null,
      partyId: row.PartyID || null,
      party: row.PartyName || '—',
      amount: Number.parseFloat(row.GrandTotal || 0) || 0,
      narration: row.Narration || '',
      status: row.Status || 'Active',
      voucherType: row.VoucherType || 'Delivery Note',
      referenceNo: row.referenceNo || '—',
    }));

    res.json({ success: true, data: { vouchers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 79 — Contra vouchers
router.post('/contra-vouchers/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(79, auth, {
      cust_from_date: req.body?.fromDate || '2024-01-01',
      cust_to_date: req.body?.toDate || '2026-12-31',
    })).content || [];
    console.log('[Template 79] total rows:', rows.length);
    console.log('[Template 79] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    // Deduplicate: group line-item rows into unique vouchers
    const voucherMap = {};
    rows.forEach((row, index) => {
      const key = `${row.VoucherDate || ''}|${row.Narration || ''}|${row.GrandTotal || '0'}`;
      if (!voucherMap[key]) {
        voucherMap[key] = {
          id: `tally-contra-${index}`,
          voucherNo: row.VoucherNo || '—',
          date: row.VoucherDate || null,
          amount: Number.parseFloat(row.GrandTotal || 0) || 0,
          narration: row.Narration || '',
          status: row.Status || 'Active',
          voucherType: row.VoucherType || 'Contra',
          fromAccount: row.fromAccount || null,
          toAccount: row.toAccount || null,
          fromBankName: row.fromBankName || null,
          toBankName: row.toBankName || null,
          fromAccountNo: row.fromAccountNo || null,
          toAccountNo: row.toAccountNo || null,
          ledgers: [],
        };
      }
      if (row.ledgerName) voucherMap[key].ledgers.push(row.ledgerName);
    });

    const vouchers = Object.values(voucherMap).map((v) => ({
      ...v,
      particulars: v.ledgers.length ? v.ledgers.join(' ↔ ') : v.narration,
    }));

    res.json({ success: true, data: { vouchers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 69 — Top Brands (Sundry Debtors wise Products wise Sale, aggregated by item)
router.post('/top-brands/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(69, auth, {
      cust_from_date: req.body?.fromDate || '2024-01-01',
      cust_to_date: req.body?.toDate || '2026-12-31',
    })).content || [];
    console.log('[Template 69] total rows:', rows.length);
    console.log('[Template 69] field keys:', JSON.stringify(Object.keys(rows[0] || {})));
    console.log('[Template 69] sample item_name:', rows[0]?.item_name, rows[1]?.item_name);

    // Aggregate by item_name
    const brandMap = {};
    const brandTransactions = {};

    rows.forEach((row) => {
      const itemName = row.item_name || '—';
      if (!brandMap[itemName]) {
        brandMap[itemName] = {
          brand: itemName,
          totalQty: 0,
          totalSalesValue: 0,
          voucherCount: 0,
          voucherSet: new Set(),
          avgRate: 0,
          rateCount: 0,
          totalRate: 0,
        };
        brandTransactions[itemName] = [];
      }

      const qty = Math.abs(Number.parseFloat(row.quantity || 0)) || 0;
      const salesValue = Number.parseFloat(row.taxable_value || 0) || 0;
      const rate = Number.parseFloat(row.rate || 0) || 0;
      const voucherNo = row.voucher_number || '';

      brandMap[itemName].totalQty += qty;
      brandMap[itemName].totalSalesValue += salesValue;
      if (rate > 0) { brandMap[itemName].totalRate += rate; brandMap[itemName].rateCount++; }

      if (voucherNo && !brandMap[itemName].voucherSet.has(voucherNo)) {
        brandMap[itemName].voucherSet.add(voucherNo);
        brandMap[itemName].voucherCount++;
      }

      brandTransactions[itemName].push({
        date: row.date || null,
        voucherNo: voucherNo || '—',
        partyName: row.party_name || '—',
        qty: qty,
        rate: rate,
        amount: salesValue,
        totalGst: Number.parseFloat(row.total_gst || 0) || 0,
        invoiceTotal: Number.parseFloat(row.invoice_total || 0) || 0,
      });
    });

    const brands = Object.values(brandMap).map((b, index) => ({
      id: `tally-brand-${index}`,
      brand: b.brand,
      itemCount: 1,
      totalStock: 0,
      stockValue: 0,
      salesValue: b.totalSalesValue,
      salesQty: b.totalQty,
      purchaseValue: 0,
      purchaseQty: 0,
      topItem: b.brand,
      salesVelocity30d: 0,
      voucherCount: b.voucherCount,
      avgRate: b.rateCount > 0 ? b.totalRate / b.rateCount : 0,
    }));

    // Clean voucherSet from transactions
    const cleanTransactions = {};
    Object.keys(brandTransactions).forEach((key) => {
      cleanTransactions[key] = brandTransactions[key];
    });

    res.json({ success: true, data: { brands, brandTransactions: cleanTransactions } });
    console.log('[Template 69] brands count:', brands.length, 'txn keys count:', Object.keys(cleanTransactions).length);
    console.log('[Template 69] sample brand:', brands[0]?.brand, 'sample txn keys:', Object.keys(cleanTransactions).slice(0, 3));
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 81 — Top Report (Customers, Products, Vendors)
router.post('/top-report/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(81, auth)).content || [];
    console.log('[Template 81] total rows:', rows.length);
    console.log('[Template 81] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    const customers = [];
    const products = [];
    const vendors = [];

    rows.forEach((row, index) => {
      const entityType = (row.EntityType || '').toLowerCase();
      const mapped = {
        id: `tally-top-${index}`,
        name: row['Name/PartyName'] || '—',
        totalValue: Number.parseFloat(row.totalValue || 0) || 0,
        transactionCount: parseInt(row.transactionCount || 0) || 0,
        percentageOfTotal: Number.parseFloat(row.percentageOfTotal || 0) || 0,
      };
      if (entityType === 'customer') customers.push(mapped);
      else if (entityType === 'product') products.push(mapped);
      else if (entityType === 'vendor') vendors.push(mapped);
    });

    console.log('[Template 81] customers:', customers.length, 'products:', products.length, 'vendors:', vendors.length);
    res.json({ success: true, data: { customers, products, vendors } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 82 — By Ledger (voucher line items grouped by ledger)
router.post('/by-ledger/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(82, auth, {
      cust_from_date: req.body?.fromDate || '2024-01-01',
      cust_to_date: req.body?.toDate || '2026-12-31',
    })).content || [];
    console.log('[Template 82] total rows:', rows.length);
    console.log('[Template 82] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    // Aggregate by LedgerName
    const ledgerMap = {};

    rows.forEach((row) => {
      const ledgerName = row.LedgerName || '—';
      if (!ledgerMap[ledgerName]) {
        ledgerMap[ledgerName] = {
          id: row.LedgerID || `tally-ledger-${ledgerName}`,
          name: ledgerName,
          group: row.GroupName || '—',
          totalDebit: 0,
          totalCredit: 0,
          totalAmount: 0,
          voucherCount: 0,
          voucherSet: new Set(),
        };
      }

      const debit = Number.parseFloat(row.debitTotal || 0) || 0;
      const credit = Number.parseFloat(row.creditTotal || 0) || 0;
      const amount = Number.parseFloat(row.totalAmount || 0) || 0;
      const voucherNo = row.VoucherNo || '';

      ledgerMap[ledgerName].totalDebit += debit;
      ledgerMap[ledgerName].totalCredit += credit;
      ledgerMap[ledgerName].totalAmount += amount;

      if (voucherNo && !ledgerMap[ledgerName].voucherSet.has(voucherNo)) {
        ledgerMap[ledgerName].voucherSet.add(voucherNo);
        ledgerMap[ledgerName].voucherCount++;
      }
    });

    const ledgers = Object.values(ledgerMap).map((l) => ({
      id: l.id,
      name: l.name,
      group: l.group,
      totalDebit: l.totalDebit,
      totalCredit: l.totalCredit,
      totalAmount: l.totalAmount,
      voucherCount: l.voucherCount,
    }));

    console.log('[Template 82] aggregated ledgers:', ledgers.length);
    res.json({ success: true, data: { ledgers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 83 + 48 — Ledger Report (financial data + type classification)
router.post('/ledger-report/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const [t83Result, t48Result] = await Promise.allSettled([
      executeTemplate(83, auth),
      executeTemplate(48, auth),
    ]);

    const t83Rows = (t83Result.status === 'fulfilled' ? t83Result.value.content : []) || [];
    const t48Rows = (t48Result.status === 'fulfilled' ? t48Result.value.content : []) || [];

    console.log('[Template 83+48] t83 rows:', t83Rows.length, 't48 rows:', t48Rows.length);

    // Build type map from template 48 by LedgerID
    const typeMap = {};
    t48Rows.forEach((row) => {
      const lid = row.LedgerID;
      if (lid) {
        typeMap[lid] = {
          type: (row.group_type || '—').toLowerCase(),
          nature: row.Nature || '—',
          statementType: row.StatementType || '—',
        };
      }
    });

    const ledgers = t83Rows.map((row) => {
      const typeInfo = typeMap[row.LedgerID] || {};
      return {
        id: row.LedgerID || '—',
        name: row.LedgerName || '—',
        group: row.GroupName || '—',
        type: typeInfo.type || '—',
        nature: typeInfo.nature || '—',
        openingBalance: Number.parseFloat(row.OpeningBalance || 0) || 0,
        closingBalance: Number.parseFloat(row.ClosingBalance || 0) || 0,
        totalDebit: Number.parseFloat(row.totalDebit || 0) || 0,
        totalCredit: Number.parseFloat(row.totalCredit || 0) || 0,
        netMovement: Number.parseFloat(row.netMovement || 0) || 0,
        voucherCount: parseInt(row.voucherCount || 0) || 0,
        lastVoucherDate: row.lastVoucherDate || null,
      };
    });

    console.log('[Template 83+48] merged ledgers:', ledgers.length);
    res.json({ success: true, data: { ledgers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 83 + 84 + 28 — Ledger Detail (financial from 83, bank details from 84, transactions from 28)
router.post('/ledger-detail/template', async (req, res) => {
  try {
    const ledgerName = req.body?.ledgerName || '';
    const ledgerId = req.body?.ledgerId || '';
    if (!ledgerName && !ledgerId) return res.status(400).json({ success: false, error: 'ledgerName or ledgerId required' });

    const auth = await getTallyAuth();

    // Step 1: Get financial data from template 83 (consistent with LedgerReport)
    const t83Rows = (await executeTemplate(83, auth)).content || [];
    const matchingT83 = ledgerId
      ? t83Rows.find((r) => r.LedgerID === ledgerId)
      : t83Rows.find((r) => r.LedgerName === ledgerName);

    console.log('[Template 83+84+28] t83 rows:', t83Rows.length, 'match:', !!matchingT83);

    if (!matchingT83) {
      return res.json({ success: true, data: { ledger: null, transactions: [] } });
    }

    // Step 2: Get bank details from template 84 (AccountNumber, BankName, IFSC, BranchName)
    const t84Rows = (await executeTemplate(84, auth)).content || [];
    const matchingT84 = ledgerId
      ? t84Rows.find((r) => r.LedgerID === ledgerId)
      : t84Rows.find((r) => r.LedgerName === (matchingT83.LedgerName || ledgerName));

    const ledger = {
      id: matchingT83.LedgerID || '—',
      name: matchingT83.LedgerName || '—',
      group: matchingT83.GroupName || '—',
      openingBalance: Number.parseFloat(matchingT83.OpeningBalance || 0) || 0,
      closingBalance: Number.parseFloat(matchingT83.ClosingBalance || 0) || 0,
      totalDebit: Math.abs(Number.parseFloat(matchingT83.totalDebit || 0)) || 0,
      totalCredit: Number.parseFloat(matchingT83.totalCredit || 0) || 0,
      nature: matchingT84?.Nature || '—',
      isActive: matchingT84?.IsActive || '—',
      accountNumber: matchingT84?.AccountNumber || null,
      bankName: matchingT84?.BankName || null,
      ifsc: matchingT84?.IFSC || null,
      branchName: matchingT84?.BranchName || null,
    };

    console.log('[Template 83+84+28] openingBalance from 83:', ledger.openingBalance,
      'bank from 84:', ledger.accountNumber ? 'yes' : 'no');

    // Step 3: Get transactions from template 28
    const searchName = matchingT83.LedgerName || ledgerName;
    const t28Result = await executeTemplate(28, auth, { ledger_name: searchName });
    const t28Rows = (t28Result?.content || []);
    console.log('[Template 83+84+28] t28 transactions:', t28Rows.length);

    const transactions = t28Rows.map((row) => ({
      date: row.date || row.voucher_date || null,
      voucherNo: row.voucher_number || row.voucherNo || '—',
      type: row.voucher_type || row.type || '—',
      particulars: row.narration || row.particulars || '—',
      debit: Number.parseFloat(row.debit || 0) || 0,
      credit: Number.parseFloat(row.credit || 0) || 0,
      balance: Number.parseFloat(row.closing_balance || row.balance || 0) || 0,
    }));

    res.json({ success: true, data: { ledger, transactions } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 85 — Groups
router.post('/groups/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(85, auth)).content || [];
    console.log('[Template 85] total rows:', rows.length);
    console.log('[Template 85] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    const groups = rows.map((row) => ({
      id: row.GroupID || '—',
      name: row.GroupName || '—',
      type: row.GroupType || '—',
      parentName: row.ParentGroup || null,
      nature: row.Nature || null,
      statementType: row.StatementType || null,
      childGroupCount: parseInt(row.childGroupCount || 0) || 0,
      ledgerCount: parseInt(row.ledgerCount || 0) || 0,
    }));

    res.json({ success: true, data: { groups } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 86 — Categories (aggregated)
router.post('/categories/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(86, auth)).content || [];
    console.log('[Template 86] total rows:', rows.length);
    console.log('[Template 86] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    const catMap = {};
    rows.forEach((row) => {
      const cid = row.CategoryID;
      if (!cid) return;
      if (!catMap[cid]) {
        catMap[cid] = {
          id: cid,
          name: row.CategoryName || '—',
          description: row.Description || null,
          groupIds: new Set(),
          itemCount: parseInt(row.ItemCount || 0) || 0,
        };
      }
      if (row.GroupID) catMap[cid].groupIds.add(row.GroupID);
    });

    const categories = Object.values(catMap).map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      groupCount: c.groupIds.size,
      itemCount: c.itemCount,
    }));

    console.log('[Template 86] categories:', categories.length);
    res.json({ success: true, data: { categories } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 87 — Items Page (full inventory)
router.post('/items-page/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(87, auth)).content || [];
    console.log('[Template 87] total rows:', rows.length);
    console.log('[Template 87] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    const items = rows.map((row) => ({
      id: row.ItemID || '—',
      name: row.ItemName || '—',
      brand: row.Brand || null,
      saleRate: Number.parseFloat(row.SaleRate || 0) || 0,
      purchaseRate: 0,
      unit: row.Unit || '—',
      gstRate: Number.parseFloat(row.GST || 0) || 0,
      currentStock: Number.parseFloat(row.CurrentStock || 0) || 0,
      salesVelocity30d: Number.parseFloat(row.SalesVelocity30d || 0) || 0,
      isUnderstock: row.IsUnderstock === 'true' || row.IsUnderstock === true,
      isOverstock: row.IsOverstock === 'true' || row.IsOverstock === true,
      isPopular: row.IsPopular === 'true' || row.IsPopular === true,
      daysOfStock: Number.parseFloat(row.DaysOfStock || 0) || 0,
      reorderLevel: Number.parseFloat(row.ReorderLevel || 0) || 0,
      stockValue: Number.parseFloat(row.StockValue || 0) || 0,
      lastSaleDate: row.LastSaleDate || null,
      lastPurchaseDate: row.LastPurchaseDate || null,
      hsn: row.HSN || '—',
      minStockLevel: Number.parseFloat(row.MinStockLevel || 0) || 0,
      maxStockLevel: Number.parseFloat(row.MaxStockLevel || 0) || 0,
      location: row.Location || null,
      categoryId: row.CategoryID || null,
      groupId: row.GroupID || null,
      openingQty: 0,
      openingValue: 0,
    }));

    console.log('[Template 87] items:', items.length);
    res.json({ success: true, data: { items } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 88 — Stock Batches
router.post('/stock-batches/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(88, auth)).content || [];
    console.log('[Template 88] total rows:', rows.length);
    console.log('[Template 88] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    const batches = rows.map((row) => ({
      batchId: row.BatchID || '—',
      itemId: row.ItemID || '—',
      itemName: row.ItemName || '—',
      batchNo: row.BatchNo || '—',
      quantity: Number.parseFloat(row.Quantity || 0) || 0,
      inwardDate: row.InwardDate || null,
      mfgDate: row.MfgDate || null,
      expDate: row.ExpDate || null,
      rate: Number.parseFloat(row.Rate || 0) || 0,
      value: Number.parseFloat(row.Value || 0) || 0,
      ageingDays: parseInt(row.AgeingDays || 0) || 0,
      ageingBucket: row.AgeingBucket || '—',
      location: row.Location || '—',
    }));

    console.log('[Template 88] batches:', batches.length);
    res.json({ success: true, data: { batches } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 89 — Item Stock Status
router.post('/item-stock-status/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(89, auth)).content || [];
    console.log('[Template 89] total rows:', rows.length);
    console.log('[Template 89] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    const items = rows.map((row) => ({
      statusId: row.StatusID || '—',
      itemId: row.ItemID || '—',
      itemName: row.ItemName || '—',
      currentStock: Number.parseFloat(row.CurrentStock || 0) || 0,
      salesVelocity30d: Number.parseFloat(row.SalesVelocity30d || 0) || 0,
      isUnderstock: row.IsUnderstock === 'true' || row.IsUnderstock === true,
      isOverstock: row.IsOverstock === 'true' || row.IsOverstock === true,
      isPopular: row.IsPopular === 'true' || row.IsPopular === true,
      daysOfStock: Number.parseFloat(row.DaysOfStock || 0) || 0,
      reorderLevel: Number.parseFloat(row.ReorderLevel || 0) || 0,
      stockValue: Number.parseFloat(row.StockValue || 0) || 0,
      lastSaleDate: row.LastSaleDate || null,
      lastPurchaseDate: row.LastPurchaseDate || null,
    }));

    console.log('[Template 89] items:', items.length);
    res.json({ success: true, data: { items } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 90 — Customer Movement
router.post('/customer-movement/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(90, auth)).content || [];
    console.log('[Template 90] total rows:', rows.length);
    console.log('[Template 90] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    const customers = rows.map((row) => ({
      movementId: row.MovementID || '—',
      partyId: row.PartyID || '—',
      partyName: row.PartyName || '—',
      partyType: row.PartyType || '—',
      firstTransactionDate: row.FirstTransactionDate || null,
      lastTransactionDate: row.LastTransactionDate || null,
      totalSalesValue: Number.parseFloat(row.TotalSalesValue || 0) || 0,
      totalPurchaseValue: Number.parseFloat(row.TotalPurchaseValue || 0) || 0,
      transactionCount: parseInt(row.TransactionCount || 0) || 0,
      daysSinceLastTxn: parseInt(row.DaysSinceLastTxn || 0) || 0,
      status: row.Status || '—',
      salesPerson: row.SalesPerson || null,
      city: row.City || null,
      state: row.State || null,
    }));

    console.log('[Template 90] customers:', customers.length);
    res.json({ success: true, data: { customers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 91 — Outstanding Group View
router.post('/outstanding-group-view/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(91, auth)).content || [];
    console.log('[Template 91] total rows:', rows.length);
    console.log('[Template 91] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    const receivables = [];
    const payables = [];

    rows.forEach((row) => {
      const mapped = {
        partyId: row.PartyID || '—',
        partyName: row.PartyName || '—',
        totalOutstanding: Number.parseFloat(row.totalOutstanding || 0) || 0,
        agingNotDue: Number.parseFloat(row.agingNotDue || 0) || 0,
        aging0to30: Number.parseFloat(row.aging0to30 || 0) || 0,
        aging31to60: Number.parseFloat(row.aging31to60 || 0) || 0,
        aging61to90: Number.parseFloat(row.aging61to90 || 0) || 0,
        aging90plus: Number.parseFloat(row.aging90plus || 0) || 0,
        creditLimit: Number.parseFloat(row.creditLimit || 0) || 0,
        creditDays: parseInt(row.creditDays || 0) || 0,
        openingBalance: Number.parseFloat(row.OpeningBalance || 0) || 0,
      };

      const groupType = (row.groupType || '').toLowerCase();
      if (groupType === 'receivable') {
        receivables.push(mapped);
      } else if (groupType === 'payable') {
        payables.push(mapped);
      }
    });

    console.log('[Template 91] receivables:', receivables.length, 'payables:', payables.length);
    res.json({ success: true, data: { receivables, payables } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Dashboard Full — merge all 17 templates
router.post('/dashboard/full', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const results = await Promise.allSettled([
      executeTemplate(87, auth),  // itemCount + stockSummary
      executeTemplate(49, auth),  // partyCount
      executeTemplate(81, auth),  // topCustomers, topVendors, topSellingItems
      executeTemplate(86, auth),  // categoryBreakdown
      executeTemplate(76, auth),  // openOrders + pendingOrders
      executeTemplate(18, auth),  // recentTransactions (sales data sorted by date DESC, top 5)
      executeTemplate(39, auth),  // salesTrend daily
      executeTemplate(84, auth),  // bankAccountDetails
    ]);

    const getRows = (idx) => (results[idx].status === 'fulfilled' ? (results[idx].value?.content || []) : []);

    // 0: Template 87 — itemCount + stockSummary
    const t87Rows = getRows(0);
    const itemCount = t87Rows.length;
    const stockSummary = {
      totalItems: itemCount,
      totalStockValue: t87Rows.reduce((sum, r) => sum + (Number.parseFloat(r.StockValue || 0) || 0), 0),
      totalCurrentStock: t87Rows.reduce((sum, r) => sum + (Number.parseFloat(r.CurrentStock || 0) || 0), 0),
      understockCount: t87Rows.filter(r => r.IsUnderstock === 'true' || r.IsUnderstock === true).length,
      overstockCount: t87Rows.filter(r => r.IsOverstock === 'true' || r.IsOverstock === true).length,
      popularCount: t87Rows.filter(r => r.IsPopular === 'true' || r.IsPopular === true).length,
    };

    // 1: Template 49 — partyCount
    const t49Rows = getRows(1);
    const partyCount = t49Rows.length;

    // 2: Template 81 — top customers, vendors, products
    const t81Rows = getRows(2);
    const topCustomers = t81Rows.filter(r => (r.EntityType || '').toLowerCase() === 'customer')
      .map(r => ({ name: r['Name/PartyName'] || '—', value: Number.parseFloat(r.totalValue || 0) || 0, count: parseInt(r.transactionCount || 0) || 0 }))
      .slice(0, 5);
    const topVendors = t81Rows.filter(r => (r.EntityType || '').toLowerCase() === 'vendor')
      .map(r => ({ name: r['Name/PartyName'] || '—', value: Number.parseFloat(r.totalValue || 0) || 0, count: parseInt(r.transactionCount || 0) || 0 }))
      .slice(0, 5);
    const topSellingItems = t81Rows.filter(r => (r.EntityType || '').toLowerCase() === 'product')
      .map(r => ({ name: r['Name/PartyName'] || '—', value: Number.parseFloat(r.totalValue || 0) || 0, count: parseInt(r.transactionCount || 0) || 0 }))
      .slice(0, 5);

    // 3: Template 86 — categoryBreakdown
    const t86Rows = getRows(3);
    const catMap = {};
    t86Rows.forEach(r => {
      const cn = r.CategoryName || '—';
      if (!catMap[cn]) catMap[cn] = { name: cn, itemCount: 0, groupCount: 0, groupSet: new Set() };
      catMap[cn].itemCount = parseInt(r.ItemCount || catMap[cn].itemCount || 0) || catMap[cn].itemCount;
      if (r.GroupID) catMap[cn].groupSet.add(r.GroupID);
    });
    const categoryBreakdown = Object.values(catMap).map(c => ({ name: c.name, itemCount: c.itemCount, groupCount: c.groupSet.size }));

    // 4: Template 76 — openOrders
    const t76Rows = getRows(4);
    const openOrders = t76Rows.map(r => ({
      number: r.number || r.order_number || '—',
      date: r.date || r.voucher_date || null,
      party: r.party || r.party_name || '—',
      amount: Number.parseFloat(r.amount || 0) || 0,
      status: r.status || r.dispatch_status || '—',
      pendingQty: Number.parseFloat(r.pendingQty || r.pending_qty || 0) || 0,
    }));

    // 5: Template 18 — recentTransactions (sales data sorted by date DESC)
    const t18Rows = getRows(5);
    const recentTransactions = t18Rows
      .sort((a, b) => new Date(b.invoice_date || b.date || 0) - new Date(a.invoice_date || a.date || 0))
      .slice(0, 5)
      .map(r => ({
        type: 'Sales',
        party: r.customer_name || r.party_name || r.party || '—',
        amount: Number.parseFloat(r.total_invoice_value || r.amount || 0) || 0,
        date: r.invoice_date || r.date || null,
        voucherNo: r.invoice_no || r.voucher_number || r.voucherNo || '—',
      }));

    // 6: Template 39 — salesTrend
    const t39Rows = getRows(6);
    const salesTrend = t39Rows.map(r => ({
      date: r.date || null,
      salesAmount: Number.parseFloat(r.sales_amount || 0) || 0,
      invoiceCount: parseInt(r.invoice_count || 0) || 0,
    }));

    // 7: Template 84 — bankAccountDetails
    const t84Rows = getRows(7);
    const bankAccounts = t84Rows.filter(r => r.AccountNumber)
      .map(r => ({
        name: r.LedgerName || '—',
        accountNo: r.AccountNumber || null,
        bankName: r.BankName || null,
        ifsc: r.IFSC || null,
        branch: r.BranchName || null,
        balance: Number.parseFloat(r.ClosingBalance || r.OpeningBalance || 0) || 0,
      }));

    console.log('[Dashboard Full] itemCount:', itemCount, 'partyCount:', partyCount,
      'topCustomers:', topCustomers.length, 'topVendors:', topVendors.length, 'topItems:', topSellingItems.length,
      'categories:', categoryBreakdown.length, 'orders:', openOrders.length,
      'transactions:', recentTransactions.length, 'trend:', salesTrend.length, 'banks:', bankAccounts.length);

    res.json({ success: true, data: {
      itemCount, stockSummary, partyCount,
      topCustomers, topVendors, topSellingItems,
      categoryBreakdown, openOrders,
      recentTransactions, salesTrend, bankAccounts,
    }});
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Outstanding Full — merge template 68 + 49 for party contact details
router.post('/outstanding/full', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const [t68Result, t49Result] = await Promise.allSettled([
      executeTemplate(68, auth),
      executeTemplate(49, auth),
    ]);

    const t68Rows = (t68Result.status === 'fulfilled' ? t68Result.value.content : []) || [];
    const t49Rows = (t49Result.status === 'fulfilled' ? t49Result.value.content : []) || [];

    console.log('[Outstanding Full] t68 rows:', t68Rows.length, 't49 rows:', t49Rows.length);

    const normalizeName = (name) => {
      return (name || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*-\s*/g, '-')
        .replace(/\s*\.\s*/g, '.')
        .trim();
    };

    // Build party details lookup from template 49 by normalized party_name
    const partyDetailMap = {};
    t49Rows.forEach((row) => {
      const key = normalizeName(row.party_name);
      if (key) {
        partyDetailMap[key] = {
          phone: row.phone_number || null,
          email: row.email || null,
          address: row.full_address || null,
          gstin: row.gstin || null,
          pan: row.PAN || null,
          creditLimit: Number.parseFloat(row.creditLimit || 0) || 0,
          creditDays: parseInt(row.creditDays || 0) || 0,
          salesPerson: row.salesPerson || null,
          city: row.city || null,
          state: row.state || null,
          pin: row.PIN || null,
          openingBalance: Number.parseFloat(row.openingBalance || 0) || 0,
          partyType: row.party_type || null,
          contactPerson: row.contact_person || null,
        };
      }
    });

    // Merge template 68 rows with template 49 party details
    const mergedReceivables = t68Rows.map((row) => {
      const nameKey = normalizeName(row.customer_name);
      const partyDetail = partyDetailMap[nameKey] || {};

      return {
        partyName: row.customer_name || '—',
        phone: row.customer_phone || partyDetail.phone || null,
        email: row.customer_email || partyDetail.email || null,
        address: partyDetail.address || null,
        gstin: partyDetail.gstin || null,
        pan: partyDetail.pan || null,
        billReference: row.bill_reference || null,
        billDate: row.bill_date || null,
        outstandingBalance: Number.parseFloat(row.outstanding_balance || 0) || 0,
        creditPeriod: partyDetail.creditDays || parseInt(row.credit_period || 0) || 0,
        creditDays: partyDetail.creditDays || parseInt(row.credit_period || 0) || 0,
        creditLimit: partyDetail.creditLimit || 0,
        dueDate: row.due_date || null,
        overdueDays: parseInt(row.overdue_days || 0) || 0,
        overdueRatio: Number.parseFloat(row.overdue_ratio || 0) || 0,
        bucket0to30: Number.parseFloat(row.bucket_0_30 || 0) || 0,
        bucket31to60: Number.parseFloat(row.bucket_31_60 || 0) || 0,
        bucket61to90: Number.parseFloat(row.bucket_61_90 || 0) || 0,
        bucketAbove90: Number.parseFloat(row.bucket_above_90 || 0) || 0,
        risk: row.risk || null,
        salesPerson: partyDetail.salesPerson || null,
        city: partyDetail.city || null,
        state: partyDetail.state || null,
        pin: partyDetail.pin || null,
        openingBalance: partyDetail.openingBalance || 0,
        partyType: partyDetail.partyType || null,
        contactPerson: partyDetail.contactPerson || null,
        voucherNumber: row.voucher_number || null,
        voucherGuid: row.voucher_guid || null,
      };
    });

    console.log('[Outstanding Full] merged receivables:', mergedReceivables.length);
    res.json({ success: true, data: { receivables: mergedReceivables } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

module.exports = router;
