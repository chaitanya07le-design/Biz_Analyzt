const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success && data.status !== 'success') {
        throw new Error(data.error || 'API request failed');
      }

      return data.data !== undefined ? data.data : data.content;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async getCompanies() {
    return this.get('/companies');
  }

  async getUsers() {
    return this.get('/users');
  }

  async getUserCompanyMapping() {
    return this.get('/user-company-mapping');
  }

  async getItemCategories() {
    return this.get('/item-categories');
  }

  async getCategoryById(categoryId, companyId) {
    const endpoint = companyId 
      ? `/item-categories/${categoryId}?companyId=${companyId}` 
      : `/item-categories/${categoryId}`;
    return this.get(endpoint);
  }

  async getLedgersByGroupId(groupId, companyId) {
    const endpoint = companyId 
      ? `/ledgers?companyId=${companyId}` 
      : '/ledgers';
    return this.get(endpoint).then(ledgers => 
      ledgers.filter(l => l.GroupID === groupId)
    );
  }

  async getItemGroups() {
    return this.get('/item-groups');
  }

  async getReminderLog() {
    return this.get('/reminder-log');
  }

  async getSheetsStatus() {
    return this.get('/sheets/status');
  }

  async getGroups(companyId) {
    const endpoint = companyId ? `/groups?companyId=${companyId}` : '/groups';
    return this.get(endpoint);
  }

  async getLedgers(companyId) {
    const endpoint = companyId ? `/ledgers?companyId=${companyId}` : '/ledgers';
    return this.get(endpoint);
  }

  async getParties(companyId) {
    const endpoint = companyId ? `/parties?companyId=${companyId}` : '/parties';
    return this.get(endpoint);
  }

  async getPartyById(partyId, companyId) {
    const endpoint = companyId 
      ? `/parties/${partyId}?companyId=${companyId}` 
      : `/parties/${partyId}`;
    return this.get(endpoint);
  }

  async getItems(companyId) {
    const endpoint = companyId ? `/items?companyId=${companyId}` : '/items';
    return this.get(endpoint);
  }

  async getItemById(itemId, companyId) {
    const endpoint = companyId 
      ? `/items/${itemId}?companyId=${companyId}` 
      : `/items/${itemId}`;
    return this.get(endpoint);
  }

  async getVouchers(companyId) {
    const endpoint = companyId ? `/vouchers?companyId=${companyId}` : '/vouchers';
    return this.get(endpoint);
  }

  async getVoucherById(voucherId, companyId) {
    const endpoint = companyId 
      ? `/vouchers/${voucherId}?companyId=${companyId}` 
      : `/vouchers/${voucherId}`;
    return this.get(endpoint);
  }

  async getVoucherLines(companyId) {
    const endpoint = companyId ? `/voucher-lines?companyId=${companyId}` : '/voucher-lines';
    return this.get(endpoint).catch(() => []);
  }

  async getOrders(companyId) {
    const endpoint = companyId ? `/orders?companyId=${companyId}` : '/orders';
    return this.get(endpoint).catch(() => []);
  }

  async getBankAccounts(companyId) {
    const endpoint = companyId ? `/bank-accounts?companyId=${companyId}` : '/bank-accounts';
    return this.get(endpoint);
  }

  async getBankAccountById(accountId, companyId) {
    const endpoint = companyId 
      ? `/bank-accounts/${accountId}?companyId=${companyId}` 
      : `/bank-accounts/${accountId}`;
    return this.get(endpoint);
  }

  async getCashAccounts(companyId) {
    const endpoint = companyId ? `/cash-accounts?companyId=${companyId}` : '/cash-accounts';
    return this.get(endpoint);
  }

  async getCashAccountById(accountId, companyId) {
    const endpoint = companyId 
      ? `/cash-accounts/${accountId}?companyId=${companyId}` 
      : `/cash-accounts/${accountId}`;
    return this.get(endpoint);
  }

  async getSettings(companyId) {
    const endpoint = companyId ? `/settings?companyId=${companyId}` : '/settings';
    return this.get(endpoint);
  }

  async getDashboardSummary(companyId) {
    return this.get(`/dashboard/summary?companyId=${companyId}`);
  }

  async getTallyDashboardTemplates() {
    return this.post('/tally/dashboard/templates', {});
  }

  async getTallyOutstandingTemplates() {
    return this.post('/tally/outstanding/templates', {});
  }

  async getTallyCashBankTemplates() {
    return this.post('/tally/cash-bank/templates', {});
  }

  async getTallyPaymentVouchers() {
    return this.post('/tally/payment-vouchers/template', {});
  }

  async getTallyPendingSales() {
    return this.post('/tally/pending-sales/template', {});
  }

  async getTallyTrends() { return this.post('/tally/trends/templates', {}); }
  async getTallyGstLiability() { return this.post('/tally/gst-liability/template', {}); }
  async getTallyGstMonthVouchers(month) { return this.post('/tally/gst-month-vouchers', { month }); }
  async getTallyStockBatches() { return this.post('/tally/stock-batches/template', {}); }
  async getTallyParties() { return this.post('/tally/parties/templates', {}); }
  async getTallySalesVouchers() { return this.post('/tally/sales-vouchers/templates', {}); }
  async getTallyPurchaseVouchers() { return this.post('/tally/purchase-vouchers/template', {}); }
  async getTallyProfitLoss() { return this.post('/tally/profit-loss/template', {}); }
  async getTallyDayBook() { return this.post('/tally/day-book/template', {}); }
  async getTallyDayBookMonth(month) { return this.post('/tally/day-book/month-vouchers', { month }); }
  async getTallyVoucherDetail(voucherNo, voucherType, voucherId = null) { return this.post('/tally/voucher-detail', { voucherNo, voucherType, voucherId }); }
  async getTallyExpenses() { return this.post('/tally/expenses/templates', {}); }
  async getTallyStockStatus() { return this.post('/tally/stock-status/template', {}); }
  async getTallyPartyStatement(partyName) { return this.post('/tally/party-statement/template', { partyName }); }
  async getTallyPartyStatementFull(partyName) { return this.post('/tally/party-statement/full', { partyName }); }
  async getTallyCustomerTransactions() { return this.post('/tally/customer-transactions/template', {}); }
  async getTallyVoucherAudit() { return this.post('/tally/voucher-audit/template', {}); }
  async getTallySalesQuotations() { return this.post('/tally/sales-quotations/template', {}); }
  async getTallyCustomerPurchaseHistory() { return this.post('/tally/customer-purchase-history/template', {}); }
  async getTallySalesRegister() { return this.post('/tally/sales-register/template', {}); }
  async getTallyVendorPurchaseHistory() { return this.post('/tally/vendor-purchase-history/template', {}); }
  async getTallyGstReconciliation(fromDate, toDate) { return this.post('/tally/gst-reconciliation/template', { fromDate, toDate }); }
  async getTallyReimbursementAudit(fromDate, toDate) { return this.post('/tally/reimbursement-audit/template', { fromDate, toDate }); }
  async getTallyLedgers() { return this.post('/tally/ledgers/template', {}); }
  async getTallyItems() { return this.post('/tally/items/template', {}); }
  async getTallyAccounts() { return this.post('/tally/accounts/template', {}); }
  async getTallyTrialBalance(fromDate, toDate) { return this.post('/tally/trial-balance/template', { fromDate, toDate }); }
  async getTallyReceiptPaymentVouchers(fromDate, toDate) { return this.post('/tally/receipt-payment-vouchers/template', { fromDate, toDate }); }
  async getTallyJournalDnCnVouchers(fromDate, toDate) { return this.post('/tally/journal-dn-cn-vouchers/template', { fromDate, toDate }); }
  async getTallyCustomerMovementRollup() { return this.post('/tally/customer-movement-rollup/template', {}); }
  async getTallyByItemRollup() { return this.post('/tally/by-item-rollup/template', {}); }
  async getTallyGeographicRollup() { return this.post('/tally/geographic-rollup/template', {}); }
  async getTallyGeographicFull() { return this.post('/tally/geographic/full', {}); }
  async getTallyPartyDetails() { return this.post('/tally/party-details/template', {}); }
  async getTallyAgingReport() { return this.post('/tally/aging-report/template', {}); }
  async getTallyBatchStock() { return this.post('/tally/batch-stock/template', {}); }
  async getTallyDashboardSummary(fromDate, toDate) { return this.post('/tally/dashboard-summary/template', { fromDate, toDate }); }
  async getTallyItemPartyWiseSales() { return this.post('/tally/item-party-wise-sales/template', {}); }
  async getTallyDeliveryNoteVouchers(fromDate, toDate) { return this.post('/tally/delivery-note-vouchers/template', { fromDate, toDate }); }
  async getTallyContraVouchers(fromDate, toDate) { return this.post('/tally/contra-vouchers/template', { fromDate, toDate }); }
  async getTallyReceiptNoteVouchers(fromDate, toDate) { return this.post('/tally/receipt-note-vouchers/template', { fromDate, toDate }); }
  async getTallyTopBrands() { return this.post('/tally/top-brands/template', {}); }
  async getTallyTopReport() { return this.post('/tally/top-report/template', {}); }
  async getTallyByLedger(fromDate, toDate) { return this.post('/tally/by-ledger/template', { fromDate, toDate }); }
  async getTallyLedgerReport() { return this.post('/tally/ledger-report/template', {}); }
  async getTallyLedgerDetail(ledgerId, ledgerName) { return this.post('/tally/ledger-detail/template', { ledgerId, ledgerName }); }
  async getTallyGroups() { return this.post('/tally/groups/template', {}); }
  async getTallyCategories() { return this.post('/tally/categories/template', {}); }
  async getTallyItemsPage() { return this.post('/tally/items-page/template', {}); }
  async getTallyItemDetail(itemId) { return this.post('/tally/item-detail/template', { itemId }); }
  async getTallyStockBatches() { return this.post('/tally/stock-batches/template', {}); }
  async getTallyItemStockStatus() { return this.post('/tally/item-stock-status/template', {}); }
  async getTallyStockStatusFull() { return this.post('/tally/stock-status/full', {}); }
  async getTallyCustomerMovement() { return this.post('/tally/customer-movement/template', {}); }
  async getTallyOutstandingGroupView() { return this.post('/tally/outstanding-group-view/template', {}); }
  async getTallyDashboardFull() { return this.post('/tally/dashboard/full', {}); }
  async getTallyOutstandingFull() { return this.post('/tally/outstanding/full', {}); }
  async getTallyByItemFull() { return this.post('/tally/by-item/full', {}); }
  async getTallyTrialBalanceFull(fromDate, toDate, prevFromDate, prevToDate) { return this.post('/tally/trial-balance/full', { fromDate, toDate, prevFromDate, prevToDate }); }
  async getTallyProfitLossFull() { return this.post('/tally/profit-loss/full', {}); }

  async getOutstandingReceivables(companyId) {
    return this.get(`/outstanding/receivable?companyId=${companyId}`);
  }

  async getOutstandingPayables(companyId) {
    return this.get(`/outstanding/payable?companyId=${companyId}`);
  }

  async getStockBatches(companyId) {
    const endpoint = companyId ? `/stock-batches?companyId=${companyId}` : '/stock-batches';
    return this.get(endpoint).catch(() => []);
  }

  async getItemStockStatus(companyId) {
    const endpoint = companyId ? `/item-stock-status?companyId=${companyId}` : '/item-stock-status';
    return this.get(endpoint).catch(() => []);
  }

  async getCustomerMovement(companyId) {
    const endpoint = companyId ? `/customer-movement?companyId=${companyId}` : '/customer-movement';
    return this.get(endpoint).catch(() => []);
  }

  async getSyncLog(companyId) {
    const endpoint = companyId ? `/sync-log?companyId=${companyId}` : '/sync-log';
    return this.get(endpoint).catch(() => []);
  }

  async getGeographicSummary(companyId) {
    const endpoint = companyId ? `/geographic-summary?companyId=${companyId}` : '/geographic-summary';
    return this.get(endpoint).catch(() => []);
  }

  async clearCache(sheetName = null) {
    const endpoint = sheetName ? `/cache?sheet=${sheetName}` : '/cache';
    return this.delete(endpoint);
  }

  async getCacheStats() {
    return this.get('/cache/stats');
  }

  async healthCheck() {
    return this.get('/health');
  }
}

export default new ApiService();
