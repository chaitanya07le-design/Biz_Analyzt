import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useCompany } from '../context/CompanyContext';

const DEFAULT_COMPANY_ID = 'COMP-0001';

const useGoogleSheetsDataInternal = (explicitCompanyId) => {
  const { currentCompany } = useCompany();
  const companyId = explicitCompanyId || currentCompany?.id || DEFAULT_COMPANY_ID;
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [sheetsStatus, setSheetsStatus] = useState(null);
  const [data, setData] = useState({
    companies: [],
    users: [],
    userCompanyMapping: [],
    groups: [],
    itemCategories: [],
    itemGroups: [],
    ledgers: [],
    parties: [],
    items: [],
    vouchers: [],
    voucherLines: [],
    bankAccounts: [],
    cashAccounts: [],
    settings: [],
    reminderLog: [],
    dashboardSummary: null,
    outstandingReceivables: [],
    outstandingPayables: [],
    stockBatches: [],
    itemStockStatus: [],
    customerMovement: [],
    syncLog: [],
    geographicSummary: [],
    orders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkConnection = useCallback(async () => {
    try {
      await api.healthCheck();
      setConnectionStatus('connected');
      return true;
    } catch (err) {
      setConnectionStatus('disconnected');
      setError('Cannot connect to backend server. Please ensure the backend is running.');
      return false;
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const isConnected = await checkConnection();

    if (!isConnected) {
      setLoading(false);
      return;
    }

    try {
      const [
        companies,
        users,
        userCompanyMapping,
        groups,
        itemCategories,
        itemGroups,
        ledgers,
        parties,
        items,
        vouchers,
        bankAccounts,
        cashAccounts,
        settings,
        reminderLog,
        dashboardSummary,
        outstandingReceivables,
        outstandingPayables,
        voucherLines,
        stockBatches,
        itemStockStatus,
        customerMovement,
        syncLog,
        geographicSummary,
        orders,
        sheetsStatusData,
      ] = await Promise.all([
        api.getCompanies(),
        api.getUsers().catch(() => []),
        api.getUserCompanyMapping().catch(() => []),
        api.getGroups(companyId).catch(() => []),
        api.getItemCategories().catch(() => []),
        api.getItemGroups().catch(() => []),
        api.getLedgers(companyId),
        api.getParties(companyId),
        api.getItems(companyId),
        api.getVouchers(companyId),
        api.getBankAccounts(companyId),
        api.getCashAccounts(companyId),
        api.getSettings(companyId).catch(() => []),
        api.getReminderLog().catch(() => []),
        api.getDashboardSummary(companyId),
        api.getOutstandingReceivables(companyId),
        api.getOutstandingPayables(companyId),
        api.getVoucherLines(companyId).catch(() => []),
        api.getStockBatches(companyId).catch(() => []),
        api.getItemStockStatus(companyId).catch(() => []),
        api.getCustomerMovement(companyId).catch(() => []),
        api.getSyncLog(companyId).catch(() => []),
        api.getGeographicSummary(companyId).catch(() => []),
        api.getOrders(companyId).catch(() => []),
        api.getSheetsStatus().catch(() => null),
      ]);

      setSheetsStatus(sheetsStatusData);
      setData({
        companies,
        users,
        userCompanyMapping,
        groups,
        itemCategories,
        itemGroups,
        ledgers,
        parties,
        items,
        vouchers,
        voucherLines,
        bankAccounts,
        cashAccounts,
        settings,
        reminderLog,
        dashboardSummary: dashboardSummary || null,
        outstandingReceivables,
        outstandingPayables,
        stockBatches,
        itemStockStatus,
        customerMovement,
        syncLog,
        geographicSummary,
        orders,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data from server');
    } finally {
      setLoading(false);
    }
  }, [companyId, checkConnection]);

  const refresh = useCallback(() => {
    return fetchAllData();
  }, [fetchAllData]);

  const clearCache = useCallback(async () => {
    try {
      await api.clearCache();
      await refresh();
    } catch (err) {
      console.warn('Could not clear cache:', err);
    }
  }, [refresh]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    ...data,
    loading,
    error,
    connectionStatus,
    sheetsStatus,
    refresh,
    clearCache,
  };
};

export default useGoogleSheetsDataInternal;
