import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';
import { calculateProfitLoss } from '../../utils/profitLoss';

const ProfitLoss = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange, setCustomDateRange } = useDateRange();
  
  const { ledgers, groups, vouchers, voucherLines, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const reportData = useMemo(() => {
    if (!vouchers) return calculateProfitLoss([], voucherLines, ledgers, groups);
    
    let filteredVouchers = vouchers;
    if (dateRange.startDate && dateRange.endDate) {
      const dateStart = new Date(dateRange.startDate);
      const dateEnd = new Date(dateRange.endDate);
      filteredVouchers = vouchers.filter(v => {
        const voucherDate = new Date(v.VoucherDate);
        return voucherDate >= dateStart && voucherDate <= dateEnd;
      });
    }

    return calculateProfitLoss(filteredVouchers, voucherLines, ledgers, groups);
  }, [vouchers, voucherLines, ledgers, groups, dateRange.startDate, dateRange.endDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-canvas-default pb-20 md:pb-6"
      >
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <Skeleton variant="text" className="w-48 h-7" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton variant="rounded" className="w-full h-10 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton variant="rounded" className="h-64 rounded-lg" />
            <Skeleton variant="rounded" className="h-64 rounded-lg" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-canvas-default pb-20 md:pb-6"
    >
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/reports')}
              className="p-2 hover:bg-canvas-faint rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Profit & Loss</h1>
              <p className="text-sm text-ink-muted">Income vs Expenses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.startDate || ''}
              onChange={(e) => setCustomDateRange(e.target.value, dateRange.endDate || '')}
              className="px-3 py-1.5 bg-white border border-canvas-faint rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <span className="text-ink-muted">to</span>
            <input
              type="date"
              value={dateRange.endDate || ''}
              onChange={(e) => setCustomDateRange(dateRange.startDate || '', e.target.value)}
              className="px-3 py-1.5 bg-white border border-canvas-faint rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-canvas-faint overflow-hidden"
          id="trading"
        >
          <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-purple-50 border-b border-canvas-faint">
            <h2 className="font-semibold text-ink-default">Trading Account (Gross Profit/Loss)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-canvas-faint">
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-3">Income (Credit)</p>
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-ink-default">Sales Accounts (Direct Income)</span>
                <span className="text-sm font-medium text-ink-default">{formatCurrency(reportData.income.direct)}</span>
              </div>
              {(reportData.income.ledgers.indirect || []).map(item => (
                <div key={item.id} className="flex justify-between py-1.5">
                  <span className="text-sm text-ink-default">{item.name} (Indirect)</span>
                  <span className="text-sm font-medium text-ink-default">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-canvas-faint">
                <div className="flex justify-between">
                  <span className="font-semibold text-ink-default">Total Income</span>
                  <span className="font-semibold text-teal-600">{formatCurrency(reportData.income.total)}</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-3">Direct Expenses (Debit)</p>
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-ink-default">Purchase Accounts</span>
                <span className="text-sm font-medium text-ink-default">{formatCurrency(reportData.expenses.purchase)}</span>
              </div>
              {(reportData.expenses.ledgers.direct || []).map(item => (
                <div key={item.id} className="flex justify-between py-1.5">
                  <span className="text-sm text-ink-default">{item.name}</span>
                  <span className="text-sm font-medium text-ink-default">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-canvas-faint">
                <div className="flex justify-between">
                  <span className="font-semibold text-ink-default">Total Direct Expenses</span>
                  <span className="font-semibold text-rose-600">{formatCurrency(reportData.expenses.totalDirect)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-light to-indigo-100 border-t border-canvas-faint">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-ink-default">Gross Profit</span>
              <span className={`font-bold text-lg ${reportData.grossProfit >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                {formatCurrency(Math.abs(reportData.grossProfit))}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-canvas-faint overflow-hidden"
          id="pl"
        >
          <div className="px-4 py-3 bg-gradient-to-r from-amber-light to-amber-100 border-b border-canvas-faint">
            <h2 className="font-semibold text-ink-default">Profit & Loss Account (Net Profit/Loss)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-canvas-faint">
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-3">Additions (Credit)</p>
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-ink-default">Gross Profit b/d</span>
                <span className="text-sm font-medium text-ink-default">{formatCurrency(Math.abs(reportData.grossProfit))}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-ink-default">Indirect Income</span>
                <span className="text-sm font-medium text-ink-default">{formatCurrency(reportData.income.indirect)}</span>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-3">Indirect Expenses (Debit)</p>
              {(reportData.expenses.ledgers.indirect || []).map(item => (
                <div key={item.id} className="flex justify-between py-1.5">
                  <span className="text-sm text-ink-default">{item.name}</span>
                  <span className="text-sm font-medium text-ink-default">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              {(reportData.expenses.ledgers.indirect || []).length === 0 && (
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-ink-muted">No indirect expenses</span>
                  <span className="text-sm font-medium text-ink-muted">{formatCurrency(0)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="px-4 py-3 bg-gradient-to-r from-teal-light to-teal-100 border-t border-canvas-faint">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-ink-default">Net Profit/Loss</span>
              <span className={`font-bold text-xl ${reportData.netProfit >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                {formatCurrency(Math.abs(reportData.netProfit))}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfitLoss;
