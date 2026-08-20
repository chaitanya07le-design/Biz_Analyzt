const toNumber = (value) => Number.parseFloat(value) || 0;
const contentOf = (response) => Array.isArray(response?.content) ? response.content : [];

const adaptReceivables = (response) => {
  const rows = contentOf(response);
  return {
    totalReceivables: rows.reduce((total, row) => total + toNumber(row.outstanding_amount), 0),
    receivablePartyCount: rows.length,
  };
};

const adaptPayables = (response) => {
  const rows = contentOf(response);
  return {
    totalPayables: rows.reduce((total, row) => total + toNumber(row.total_pending_amount), 0),
    payablePartyCount: rows.length,
  };
};

const adaptSalesComparison = (response) => {
  const row = contentOf(response)[0] || {};
  return {
    todaySales: toNumber(row.today_sales),
    lastWeekSales: toNumber(row.last_week_sales),
    salesDifferencePercent: toNumber(row.difference_percent),
  };
};

const adaptWeeklyMis = (response) => {
  const row = contentOf(response)[0] || {};
  return {
    weekStartDate: row.week_start_date || null,
    weekEndDate: row.week_end_date || null,
    weeklySales: toNumber(row.total_sales_amount),
    weeklySalesVoucherCount: toNumber(row.total_sales_vouchers),
    weeklyExpenses: toNumber(row.total_expense_amount),
    cashInflow: toNumber(row.cash_inflow),
    cashOutflow: toNumber(row.cash_outflow),
    netCashFlow: toNumber(row.net_cash_flow),
    topCustomerName: row.top_customer_name || null,
    topVendorName: row.top_vendor_name || null,
  };
};

const adaptTodaySales = (response) => {
  const row = contentOf(response)[0] || {};
  return {
    todaySales: toNumber(row.total_sales_amount),
    todaySalesInvoiceCount: toNumber(row.total_sales_invoices),
  };
};

const adaptTotalSales = (response) => {
  const invoices = new Map();
  contentOf(response).forEach((row) => {
    const key = `${row.invoice_number || ''}|${row.invoice_date || ''}`;
    const value = toNumber(row.invoice_value);
    // Template #23 can return multiple GST/HSN rows for one invoice. Its invoice
    // total is repeated on those rows, so retain one (the maximum) per invoice.
    invoices.set(key, Math.max(invoices.get(key) || 0, value));
  });

  return {
    totalSales: [...invoices.values()].reduce((total, value) => total + value, 0),
    totalSalesInvoiceCount: invoices.size,
  };
};

const adaptCashAndBank = (response) => {
  const rows = contentOf(response);
  const isCash = (row) => String(row.group_name || '').toLowerCase().includes('cash');
  const isBank = (row) => String(row.group_name || '').toLowerCase().includes('bank');
  const balance = (row) => Math.abs(toNumber(row.overall_net_balance));
  return {
    cashInHand: rows.filter(isCash).reduce((total, row) => total + balance(row), 0),
    bankBalance: rows.filter(isBank).reduce((total, row) => total + balance(row), 0),
    cashAccountCount: rows.filter(isCash).length,
    bankAccountCount: rows.filter(isBank).length,
  };
};

const adaptProfit = (response) => {
  const row = contentOf(response)[0] || {};
  return {
    grossProfit: toNumber(row.gross_profit),
    netProfit: toNumber(row.net_profit),
  };
};

const adaptDashboardTemplates = (templates) => ({
  ...adaptReceivables(templates[1]),
  ...adaptPayables(templates[5]),
  salesComparison: adaptSalesComparison(templates[10]),
  weeklyMis: adaptWeeklyMis(templates[11]),
  ...adaptTodaySales(templates[13]),
  ...adaptTotalSales(templates[23]),
  ...adaptCashAndBank(templates[14]),
  ...adaptProfit(templates[30]),
});

module.exports = { adaptDashboardTemplates };
