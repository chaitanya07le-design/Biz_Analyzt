import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import * as mockData from '../data/mockData';
import { useCompany } from '../context/CompanyContext';

const DEFAULT_COMPANY_ID = 'COMP-0001';

const useGoogleSheetsData = (explicitCompanyId) => {
  const { currentCompany } = useCompany();
  const companyId = explicitCompanyId || currentCompany?.id || DEFAULT_COMPANY_ID;
  const [useMockData, setUseMockData] = useState(false);
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
      setUseMockData(false);
      return true;
    } catch (err) {
      console.warn('Backend not available, using mock data');
      setConnectionStatus('disconnected');
      setUseMockData(true);
      return false;
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const isConnected = await checkConnection();

    if (!isConnected) {
      setData({
        companies: [],
        users: [],
        userCompanyMapping: [],
        groups: [],
        itemCategories: [],
        itemGroups: [],
        ledgers: mockData.ledgers,
        parties: mockData.parties,
        items: mockData.items,
        vouchers: [...mockData.salesVouchers, ...mockData.purchaseVouchers],
        voucherLines: [],
        bankAccounts: [],
        cashAccounts: [],
        settings: [],
        reminderLog: [],
        dashboardSummary: mockData.dashboardMetrics,
        outstandingReceivables: mockData.outstandingReceivables || [],
        outstandingPayables: mockData.outstandingPayables || [],
        stockBatches: [],
        itemStockStatus: [],
        customerMovement: [],
        syncLog: [],
        geographicSummary: [],
      });
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
      setError(err.message);

      const currentData = data;
      setData({
        companies: currentData.companies.length > 0 ? currentData.companies : [],
        users: currentData.users.length > 0 ? currentData.users : [],
        userCompanyMapping: currentData.userCompanyMapping.length > 0 ? currentData.userCompanyMapping : [],
        groups: currentData.groups.length > 0 ? currentData.groups : [],
        itemCategories: currentData.itemCategories.length > 0 ? currentData.itemCategories : [],
        itemGroups: currentData.itemGroups.length > 0 ? currentData.itemGroups : [],
        ledgers: currentData.ledgers.length > 0 ? currentData.ledgers : mockData.ledgers,
        parties: currentData.parties.length > 0 ? currentData.parties : mockData.parties,
        items: currentData.items.length > 0 ? currentData.items : mockData.items,
        vouchers: currentData.vouchers.length > 0 ? currentData.vouchers : [...mockData.salesVouchers, ...mockData.purchaseVouchers],
        voucherLines: currentData.voucherLines.length > 0 ? currentData.voucherLines : [],
        bankAccounts: currentData.bankAccounts.length > 0 ? currentData.bankAccounts : [],
        cashAccounts: currentData.cashAccounts.length > 0 ? currentData.cashAccounts : [],
        settings: currentData.settings.length > 0 ? currentData.settings : [],
        reminderLog: currentData.reminderLog.length > 0 ? currentData.reminderLog : [],
        dashboardSummary: currentData.dashboardSummary || mockData.dashboardMetrics,
        outstandingReceivables: currentData.outstandingReceivables.length > 0 ? currentData.outstandingReceivables : mockData.outstandingReceivables || [],
        outstandingPayables: currentData.outstandingPayables.length > 0 ? currentData.outstandingPayables : mockData.outstandingPayables || [],
        stockBatches: currentData.stockBatches.length > 0 ? currentData.stockBatches : [],
        itemStockStatus: currentData.itemStockStatus.length > 0 ? currentData.itemStockStatus : [],
        customerMovement: currentData.customerMovement.length > 0 ? currentData.customerMovement : [],
        syncLog: currentData.syncLog.length > 0 ? currentData.syncLog : [],
        geographicSummary: currentData.geographicSummary.length > 0 ? currentData.geographicSummary : [],
        orders: currentData.orders.length > 0 ? currentData.orders : [],
      });
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
    useMockData,
    sheetsStatus,
    refresh,
    clearCache,
  };
};

export default useGoogleSheetsData;
