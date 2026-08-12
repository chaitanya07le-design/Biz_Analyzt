import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';

const BalanceSheet = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { ledgers, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const normalizedLedgers = useMemo(() => {
    if (!ledgers || ledgers.length === 0) return [];
    return ledgers.map(l => ({
      id: l.LedgerID || l.id,
      name: l.LedgerName || l.name || '',
      group: l.Group || l.group || '',
      type: l.LedgerType || l.type || '',
      balance: parseFloat(l.OpeningBalance || l.balance || 0),
    }));
  }, [ledgers]);

  const reportData = useMemo(() => {
    const assets = {
      current: [],
      fixed: [],
      total: 0
    };
    const liabilities = {
      current: [],
      capital: [],
      total: 0
    };

    const groupMap = {};
    normalizedLedgers.forEach(ledger => {
      if (!groupMap[ledger.group]) {
        groupMap[ledger.group] = {
          name: ledger.group,
          ledgers: [],
          total: 0
        };
      }
      groupMap[ledger.group].ledgers.push(ledger);
      groupMap[ledger.group].total += ledger.balance;
    });

    const assetGroups = ['Stock-in-Hand', 'Sundry Debtors', 'Bank Accounts', 'Cash-in-Hand'];
    const liabilityCurrentGroups = ['Sundry Creditors', 'Duties & Taxes'];
    const liabilityCapitalGroups = ['Capital Account'];

    Object.values(groupMap).forEach(group => {
      const item = {
        name: group.name,
        amount: group.total,
        ledgers: group.ledgers
      };

      if (assetGroups.includes(group.name)) {
        assets.current.push(item);
        assets.total += group.total;
      } else if (liabilityCurrentGroups.includes(group.name)) {
        liabilities.current.push(item);
        liabilities.total += Math.abs(group.total);
      } else if (liabilityCapitalGroups.includes(group.name)) {
        liabilities.capital.push(item);
        liabilities.total += Math.abs(group.total);
      } else if (group.total > 0) {
        assets.current.push(item);
        assets.total += group.total;
      } else if (group.total < 0) {
        liabilities.current.push(item);
        liabilities.total += Math.abs(group.total);
      }
    });

    return { assets, liabilities };
  }, [normalizedLedgers]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
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
          <Skeleton variant="rounded" className="w-full h-10 rounded-lg" />
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
          className="flex items-center justify-between"
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
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Balance Sheet</h1>
              <p className="text-sm text-ink-muted">Assets vs Liabilities</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-ink-muted">As of:</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-canvas-faint rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-canvas-faint">
              <h2 className="font-semibold text-ink-default">Assets</h2>
            </div>
            <div className="divide-y divide-canvas-faint">
              {reportData.assets.current.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Current Assets</p>
                  {reportData.assets.current.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5">
                      <span className="text-sm text-ink-default">{item.name}</span>
                      <span className="text-sm font-medium text-ink-default">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              {reportData.assets.fixed.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Fixed Assets</p>
                  {reportData.assets.fixed.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5">
                      <span className="text-sm text-ink-default">{item.name}</span>
                      <span className="text-sm font-medium text-ink-default">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="px-4 py-3 bg-green-50">
                <div className="flex justify-between">
                  <span className="font-semibold text-ink-default">Total Assets</span>
                  <span className="font-semibold text-green-600">{formatCurrency(reportData.assets.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 border-b border-canvas-faint">
              <h2 className="font-semibold text-ink-default">Liabilities</h2>
            </div>
            <div className="divide-y divide-canvas-faint">
              {reportData.liabilities.current.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Current Liabilities</p>
                  {reportData.liabilities.current.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5">
                      <span className="text-sm text-ink-default">{item.name}</span>
                      <span className="text-sm font-medium text-ink-default">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              {reportData.liabilities.capital.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Capital & Reserves</p>
                  {reportData.liabilities.capital.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5">
                      <span className="text-sm text-ink-default">{item.name}</span>
                      <span className="text-sm font-medium text-ink-default">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="px-4 py-3 bg-red-50">
                <div className="flex justify-between">
                  <span className="font-semibold text-ink-default">Total Liabilities</span>
                  <span className="font-semibold text-red-600">{formatCurrency(reportData.liabilities.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-canvas-faint p-4"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-ink-default">Difference (Profit/Loss)</span>
            <span className={`font-bold text-lg ${reportData.assets.total - reportData.liabilities.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(reportData.assets.total - reportData.liabilities.total)}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BalanceSheet;
