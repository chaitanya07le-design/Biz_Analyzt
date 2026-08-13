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
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data.data;
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
