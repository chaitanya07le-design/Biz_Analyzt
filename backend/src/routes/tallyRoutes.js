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
    
    // Fetch T53 (contains all Receipt and Payment vouchers with full ledger details)
    const result = await executeTemplate(53, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' });
    const allRows = result.content || [];

    // Group rows by voucher_number — each voucher has multiple ledger entries (debit/credit)
    const voucherMap = new Map();
    
    allRows.forEach((row, index) => {
      if (String(row.voucher_type || '').trim().toLowerCase() !== 'payment') return;
      
      const voucherNo = (row.voucher_number || `tally-payment-${index}`).trim();
      
      if (!voucherMap.has(voucherNo)) {
        // First row for this voucher — build the header
        voucherMap.set(voucherNo, {
          id: row.voucher_id || `tally-payment-${voucherMap.size}`,
          voucherNo,
          date: row.voucher_date || null,
          party: row.party_name || '—',
          partyId: row.party_id || null,
          amount: Math.abs(Number.parseFloat(row.total_amount_inr || 0) || 0),
          status: row.is_cancelled_flag === 1 ? 'CANCELLED' : 'PAID',
          narration: row.narration || '',
          referenceNumber: row.reference_number || '',
          
          // Array of ledger splits for this payment
          ledgers: [],
        });
      }

      // Push ledger line item into the voucher
      const voucher = voucherMap.get(voucherNo);
      if (row.ledger_name) {
        voucher.ledgers.push({
          ledgerId: row.ledger_id || null,
          ledgerName: row.ledger_name || '—',
          debit: Number.parseFloat(row.debit_amount_inr || 0) || 0,
          credit: Number.parseFloat(row.credit_amount_inr || 0) || 0,
        });
      }
    });

    const vouchers = [...voucherMap.values()].map((v) => ({
      ...v,
      items: v.ledgers.length, // count of ledger line items
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
      voucherType: row.voucher_type || null,
      email: row.email || null,
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
    const result = await executeTemplate(74, auth);
    const taxes = (result.content || []).map((row) => ({
      name: row.ledger_name,
      balance: Number.parseFloat(row.net_tax_liability_inr) || 0,
      inwardItc: Number.parseFloat(row.inward_itc_inr) || 0,
      outwardTax: Number.parseFloat(row.outward_tax_inr) || 0,
      gstin: row.gstin || '—',
      period: row.period || '—',
      returnFilingStatus: row.return_filing_status || '—',
      paymentStatus: row.payment_status || '—',
      dueDate: row.due_date || null,
    }));
    res.json({ success: true, data: { taxes } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 23 — GST vouchers for a specific month (GST Liability drill-down)
router.post('/gst-month-vouchers', async (req, res) => {
  try {
    const { month } = req.body; // e.g., "Apr 2024"
    if (!month) return res.status(400).json({ success: false, error: 'month is required' });

    const auth = await getTallyAuth();
    const result = await executeTemplate(23, auth);
    const t23Rows = result.content || [];

    // Match month: "Apr 2024" → filter by YYYY-MM
    const MONTH_ABBR = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};
    const [monthStr, yearStr] = month.toLowerCase().split(' ');
    const targetPrefix = `${yearStr}-${MONTH_ABBR[(monthStr||'').slice(0,3)] || '00'}-`;
    const seen = new Set();
    const vouchers = [];

    t23Rows.forEach((row) => {
      const invNo = (row.invoice_number || '').trim();
      const d = (row.invoice_date || '').toString().slice(0, 10); // "2024-04-02"
      if (!invNo || seen.has(invNo) || !d.startsWith(targetPrefix)) return;
      seen.add(invNo);
      vouchers.push({
        id: invNo,
        invoiceNo: invNo,
        date: row.invoice_date || null,
        partyName: row.party_name || '—',
        gstin: row.gstin || '—',
        taxableAmount: Number.parseFloat(row.taxable_amount || 0) || 0,
        cgst: Number.parseFloat(row.cgst_amount || 0) || 0,
        sgst: Number.parseFloat(row.sgst_amount || 0) || 0,
        igst: Number.parseFloat(row.igst_amount || 0) || 0,
        cess: Number.parseFloat(row.cess_amount || 0) || 0,
        hsnSac: row.hsn_sac_code || '—',
        placeOfSupply: row.place_of_supply || '—',
        totalInvoiceValue: Number.parseFloat(row.invoice_value || 0) || 0,
      });
    });

    res.json({ success: true, data: { month, vouchers, count: vouchers.length } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
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

    // Fetch T52 (line items, PartyID, narration), T72 (GSTIN), and T44 (CGST/SGST/IGST breakdown)
    const [t52Result, t72Result, t44Result] = await Promise.all([
      executeTemplate(52, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' }),
      executeTemplate(72, auth, { Cust_from_date: '2024-04-01', Cust_to_date: '2030-03-31' }),
      executeTemplate(44, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' }),
    ]);

    const t52Rows = t52Result.content || [];
    const t72Rows = t72Result.content || [];
    const t44Rows = t44Result.content || [];

    // Build T72 lookup map (keyed by invoice_no) for GSTIN and place of supply
    const t72Map = {};
    t72Rows.forEach((row) => {
      const key = (row.invoice_no || '').trim();
      if (key) t72Map[key] = row;
    });

    // Build T44 lookup map (keyed by Vch No.) for precise tax breakdown
    const t44Map = {};
    t44Rows.forEach((row) => {
      const key = (row['Vch No.'] || '').trim();
      if (key) t44Map[key] = row;
    });

    // Group T52 rows by voucher_number — each voucher has multiple line item rows
    const voucherMap = new Map();
    t52Rows.forEach((row, index) => {
      const voucherNo = (row.voucher_number || `tally-purchase-${index}`).trim();
      if (!voucherMap.has(voucherNo)) {
        // First row for this voucher — build the header
        const t72 = t72Map[voucherNo] || {};
        const t44 = t44Map[voucherNo] || {};
        
        voucherMap.set(voucherNo, {
          id: `tally-purchase-${voucherMap.size}`,
          voucherNo,
          date: row.voucher_date || null,
          party: row.party_name || '—',
          partyId: row.party_id || null,
          amount: Number.parseFloat(row.netAmount || row.grossTotal || 0) || 0,
          grossTotal: Number.parseFloat(row.grossTotal || 0) || 0,
          totalGst: Number.parseFloat(row.totalGST || 0) || 0,
          roundOff: Number.parseFloat(row.roundOff || 0) || 0,
          status: row.isCancelled === 1 ? 'CANCELLED' : 'POSTED',
          narration: row.narration || '',
          referenceNumber: row.referenceNo || '',
          salesPerson: row.purchase_person || null,
          
          // From T72: GSTIN and place of supply
          gstin: t72.supplier_gstin || null,
          placeOfSupply: t72.place_of_supply || null,
          hsnCode: null, // HSN not available in purchase templates currently
          
          // From T44: Precise GST breakdown
          taxableAmount: Number.parseFloat(t44['Taxable Amount'] || t44.taxable_amount || row.grossTotal || 0) || 0,
          cgst: Number.parseFloat(t44['CGST'] || t44.cgst || 0) || 0,
          sgst: Number.parseFloat(t44['SGST/UTGST'] || t44.sgst || 0) || 0,
          igst: Number.parseFloat(t44['IGST'] || t44.igst || 0) || 0,
          cess: Number.parseFloat(t44['Cess'] || t44.cess || 0) || 0,
          
          // Line items array
          lineItems: [],
        });
      }

      // Push line item into the voucher
      const voucher = voucherMap.get(voucherNo);
      if (row.itemName) {
        voucher.lineItems.push({
          itemId: row.ItemID || null,
          itemName: row.itemName || '—',
          unit: row.unit || '—',
          quantity: Number.parseFloat(row.qty || 0) || 0,
          rate: Number.parseFloat(row.rate || 0) || 0,
          amount: Number.parseFloat(row.amount || 0) || 0,
          gstRate: Number.parseFloat(row.gstRate || 0) || 0,
          gstAmount: Number.parseFloat(row.gstAmount || 0) || 0,
          ledgerName: row.ledgerName || null,
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
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const entries = rows.map((row, index) => {
      const sales = Number.parseFloat(row.total_sales) || 0;
      const purchases = Number.parseFloat(row.total_purchase) || 0;
      const receipts = Number.parseFloat(row.total_receipt) || 0;
      const payments = Number.parseFloat(row.total_payment) || 0;
      const expenses = Number.parseFloat(row.total_expense) || 0;
      // Convert "Oct-2025" to monthKey "2025-10"
      const monthStr = row.month || '';
      const parts = monthStr.split('-');
      let monthKey = '';
      if (parts.length === 2) {
        const mIdx = monthNames.indexOf(parts[0].toLowerCase().slice(0, 3));
        monthKey = mIdx >= 0 ? `${parts[1]}-${String(mIdx + 1).padStart(2, '0')}` : '';
      }
      return { id: `tally-daybook-${index}`, monthKey, voucherNo: 'Monthly Tally Summary', date: row.month, category: 'Monthly Summary', partyName: '—', netAmount: sales + purchases + receipts + payments + expenses, narration: `Sales ${sales}; Purchases ${purchases}; Receipts ${receipts}; Payments ${payments}; Expenses ${expenses}` };
    });
    res.json({ success: true, data: { entries } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Templates 44 + 51 + 53 + 54 — All voucher types for a specific month (DayBook drill-down)
router.post('/day-book/month-vouchers', async (req, res) => {
  try {
    const { month } = req.body; // e.g., "2025-10"
    if (!month) return res.status(400).json({ success: false, error: 'month is required' });

    // Parse "YYYY-MM" into date range
    const [year, monthNum] = month.split('-');
    const fromDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    const toDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`;
    const targetMonthPrefix = `${year}-${monthNum}-`;

    const auth = await getTallyAuth();
    // T44=Purchase/DN, T51=Sales, T53=Payment/Receipt, T54=Journal/CN
    const [t44Result, t51Result, t53Result, t54Result] = await Promise.allSettled([
      executeTemplate(44, auth, { cust_from_date: fromDate, cust_to_date: toDate }),
      executeTemplate(51, auth, { cust_from_date: fromDate, cust_to_date: toDate }),
      executeTemplate(53, auth, { cust_from_date: fromDate, cust_to_date: toDate }),
      executeTemplate(54, auth, { cust_from_date: fromDate, cust_to_date: toDate }),
    ]);

    const t44Rows = (t44Result.status === 'fulfilled' ? t44Result.value.content : []) || [];
    const t51Rows = (t51Result.status === 'fulfilled' ? t51Result.value.content : []) || [];
    const t53Rows = (t53Result.status === 'fulfilled' ? t53Result.value.content : []) || [];
    const t54Rows = (t54Result.status === 'fulfilled' ? t54Result.value.content : []) || [];

    // --- T44: Purchase / Debit Note vouchers ---
    const t44Vouchers = t44Rows
      .filter((row) => String(row.Date || '').startsWith(targetMonthPrefix))
      .map((row, index) => {
        const taxable = Number.parseFloat(row['Taxable Amount'] || 0) || 0;
        const tax = Number.parseFloat(row['Tax Amount'] || 0) || 0;
        const partyRaw = row.Particulars || '—';
        const partyName = partyRaw.replace(/\s*\((?:Pur|Sales|Jrnl|Rcpt|Pymt)\)\s*$/i, '').trim();
        return { id: `t44-${index}`, voucherNo: row['Vch No.'] || '—', date: row.Date || null, partyName, voucherType: row['Vch Type'] || '—', netAmount: taxable + tax };
      });

    // --- T51: Sales vouchers (group by voucher_number) ---
    const seenSales = new Set();
    const t51Vouchers = [];
    t51Rows.forEach((row, index) => {
      const vno = (row.voucher_number || '').trim();
      const d = row.voucher_date || row.date || null;
      if (!vno || seenSales.has(vno) || !String(d || '').startsWith(targetMonthPrefix)) return;
      seenSales.add(vno);
      t51Vouchers.push({ id: `t51-${index}`, voucherNo: vno, date: d, partyName: row.party_name || '—', voucherType: 'Sales', netAmount: Number.parseFloat(row.net_amount_inr || row.gross_total_inr || 0) || 0 });
    });

    // --- T53: Payment / Receipt vouchers (group by voucher_number + voucher_type) ---
    const seenRcptPay = new Set();
    const t53Vouchers = [];
    t53Rows.forEach((row, index) => {
      const vno = (row.voucher_number || '').trim();
      const vtype = (row.voucher_type || '').trim();
      const d = row.voucher_date || null;
      const key = `${vtype || '?'}|${vno}`;
      if (!vno || seenRcptPay.has(key) || !String(d || '').startsWith(targetMonthPrefix)) return;
      // Capitalize: "payment" → "Payment", "receipt" → "Receipt"
      const niceType = vtype.charAt(0).toUpperCase() + vtype.slice(1).toLowerCase();
      if (!['Payment', 'Receipt'].includes(niceType)) return;
      seenRcptPay.add(key);
      t53Vouchers.push({ id: `t53-${index}`, voucherNo: vno, date: d, partyName: row.party_name || '—', voucherType: niceType, netAmount: Math.abs(Number.parseFloat(row.total_amount_inr || 0) || 0) });
    });

    // --- T54: Journal / Credit Note vouchers (group by voucher_id) ---
    const seenJnCn = new Set();
    const t54Vouchers = [];
    t54Rows.forEach((row, index) => {
      const vid = row.voucher_id || `${row.voucher_date || '?'}|${row.voucher_number || '?'}`;
      const d = row.voucher_date || null;
      const vtype = (row.voucher_type || '').trim();
      const niceType = vtype.charAt(0).toUpperCase() + vtype.slice(1).toLowerCase();
      if (!['Journal', 'Credit Note'].includes(niceType)) return;
      if (!seenJnCn.has(vid) && String(d || '').startsWith(targetMonthPrefix)) {
        seenJnCn.add(vid);
        t54Vouchers.push({ id: `t54-${index}`, voucherNo: row.voucher_number || '—', date: d, partyName: row.party_name || '—', voucherType: niceType, netAmount: Number.parseFloat(row.total_amount_inr || 0) || 0 });
      }
    });

    // Merge all and sort by date
    const vouchers = [...t44Vouchers, ...t51Vouchers, ...t53Vouchers, ...t54Vouchers].sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });

    res.json({ success: true, data: { month, vouchers, count: vouchers.length } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Voucher detail by voucherNo + type (for DayBook drill-down → individual voucher view)
router.post('/voucher-detail', async (req, res) => {
  try {
    const { voucherId, voucherNo, voucherType } = req.body;
    console.log(`[Voucher Detail] Requested type: "${voucherType}", no: "${voucherNo}", id: "${voucherId}"`);
    if (!voucherNo || !voucherType) {
      return res.status(400).json({ success: false, error: 'voucherNo and voucherType are required' });
    }

    const auth = await getTallyAuth();
    const broadRange = { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' };

    if (voucherType === 'Sales') {
      const [t51Result, t23Result] = await Promise.allSettled([
        executeTemplate(51, auth, broadRange),
        executeTemplate(23, auth),
      ]);
      const t51Rows = (t51Result.status === 'fulfilled' ? t51Result.value.content : []) || [];
      const t23Rows = (t23Result.status === 'fulfilled' ? t23Result.value.content : []) || [];

      // Build T23 lookup
      const t23Map = {};
      t23Rows.forEach((row) => {
        const key = (row.invoice_number || '').trim();
        if (key) t23Map[key] = row;
      });

      // Find matching voucher rows
      const rows = t51Rows.filter((r) => (r.voucher_number || '').trim() === voucherNo);
      if (rows.length === 0) return res.status(404).json({ success: false, error: 'Voucher not found' });

      const t23 = t23Map[voucherNo] || {};
      const firstRow = rows[0];

      // Group line items by item_name — Template 51 returns per-batch rows, not per-item rows.
      // Each batch row has its own amount_inr (batch subtotal), which inflates the visible total
      // when summed. We group by item_name, sum quantities, and compute amount as qty × rate,
      // scaled proportionally to match the true gross_total_inr.
      const itemGroups = {};
      rows.forEach((r) => {
        if (!r.item_name) return;
        const key = r.item_name;
        if (!itemGroups[key]) {
          itemGroups[key] = {
            itemName: key,
            quantity: 0,
            unit: r.unit || '—',
            rate: Number.parseFloat(r.rate_per_unit || 0) || 0,
            gstRate: Number.parseFloat(r.gst_rate_percent || 0) || 0,
            gstAmount: 0,
          };
        }
        itemGroups[key].quantity += Number.parseFloat(r.quantity || 0) || 0;
        itemGroups[key].gstAmount += Number.parseFloat(r.gst_amount_inr || 0) || 0;
      });

      // Compute raw item calc total (qty × rate per group), then scale to match gross
      const t51Gross = Number.parseFloat(firstRow.gross_total_inr || 0) || 0;
      const t23Taxable = Number.parseFloat(t23.taxable_amount || 0) || 0;
      const targetTotal = t23Taxable > 0 ? t23Taxable : t51Gross;
      const groupedItems = Object.values(itemGroups);
      const calcSum = groupedItems.reduce((s, g) => s + g.quantity * g.rate, 0);
      const scale = calcSum > 0 && targetTotal > 0 ? targetTotal / calcSum : 1;

      const lineItems = groupedItems.map((g) => ({
        itemName: g.itemName,
        quantity: g.quantity,
        unit: g.unit,
        rate: g.rate,
        amount: Math.round(g.quantity * g.rate * scale * 100) / 100,
        gstRate: g.gstRate,
        gstAmount: Math.round(g.gstAmount * scale * 100) / 100,
      })).sort((a, b) => b.amount - a.amount);

      res.json({ success: true, data: {
        voucherNo,
        voucherType: 'Sales',
        date: firstRow.voucher_date || null,
        party: firstRow.party_name || '—',
        narration: firstRow.narration || '',
        status: firstRow.is_cancelled_flag === 1 ? 'CANCELLED' : 'POSTED',
        grossTotal: t23Taxable,
        totalGst: Number.parseFloat(firstRow.total_gst_inr || 0) || 0,
        roundOff: Number.parseFloat(firstRow.round_off_inr || 0) || 0,
        netAmount: Number.parseFloat(firstRow.net_amount_inr || firstRow.gross_total_inr || 0) || 0,
        // GST breakdown from T23
        taxableAmount: Number.parseFloat(t23.taxable_amount || 0) || 0,
        cgst: Number.parseFloat(t23.cgst_amount || 0) || 0,
        sgst: Number.parseFloat(t23.sgst_amount || 0) || 0,
        igst: Number.parseFloat(t23.igst_amount || 0) || 0,
        cess: Number.parseFloat(t23.cess_amount || 0) || 0,
        gstin: t23.gstin || null,
        hsnCode: t23.hsn_sac_code || null,
        placeOfSupply: t23.place_of_supply || null,
        lineItems,
      }});
    } else if (voucherType === 'Journal' || voucherType === 'Debit Note' || voucherType === 'Credit Note') {
      // Template 54 — Journal, Debit Note, Credit Note (ledger-level entries, NOT inventory line items)
      const t54Result = await executeTemplate(54, auth, broadRange);
      const t54Rows = t54Result.content || [];

      // Filter rows for this exact voucher
      const targetVno = voucherNo === '—' ? '' : voucherNo;
      const rows = t54Rows.filter((r, i) => {
        const vno = (r.voucher_number || '').trim();
        return vno === targetVno || voucherNo === `tally-jncn-${i}`;
      });
      if (rows.length === 0) return res.status(404).json({ success: false, error: 'Voucher not found' });

      const firstRow = rows[0];
      const ledgerEntries = rows
        .filter((r) => r.ledger_name)
        .map((r) => ({
          ledgerName: r.ledger_name || '—',
          debit: Number.parseFloat(r.debit_amount_inr || 0) || 0,
          credit: Number.parseFloat(r.credit_amount_inr || 0) || 0,
        }))
        .sort((a, b) => (b.debit + b.credit) - (a.debit + a.credit));

      res.json({ success: true, data: {
        voucherNo,
        voucherType,
        date: firstRow.voucher_date || null,
        party: firstRow.party_name || (ledgerEntries.length > 0 ? ledgerEntries[0].ledgerName : '—'),
        narration: firstRow.narration || '',
        status: firstRow.is_cancelled_flag === true || firstRow.is_cancelled_flag === 'true' ? 'CANCELLED' : 'POSTED',
        netAmount: Number.parseFloat(firstRow.total_amount_inr || 0) || 0,
        ledgerEntries,
      }});
    } else if (voucherType === 'Payment' || voucherType === 'Receipt') {
      // Template 53 — Payment and Receipt vouchers (ledger-level entries)
      const t53Result = await executeTemplate(53, auth, broadRange);
      const t53Rows = t53Result.content || [];

      const targetVno = voucherNo === '—' ? '' : voucherNo;
      const rows = t53Rows.filter((r, i) => {
        const vno = (r.voucher_number || '').trim();
        const vtype = (r.voucher_type || '').trim().toLowerCase();
        const d = (r.voucher_date || '').toString().slice(0, 10);
        // voucherId is a composite key: "Payment|TRF|2026-09-10"
        if (voucherId) {
          const parts = voucherId.split('|');
          if (parts.length === 3) {
            return vtype === parts[0].toLowerCase() && vno === parts[1] && d === parts[2];
          }
        }
        return (vno === targetVno || voucherNo === `tally-rcpt-pay-${i}` || voucherNo === `tally-payment-${i}`) && vtype === voucherType.toLowerCase();
      });
      if (rows.length === 0) return res.status(404).json({ success: false, error: 'Voucher not found' });

      const firstRow = rows[0];
      const ledgerEntries = rows
        .filter((r) => r.ledger_name)
        .map((r) => ({
          ledgerName: r.ledger_name || '—',
          debit: Number.parseFloat(r.debit_amount_inr || 0) || 0,
          credit: Number.parseFloat(r.credit_amount_inr || 0) || 0,
        }))
        .sort((a, b) => (b.debit + b.credit) - (a.debit + a.credit));

      res.json({ success: true, data: {
        voucherNo,
        voucherType,
        date: firstRow.voucher_date || null,
        party: firstRow.party_name || (ledgerEntries.length > 0 ? ledgerEntries[0].ledgerName : '—'),
        narration: firstRow.narration || '',
        status: firstRow.is_cancelled_flag === 1 ? 'CANCELLED' : 'PAID',
        netAmount: Math.abs(Number.parseFloat(firstRow.total_amount_inr || 0) || 0),
        ledgerEntries,
      }});
    } else if (voucherType === 'Contra') {
      // Template 79 — Contra vouchers
      const t79Result = await executeTemplate(79, auth, broadRange);
      const t79Rows = t79Result.content || [];

      const targetVno = voucherNo === '—' ? '' : voucherNo;
      const rows = t79Rows.filter((r, i) => {
        const vno = (r.VoucherNo || '').trim();
        return vno === targetVno || voucherNo === `tally-contra-${i}`;
      });
      if (rows.length === 0) return res.status(404).json({ success: false, error: 'Voucher not found' });

      const firstRow = rows[0];
      const amount = Number.parseFloat(firstRow.GrandTotal || 0) || 0;
      const ledgerEntries = [];
      if (firstRow.fromAccount) ledgerEntries.push({ ledgerName: firstRow.fromAccount, credit: amount, debit: 0 });
      if (firstRow.toAccount) ledgerEntries.push({ ledgerName: firstRow.toAccount, debit: amount, credit: 0 });

      res.json({ success: true, data: {
        voucherNo,
        voucherType,
        date: firstRow.VoucherDate || null,
        party: firstRow.fromAccount || '—',
        narration: firstRow.Narration || '',
        status: firstRow.Status || 'POSTED',
        netAmount: amount,
        ledgerEntries,
      }});
    } else if (voucherType === 'Delivery Note') {
      const t78Result = await executeTemplate(78, auth, broadRange);
      const t78Rows = t78Result.content || [];

      const targetVno = voucherNo === '—' ? '' : voucherNo;
      const rows = t78Rows.filter((r, i) => {
        const vno = (r.VoucherNo || '').trim();
        return vno === targetVno || voucherNo === `tally-dn-${i}`;
      });
      if (rows.length === 0) return res.status(404).json({ success: false, error: 'Voucher not found' });

      const firstRow = rows[0];
      res.json({ success: true, data: {
        voucherNo,
        voucherType,
        date: firstRow.VoucherDate || null,
        party: firstRow.PartyName || '—',
        narration: firstRow.Narration || '',
        status: firstRow.Status || 'POSTED',
        netAmount: Number.parseFloat(firstRow.GrandTotal || 0) || 0,
        ledgerEntries: [],
      }});
    } else if (voucherType === 'Receipt Note') {
      const t64Result = await executeTemplate(64, auth, broadRange);
      const t64Rows = t64Result.content || [];

      const targetVno = voucherNo === '—' ? '' : voucherNo;
      const rows = t64Rows.filter((r, i) => {
        const vno = (r.voucher_number || r.voucherNo || '').trim();
        const vtype = (r.voucher_type || r.voucherType || '').toLowerCase();
        return (vno === targetVno || voucherNo === `tally-rn-${i}`) && vtype === 'receipt note';
      });
      if (rows.length === 0) return res.status(404).json({ success: false, error: 'Voucher not found' });

      const firstRow = rows[0];
      res.json({ success: true, data: {
        voucherNo,
        voucherType,
        date: firstRow.voucher_date || firstRow.date || null,
        party: firstRow.party_name || firstRow.partyName || '—',
        narration: firstRow.narration || firstRow.lineNarration || '',
        status: firstRow.isCancelled === 'Yes' || firstRow.is_cancelled_flag === 1 ? 'CANCELLED' : 'POSTED',
        netAmount: Number.parseFloat(firstRow.total_amount_inr || firstRow.amount_inr || firstRow.amount || 0) || 0,
        ledgerEntries: [],
      }});
    } else {
      // Purchase, Debit Note, etc.
      const [t52Result, t72Result, t44Result] = await Promise.allSettled([
        executeTemplate(52, auth, broadRange),
        executeTemplate(72, auth, { Cust_from_date: '2024-04-01', Cust_to_date: '2030-03-31' }),
        executeTemplate(44, auth, broadRange),
      ]);
      const t52Rows = (t52Result.status === 'fulfilled' ? t52Result.value.content : []) || [];
      const t72Rows = (t72Result.status === 'fulfilled' ? t72Result.value.content : []) || [];
      const t44Rows = (t44Result.status === 'fulfilled' ? t44Result.value.content : []) || [];

      const t72Map = {};
      t72Rows.forEach((row) => {
        const key = (row.invoice_no || '').trim();
        if (key) t72Map[key] = row;
      });
      const t44Map = {};
      t44Rows.forEach((row) => {
        const key = (row['Vch No.'] || '').trim();
        if (key) t44Map[key] = row;
      });

      const rows = t52Rows.filter((r) => (r.voucher_number || '').trim() === voucherNo);
      if (rows.length === 0) return res.status(404).json({ success: false, error: 'Voucher not found' });

      const t72 = t72Map[voucherNo] || {};
      const t44 = t44Map[voucherNo] || {};
      const firstRow = rows[0];
      const lineItems = rows
        .filter((r) => r.itemName)
        .map((r) => ({
          itemName: r.itemName || '—',
          quantity: Number.parseFloat(r.qty || 0) || 0,
          unit: r.unit || '—',
          rate: Number.parseFloat(r.rate || 0) || 0,
          amount: Number.parseFloat(r.amount || 0) || 0,
          gstRate: Number.parseFloat(r.gstRate || 0) || 0,
          gstAmount: Number.parseFloat(r.gstAmount || 0) || 0,
        }));

      res.json({ success: true, data: {
        voucherNo,
        voucherType,
        date: firstRow.voucher_date || null,
        party: firstRow.party_name || '—',
        narration: firstRow.narration || '',
        status: firstRow.isCancelled === 1 ? 'CANCELLED' : 'POSTED',
        grossTotal: Number.parseFloat(firstRow.grossTotal || 0) || 0,
        totalGst: Number.parseFloat(firstRow.totalGST || 0) || 0,
        roundOff: Number.parseFloat(firstRow.roundOff || 0) || 0,
        netAmount: Number.parseFloat(firstRow.netAmount || firstRow.grossTotal || 0) || 0,
        taxableAmount: Number.parseFloat(t44['Taxable Amount'] || 0) || 0,
        cgst: Number.parseFloat(t44['CGST'] || 0) || 0,
        sgst: Number.parseFloat(t44['SGST/UTGST'] || 0) || 0,
        igst: Number.parseFloat(t44['IGST'] || 0) || 0,
        cess: Number.parseFloat(t44['Cess'] || 0) || 0,
        gstin: t72.supplier_gstin || null,
        hsnCode: null,
        placeOfSupply: t72.place_of_supply || null,
        lineItems,
      }});
    }
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/expenses/templates', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const today = new Date().toISOString().slice(0, 10);
    const broadRange = { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' };
    const todayRange = { cust_from_date: today, cust_to_date: today };

    // Template 48 = expense breakdown (name, group, amount)
    // T44 = today's Purchase/DN, T51 = today's Sales, T53 = today's Payment/Receipt
    const [t48Result, t44Result, t51Result, t53Result] = await Promise.allSettled([
      executeTemplate(48, auth),
      executeTemplate(44, auth, todayRange),
      executeTemplate(51, auth, todayRange),
      executeTemplate(53, auth, todayRange),
    ]);

    const t48Rows = (t48Result.status === 'fulfilled' ? t48Result.value.content : []) || [];
    const t44Rows = (t44Result.status === 'fulfilled' ? t44Result.value.content : []) || [];
    const t51Rows = (t51Result.status === 'fulfilled' ? t51Result.value.content : []) || [];
    const t53Rows = (t53Result.status === 'fulfilled' ? t53Result.value.content : []) || [];

    // --- Template 48: Expense summary (group-level, aggregate all ledgers) ---
    const expenseMap = {};
    t48Rows.forEach((row) => {
      const nature = (row.Nature || '').toLowerCase();
      if (nature !== 'expense') return;
      const groupName = row.parent_group_name || row.under_group_name || 'Other Expenses';
      const key = groupName.toLowerCase();
      const closingBal = Number.parseFloat(row.closing_balance || row.closingbalance || row.ClosingBalance || 0) || 0;
      const openingBal = Number.parseFloat(row.opening_balance_inr || row.OpeningBalance || 0) || 0;
      const amount = Math.abs(closingBal) > 0 ? Math.abs(closingBal) : Math.abs(openingBal);
      if (amount === 0) return;
      if (!expenseMap[key]) expenseMap[key] = { name: groupName, group: groupName, amount: 0 };
      expenseMap[key].amount += amount;
    });
    const expenses = Object.values(expenseMap).sort((a, b) => b.amount - a.amount).map((e, i) => ({ id: `exp-${i}`, ...e }));

    // --- Today's transactions: T44 (Purchase/DN) ---
    const todayTxns = [];
    t44Rows.forEach((row, index) => {
      const d = row.Date || null;
      if (!d || !String(d).startsWith(today)) return;
      const taxable = Number.parseFloat(row['Taxable Amount'] || 0) || 0;
      const tax = Number.parseFloat(row['Tax Amount'] || 0) || 0;
      const partyRaw = row.Particulars || '—';
      todayTxns.push({
        id: `td-t44-${index}`,
        expenseDate: d,
        voucherNo: row['Vch No.'] || '—',
        voucherId: row.voucher_id || null,
        partyName: partyRaw.replace(/\s*\((?:Pur|Sales|Jrnl|Rcpt|Pymt)\)\s*$/i, '').trim(),
        expenseType: row['Vch Type'] || '—',
        notes: '',
        billReference: '—',
        amount: taxable + tax,
      });
    });

    // T51: Sales
    t51Rows.forEach((row, index) => {
      const d = row.voucher_date || row.date || null;
      if (!d || !String(d || '').startsWith(today)) return;
      const vno = (row.voucher_number || '').trim();
      if (!vno) return;
      todayTxns.push({
        id: `td-t51-${index}`,
        expenseDate: d,
        voucherNo: vno,
        voucherId: row.voucher_id || null,
        partyName: row.party_name || '—',
        expenseType: 'Sales',
        notes: row.narration || '',
        billReference: row.reference_number || '—',
        amount: Number.parseFloat(row.net_amount_inr || row.gross_total_inr || 0) || 0,
      });
    });

    // T53: Payment/Receipt
    const seenRcptPay = new Set();
    t53Rows.forEach((row, index) => {
      const d = row.voucher_date || null;
      if (!d || !String(d || '').startsWith(today)) return;
      const vno = (row.voucher_number || '').trim();
      const vtypeRaw = (row.voucher_type || '').trim().toLowerCase();
      const key = `${vtypeRaw}|${vno}`;
      if (!vno || seenRcptPay.has(key)) return;
      const niceType = vtypeRaw.charAt(0).toUpperCase() + vtypeRaw.slice(1);
      if (!['Payment', 'Receipt'].includes(niceType)) return;
      seenRcptPay.add(key);
      todayTxns.push({
        id: `td-t53-${index}`,
        expenseDate: d,
        voucherNo: vno,
        voucherId: row.voucher_id || `${niceType}|${vno}|${String(d||'').slice(0,10)}`,
        partyName: row.party_name || '—',
        expenseType: niceType,
        notes: row.narration || '',
        billReference: row.reference_number || '—',
        amount: Math.abs(Number.parseFloat(row.total_amount_inr || 0) || 0),
      });
    });

    todayTxns.sort((a, b) => (a.expenseDate || '').localeCompare(b.expenseDate || ''));

    res.json({ success: true, data: { expenses, today: todayTxns } });
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

    // Fetch T48 (master) and T83 (analytics) concurrently
    const [t48Result, t83Result] = await Promise.allSettled([
      executeTemplate(48, auth),
      executeTemplate(83, auth),
    ]);

    const t48Rows = t48Result.status === 'fulfilled' ? (t48Result.value.content || []) : [];
    const t83Rows = t83Result.status === 'fulfilled' ? (t83Result.value.content || []) : [];

    // Map T83 rows by lowercase LedgerName for quick lookup
    const t83Map = new Map();
    t83Rows.forEach(row => {
      const name = String(row.LedgerName || '').trim().toLowerCase();
      if (name) t83Map.set(name, row);
    });

    const ledgers = t48Rows.map((row, index) => {
      const name = String(row.ledger_name || '').trim();
      const nameLower = name.toLowerCase();
      const analytics = t83Map.get(nameLower) || {};

      return {
        id: row.LedgerID || `tally-ledger-${index}`,
        name: name || '—',
        group: row.parent_group_name || row.under_group_name || analytics.GroupName || '—',
        type: (row.group_type || '').toLowerCase(),
        balance: Number.parseFloat(analytics.ClosingBalance || row.opening_balance_inr || 0) || 0,
        // Master fields from T48
        LedgerID: row.LedgerID || null,
        CompanyID: row.CompanyID || null,
        GroupID: row.GroupID || analytics.GroupID || null,
        isActive: row.IsActive === 1 || String(row.IsActive).toLowerCase() === 'true',
        statementType: row.StatementType || null,
        nature: row.Nature || null,
        isSystemLedger: row.is_system_ledger === 1 || String(row.is_system_ledger).toLowerCase() === 'true',
        openingBalance: Number.parseFloat(analytics.OpeningBalance || row.opening_balance_inr || 0) || 0,
        // Analytics from T83
        closingBalance: Number.parseFloat(analytics.ClosingBalance || 0) || 0,
        totalDebit: Number.parseFloat(analytics.totalDebit || 0) || 0,
        totalCredit: Number.parseFloat(analytics.totalCredit || 0) || 0,
        netMovement: Number.parseFloat(analytics.netMovement || 0) || 0,
        voucherCount: parseInt(analytics.voucherCount || 0) || 0,
        lastVoucherDate: analytics.lastVoucherDate || null,
      };
    });

    res.json({ success: true, data: { ledgers } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// ── Shared ledger detail builder ─────────────────────────────────────────
const buildLedgerDetail = async (auth, masterRow, analyticsRow) => {
  const analytics = analyticsRow || {};
  return {
    LedgerName: masterRow.ledger_name || '—',
    Group: masterRow.parent_group_name || masterRow.under_group_name || analytics.GroupName || null,
    GroupID: masterRow.GroupID || analytics.GroupID || null,
    Type: masterRow.group_type || null,
    LedgerID: masterRow.LedgerID || null,
    CompanyID: masterRow.CompanyID || null,
    IsActive: masterRow.IsActive === 1 || String(masterRow.IsActive).toLowerCase() === 'true',
    StatementType: masterRow.StatementType || null,
    Nature: masterRow.Nature || null,
    IsSystemLedger: masterRow.is_system_ledger === 1 || String(masterRow.is_system_ledger).toLowerCase() === 'true',
    OpeningBalance: Number.parseFloat(analytics.OpeningBalance || masterRow.opening_balance_inr || 0) || 0,
    ClosingBalance: Number.parseFloat(analytics.ClosingBalance || 0) || 0,
    TotalDebit: Number.parseFloat(analytics.totalDebit || 0) || 0,
    TotalCredit: Number.parseFloat(analytics.totalCredit || 0) || 0,
    NetMovement: Number.parseFloat(analytics.netMovement || 0) || 0,
    VoucherCount: parseInt(analytics.voucherCount || 0) || 0,
    LastVoucherDate: analytics.lastVoucherDate || null,
  };
};

// ── Ledger Detail by Name ─────────────────────────────────────────────────
router.post('/ledger-by-name', async (req, res) => {
  const ledgerName = String(req.body?.ledgerName || '').trim();
  if (!ledgerName) return res.status(400).json({ success: false, error: 'ledgerName is required.' });
  try {
    const auth = await getTallyAuth();
    const [t48Result, t83Result] = await Promise.allSettled([
      executeTemplate(48, auth),
      executeTemplate(83, auth),
    ]);
    const t48Rows = t48Result.status === 'fulfilled' ? (t48Result.value.content || []) : [];
    const t83Rows = t83Result.status === 'fulfilled' ? (t83Result.value.content || []) : [];
    const nameLower = ledgerName.toLowerCase();
    const masterRow = t48Rows.find(r => String(r.ledger_name || '').trim().toLowerCase() === nameLower);
    const analyticsRow = t83Rows.find(r => String(r.LedgerName || '').trim().toLowerCase() === nameLower);
    if (!masterRow && !analyticsRow) return res.status(404).json({ success: false, error: 'Ledger not found in Tally.' });
    const data = await buildLedgerDetail(auth, masterRow || {}, analyticsRow || {});
    res.json({ success: true, data });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// ── Ledger Detail by Tally ID ─────────────────────────────────────────────
router.post('/ledger-by-tally-id', async (req, res) => {
  const tallyId = String(req.body?.tallyId || '').trim();
  if (!tallyId) return res.status(400).json({ success: false, error: 'tallyId is required.' });
  try {
    const auth = await getTallyAuth();
    const t48Rows = (await executeTemplate(48, auth)).content || [];
    let matchedRow = t48Rows.find(r => r.LedgerID === tallyId);
    if (!matchedRow) {
      const idxMatch = tallyId.match(/tally-ledger-(\d+)$/);
      if (idxMatch) matchedRow = t48Rows[parseInt(idxMatch[1], 10)] || null;
    }
    if (!matchedRow) return res.status(404).json({ success: false, error: 'Ledger not found in Tally.' });
    const ledgerName = String(matchedRow.ledger_name || '').trim();
    const t83Rows = (await executeTemplate(83, auth)).content || [];
    const analyticsRow = t83Rows.find(r => String(r.LedgerName || '').trim().toLowerCase() === ledgerName.toLowerCase()) || {};
    const data = await buildLedgerDetail(auth, matchedRow, analyticsRow);
    res.json({ success: true, data });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// ── Ledger Detail + Transactions (used by LedgerDetail.jsx) ──────────────
// api.getTallyLedgerDetail(ledgerId, ledgerName) → POST /tally/ledger-detail/template
router.post('/ledger-detail/template', async (req, res) => {
  const rawId   = String(req.body?.ledgerId   || '').trim();
  const rawName = String(req.body?.ledgerName || '').trim();
  if (!rawId && !rawName) return res.status(400).json({ success: false, error: 'ledgerId or ledgerName required.' });

  try {
    const auth = await getTallyAuth();

    // 1. Fetch Master (T48) & Analytics (T83) first
    const [t48Result, t83Result] = await Promise.allSettled([
      executeTemplate(48, auth),
      executeTemplate(83, auth),
    ]);

    const t48Rows = t48Result.status === 'fulfilled' ? (t48Result.value.content || []) : [];
    const t83Rows = t83Result.status === 'fulfilled' ? (t83Result.value.content || []) : [];

    // 2. Find master row
    let masterRow = null;
    if (rawId) {
      masterRow = t48Rows.find(r => r.LedgerID === rawId);
      if (!masterRow) {
        const idxMatch = rawId.match(/tally-ledger-(\d+)$/);
        if (idxMatch) masterRow = t48Rows[parseInt(idxMatch[1], 10)] || null;
      }
    }
    if (!masterRow && rawName) {
      const nl = rawName.toLowerCase();
      masterRow = t48Rows.find(r => String(r.ledger_name || '').trim().toLowerCase() === nl);
    }

    if (!masterRow) return res.status(404).json({ success: false, error: 'Ledger not found in Tally.' });

    const ledgerName = String(masterRow.ledger_name || '').trim();
    const nameLower  = ledgerName.toLowerCase();
    const analyticsRow = t83Rows.find(r => String(r.LedgerName || '').trim().toLowerCase() === nameLower) || {};
    const masterDetail = await buildLedgerDetail(auth, masterRow, analyticsRow);

    // 3. Fetch Transactions (T28) SPECIFICALLY for this ledger
    const searchName = masterDetail.LedgerName || ledgerName;
    let t28Rows = [];
    try {
      const t28Result = await executeTemplate(28, auth, { ledger_name: searchName });
      t28Rows = t28Result.content || [];
    } catch (e) {
      console.error('Error fetching T28 for ledger', searchName, e);
    }

    // Build transaction lines using T28
    const isDebitNature = masterDetail.Nature === 'Expense' || masterDetail.Nature === 'Asset';
    let runningBalance = Number.parseFloat(masterDetail.OpeningBalance || 0) || 0;
    
    const transactions = t28Rows.map((row) => {
      const debit = Number.parseFloat(row.debit || 0) || 0;
      const credit = Number.parseFloat(row.credit || 0) || 0;
      
      if (isDebitNature) {
        runningBalance += debit - credit;
      } else {
        runningBalance += credit - debit;
      }
      
      return {
        date: row.date || row.voucher_date || null,
        voucherNo: row.voucher_number || row.voucherNo || '—',
        type: row.voucher_type || row.type || '—',
        particulars: row.narration || row.particulars || '—',
        debit,
        credit,
        balance: Math.round(runningBalance * 100) / 100,
      };
    });

    const computedTotalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const computedTotalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
    const finalBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : masterDetail.ClosingBalance;

    res.json({
      success: true,
      data: {
        ledger: {
          name:           masterDetail.LedgerName,
          group:          masterDetail.Group,
          type:           (masterDetail.Nature || masterDetail.Type || '').toLowerCase(),
          openingBalance: masterDetail.OpeningBalance,
          closingBalance: finalBalance,
          totalDebit:     computedTotalDebit > 0 ? computedTotalDebit : masterDetail.TotalDebit,
          totalCredit:    computedTotalCredit > 0 ? computedTotalCredit : masterDetail.TotalCredit,
          voucherCount:   masterDetail.VoucherCount,
          isActive:       masterDetail.IsActive,
          statementType:  masterDetail.StatementType,
          nature:         masterDetail.Nature,
          ...masterDetail,
        },
        transactions,
      },
    });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// ── Voucher Detail ───────────────────────────────────────────────
router.post('/voucher-detail', async (req, res) => {
  const { voucherNo, voucherType, voucherId } = req.body;
  if (!voucherNo) return res.status(400).json({ success: false, error: 'voucherNo required' });

  try {
    const auth = await getTallyAuth();
    // Use Template 18 (Voucher Register) to find the voucher
    let tData = await executeTemplate(18, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' });
    let rows = tData.content || [];
    
    // Find all rows for this voucher
    let voucherRows = rows.filter((r, i) => {
      const isMatch = (r.voucher_number === voucherNo || r.voucherNo === voucherNo) ||
                      (voucherNo === `tally-rcpt-pay-${i}`) ||
                      (voucherNo === `tally-payment-${i}`) ||
                      (voucherNo === `tally-rn-${i}`) ||
                      (voucherNo === `tally-dn-${i}`) ||
                      (voucherNo === `tally-jncn-${i}`) ||
                      (voucherNo === `tally-contra-${i}`) ||
                      (voucherNo === `tally-vch-${i}`);
                      
      const isTypeMatch = (!voucherType || (r.voucher_type || r.voucherType || r.voucher_type_name || '').toLowerCase() === voucherType.toLowerCase());
      
      return isMatch && isTypeMatch;
    });
    
    if (!voucherRows.length) {
      // Fallback for other specific vouchers types
      let fbData = { content: [] };
      const vt = (voucherType || '').toLowerCase();
      if (vt === 'delivery note') {
        fbData = await executeTemplate(78, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' });
      } else if (vt === 'contra') {
        fbData = await executeTemplate(79, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' });
      } else if (vt === 'payment' || vt === 'receipt') {
        fbData = await executeTemplate(53, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' });
      } else if (vt === 'journal' || vt === 'debit note' || vt === 'credit note') {
        fbData = await executeTemplate(54, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' });
      } else if (vt === 'purchase') {
        fbData = await executeTemplate(20, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' }); // Template 20 is typically Purchase Register
      }
      
      rows = fbData.content || [];
      voucherRows = rows.filter((r, i) => {
        const isMatch = (r.voucher_number === voucherNo || r.voucherNo === voucherNo || r.referenceNo === voucherNo || r.VoucherNo === voucherNo) ||
                        (voucherNo === `tally-rcpt-pay-${i}`) ||
                        (voucherNo === `tally-payment-${i}`) ||
                        (voucherNo === `tally-rn-${i}`) ||
                        (voucherNo === `tally-dn-${i}`) ||
                        (voucherNo === `tally-jncn-${i}`) ||
                        (voucherNo === `tally-contra-${i}`) ||
                        (voucherNo === `tally-vch-${i}`);
                        
        const isTypeMatch = (!voucherType || (r.voucher_type || r.voucherType || r.VoucherType || r.voucher_type_name || '').toLowerCase() === voucherType.toLowerCase());
        
        if (isMatch) {
           console.log(`[Voucher Detail] Found match at index ${i} with type ${r.voucher_type}, isTypeMatch: ${isTypeMatch}`);
        }
        return isMatch && isTypeMatch;
      });
    }
    
    if (!voucherRows.length) {
      console.log(`[Voucher Detail] 404 NOT FOUND for type: "${voucherType}", no: "${voucherNo}"`);
      return res.status(404).json({ success: false, error: 'Voucher not found' });
    }

    const firstRow = voucherRows[0];
    const voucher = {
      id: firstRow.voucher_id || voucherId || `tally-vch-${voucherNo}`,
      voucherNo: firstRow.voucher_number || firstRow.voucherNo || firstRow.VoucherNo || voucherNo,
      type: firstRow.voucher_type || firstRow.voucherType || firstRow.VoucherType || firstRow.voucher_type_name || voucherType,
      date: firstRow.voucher_date || firstRow.date,
      partyName: firstRow.party_name || firstRow.partyName || '—',
      netAmount: Number.parseFloat(firstRow.amount_inr || firstRow.amount || firstRow.net_amount_inr || 0) || 0,
      narration: firstRow.narration || '',
      lineItems: voucherRows.map((r, i) => {
        let amt = Number.parseFloat(r.amount_inr || r.amount || 0) || 0;
        let isDebit = r.is_deemed_positive === 'Yes' || r.is_debit === 'Yes' || r.is_debit === true;
        
        if (r.debitAmount && Number.parseFloat(r.debitAmount) > 0) {
          amt = Number.parseFloat(r.debitAmount);
          isDebit = true;
        } else if (r.creditAmount && Number.parseFloat(r.creditAmount) > 0) {
          amt = Number.parseFloat(r.creditAmount);
          isDebit = false;
        }
        return {
          id: `line-${i}`,
          ledgerName: r.ledger_name || r.particulars || '—',
          amount: amt,
          debit: isDebit ? amt : 0,
          credit: !isDebit ? amt : 0,
          isDebit: isDebit,
        };
      })
    };

    res.json({ success: true, data: voucher });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

router.post('/test-t64-types', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const t18Data = await executeTemplate(18, auth, { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' });
    const types = [...new Set((t18Data.content || []).map(r => r.voucher_type_name))];
    res.json({ success: true, types, keys: t18Data.content.length > 0 ? Object.keys(t18Data.content[0]) : [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/receipt-note-vouchers/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const t64Data = await executeTemplate(64, auth, {
      cust_from_date: req.body.fromDate || '2024-04-01',
      cust_to_date: req.body.toDate || '2030-03-31',
    });
    
    const rows = t64Data.content || [];
    const vouchers = [];
    rows.forEach((row, index) => {
      // Group by voucher_number or VoucherID
      if ((row.voucher_type || row.voucherType || '').toLowerCase() !== 'receipt note') return;
      
      const vNo = row.voucher_number || row.voucherNo || `tally-rn-${index}`;
      vouchers.push({
        id: vNo,
        voucherNo: vNo,
        date: row.voucher_date || row.date || null,
        partyId: row.party_id || row.partyId || null,
        party: row.party_name || row.partyName || '—',
        amount: Number.parseFloat(row.total_amount_inr || row.amount_inr || row.amount || 0) || 0,
        narration: row.narration || row.lineNarration || '',
        status: row.isCancelled === 'Yes' || row.is_cancelled_flag === 1 ? 'CANCELLED' : 'POSTED',
        voucherType: 'Receipt Note',
        referenceNo: row.referenceNo || '—',
      });
    });

    res.json({ success: true, data: { vouchers } });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

router.post('/items/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    
    // Fetch T55 (master) and T87 (analytics) concurrently
    const [t55Result, t87Result] = await Promise.allSettled([
      executeTemplate(55, auth),
      executeTemplate(87, auth)
    ]);

    const t55Rows = t55Result.status === 'fulfilled' ? (t55Result.value.content || []) : [];
    const t87Rows = t87Result.status === 'fulfilled' ? (t87Result.value.content || []) : [];

    // Map T87 rows by lowercase ItemName for quick lookup
    const t87Map = new Map();
    t87Rows.forEach(row => {
      const name = String(row.ItemName || '').trim().toLowerCase();
      if (name) t87Map.set(name, row);
    });

    const items = t55Rows.map((row, index) => {
      const name = String(row.item_name || '').trim();
      const nameLower = name.toLowerCase();
      const analytics = t87Map.get(nameLower) || {};

      return {
        id: row.ItemID || row.item_id || `tally-item-${index}`,
        name: name || '—',
        group: row.item_stock_group_name || row.stock_group_name || analytics.GroupID || '—',
        stock: Number.parseFloat(row.current_stock_quantity || 0) || 0,
        unit: row.unit_of_measure || analytics.Unit || 'Nos',
        rate: Number.parseFloat(row.sale_rate_inr || 0) || Number.parseFloat(analytics.SaleRate || 0) || 0,
        gst: Number.parseFloat(row.gst_rate_percent || 0) || Number.parseFloat(analytics.GST || 0) || 0,
        brand: row.Brand || row.brand || analytics.Brand || null,
        hsn: row.hsn_code || row.HSN || analytics.HSN || null,
        categoryId: row.CategoryID || analytics.CategoryID || null,
        subCategory: row.SubCategory || null,
        minStockLevel: Number.parseFloat(row.MinStockLevel || analytics.MinStockLevel || 0) || 0,
        maxStockLevel: Number.parseFloat(row.MaxStockLevel || analytics.MaxStockLevel || 0) || 0,
        reorderLevel: Number.parseFloat(row.reorder_level || row.ReorderLevel || analytics.ReorderLevel || 0) || 0,
        isActive: row.IsActive !== undefined ? (row.IsActive === 1 || String(row.IsActive).toLowerCase() === 'true') : true,
        openingStock: Number.parseFloat(row.opening_stock_quantity || row.openingStock || 0) || 0,
        purchaseRate: Number.parseFloat(row.purchase_rate_inr || row.purchaseRate || 0) || 0,
        stockValue: Number.parseFloat(row.current_stock_value_inr || analytics.StockValue || 0) || 0,
        mrp: Number.parseFloat(row.MRP || 0) || 0,
        
        // Analytics fields from T87
        salesVelocity: Number.parseFloat(analytics.SalesVelocity30d || 0) || 0,
        isUnderstock: analytics.IsUnderstock === 1 || String(analytics.IsUnderstock).toLowerCase() === 'true',
        isOverstock: analytics.IsOverstock === 1 || String(analytics.IsOverstock).toLowerCase() === 'true',
        isPopular: analytics.IsPopular === 1 || String(analytics.IsPopular).toLowerCase() === 'true',
        daysOfStock: Number.parseFloat(analytics.DaysOfStock || 0) || 0,
        lastSaleDate: analytics.LastSaleDate || null,
        lastPurchaseDate: analytics.LastPurchaseDate || null,
      };
    });

    res.json({ success: true, data: { items } });
  } catch (error) { 
    res.status(502).json({ success: false, error: error.message }); 
  }
});

// ── Item Detail by Name ───────────────────────────────────────────────────
router.post('/item-by-name', async (req, res) => {
  const itemName = String(req.body?.itemName || '').trim();
  if (!itemName) return res.status(400).json({ success: false, error: 'itemName is required.' });

  try {
    const auth = await getTallyAuth();
    const [t55Result, t87Result] = await Promise.allSettled([
      executeTemplate(55, auth),
      executeTemplate(87, auth)
    ]);

    const t55Rows = t55Result.status === 'fulfilled' ? (t55Result.value.content || []) : [];
    const t87Rows = t87Result.status === 'fulfilled' ? (t87Result.value.content || []) : [];

    const nameLower = itemName.toLowerCase();
    const masterRow = t55Rows.find(r => String(r.item_name || '').trim().toLowerCase() === nameLower) || {};
    const analyticsRow = t87Rows.find(r => String(r.ItemName || '').trim().toLowerCase() === nameLower) || {};

    if (!masterRow.item_name && !analyticsRow.ItemName) {
      return res.status(404).json({ success: false, error: 'Item not found in Tally.' });
    }

    res.json({
      success: true,
      data: {
        ItemName: masterRow.item_name || analyticsRow.ItemName || itemName,
        Category: masterRow.item_stock_group_name || masterRow.stock_group_name || analyticsRow.GroupID || null,
        Unit: masterRow.unit_of_measure || analyticsRow.Unit || 'Nos',
        SaleRate: Number.parseFloat(masterRow.sale_rate_inr || 0) || Number.parseFloat(analyticsRow.SaleRate || 0) || 0,
        GST: Number.parseFloat(masterRow.gst_rate_percent || 0) || Number.parseFloat(analyticsRow.GST || 0) || 0,
        Brand: masterRow.Brand || masterRow.brand || analyticsRow.Brand || null,
        HSN: masterRow.hsn_code || masterRow.HSN || analyticsRow.HSN || null,
        CategoryID: masterRow.CategoryID || analyticsRow.CategoryID || null,
        SubCategory: masterRow.SubCategory || null,
        MinStockLevel: Number.parseFloat(masterRow.MinStockLevel || analyticsRow.MinStockLevel || 0) || 0,
        MaxStockLevel: Number.parseFloat(masterRow.MaxStockLevel || analyticsRow.MaxStockLevel || 0) || 0,
        ReorderLevel: Number.parseFloat(masterRow.reorder_level || masterRow.ReorderLevel || analyticsRow.ReorderLevel || 0) || 0,
        IsActive: masterRow.IsActive !== undefined ? (masterRow.IsActive === 1 || String(masterRow.IsActive).toLowerCase() === 'true') : true,
        OpeningStock: Number.parseFloat(masterRow.opening_stock_quantity || masterRow.openingStock || 0) || 0,
        PurchaseRate: Number.parseFloat(masterRow.purchase_rate_inr || masterRow.purchaseRate || 0) || 0,
        StockValue: Number.parseFloat(masterRow.current_stock_value_inr || analyticsRow.StockValue || 0) || 0,
        MRP: Number.parseFloat(masterRow.MRP || 0) || 0,
        SalesVelocity30d: Number.parseFloat(analyticsRow.SalesVelocity30d || 0) || 0,
        IsUnderstock: analyticsRow.IsUnderstock === 1 || String(analyticsRow.IsUnderstock).toLowerCase() === 'true',
        IsOverstock: analyticsRow.IsOverstock === 1 || String(analyticsRow.IsOverstock).toLowerCase() === 'true',
        IsPopular: analyticsRow.IsPopular === 1 || String(analyticsRow.IsPopular).toLowerCase() === 'true',
        DaysOfStock: Number.parseFloat(analyticsRow.DaysOfStock || 0) || 0,
        LastSaleDate: analyticsRow.LastSaleDate || null,
        LastPurchaseDate: analyticsRow.LastPurchaseDate || null,
      }
    });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// ── Item Detail by Tally ID ───────────────────────────────────────────────
router.post('/item-by-tally-id', async (req, res) => {
  const tallyId = String(req.body?.tallyId || '').trim();
  if (!tallyId) return res.status(400).json({ success: false, error: 'tallyId is required.' });

  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(55, auth)).content || [];

    let matchedRow = rows.find(r => r.ItemID === tallyId || r.item_id === tallyId);
    if (!matchedRow) {
      const idxMatch = tallyId.match(/tally-item-(\d+)$/);
      if (idxMatch) {
        const idx = parseInt(idxMatch[1], 10);
        matchedRow = rows[idx] || null;
      }
    }

    if (!matchedRow) {
      return res.status(404).json({ success: false, error: 'Item not found in Tally.' });
    }

    const itemName = String(matchedRow.item_name || '').trim();
    if (!itemName) return res.status(404).json({ success: false, error: 'Item name missing.' });

    // Re-use the name lookup logic
    const t87Rows = (await executeTemplate(87, auth)).content || [];
    const nameLower = itemName.toLowerCase();
    const analyticsRow = t87Rows.find(r => String(r.ItemName || '').trim().toLowerCase() === nameLower) || {};

    res.json({
      success: true,
      data: {
        ItemName: matchedRow.item_name || itemName,
        Category: matchedRow.item_stock_group_name || matchedRow.stock_group_name || analyticsRow.GroupID || null,
        Unit: matchedRow.unit_of_measure || analyticsRow.Unit || 'Nos',
        SaleRate: Number.parseFloat(matchedRow.sale_rate_inr || 0) || Number.parseFloat(analyticsRow.SaleRate || 0) || 0,
        GST: Number.parseFloat(matchedRow.gst_rate_percent || 0) || Number.parseFloat(analyticsRow.GST || 0) || 0,
        Brand: matchedRow.Brand || matchedRow.brand || analyticsRow.Brand || null,
        HSN: matchedRow.hsn_code || matchedRow.HSN || analyticsRow.HSN || null,
        CategoryID: matchedRow.CategoryID || analyticsRow.CategoryID || null,
        SubCategory: matchedRow.SubCategory || null,
        MinStockLevel: Number.parseFloat(matchedRow.MinStockLevel || analyticsRow.MinStockLevel || 0) || 0,
        MaxStockLevel: Number.parseFloat(matchedRow.MaxStockLevel || analyticsRow.MaxStockLevel || 0) || 0,
        ReorderLevel: Number.parseFloat(matchedRow.reorder_level || matchedRow.ReorderLevel || analyticsRow.ReorderLevel || 0) || 0,
        IsActive: matchedRow.IsActive !== undefined ? (matchedRow.IsActive === 1 || String(matchedRow.IsActive).toLowerCase() === 'true') : true,
        OpeningStock: Number.parseFloat(matchedRow.opening_stock_quantity || matchedRow.openingStock || 0) || 0,
        PurchaseRate: Number.parseFloat(matchedRow.purchase_rate_inr || matchedRow.purchaseRate || 0) || 0,
        StockValue: Number.parseFloat(matchedRow.current_stock_value_inr || analyticsRow.StockValue || 0) || 0,
        MRP: Number.parseFloat(matchedRow.MRP || 0) || 0,
        SalesVelocity30d: Number.parseFloat(analyticsRow.SalesVelocity30d || 0) || 0,
        IsUnderstock: analyticsRow.IsUnderstock === 1 || String(analyticsRow.IsUnderstock).toLowerCase() === 'true',
        IsOverstock: analyticsRow.IsOverstock === 1 || String(analyticsRow.IsOverstock).toLowerCase() === 'true',
        IsPopular: analyticsRow.IsPopular === 1 || String(analyticsRow.IsPopular).toLowerCase() === 'true',
        DaysOfStock: Number.parseFloat(analyticsRow.DaysOfStock || 0) || 0,
        LastSaleDate: analyticsRow.LastSaleDate || null,
        LastPurchaseDate: analyticsRow.LastPurchaseDate || null,
      }
    });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

router.post('/accounts/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    
    // Fetch T48 (Ledgers Master) and T84 (Bank Details) concurrently
    const [t48Result, t84Result] = await Promise.allSettled([
      executeTemplate(48, auth),
      executeTemplate(84, auth)
    ]);

    const t48Rows = t48Result.status === 'fulfilled' ? (t48Result.value.content || []) : [];
    const t84Rows = t84Result.status === 'fulfilled' ? (t84Result.value.content || []) : [];

    // Map T84 rows by LedgerID and LedgerName for quick lookup
    const t84Map = new Map();
    t84Rows.forEach(row => {
      if (row.LedgerID) t84Map.set(row.LedgerID, row);
      const name = String(row.LedgerName || row.ledger_name || '').trim().toLowerCase();
      if (name) t84Map.set(name, row);
    });

    // Filter T48 to only include Bank and Cash accounts
    const accountRows = t48Rows.filter(row => {
      const parent = (row.parent_group_name || row.group_type || row.under_group_name || row.Nature || '').toLowerCase();
      return parent.includes('bank') || parent.includes('cash');
    });

    const accounts = accountRows.map((row, index) => {
      const name = String(row.ledger_name || row.LedgerName || '').trim();
      const nameLower = name.toLowerCase();
      const parent = (row.parent_group_name || row.group_type || row.under_group_name || row.Nature || '').toLowerCase();
      
      const bankDetail = t84Map.get(row.LedgerID) || t84Map.get(nameLower) || {};

      return {
        id: row.LedgerID || `tally-account-${index}`,
        AccountID: row.LedgerID || `tally-account-${index}`,
        CompanyID: row.CompanyID || null,
        LedgerID: row.LedgerID || null,
        name: name || '—',
        type: parent.includes('cash') ? 'Cash' : 'Bank',
        balance: Number.parseFloat(row.closing_balance || row.ClosingBalance || bankDetail.ClosingBalance || 0) || 0,
        accountNo: bankDetail.AccountNumber || '',
        branch: bankDetail.BranchName || '',
        bankName: bankDetail.BankName || '',
        ifsc: bankDetail.IFSC || '',
        isActive: row.IsActive !== undefined ? (row.IsActive === 1 || String(row.IsActive).toLowerCase() === 'true') : true,
        location: bankDetail.BranchName || '', // Location fallback for banks
      };
    });

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
  const toDate = (req.body || {}).toDate || '2030-12-31';
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(53, auth, { cust_from_date: fromDate, cust_to_date: toDate })).content || [];

    const voucherMap = new Map();
    
    rows.forEach((row, index) => {
      const voucherNo = (row.voucher_number || `tally-rcpt-pay-${index}`).trim();
      
      if (!voucherMap.has(voucherNo)) {
        voucherMap.set(voucherNo, {
          id: row.voucher_id || `tally-rcpt-pay-${voucherMap.size}`,
          date: row.voucher_date || null,
          voucherNo,
          type: row.voucher_type || '—',
          party: row.party_name || '—',
          partyId: row.party_id || null,
          amount: Math.abs(Number.parseFloat(row.total_amount_inr || 0) || 0),
          status: row.is_cancelled_flag === 1 ? 'CANCELLED' : 'POSTED',
          narration: row.narration || '',
          referenceNumber: row.reference_number || '',
          ledgers: [],
        });
      }

      const voucher = voucherMap.get(voucherNo);
      if (row.ledger_name) {
        voucher.ledgers.push({
          ledgerId: row.ledger_id || null,
          ledgerName: row.ledger_name || '—',
          debit: Number.parseFloat(row.debit_amount_inr || 0) || 0,
          credit: Number.parseFloat(row.credit_amount_inr || 0) || 0,
        });
      }
    });

    const vouchers = [...voucherMap.values()].map((v) => ({
      ...v,
      items: v.ledgers.length,
    }));

    res.json({ success: true, data: { vouchers } });
  } catch (error) { 
    res.status(502).json({ success: false, error: error.message }); 
  }
});

// Template 54 — Journal, Debit Note, Credit Note vouchers (date range)
router.post('/journal-dn-cn-vouchers/template', async (req, res) => {
  const fromDate = (req.body || {}).fromDate || '2024-01-01';
  const toDate = (req.body || {}).toDate || '2026-12-31';
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(54, auth, { cust_from_date: fromDate, cust_to_date: toDate })).content || [];
    console.log('[Template 54] total rows:', rows.length);
    console.log('[Template 54] field keys:', JSON.stringify(Object.keys(rows[0] || {})));

    // Group line-item rows into unique vouchers by voucher_id
    const voucherMap = {};
    rows.forEach((row, index) => {
      const vid = row.voucher_id || `${row.voucher_date || '?'}|${row.voucher_number || '?'}`;
      if (!voucherMap[vid]) {
        voucherMap[vid] = {
          id: `tally-journal-${index}`,
          voucherId: row.voucher_id || null,
          date: row.voucher_date || null,
          voucherNo: row.voucher_number || '—',
          type: row.voucher_type || '—',
          party: row.party_name || '—',
          partyId: row.party_id || null,
          amount: Number.parseFloat(row.total_amount_inr || 0) || 0,
          narration: row.narration || '',
          referenceNo: row.reference_number || null,
          isCancelled: row.is_cancelled_flag === 'true' || row.is_cancelled_flag === true || false,
          lineItems: [],
        };
      }
      if (row.ledger_name || row.ledger_id) {
        voucherMap[vid].lineItems.push({
          ledgerName: row.ledger_name || '—',
          ledgerId: row.ledger_id || null,
          debitAmount: Number.parseFloat(row.debit_amount_inr || 0) || 0,
          creditAmount: Number.parseFloat(row.credit_amount_inr || 0) || 0,
          narration: row.line_narration || '',
          sortOrder: parseInt(row.sort_order || 0) || 0,
        });
      }
    });

    const vouchers = Object.values(voucherMap).map((v) => {
      v.lineItems.sort((a, b) => a.sortOrder - b.sortOrder);
      return v;
    });

    console.log('[Template 54] unique vouchers:', vouchers.length);
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

// Template 61 — Geographic rollup
router.post('/geographic-rollup/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(61, auth)).content || [];
    const geo = rows.map((row, index) => {
      let topCustomers = [];
      try { topCustomers = typeof row.ledgerDetails === 'string' ? JSON.parse(row.ledgerDetails) : (row.ledgerDetails || []); } catch (e) { topCustomers = []; }
      return {
        id: `tally-geo-${index}`,
        state: row.State || '—',
        city: row.City || 'Multiple',
        partyCount: parseInt(row.PartyCount || 0) || 0,
        salesValue: Number.parseFloat(row.TotalSalesValue || 0) || 0,
        purchaseValue: Number.parseFloat(row.TotalPurchaseValue || 0) || 0,
        outstanding: Number.parseFloat(row.NetAmount || 0) || 0,
        topCustomers: topCustomers.map((c) => c.ledgerName || c.LedgerName || '—').join(', ') || '—',
        topItems: '—',
        period: row.period || null,
        lastTransactionDate: row.LastTransactionDate || null,
      };
    });
    res.json({ success: true, data: { geo } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 49 + 51 + 52 — Geographic full (city-level aggregation by party_name)
router.post('/geographic/full', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const broadRange = { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' };

    const [t49Result, t51Result, t52Result] = await Promise.allSettled([
      executeTemplate(49, auth),
      executeTemplate(51, auth, broadRange),
      executeTemplate(52, auth, broadRange),
    ]);

    const t49Rows = (t49Result.status === 'fulfilled' ? t49Result.value.content : []) || [];
    const t51Rows = (t51Result.status === 'fulfilled' ? t51Result.value.content : []) || [];
    const t52Rows = (t52Result.status === 'fulfilled' ? t52Result.value.content : []) || [];

    // Build T49 party lookup: normalized_name → { city, state, balance, gstin, fullName }
    const normalizeCity = (rawCity) => {
      if (!rawCity) return '';
      let c = rawCity.trim();
      // Take first segment before comma, pipe, or newline
      const firstComma = c.search(/[,|\n]/);
      if (firstComma > 0) c = c.substring(0, firstComma).trim();
      // Remove common prefixes that aren't city names (c/o, dist-, nr., opp., plot no., shed no., d.no.)
      c = c.replace(/^(dist[\s-]+|nr\.?\s+|opp\.?\s+|plot\s+no\.?\s*[\d,\/-]+\s*,?\s*|shed\s+no\.?\s*[\d,\/-]+\s*,?\s*|c\/o\s+|d\.?no\.?\s*[\d,\/-]+\s*,?\s*)/i, '').trim();
      // If the cleaned name is very short (< 3 chars), keep the original
      if (c.length < 3) return rawCity.trim();
      // Title-case: uppercase first letter, lowercase rest
      c = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
      return c;
    };

    const partyMap = {};
    t49Rows.forEach((r) => {
      const name = (r.party_name || '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      const city = normalizeCity(r.city || '');
      const state = (r.state || '').trim();
      if (!city && !state) return; // skip parties without location
      partyMap[key] = {
        fullName: name,
        city: city || 'Unknown',
        state: state || 'Unknown',
        balance: Number.parseFloat(r.openingBalance || 0) || 0,
        gstin: r.gstin || null,
      };
    });

    // Aggregate T51 sales by party_name (deduplicated by voucher_number)
    const salesByParty = {};
    const seenSales = new Set();
    t51Rows.forEach((r) => {
      const name = (r.party_name || '').trim();
      const vno = (r.voucher_number || '').trim();
      if (!name) return;
      const key = `${name.toLowerCase()}|${vno}`;
      if (seenSales.has(key)) return;
      seenSales.add(key);
      const nk = name.toLowerCase();
      if (!salesByParty[nk]) salesByParty[nk] = { totalSales: 0, txnCount: 0, lastDate: null };
      salesByParty[nk].totalSales += Number.parseFloat(r.net_amount_inr || r.gross_total_inr || 0) || 0;
      salesByParty[nk].txnCount += 1;
      const d = r.voucher_date || r.date || null;
      if (d && (!salesByParty[nk].lastDate || new Date(d) > new Date(salesByParty[nk].lastDate))) {
        salesByParty[nk].lastDate = d;
      }
    });

    // Aggregate T52 purchases by party_name (deduplicated by voucher_number)
    const purchByParty = {};
    const seenPurch = new Set();
    t52Rows.forEach((r) => {
      const name = (r.party_name || '').trim();
      const vno = (r.voucher_number || '').trim();
      if (!name) return;
      const key = `${name.toLowerCase()}|${vno}`;
      if (seenPurch.has(key)) return;
      seenPurch.add(key);
      const nk = name.toLowerCase();
      if (!purchByParty[nk]) purchByParty[nk] = { totalPurchase: 0, txnCount: 0 };
      purchByParty[nk].totalPurchase += Number.parseFloat(r.grossTotal || 0) || 0;
      purchByParty[nk].txnCount += 1;
    });

    // Merge by city: group all parties in the same (state, city)
    const cityMap = {};
    Object.entries(partyMap).forEach(([normName, pty]) => {
      const cityKey = `${pty.state}|${pty.city}`;
      if (!cityMap[cityKey]) {
        cityMap[cityKey] = {
          state: pty.state,
          city: pty.city,
          partyCount: 0,
          salesValue: 0,
          purchaseValue: 0,
          outstanding: 0,
          topCustomers: [], // will store { name, totalValue } for sorting
        };
      }
      const c = cityMap[cityKey];
      c.partyCount += 1;
      c.outstanding += Math.abs(pty.balance);

      const sales = salesByParty[normName] || {};
      const purch = purchByParty[normName] || {};
      c.salesValue += sales.totalSales || 0;
      c.purchaseValue += purch.totalPurchase || 0;

      const totalTxnValue = (sales.totalSales || 0) + (purch.totalPurchase || 0);
      if (totalTxnValue > 0) {
        c.topCustomers.push({ name: pty.fullName, totalValue: totalTxnValue });
      }
    });

    // Convert to array, sort topCustomers, stringify names
    const geo = Object.entries(cityMap)
      .filter(([k, c]) => c.salesValue > 0 || c.purchaseValue > 0 || c.outstanding > 0)
      .map(([key, c], index) => {
        c.topCustomers.sort((a, b) => b.totalValue - a.totalValue);
        const top5Names = c.topCustomers.slice(0, 5).map(t => t.name).join(', ');
        return {
          id: `tally-geo-full-${index}`,
          state: c.state,
          city: c.city,
          partyCount: c.partyCount,
          salesValue: Math.round(c.salesValue * 100) / 100,
          purchaseValue: Math.round(c.purchaseValue * 100) / 100,
          outstanding: Math.round(c.outstanding * 100) / 100,
          topCustomers: top5Names || '—',
          topItems: '—',
          period: null,
          lastTransactionDate: null,
        };
      });

    res.json({ success: true, data: { geo } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Template 49 — All parties with contact details + credit terms
router.post('/party-details/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(49, auth)).content || [];
    const parties = rows.map((row, index) => {
      const pt = (row.party_type || '').toLowerCase();
      let type = 'Customer';
      if (pt.includes('creditor') || pt.includes('supplier') || pt.includes('vendor') || pt.includes('payable') || pt.includes('seller')) type = 'Supplier';
      if ((pt.includes('debtor') || pt.includes('customer') || pt.includes('receivable') || pt.includes('buyer')) && (pt.includes('creditor') || pt.includes('supplier'))) type = 'Both';

      return {
        id: row.PartyID || `tally-party-detail-${index}`,
        name: row.party_name || '—',
        type,
        gstin: row.gstin || '—',
        address: row.full_address || '—',
        city: row.city || '—',
        state: row.state || '—',
        pin: row.PIN || '—',
        mobile: row.phone_number || '—',
        email: row.email || '—',
        contactPerson: row.contact_person || '—',
        pan: row.PAN || '—',
        creditLimit: Number.parseFloat(row.creditLimit || 0) || 0,
        creditDays: parseInt(row.creditDays || 0) || 0,
        salesPerson: row.salesPerson || '—',
        openingBalance: Number.parseFloat(row.openingBalance || 0) || 0,
        balance: Number.parseFloat(row.openingBalance || row.opening_balance_inr || 0) || 0,
        status: row.Status || 'Active',
        parentGroup: row.parent_group_name || '—',
        incomeTaxNumber: row.income_tax_number || '—',
      };
    });
    res.json({ success: true, data: { parties } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Aggregated customer transactions (T51 Sales + T53 Receipts by party_name)
router.post('/customer-transactions/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const broadRange = { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' };

    const [t51Result, t53Result] = await Promise.allSettled([
      executeTemplate(51, auth, broadRange),
      executeTemplate(53, auth, broadRange),
    ]);

    const t51Rows = (t51Result.status === 'fulfilled' ? t51Result.value.content : []) || [];
    const t53Rows = (t53Result.status === 'fulfilled' ? t53Result.value.content : []) || [];

    // Aggregate sales by party_name
    const salesByParty = {};
    const seenSalesVouchers = new Set();
    t51Rows.forEach((row) => {
      const party = (row.party_name || '').trim();
      const vno = (row.voucher_number || '').trim();
      if (!party) return;
      const key = `${party}|${vno}`;
      if (seenSalesVouchers.has(key)) return;
      seenSalesVouchers.add(key);
      const amount = Number.parseFloat(row.net_amount_inr || row.gross_total_inr || 0) || 0;
      const date = row.voucher_date || row.date || null;
      if (!salesByParty[party]) {
        salesByParty[party] = { totalSales: 0, transactionCount: 0, lastTransaction: null };
      }
      salesByParty[party].totalSales += amount;
      salesByParty[party].transactionCount += 1;
      if (date && (!salesByParty[party].lastTransaction || new Date(date) > new Date(salesByParty[party].lastTransaction))) {
        salesByParty[party].lastTransaction = date;
      }
    });

    // Aggregate receipts by party_name
    const receiptsByParty = {};
    const seenReceiptVouchers = new Set();
    t53Rows.forEach((row) => {
      const vtype = (row.voucher_type || '').trim().toLowerCase();
      if (vtype !== 'receipt') return;
      const party = (row.party_name || '').trim();
      const vno = (row.voucher_number || '').trim();
      if (!party) return;
      const key = `${party}|${vno}`;
      if (seenReceiptVouchers.has(key)) return;
      seenReceiptVouchers.add(key);
      const amount = Number.parseFloat(row.total_amount_inr || 0) || 0;
      if (!receiptsByParty[party]) receiptsByParty[party] = 0;
      receiptsByParty[party] += amount;
    });

    res.json({ success: true, data: { salesByParty, receiptsByParty } });
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

    const vouchers = rows.map((row, index) => {
      const vNo = row.VoucherNo || `tally-dn-${index}`;
      return {
        id: vNo,
        voucherNo: vNo,
        date: row.VoucherDate || null,
        partyId: row.PartyID || null,
        party: row.PartyName || '—',
        amount: Number.parseFloat(row.GrandTotal || 0) || 0,
        narration: row.Narration || '',
        status: row.Status || 'Active',
        voucherType: row.VoucherType || 'Delivery Note',
        referenceNo: row.referenceNo || '—',
      };
    });

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
      const vNo = row.VoucherNo || `tally-contra-${index}`;
      const key = `${row.VoucherDate || ''}|${row.Narration || ''}|${row.GrandTotal || '0'}`;
      if (!voucherMap[key]) {
        voucherMap[key] = {
          id: vNo,
          voucherNo: vNo,
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

// Template 54 — Journal, Debit Note, Credit Note vouchers
router.post('/journal-dn-cn-vouchers/template', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(54, auth, {
      cust_from_date: req.body?.fromDate || '2024-01-01',
      cust_to_date: req.body?.toDate || '2026-12-31',
    })).content || [];

    // Group line-item rows into unique vouchers
    const voucherMap = {};
    rows.forEach((row, index) => {
      const vtype = (row.voucher_type || '').trim();
      const niceType = vtype.charAt(0).toUpperCase() + vtype.slice(1).toLowerCase();
      if (!['Journal', 'Debit Note', 'Credit Note'].includes(niceType)) return;

      const vNo = row.voucher_number || `tally-jncn-${index}`;
      const key = `${row.voucher_date || ''}|${vNo}|${niceType}`;
      if (!voucherMap[key]) {
        voucherMap[key] = {
          id: vNo,
          voucherNo: vNo,
          date: row.voucher_date || null,
          partyName: row.party_name || '—',
          voucherType: niceType,
          amount: Number.parseFloat(row.total_amount_inr || 0) || 0,
          narration: row.narration || '',
          status: row.is_cancelled_flag === 1 || String(row.is_cancelled_flag).toLowerCase() === 'true' ? 'CANCELLED' : 'POSTED',
          ledgers: [],
        };
      }
      if (row.ledger_name) voucherMap[key].ledgers.push(row.ledger_name);
    });

    const vouchers = Object.values(voucherMap).map((v) => ({
      ...v,
      particulars: v.partyName !== '—' && v.partyName ? v.partyName : (v.ledgers.length ? v.ledgers.join(', ') : v.narration),
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

// Template 87 + 88 — Single item detail (item master + batch ageing merged by itemId)
router.post('/item-detail/template', async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ success: false, error: 'itemId is required' });

    const auth = await getTallyAuth();
    const [t87Result, t88Result] = await Promise.allSettled([
      executeTemplate(87, auth),
      executeTemplate(88, auth),
    ]);

    const t87Rows = (t87Result.status === 'fulfilled' ? t87Result.value.content : []) || [];
    const t88Rows = (t88Result.status === 'fulfilled' ? t88Result.value.content : []) || [];

    // T87: Find the matching item by ItemID
    const t87Match = t87Rows.find((r) => (r.ItemID || '').trim() === itemId) || {};
    const item = {
      itemId: itemId,
      itemName: t87Match.ItemName || '—',
      brand: t87Match.Brand || null,
      hsn: t87Match.HSN || '—',
      unit: t87Match.Unit || '—',
      gstRate: Number.parseFloat(t87Match.GST || 0) || 0,
      saleRate: Number.parseFloat(t87Match.SaleRate || 0) || 0,
      purchaseRate: 0,
      currentStock: Number.parseFloat(t87Match.CurrentStock || 0) || 0,
      stockValue: Number.parseFloat(t87Match.StockValue || 0) || 0,
      salesVelocity30d: Number.parseFloat(t87Match.SalesVelocity30d || 0) || 0,
      isUnderstock: t87Match.IsUnderstock === 'true' || t87Match.IsUnderstock === true,
      isOverstock: t87Match.IsOverstock === 'true' || t87Match.IsOverstock === true,
      isPopular: t87Match.IsPopular === 'true' || t87Match.IsPopular === true,
      daysOfStock: Number.parseFloat(t87Match.DaysOfStock || 0) || 0,
      reorderLevel: Number.parseFloat(t87Match.ReorderLevel || 0) || 0,
      lastSaleDate: t87Match.LastSaleDate || null,
      lastPurchaseDate: t87Match.LastPurchaseDate || null,
      location: t87Match.Location || null,
      categoryId: t87Match.CategoryID || null,
      groupId: t87Match.GroupID || null,
    };

    // T88: Find all batches for this item (match by ItemID or ItemName)
    const itemName = (item.itemName || '').toLowerCase().trim();
    const batches = t88Rows
      .filter((r) => {
        const bid = (r.ItemID || '').trim();
        const bname = (r.itemName || r.ItemName || '').toLowerCase().trim();
        return bid === itemId || (itemName && bname === itemName);
      })
      .map((r) => ({
        batchId: r.batchId || r.BatchID || null,
        batchNo: r.batchNo || r.BatchNo || '—',
        quantity: Number.parseFloat(r.quantity || r.Quantity || 0) || 0,
        value: Number.parseFloat(r.value || r.Value || 0) || 0,
        rate: Number.parseFloat(r.rate || r.Rate || 0) || 0,
        inwardDate: r.inwardDate || r.InwardDate || null,
        ageingDays: parseInt(r.ageingDays || r.AgeingDays || 0) || 0,
        ageingBucket: r.ageingBucket || r.AgeingBucket || '0-30',
        location: r.location || r.Location || item.location || null,
        mfgDate: r.mfgDate || r.MfgDate || null,
        expDate: r.expDate || r.ExpDate || null,
        isDeadStock: (parseInt(r.ageingDays || r.AgeingDays || 0) || 0) > 90,
      }));

    res.json({ success: true, data: { item, batches } });
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

// Template 87 + 89 — Stock Status Full (analytics + item master merged by itemId and name)
router.post('/stock-status/full', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const [t87Result, t89Result] = await Promise.allSettled([
      executeTemplate(87, auth),
      executeTemplate(89, auth),
    ]);

    const t87Rows = (t87Result.status === 'fulfilled' ? t87Result.value.content : []) || [];
    const t89Rows = (t89Result.status === 'fulfilled' ? t89Result.value.content : []) || [];

    // Build T87 lookup by ItemID and by name
    const t87Map = {};
    t87Rows.forEach((r) => {
      const id = (r.ItemID || '').trim();
      const name = (r.ItemName || '').trim().toLowerCase();
      if (id) t87Map[id] = r;
      if (name) t87Map[name] = r;
    });

    // Merge T89 analytics with T87 item master fields
    const items = t89Rows.map((row) => {
      const rid = (row.ItemID || '').trim();
      const rname = (row.ItemName || '').trim().toLowerCase();
      const t87 = t87Map[rid] || t87Map[rname] || {};
      return {
        // T89 analytics
        statusId: row.StatusID || null,
        itemId: row.ItemID || null,
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
        // T87 item master
        hsn: t87.HSN || '—',
        unit: t87.Unit || '—',
        gstRate: Number.parseFloat(t87.GST || 0) || 0,
        saleRate: Number.parseFloat(t87.SaleRate || 0) || 0,
        purchaseRate: 0,
        location: t87.Location || null,
        brand: t87.Brand || null,
        categoryId: t87.CategoryID || null,
        groupId: t87.GroupID || null,
      };
    });

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

// By Item Full — merge templates 77 + 52 + 87 for complete item sales/purchase/stock
router.post('/by-item/full', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const [t77Result, t52Result, t87Result] = await Promise.allSettled([
      executeTemplate(77, auth),
      executeTemplate(52, auth, { cust_from_date: '2024-01-01', cust_to_date: '2026-12-31' }),
      executeTemplate(87, auth),
    ]);

    const t77Rows = (t77Result.status === 'fulfilled' ? t77Result.value.content : []) || [];
    const t52Rows = (t52Result.status === 'fulfilled' ? t52Result.value.content : []) || [];
    const t87Rows = (t87Result.status === 'fulfilled' ? t87Result.value.content : []) || [];

    console.log('[ByItem Full] t77:', t77Rows.length, 't52:', t52Rows.length, 't87:', t87Rows.length);

    // Build stock map from template 87 by item_name
    const stockMap = {};
    t87Rows.forEach((r) => {
      const key = (r.ItemName || '').toLowerCase().trim();
      if (key) {
        stockMap[key] = {
          currentStock: Number.parseFloat(r.CurrentStock || 0) || 0,
          stockValue: Number.parseFloat(r.StockValue || 0) || 0,
          brand: r.Brand || null,
          hsn: r.HSN || null,
          unit: r.Unit || null,
          saleRate: Number.parseFloat(r.SaleRate || 0) || 0,
          gst: r.GST || null,
          groupId: r.GroupID || null,
        };
      }
    });

    // Build purchase aggregation from template 52 by itemName
    const purchaseMap = {};
    t52Rows.forEach((r) => {
      const itemName = r.itemName || null;  // camelCase in template 52
      if (!itemName) return;                // skip voucher header rows
      const key = itemName.toLowerCase().trim();
      if (!purchaseMap[key]) purchaseMap[key] = { purchaseQty: 0, purchaseValue: 0 };
      purchaseMap[key].purchaseQty += Number.parseFloat(r.qty || 0) || 0;       // qty, not quantity
      purchaseMap[key].purchaseValue += Number.parseFloat(r.amount || 0) || 0;  // amount, not amount_inr
    });

    // Build sales items from template 77 ITEM_WISE rows
    const salesItemMap = {};
    t77Rows
      .filter((r) => (r.report_type || '').toUpperCase() === 'ITEM_WISE')
      .forEach((r) => {
        const key = (r.item_name || '').toLowerCase().trim();
        if (!key) return;
        salesItemMap[key] = {
          itemName: r.item_name || '—',
          brand: r.brand || null,
          unit: r.unit || null,
          saleRate: Number.parseFloat(r.sale_rate || 0) || 0,
          gst: r.gst || null,
          hsn: r.hsn || null,
          qtySold: Number.parseFloat(r.total_qty || 0) || 0,
          salesValue: Number.parseFloat(r.total_amount || 0) || 0,
          voucherCount: parseInt(r.voucher_count || 0) || 0,
          lastSaleDate: r.last_sale_date || null,
        };
      });

    // Merge all three sources by item_name
    const allItemNames = new Set([
      ...Object.keys(salesItemMap),
      ...Object.keys(purchaseMap),
      ...Object.keys(stockMap),
    ]);

    const items = [];
    allItemNames.forEach((key) => {
      const sales = salesItemMap[key] || { itemName: key };
      const purchase = purchaseMap[key] || { purchaseQty: 0, purchaseValue: 0 };
      const stock = stockMap[key] || {};

      items.push({
        itemName: sales.itemName || key,
        brand: sales.brand || stock.brand || null,
        unit: sales.unit || stock.unit || null,
        saleRate: sales.saleRate || stock.saleRate || 0,
        gst: sales.gst || stock.gst || null,
        hsn: sales.hsn || stock.hsn || null,
        itemGroup: stock.groupId || null,
        stockBalance: stock.currentStock || 0,
        stockValue: stock.stockValue || 0,
        qtySold: sales.qtySold || 0,
        salesValue: sales.salesValue || 0,
        voucherCount: sales.voucherCount || 0,
        lastSaleDate: sales.lastSaleDate || null,
        purchaseQty: purchase.purchaseQty || 0,
        purchaseValue: purchase.purchaseValue || 0,
      });
    });

    console.log('[ByItem Full] merged items:', items.length);
    res.json({ success: true, data: { items } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Trial Balance Full — merge template 62 + 85 for classification + dual-period
router.post('/trial-balance/full', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const fromDate = req.body?.fromDate || '2025-04-01';
    const toDate = req.body?.toDate || '2026-03-31';
    const prevFromDate = req.body?.prevFromDate || '2024-04-01';
    const prevToDate = req.body?.prevToDate || '2025-03-31';

    const [t62Curr, t62Prev, t85] = await Promise.allSettled([
      executeTemplate(62, auth, { cust_from_date: fromDate, cust_to_date: toDate }),
      executeTemplate(62, auth, { cust_from_date: prevFromDate, cust_to_date: prevToDate }),
      executeTemplate(85, auth),
    ]);

    const currRows = (t62Curr.status === 'fulfilled' ? t62Curr.value.content : []) || [];
    const prevRows = (t62Prev.status === 'fulfilled' ? t62Prev.value.content : []) || [];
    const groupRows = (t85.status === 'fulfilled' ? t85.value.content : []) || [];

    console.log('[TrialBalance Full] curr:', currRows.length, 'prev:', prevRows.length, 'groups:', groupRows.length);

    // Build group lookup from template 85 by GroupName
    const groupMap = {};
    groupRows.forEach((r) => {
      const key = (r.GroupName || '').toLowerCase().trim();
      if (key) {
        groupMap[key] = {
          groupId: r.GroupID || null,
          groupName: r.GroupName || null,
          parentGroup: r.ParentGroup || null,
          groupType: r.GroupType || null,
          nature: r.Nature || null,
          statementType: r.StatementType || null,
          childCount: parseInt(r.childGroupCount || 0) || 0,
          ledgerCount: parseInt(r.ledgerCount || 0) || 0,
        };
      }
    });

    // Build previous period balance map by ledger_name
    const prevBalanceMap = {};
    prevRows.forEach((r) => {
      const key = (r.ledger_name || '').toLowerCase().trim();
      if (key) {
        prevBalanceMap[key] = {
          debit: Number.parseFloat(r.opening_debit_inr || 0) || 0,
          credit: Number.parseFloat(r.opening_credit_inr || 0) || 0,
          balance: Number.parseFloat(r.closing_balance_inr || 0) || 0,
        };
      }
    });

    // Merge current period with group data
    const entries = currRows.map((r) => {
      const groupName = (r.group_name || '').toLowerCase().trim();
      const groupInfo = groupMap[groupName] || {};
      const ledgerKey = (r.ledger_name || '').toLowerCase().trim();
      const prevBal = prevBalanceMap[ledgerKey] || { debit: 0, credit: 0, balance: 0 };

      const openingDebit = Number.parseFloat(r.opening_debit_inr || 0) || 0;
      const openingCredit = Number.parseFloat(r.opening_credit_inr || 0) || 0;
      const closingDebit = Number.parseFloat(r.closing_debit_inr || 0) || 0;
      const closingCredit = Number.parseFloat(r.closing_credit_inr || 0) || 0;
      const currentBalance = closingDebit - closingCredit;
      const prevBalance = prevBal.debit - prevBal.credit;

      return {
        ledgerId: r.ledger_id || null,
        ledgerName: r.ledger_name || '—',
        groupName: r.group_name || '—',
        parentGroup: groupInfo.parentGroup || null,
        nature: groupInfo.nature || null,
        statementType: groupInfo.statementType || null,
        groupType: groupInfo.groupType || null,
        childCount: groupInfo.childCount || 0,
        ledgerCount: groupInfo.ledgerCount || 0,
        openingDebit, openingCredit,
        closingDebit, closingCredit,
        debit: closingDebit,
        credit: closingCredit,
        balance: currentBalance,
        previousBalance: prevBalance,
        change: currentBalance - prevBalance,
        changePct: prevBalance !== 0 ? ((currentBalance - prevBalance) / Math.abs(prevBalance)) * 100 : 0,
      };
    });

    console.log('[TrialBalance Full] entries:', entries.length);
    res.json({ success: true, data: { entries } });
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// Profit & Loss Full — merge template 30 (summary) + 48 (detailed classification with period balances)
router.post('/profit-loss/full', async (req, res) => {
  try {
    const auth = await getTallyAuth();
    const [t30Result, t48Result] = await Promise.allSettled([
      executeTemplate(30, auth),
      executeTemplate(48, auth),
    ]);

    const t30 = (t30Result.status === 'fulfilled' ? t30Result.value.content : []) || [];
    const t48 = (t48Result.status === 'fulfilled' ? t48Result.value.content : []) || [];

    console.log('[ProfitLoss Full] t30 rows:', t30.length, 't48 rows:', t48.length);

    // Template 30 gives summary
    const t30Row = t30[0] || {};
    const summary = {
      sales: Number.parseFloat(t30Row.sales_accounts || 0) || 0,
      purchases: Number.parseFloat(t30Row.purchase_accounts || 0) || 0,
      directExpenses: Number.parseFloat(t30Row.direct_expenses || 0) || 0,
      directIncome: Number.parseFloat(t30Row.direct_incomes || 0) || 0,
      indirectExpenses: Number.parseFloat(t30Row.indirect_expenses || 0) || 0,
      indirectIncome: Number.parseFloat(t30Row.indirect_incomes || 0) || 0,
      openingStock: Number.parseFloat(t30Row.opening_stock || 0) || 0,
      closingStock: Number.parseFloat(t30Row.closing_stock || 0) || 0,
      grossProfit: Number.parseFloat(t30Row.gross_profit || 0) || 0,
      netProfit: Number.parseFloat(t30Row.net_profit || 0) || 0,
    };

    // Template 48 gives detailed ledger classification
    // Uses both closing_balance (period-to-date for P&L) and opening_balance_inr (opening balance)
    // For P&L items, closing balance IS the period activity (since they reset at year start)
    const expenseBreakdown = {};
    const revenueStreams = {};
    const otherIncome = {};
    const depreciation = {};
    const financeCosts = {};
    const employeeCosts = {};

    t48.forEach((row) => {
      const nature = (row.Nature || '').toLowerCase();
      const stmt = (row.StatementType || '').toLowerCase();
      const parentGroup = (row.parent_group_name || row.under_group_name || '').toLowerCase();
      const name = row.ledger_name || row.LedgerName || '—';
      // For P&L items: closing_balance || closingbalance || ClosingBalance gives the period-to-date activity
      // Fallback to opening_balance_inr for balance sheet items
      const closingBal = Number.parseFloat(row.closing_balance || row.closingbalance || row.ClosingBalance || 0) || 0;
      const openingBal = Number.parseFloat(row.opening_balance_inr || row.OpeningBalance || 0) || 0;
      // Use closing balance as the period amount (it reflects all transactions in the period for P&L items)
      const balance = Math.abs(closingBal) > 0 ? closingBal : openingBal;
      const absBalance = Math.abs(balance);

      if (absBalance === 0) return;

      if (nature === 'expense' || (stmt === 'profit & loss' && balance < 0)) {
        const expKey = parentGroup || 'Other Expenses';
        if (!expenseBreakdown[expKey]) expenseBreakdown[expKey] = { name: row.parent_group_name || row.under_group_name || 'Other Expenses', groupName: expKey, amount: 0, ledgers: [] };
        expenseBreakdown[expKey].amount += absBalance;
        expenseBreakdown[expKey].ledgers.push({ name, amount: absBalance });

        if (parentGroup.includes('depreciation') || parentGroup.includes('amortis')) {
          if (!depreciation[expKey]) depreciation[expKey] = { name: row.parent_group_name || 'Depreciation', amount: 0 };
          depreciation[expKey].amount += absBalance;
        }
        if (parentGroup.includes('finance') || parentGroup.includes('interest') || parentGroup.includes('bank charg')) {
          if (!financeCosts[expKey]) financeCosts[expKey] = { name: row.parent_group_name || 'Finance Costs', amount: 0 };
          financeCosts[expKey].amount += absBalance;
        }
        if (parentGroup.includes('employ') || parentGroup.includes('salar') || parentGroup.includes('wage') || parentGroup.includes('staff')) {
          if (!employeeCosts[expKey]) employeeCosts[expKey] = { name: row.parent_group_name || 'Employee Costs', amount: 0 };
          employeeCosts[expKey].amount += absBalance;
        }
      } else if (nature === 'income' || (stmt === 'profit & loss' && balance > 0)) {
        const incKey = parentGroup || 'Other Income';
        if (!revenueStreams[incKey]) revenueStreams[incKey] = { name: row.parent_group_name || row.under_group_name || 'Other Income', groupName: incKey, amount: 0, ledgers: [] };
        revenueStreams[incKey].amount += absBalance;
        revenueStreams[incKey].ledgers.push({ name, amount: absBalance });

        if (!parentGroup.includes('sale') && !parentGroup.includes('direct')) {
          if (!otherIncome[incKey]) otherIncome[incKey] = { name: row.parent_group_name || 'Other Income', amount: 0 };
          otherIncome[incKey].amount += absBalance;
        }
      }
    });

    console.log('[ProfitLoss Full] expense groups:', Object.keys(expenseBreakdown).length,
      'revenue groups:', Object.keys(revenueStreams).length,
      'depreciation:', Object.keys(depreciation).length,
      'finance:', Object.keys(financeCosts).length,
      'employee:', Object.keys(employeeCosts).length);

    res.json({ success: true, data: {
      summary,
      expenseBreakdown: Object.values(expenseBreakdown).sort((a, b) => b.amount - a.amount),
      revenueStreams: Object.values(revenueStreams).sort((a, b) => b.amount - a.amount),
      otherIncome: Object.values(otherIncome).sort((a, b) => b.amount - a.amount),
      depreciation: Object.values(depreciation).sort((a, b) => b.amount - a.amount),
      financeCosts: Object.values(financeCosts).sort((a, b) => b.amount - a.amount),
      employeeCosts: Object.values(employeeCosts).sort((a, b) => b.amount - a.amount),
    }});
  } catch (error) { res.status(502).json({ success: false, error: error.message }); }
});

// ── Shared date formatter for party detail routes ───────────────────────
const formatPartyDate = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Party Detail by Name ────────────────────────────────────────────────
// Used by dataRoutes /parties/:partyId to enrich modal with full Tally data
router.post('/party-by-name', async (req, res) => {
  const partyName = String(req.body?.partyName || '').trim();
  if (!partyName) return res.status(400).json({ success: false, error: 'partyName is required.' });

  try {
    const auth = await getTallyAuth();
    const broadRange = { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' };

    // T49: party master (contact, GSTIN, address, credit terms)
    // T51: sales transactions by party
    // T53: receipt/payment transactions by party
    const [t49Result, t51Result, t53Result] = await Promise.allSettled([
      executeTemplate(49, auth),
      executeTemplate(51, auth, broadRange),
      executeTemplate(53, auth, broadRange),
    ]);

    const t49Rows = (t49Result.status === 'fulfilled' ? t49Result.value.content : []) || [];
    const t51Rows = (t51Result.status === 'fulfilled' ? t51Result.value.content : []) || [];
    const t53Rows = (t53Result.status === 'fulfilled' ? t53Result.value.content : []) || [];

    const nameLower = partyName.toLowerCase();

    // Find master record from T49
    const masterRow = t49Rows.find(r =>
      String(r.party_name || '').trim().toLowerCase() === nameLower
    ) || {};

    // Build transaction history from T51 (sales — deduplicate by voucher_number)
    const seenSales = new Set();
    const salesTxns = [];
    t51Rows
      .filter(r => String(r.party_name || '').trim().toLowerCase() === nameLower)
      .forEach(r => {
        const vno = r.voucher_number || '';
        if (seenSales.has(vno)) return;
        seenSales.add(vno);
        salesTxns.push({
          date: formatPartyDate(r.voucher_date),
          voucherNo: vno || '—',
          voucherType: r.voucher_type || 'Sales',
          amount: Number.parseFloat(r.net_amount_inr || r.gross_total_inr || 0) || 0,
          status: r.is_cancelled_flag === 1 ? 'CANCELLED' : 'POSTED',
        });
      });

    // Build transaction history from T53 (receipts/payments)
    const seenRcpt = new Set();
    const rcptTxns = [];
    t53Rows
      .filter(r => String(r.party_name || '').trim().toLowerCase() === nameLower)
      .forEach(r => {
        const vno = r.voucher_number || '';
        if (seenRcpt.has(vno)) return;
        seenRcpt.add(vno);
        rcptTxns.push({
          date: formatPartyDate(r.voucher_date),
          voucherNo: vno || '—',
          voucherType: r.voucher_type || 'Receipt',
          amount: Math.abs(Number.parseFloat(r.total_amount_inr || 0) || 0),
          status: r.is_cancelled_flag === 1 ? 'CANCELLED' : 'POSTED',
        });
      });

    const transactions = [...salesTxns, ...rcptTxns]
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

    // Build type label
    const pt = String(masterRow.party_type || '').toLowerCase();
    let partyType = 'Customer';
    if (pt.includes('creditor') || pt.includes('supplier') || pt.includes('vendor') || pt.includes('payable')) partyType = 'Supplier';

    res.json({
      success: true,
      data: {
        PartyName: masterRow.party_name || partyName,
        PartyType: partyType,
        GSTIN: masterRow.gstin || null,
        Address: masterRow.full_address || null,
        City: masterRow.city || null,
        State: masterRow.state || null,
        PIN: masterRow.PIN || null,
        Phone: masterRow.phone_number || null,
        Email: masterRow.email || null,
        ContactPerson: masterRow.contact_person || null,
        PAN: masterRow.PAN || null,
        CreditLimit: Number.parseFloat(masterRow.creditLimit || 0) || 0,
        CreditDays: parseInt(masterRow.creditDays || 0) || 0,
        SalesPerson: masterRow.salesPerson || null,
        OpeningBalance: Number.parseFloat(masterRow.openingBalance || masterRow.opening_balance_inr || 0) || 0,
        Status: masterRow.Status || 'Active',
        ParentGroup: masterRow.parent_group_name || null,
        transactions,
      },
    });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

// ── Party Detail by Tally ID ────────────────────────────────────────────
// Fallback for dataRoutes when partyId is a Tally ID (not a GS PartyID)
router.post('/party-by-tally-id', async (req, res) => {
  const tallyId = String(req.body?.tallyId || '').trim();
  if (!tallyId) return res.status(400).json({ success: false, error: 'tallyId is required.' });

  try {
    const auth = await getTallyAuth();
    const rows = (await executeTemplate(49, auth)).content || [];

    // Match by PartyID field OR by index (tally-party-detail-N)
    let matchedRow = rows.find(r => r.PartyID === tallyId);
    if (!matchedRow) {
      const idxMatch = tallyId.match(/tally-party-detail-(\d+)$/);
      if (idxMatch) {
        const idx = parseInt(idxMatch[1], 10);
        matchedRow = rows[idx] || null;
      }
    }

    if (!matchedRow) {
      return res.status(404).json({ success: false, error: 'Party not found in Tally.' });
    }

    const partyName = String(matchedRow.party_name || '').trim();
    if (!partyName) return res.status(404).json({ success: false, error: 'Party name missing.' });

    const broadRange = { cust_from_date: '2024-04-01', cust_to_date: '2030-03-31' };
    const [t51Result, t53Result] = await Promise.allSettled([
      executeTemplate(51, auth, broadRange),
      executeTemplate(53, auth, broadRange),
    ]);

    const t51Rows = (t51Result.status === 'fulfilled' ? t51Result.value.content : []) || [];
    const t53Rows = (t53Result.status === 'fulfilled' ? t53Result.value.content : []) || [];
    const nameLower = partyName.toLowerCase();

    const seenSales = new Set();
    const salesTxns = t51Rows
      .filter(r => String(r.party_name || '').trim().toLowerCase() === nameLower)
      .reduce((acc, r) => {
        const vno = r.voucher_number || '';
        if (!seenSales.has(vno)) {
          seenSales.add(vno);
          acc.push({ date: formatPartyDate(r.voucher_date), voucherNo: vno || '—', voucherType: r.voucher_type || 'Sales', amount: Number.parseFloat(r.net_amount_inr || r.gross_total_inr || 0) || 0, status: r.is_cancelled_flag === 1 ? 'CANCELLED' : 'POSTED' });
        }
        return acc;
      }, []);

    const seenRcpt = new Set();
    const rcptTxns = t53Rows
      .filter(r => String(r.party_name || '').trim().toLowerCase() === nameLower)
      .reduce((acc, r) => {
        const vno = r.voucher_number || '';
        if (!seenRcpt.has(vno)) {
          seenRcpt.add(vno);
          acc.push({ date: formatPartyDate(r.voucher_date), voucherNo: vno || '—', voucherType: r.voucher_type || 'Receipt', amount: Math.abs(Number.parseFloat(r.total_amount_inr || 0) || 0), status: r.is_cancelled_flag === 1 ? 'CANCELLED' : 'POSTED' });
        }
        return acc;
      }, []);

    const transactions = [...salesTxns, ...rcptTxns].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

    const pt = String(matchedRow.party_type || '').toLowerCase();
    let PartyType = 'Customer';
    if (pt.includes('creditor') || pt.includes('supplier') || pt.includes('vendor') || pt.includes('payable')) PartyType = 'Supplier';

    res.json({
      success: true,
      data: {
        PartyName: partyName,
        PartyType,
        GSTIN: matchedRow.gstin || null,
        Address: matchedRow.full_address || null,
        City: matchedRow.city || null,
        State: matchedRow.state || null,
        PIN: matchedRow.PIN || null,
        Phone: matchedRow.phone_number || null,
        Email: matchedRow.email || null,
        ContactPerson: matchedRow.contact_person || null,
        PAN: matchedRow.PAN || null,
        CreditLimit: Number.parseFloat(matchedRow.creditLimit || 0) || 0,
        CreditDays: parseInt(matchedRow.creditDays || 0) || 0,
        SalesPerson: matchedRow.salesPerson || null,
        OpeningBalance: Number.parseFloat(matchedRow.openingBalance || matchedRow.opening_balance_inr || 0) || 0,
        Status: matchedRow.Status || 'Active',
        ParentGroup: matchedRow.parent_group_name || null,
        transactions,
      },
    });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

module.exports = router;
