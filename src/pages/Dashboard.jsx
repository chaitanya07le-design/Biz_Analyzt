import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/shared/KpiCard';
import DonutChart from '../components/shared/DonutChart';
import { KpiCardSkeleton } from '../components/shared/CardSkeleton';
import Skeleton from '../components/shared/Skeleton';
import { motion } from 'framer-motion';
import useGoogleSheetsData from '../hooks/useGoogleSheetsData';
import { useCompany } from '../context/CompanyContext';
import { useDateRange } from '../context/DateRangeContext';
import { calculateProfitLoss } from '../utils/profitLoss';
import useTallyDashboardTemplates from '../hooks/useTallyDashboardTemplates';

const formatCurrency = (value) => '₹' + (value || 0).toLocaleString('en-IN');
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const { templates: tallyTemplates, dashboard: tallyDashboard, loading: tallyLoading, error: tallyError } = useTallyDashboardTemplates();
  
  const {
    ledgers,
    groups,
    parties,
    items,
    vouchers,
    voucherLines,
    bankAccounts,
    cashAccounts,
    stockBatches,
    itemStockStatus,
    dashboardSummary,
    loading,
    error,
    connectionStatus,
  } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  useEffect(() => {
    const dismissed = localStorage.getItem('promoBannerDismissed');
    if (dismissed === 'true') {
      setShowPromoBanner(false);
    }
  }, []);

  const dismissPromoBanner = () => {
    setShowPromoBanner(false);
    localStorage.setItem('promoBannerDismissed', 'true');
  };

  const deduplicatedVouchers = useMemo(() => {
    if (!vouchers || vouchers.length === 0) return [];
    const seen = new Set();
    const seenByContent = new Set();
    return vouchers.filter(v => {
      const id = v.VoucherID || v.id;
      if (seen.has(id)) return false;
      seen.add(id);
      const contentKey = `${v.VoucherNo}|${v.VoucherDate}|${v.GrandTotal}`;
      if (seenByContent.has(contentKey)) return false;
      seenByContent.add(contentKey);
      return true;
    });
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    if (!deduplicatedVouchers || deduplicatedVouchers.length === 0) return [];
    if (!dateRange.startDate || !dateRange.endDate) return deduplicatedVouchers;
    
    return deduplicatedVouchers.filter(v => {
      const voucherDate = new Date(v.VoucherDate || v.date);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return voucherDate >= start && voucherDate <= end;
    });
  }, [deduplicatedVouchers, dateRange]);

  const filteredVoucherLines = useMemo(() => {
    if (!voucherLines || voucherLines.length === 0) return [];
    const filteredVoucherIds = new Set(filteredVouchers.map(v => v.VoucherID || v.id));
    return voucherLines.filter(vl => filteredVoucherIds.has(vl.VoucherID || vl.voucherId));
  }, [voucherLines, filteredVouchers]);

  const metrics = useMemo(() => {
    const plData = calculateProfitLoss(filteredVouchers, voucherLines, ledgers, groups);
    
    if (dashboardSummary) {
      return {
        cashInHand: dashboardSummary.cashInHand || 0,
        bankBalance: dashboardSummary.bankBalance || 0,
        totalSales: plData.income.total,
        totalPurchases: plData.expenses.purchase,
        totalReceivables: dashboardSummary.totalReceivables || 0,
        totalPayables: dashboardSummary.totalPayables || 0,
        grossProfit: plData.grossProfit,
        netProfit: plData.netProfit,
        stockValue: (itemStockStatus || []).reduce((sum, item) => 
          sum + (parseFloat(item.StockValue || 0) || 0), 0
        ),
        partyCount: dashboardSummary.partyCount || parties?.length || 0,
        itemCount: dashboardSummary.itemCount || items?.length || 0,
        voucherCount: dashboardSummary.voucherCount || filteredVouchers.length,
        cashAccountCount: dashboardSummary.cashAccountCount || 1,
        bankAccountCount: dashboardSummary.bankAccountCount || 1,
      };
    }

    const receivables = (parties || [])
      .filter(p => p.PartyType === 'Sundry Debtors' || p.PartyType === 'Customer' || p.PartyType === 'Both')
      .reduce((sum, p) => {
        const balance = parseFloat(p.OpeningBalance || 0) || 0;
        return sum + (balance > 0 ? Math.abs(balance) : 0);
      }, 0);
    
    const payables = (parties || [])
      .filter(p => p.PartyType === 'Sundry Creditors' || p.PartyType === 'Supplier' || p.PartyType === 'Both')
      .reduce((sum, p) => {
        const balance = parseFloat(p.OpeningBalance || 0) || 0;
        return sum + (balance < 0 ? Math.abs(balance) : 0);
      }, 0);

    const bankLedgers = (ledgers || []).filter(l => 
      l.GroupID === 'GRP-0016' || 
      (l.LedgerName || '').toLowerCase().includes('bank')
    );
    const ledgerBankBalance = bankLedgers.reduce((sum, l) => 
      sum + parseFloat(l.OpeningBalance || 0), 0
    );
    const directBankBalance = (bankAccounts || []).reduce((sum, b) => 
      sum + parseFloat(b.OpeningBalance || 0), 0
    );
    const bankBalance = Math.max(ledgerBankBalance, directBankBalance);
    const bankAccountCount = Math.max(bankLedgers.length, (bankAccounts || []).length);
    
    const cashLedgers = (ledgers || []).filter(l => 
      (l.LedgerName || '').toLowerCase().includes('cash') ||
      (l.LedgerName || '').toLowerCase().includes('petty')
    );
    const ledgerCashBalance = cashLedgers.reduce((sum, l) => 
      sum + parseFloat(l.OpeningBalance || 0), 0
    );
    const directCashBalance = (cashAccounts || []).reduce((sum, c) => 
      sum + parseFloat(c.OpeningBalance || 0), 0
    );
    const cashInHand = Math.max(ledgerCashBalance, directCashBalance);
    const cashAccountCount = Math.max(cashLedgers.length, (cashAccounts || []).length);

    const stockValue = (itemStockStatus || []).reduce((sum, item) => 
      sum + (parseFloat(item.StockValue || 0) || 0), 0
    );

    return {
      cashInHand,
      bankBalance,
      totalSales: plData.income.total,
      totalPurchases: plData.expenses.purchase,
      totalReceivables: receivables,
      totalPayables: payables,
      grossProfit: plData.grossProfit,
      netProfit: plData.netProfit,
      stockValue,
      partyCount: parties?.length || 0,
      itemCount: items?.length || 0,
      voucherCount: filteredVouchers.length,
      cashAccountCount,
      bankAccountCount,
    };
  }, [filteredVouchers, filteredVoucherLines, voucherLines, ledgers, groups, parties, items, itemStockStatus, stockBatches, bankAccounts, cashAccounts, dashboardSummary]);

  const kpis = [
    { 
      title: 'Cash in Hand', 
      value: metrics.cashInHand, 
      color: 'kinetic-secondary', 
      onClick: () => navigate('/cash-bank'),
      subtitle: `${metrics.cashAccountCount || 0} accounts`
    },
    { 
      title: 'Bank Balance', 
      value: metrics.bankBalance, 
      color: 'kinetic-primary', 
      onClick: () => navigate('/cash-bank'),
      subtitle: `${metrics.bankAccountCount || 0} accounts`
    },
    { 
      title: 'Total Sales', 
      value: metrics.totalSales, 
      color: 'kinetic-secondary', 
      onClick: () => navigate('/vouchers/sales'),
      subtitle: `${filteredVouchers.filter(v => v.VoucherType === 'Sales').length} vouchers`
    },
    { 
      title: 'Total Purchases', 
      value: metrics.totalPurchases, 
      color: 'kinetic-tertiary', 
      onClick: () => navigate('/vouchers/purchase'),
      subtitle: `${filteredVouchers.filter(v => v.VoucherType === 'Purchase').length} vouchers`
    },
    { 
      title: 'Receivables', 
      value: metrics.totalReceivables, 
      color: 'kinetic-secondary', 
      onClick: () => navigate('/outstanding?type=receivable'),
      subtitle: `${(parties || []).filter(p => p.PartyType === 'Sundry Debtors' || p.PartyType === 'Customer').length} parties`
    },
    { 
      title: 'Payables', 
      value: metrics.totalPayables, 
      color: 'kinetic-tertiary', 
      onClick: () => navigate('/outstanding?type=payable'),
      subtitle: `${(parties || []).filter(p => p.PartyType === 'Sundry Creditors' || p.PartyType === 'Supplier').length} parties`
    },
    { 
      title: 'Gross Profit', 
      value: metrics.grossProfit, 
      color: metrics.grossProfit >= 0 ? 'kinetic-secondary' : 'kinetic-tertiary', 
      onClick: () => navigate('/reports/profit-loss#trading')
    },
    { 
      title: 'Net Profit', 
      value: metrics.netProfit, 
      color: metrics.netProfit >= 0 ? 'kinetic-secondary' : 'kinetic-tertiary', 
      onClick: () => navigate('/reports/profit-loss#pl')
    },
    { 
      title: 'Stock Value', 
      value: metrics.stockValue, 
      color: 'kinetic-primary', 
      onClick: () => navigate('/items'),
      subtitle: `${items?.length || 0} items`
    },
  ];

  const hasTallyTemplate = (templateNo) => tallyTemplates[templateNo]?.status === 'success';
  const displayMetrics = {
    ...metrics,
    ...(hasTallyTemplate(14) ? {
      cashInHand: tallyDashboard?.cashInHand,
      bankBalance: tallyDashboard?.bankBalance,
      cashAccountCount: tallyDashboard?.cashAccountCount,
      bankAccountCount: tallyDashboard?.bankAccountCount,
    } : {}),
    ...(hasTallyTemplate(23) ? { totalSales: tallyDashboard?.totalSales } : {}),
    ...(hasTallyTemplate(1) ? { totalReceivables: tallyDashboard?.totalReceivables } : {}),
    ...(hasTallyTemplate(5) ? { totalPayables: tallyDashboard?.totalPayables } : {}),
    ...(hasTallyTemplate(30) ? {
      grossProfit: tallyDashboard?.grossProfit,
      netProfit: tallyDashboard?.netProfit,
    } : {}),
  };

  const displayKpis = kpis.map((kpi) => {
    const liveKpi = {
      'Cash in Hand': hasTallyTemplate(14),
      'Bank Balance': hasTallyTemplate(14),
      'Total Sales': hasTallyTemplate(23),
      Receivables: hasTallyTemplate(1),
      Payables: hasTallyTemplate(5),
      'Gross Profit': hasTallyTemplate(30),
      'Net Profit': hasTallyTemplate(30),
    }[kpi.title];
    const title = kpi.title;
    const valueKey = kpi.title === 'Total Sales' ? 'totalSales' :
      kpi.title === 'Cash in Hand' ? 'cashInHand' :
      kpi.title === 'Bank Balance' ? 'bankBalance' :
      kpi.title === 'Gross Profit' ? 'grossProfit' :
      kpi.title === 'Net Profit' ? 'netProfit' :
      kpi.title === 'Receivables' ? 'totalReceivables' :
      kpi.title === 'Payables' ? 'totalPayables' : 'stockValue';
    return {
      ...kpi,
      title,
      value: displayMetrics[valueKey],
      subtitle: kpi.title === 'Total Sales' && hasTallyTemplate(23)
        ? `${tallyDashboard?.totalSalesInvoiceCount || 0} invoices · Live Tally`
        : liveKpi ? `${kpi.subtitle || ''}${kpi.subtitle ? ' · ' : ''}Live Tally` : kpi.subtitle,
    };
  });

  const receivableChartData = useMemo(() => {
    const receivables = parties?.filter(p => 
      p.PartyType === 'Sundry Debtors' || p.PartyType === 'Customer'
    ) || [];
    const total = hasTallyTemplate(1) ? displayMetrics.totalReceivables : receivables.reduce((sum, p) => sum + Math.abs(parseFloat(p.OpeningBalance || 0) || 0), 0);
    if (total === 0) return [{ name: 'No Data', value: 1, color: '#F1F5F9' }]; // slate-100
    return [
      { name: 'Outstanding', value: total, color: '#65A30D' }, // kinetic-secondary
    ];
  }, [parties, tallyTemplates, displayMetrics.totalReceivables]);

  const payableChartData = useMemo(() => {
    const payables = parties?.filter(p => 
      p.PartyType === 'Sundry Creditors' || p.PartyType === 'Supplier'
    ) || [];
    const total = hasTallyTemplate(5) ? displayMetrics.totalPayables : payables.reduce((sum, p) => sum + Math.abs(parseFloat(p.OpeningBalance || 0) || 0), 0);
    if (total === 0) return [{ name: 'No Data', value: 1, color: '#F1F5F9' }];
    return [
      { name: 'Outstanding', value: total, color: '#EA580C' }, // kinetic-tertiary
    ];
  }, [parties, tallyTemplates, displayMetrics.totalPayables]);

  const topItems = useMemo(() => {
    const salesVoucherIds = new Set(
      filteredVouchers
        .filter(v => v.VoucherType === 'Sales' || v.type === 'Sales')
        .map(v => v.VoucherID || v.id)
    );
    
    const itemSales = {};
    filteredVoucherLines.forEach(vl => {
      if ((vl.LineType === 'Item' || !vl.LineType) && salesVoucherIds.has(vl.VoucherID || vl.voucherId)) {
        const itemId = vl.ItemID || vl.itemId;
        const qty = parseFloat(vl.Quantity || vl.Qty || 0) || 0;
        const amount = parseFloat(vl.Amount || 0) || 0;
        if (!itemSales[itemId]) itemSales[itemId] = { qty: 0, value: 0 };
        itemSales[itemId].qty += qty;
        itemSales[itemId].value += amount;
      }
    });

    return Object.entries(itemSales)
      .map(([itemId, data]) => {
        const item = (items || []).find(i => i.ItemID === itemId) || {};
        return {
          itemId,
          name: item.ItemName || itemId,
          totalQty: data.qty,
          totalValue: data.value,
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  }, [filteredVouchers, filteredVoucherLines, items]);

  const recentTransactions = useMemo(() => {
    return filteredVouchers
      .slice()
      .sort((a, b) => new Date(b.VoucherDate || b.date) - new Date(a.VoucherDate || a.date))
      .slice(0, 5)
      .map(v => ({
        type: v.VoucherType || v.type,
        party: v.PartyName || v.party || 'Unknown',
        amount: parseFloat(v.GrandTotal || v.NetAmount || v.amount) || 0,
        date: v.VoucherDate || v.date,
      }));
  }, [filteredVouchers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton variant="text" className="w-40 h-7" />
              <Skeleton variant="text" className="w-32 h-4" />
            </div>
            <Skeleton variant="text" className="w-20 h-4" />
          </div>

          <div className="space-y-3">
            <Skeleton variant="rounded" className="w-full h-16 rounded-lg" />
            <Skeleton variant="rounded" className="w-full h-20 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              className="bg-white rounded-lg border border-canvas-faint p-4 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between">
                <Skeleton variant="text" className="w-32 h-5" />
                <Skeleton variant="text" className="w-16 h-4" />
              </div>
              <Skeleton variant="rounded" className="w-full h-40 rounded-lg" />
            </motion.div>
            <motion.div
              className="bg-white rounded-lg border border-canvas-faint p-4 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between">
                <Skeleton variant="text" className="w-32 h-5" />
                <Skeleton variant="text" className="w-16 h-4" />
              </div>
              <Skeleton variant="rounded" className="w-full h-40 rounded-lg" />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-slate-50 pb-20 md:pb-6 font-sans"
    >
      <div className="px-4 py-4 md:px-8 md:py-8 space-y-6 max-w-7xl mx-auto">
        {tallyError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Live Tally dashboard data is unavailable. Existing Google Sheets data remains displayed.
          </div>
        )}
        <div className="flex items-start justify-between bg-white p-6 rounded-2xl shadow-card border border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-900 tracking-tight">System Dashboard</h1>
              <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                connectionStatus === 'connected' 
                  ? 'bg-kinetic-secondary/10 text-kinetic-secondary' 
                  : connectionStatus === 'disconnected'
                  ? 'bg-kinetic-tertiary/10 text-kinetic-tertiary'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {connectionStatus === 'connected' && '● Live'}
                {connectionStatus === 'disconnected' && '● Demo'}
                {connectionStatus === 'checking' && '● Checking...'}
              </span>
              {!tallyLoading && Object.keys(tallyTemplates).length > 0 && (
                <span className="text-xs font-medium text-kinetic-neutral">Tally refresh requested</span>
              )}
            </div>
            <p className="text-sm text-kinetic-neutral font-medium mt-1">
              {currentCompany?.name || 'Sharma Trading Co.'}
            </p>
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 text-sm font-semibold text-ink-muted">
            {dateRange.label || 'All data'}
          </div>
        </div>

        {showPromoBanner && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden bg-kinetic-primary text-white rounded-2xl p-6 shadow-card"
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <button
              onClick={dismissPromoBanner}
              className="absolute top-4 right-4 text-white/70 hover:text-white z-10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex-shrink-0 bg-white/20 p-3 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-display font-bold text-lg">Live Data Connected</p>
                <p className="text-sm text-white/80 mt-1 font-medium">
                  Dashboard now shows real-time data from Google Sheets.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {displayKpis.map((kpi, idx) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <KpiCard {...kpi} />
            </motion.div>
          ))}
        </motion.div>

        {(hasTallyTemplate(10) || hasTallyTemplate(11)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasTallyTemplate(10) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                <p className="text-xs font-bold text-kinetic-neutral uppercase tracking-widest">Sales comparison</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div><p className="text-sm text-ink-muted">Today</p><p className="text-xl font-extrabold text-ink-900">{formatCurrency(tallyDashboard?.salesComparison?.todaySales)}</p></div>
                  <div><p className="text-sm text-ink-muted">Last week</p><p className="text-xl font-extrabold text-ink-900">{formatCurrency(tallyDashboard?.salesComparison?.lastWeekSales)}</p></div>
                  <span className="text-sm font-bold text-kinetic-primary">{tallyDashboard?.salesComparison?.salesDifferencePercent || 0}%</span>
                </div>
              </div>
            )}
            {hasTallyTemplate(11) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                <p className="text-xs font-bold text-kinetic-neutral uppercase tracking-widest">Weekly MIS</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-ink-muted">Sales</p><p className="font-extrabold text-ink-900">{formatCurrency(tallyDashboard?.weeklyMis?.weeklySales)}</p></div>
                  <div><p className="text-ink-muted">Net cash flow</p><p className="font-extrabold text-ink-900">{formatCurrency(tallyDashboard?.weeklyMis?.netCashFlow)}</p></div>
                  <div><p className="text-ink-muted">Top customer</p><p className="font-bold text-ink-900 truncate">{tallyDashboard?.weeklyMis?.topCustomerName || '—'}</p></div>
                  <div><p className="text-ink-muted">Top vendor</p><p className="font-bold text-ink-900 truncate">{tallyDashboard?.weeklyMis?.topVendorName || '—'}</p></div>
                </div>
              </div>
            )}
          </div>
        )}

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-100">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-ink-900 tracking-tight">Receivables</h3>
              <button
                onClick={() => navigate('/outstanding?type=receivable')}
                className="text-sm font-semibold text-kinetic-primary hover:text-kinetic-primary/80 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              <DonutChart data={receivableChartData} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-100">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-ink-900 tracking-tight">Payables</h3>
              <button
                onClick={() => navigate('/outstanding?type=payable')}
                className="text-sm font-semibold text-kinetic-primary hover:text-kinetic-primary/80 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              <DonutChart data={payableChartData} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-ink-900 tracking-tight">Top Selling Items</h3>
              <button
                onClick={() => navigate('/items')}
                className="text-sm font-semibold text-kinetic-primary hover:text-kinetic-primary/80 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {topItems.length > 0 ? topItems.slice(0, 3).map((item, idx) => {
                const badgeStyles = [
                  'bg-kinetic-secondary/10 text-kinetic-secondary',
                  'bg-slate-100 text-kinetic-neutral',
                  'bg-kinetic-tertiary/10 text-kinetic-tertiary',
                ];
                return (
                  <div
                    key={item.itemId || idx}
                    className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                    onClick={() => navigate('/items')}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 ${badgeStyles[idx]} rounded-xl flex items-center justify-center`}>
                      <span className="font-display font-bold text-lg">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink-900 truncate">{item.name}</p>
                      <p className="text-xs font-medium text-kinetic-neutral mt-0.5">{item.totalQty} units sold</p>
                    </div>
                    <p className="text-base font-extrabold text-ink-900">{formatCurrency(item.totalValue)}</p>
                  </div>
                );
              }) : (
                <p className="text-sm font-medium text-kinetic-neutral text-center py-6 bg-slate-50 rounded-xl">No sales data available</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-ink-900 tracking-tight">Recent Transactions</h3>
              <button
                onClick={() => navigate('/reports/day-book')}
                className="text-sm font-semibold text-kinetic-primary hover:text-kinetic-primary/80 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentTransactions.length > 0 ? recentTransactions.map((trans, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-kinetic-primary/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-kinetic-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink-900">{trans.type}</p>
                    <p className="text-xs font-medium text-kinetic-neutral truncate mt-0.5">{trans.party}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-ink-900">{formatCurrency(trans.amount)}</p>
                    <p className="text-xs font-medium text-kinetic-neutral mt-0.5">{formatDate(trans.date)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm font-medium text-kinetic-neutral text-center py-6 bg-slate-50 rounded-xl">No transactions available</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
