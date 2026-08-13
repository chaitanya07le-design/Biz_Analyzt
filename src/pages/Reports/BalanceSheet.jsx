import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { calculateProfitLoss } from '../../utils/profitLoss';

const BalanceSheet = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { ledgers, parties, groups, vouchers, voucherLines, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const normalizedLedgers = useMemo(() => {
    if (!ledgers || ledgers.length === 0) return [];
    return ledgers.map(l => ({
      id: l.LedgerID || l.id,
      name: l.LedgerName || l.name || '',
      groupId: l.GroupID || l.groupId || '',
      balance: parseFloat(l.OpeningBalance || l.balance || 0),
    }));
  }, [ledgers]);

  const partyBalances = useMemo(() => {
    if (!parties) return { debtors: 0, creditors: 0 };
    const debtors = parties
      .filter(p => p.PartyType === 'Customer')
      .reduce((sum, p) => sum + Math.max(0, parseFloat(p.OpeningBalance || 0)), 0);
    const creditors = parties
      .filter(p => p.PartyType === 'Supplier')
      .reduce((sum, p) => sum + Math.abs(Math.min(0, parseFloat(p.OpeningBalance || 0))), 0);
    return { debtors, creditors };
  }, [parties]);

  const ledgerWithGroups = useMemo(() => {
    if (!normalizedLedgers || !groups) return [];
    const groupMap = new Map();
    groups.forEach(g => {
      groupMap.set(g.GroupID, g);
    });
    return normalizedLedgers.map(ledger => {
      const group = groupMap.get(ledger.groupId) || {};
      return {
        ...ledger,
        groupName: group.GroupName || '',
        groupNature: group.Nature || '',
        statementType: group.StatementType || ''
      };
    });
  }, [normalizedLedgers, groups]);

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
    ledgerWithGroups.forEach(ledger => {
      if (ledger.statementType !== 'BalanceSheet') return;
      
      if (!groupMap[ledger.groupName]) {
        groupMap[ledger.groupName] = {
          name: ledger.groupName,
          ledgers: [],
          total: 0
        };
      }
      groupMap[ledger.groupName].ledgers.push(ledger);
      groupMap[ledger.groupName].total += ledger.balance;
    });

    Object.values(groupMap).forEach(group => {
      const item = {
        name: group.name,
        amount: group.total,
        ledgers: group.ledgers
      };

      if (group.name === 'Bank Accounts' || group.name === 'Cash-in-Hand') {
        assets.current.push(item);
        assets.total += group.total;
      } else if (group.name === 'Capital Account') {
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

    if (partyBalances.debtors > 0) {
      assets.current.push({ name: 'Sundry Debtors', amount: partyBalances.debtors, ledgers: [] });
      assets.total += partyBalances.debtors;
    }

    if (partyBalances.creditors > 0) {
      liabilities.current.push({ name: 'Sundry Creditors', amount: partyBalances.creditors, ledgers: [] });
      liabilities.total += partyBalances.creditors;
    }

    const profitData = calculateProfitLoss(vouchers, voucherLines, ledgers, groups);
    if (profitData.netProfit !== 0) {
      const profitItem = {
        name: profitData.netProfit >= 0 ? 'Net Profit' : 'Net Loss',
        amount: Math.abs(profitData.netProfit),
        ledgers: []
      };
      liabilities.capital.push(profitItem);
      liabilities.total += Math.abs(profitData.netProfit);
    }

    return { assets, liabilities, netProfit: profitData.netProfit };
  }, [ledgerWithGroups, partyBalances, vouchers, voucherLines, ledgers, groups]);

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
            <div className="px-4 py-3 bg-gradient-to-r from-teal-light to-teal-100 border-b border-canvas-faint">
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
              <div className="px-4 py-3 bg-teal-light">
                <div className="flex justify-between">
                  <span className="font-semibold text-ink-default">Total Assets</span>
                  <span className="font-semibold text-teal-600">{formatCurrency(reportData.assets.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-rose-light to-rose-100 border-b border-canvas-faint">
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
              <div className="px-4 py-3 bg-rose-light">
                <div className="flex justify-between">
                  <span className="font-semibold text-ink-default">Total Liabilities</span>
                  <span className="font-semibold text-rose-600">{formatCurrency(reportData.liabilities.total)}</span>
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
            <span className={`font-bold text-lg ${reportData.assets.total - reportData.liabilities.total >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
              {formatCurrency(reportData.assets.total - reportData.liabilities.total)}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BalanceSheet;
