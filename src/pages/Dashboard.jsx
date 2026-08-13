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
      color: 'teal', 
      onClick: () => navigate('/cash-bank'),
      subtitle: `${metrics.cashAccountCount || 0} accounts`
    },
    { 
      title: 'Bank Balance', 
      value: metrics.bankBalance, 
      color: 'indigo', 
      onClick: () => navigate('/cash-bank'),
      subtitle: `${metrics.bankAccountCount || 0} accounts`
    },
    { 
      title: 'Total Sales', 
      value: metrics.totalSales, 
      color: 'teal', 
      onClick: () => navigate('/vouchers/sales'),
      subtitle: `${filteredVouchers.filter(v => v.VoucherType === 'Sales').length} vouchers`
    },
    { 
      title: 'Total Purchases', 
      value: metrics.totalPurchases, 
      color: 'amber', 
      onClick: () => navigate('/vouchers/purchase'),
      subtitle: `${filteredVouchers.filter(v => v.VoucherType === 'Purchase').length} vouchers`
    },
    { 
      title: 'Receivables', 
      value: metrics.totalReceivables, 
      color: 'teal', 
      onClick: () => navigate('/outstanding?type=receivable'),
      subtitle: `${(parties || []).filter(p => p.PartyType === 'Sundry Debtors' || p.PartyType === 'Customer').length} parties`
    },
    { 
      title: 'Payables', 
      value: metrics.totalPayables, 
      color: 'rose', 
      onClick: () => navigate('/outstanding?type=payable'),
      subtitle: `${(parties || []).filter(p => p.PartyType === 'Sundry Creditors' || p.PartyType === 'Supplier').length} parties`
    },
    { 
      title: 'Gross Profit', 
      value: metrics.grossProfit, 
      color: metrics.grossProfit >= 0 ? 'teal' : 'rose', 
      onClick: () => navigate('/reports/profit-loss#trading')
    },
    { 
      title: 'Net Profit', 
      value: metrics.netProfit, 
      color: metrics.netProfit >= 0 ? 'teal' : 'rose', 
      onClick: () => navigate('/reports/profit-loss#pl')
    },
    { 
      title: 'Stock Value', 
      value: metrics.stockValue, 
      color: 'amber', 
      onClick: () => navigate('/items'),
      subtitle: `${items?.length || 0} items`
    },
  ];

  const receivableChartData = useMemo(() => {
    const receivables = parties?.filter(p => 
      p.PartyType === 'Sundry Debtors' || p.PartyType === 'Customer'
    ) || [];
    const total = receivables.reduce((sum, p) => sum + Math.abs(parseFloat(p.OpeningBalance || 0) || 0), 0);
    if (total === 0) return [{ name: 'No Data', value: 1, color: '#E5E7EB' }];
    return [
      { name: 'Outstanding', value: total, color: '#0D9488' },
    ];
  }, [parties]);

  const payableChartData = useMemo(() => {
    const payables = parties?.filter(p => 
      p.PartyType === 'Sundry Creditors' || p.PartyType === 'Supplier'
    ) || [];
    const total = payables.reduce((sum, p) => sum + Math.abs(parseFloat(p.OpeningBalance || 0) || 0), 0);
    if (total === 0) return [{ name: 'No Data', value: 1, color: '#E5E7EB' }];
    return [
      { name: 'Outstanding', value: total, color: '#E11D48' },
    ];
  }, [parties]);

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
      className="min-h-screen bg-gradient-to-br from-canvas-default via-canvas-soft to-indigo-light/20 pb-20 md:pb-6"
    >
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Dashboard</h1>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                connectionStatus === 'connected' 
                  ? 'bg-teal-light text-teal-DEFAULT' 
                  : connectionStatus === 'disconnected'
                  ? 'bg-amber-light text-amber-DEFAULT'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {connectionStatus === 'connected' && '● Live'}
                {connectionStatus === 'disconnected' && '● Demo'}
                {connectionStatus === 'checking' && '● Checking...'}
              </span>
            </div>
            <p className="text-sm text-ink-muted mt-1">
              {currentCompany?.name || 'Sharma Trading Co.'}
            </p>
          </div>
          <div className="text-xs text-ink-faint">
            {dateRange.label || 'All data'}
          </div>
        </div>

        {showPromoBanner && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden bg-gradient-to-r from-indigo-light to-indigo-light/50 border-l-4 border-indigo-DEFAULT rounded-lg p-4"
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-indigo-DEFAULT/10 rounded-full blur-xl pointer-events-none" />
            <button
              onClick={dismissPromoBanner}
              className="absolute top-2 right-2 text-ink-muted hover:text-ink-DEFAULT z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-ink-DEFAULT">Live Data Connected</p>
                <p className="text-sm text-ink-muted mt-1">
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
          {kpis.map((kpi, idx) => (
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

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-light/50 to-teal-light/20 px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-teal-DEFAULT">Receivables</h3>
                <button
                  onClick={() => navigate('/outstanding?type=receivable')}
                  className="text-sm text-teal-DEFAULT hover:text-teal-dark hover:underline"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-4">
              <DonutChart data={receivableChartData} />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-rose-light/50 to-rose-light/20 px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-rose-DEFAULT">Payables</h3>
                <button
                  onClick={() => navigate('/outstanding?type=payable')}
                  className="text-sm text-rose-DEFAULT hover:text-rose-dark hover:underline"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-4">
              <DonutChart data={payableChartData} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ink-DEFAULT">Top Selling Items</h3>
              <button
                onClick={() => navigate('/items')}
                className="text-sm text-ink-muted hover:text-ink-DEFAULT hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {topItems.length > 0 ? topItems.slice(0, 3).map((item, idx) => {
                const badgeStyles = [
                  'bg-gradient-to-br from-amber-light to-amber-DEFAULT/30 border-amber-DEFAULT/30 text-amber-DEFAULT',
                  'bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-300/50 text-slate-600',
                  'bg-gradient-to-br from-orange-light to-orange-DEFAULT/30 border-orange-DEFAULT/30 text-orange-DEFAULT',
                ];
                return (
                  <div
                    key={item.itemId || idx}
                    className="flex items-center gap-3 p-2 hover:bg-canvas-default rounded-lg cursor-pointer transition-colors"
                    onClick={() => navigate('/items')}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 ${badgeStyles[idx]} rounded-lg flex items-center justify-center border`}>
                      <span className="font-semibold text-sm">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-DEFAULT truncate">{item.name}</p>
                      <p className="text-xs text-ink-muted">{item.totalQty} units sold</p>
                    </div>
                    <p className="text-sm font-semibold text-ink-DEFAULT">{formatCurrency(item.totalValue)}</p>
                  </div>
                );
              }) : (
                <p className="text-sm text-ink-muted text-center py-4">No sales data available</p>
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ink-DEFAULT">Recent Transactions</h3>
              <button
                onClick={() => navigate('/reports/day-book')}
                className="text-sm text-ink-muted hover:text-ink-DEFAULT hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentTransactions.length > 0 ? recentTransactions.map((trans, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-canvas rounded-lg transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-light rounded-full flex items-center justify-center border border-border">
                    <svg className="w-4 h-4 text-indigo-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-DEFAULT">{trans.type}</p>
                    <p className="text-xs text-ink-muted truncate">{trans.party}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink-DEFAULT">{formatCurrency(trans.amount)}</p>
                    <p className="text-xs text-ink-muted">{formatDate(trans.date)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-ink-muted text-center py-4">No transactions available</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
