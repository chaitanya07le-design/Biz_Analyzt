import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';

const ExpensesReport = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  
  const { ledgers: apiLedgers, groups, vouchers, voucherLines, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const expenseData = useMemo(() => {
    const directExpenses = [];
    const indirectExpenses = [];
    let totalDirect = 0;
    let totalIndirect = 0;

    if (!vouchers || !voucherLines || !groups || !apiLedgers) {
      return {
        directExpenses,
        indirectExpenses,
        totalDirect,
        totalIndirect,
        grandTotal: totalDirect + totalIndirect
      };
    }

    const groupMap = new Map();
    groups.forEach(g => {
      groupMap.set(g.GroupID, g);
    });

    const ledgerMap = new Map();
    apiLedgers.forEach(l => {
      ledgerMap.set(l.LedgerID, l);
    });

    const expenseMap = new Map();

    voucherLines.forEach(line => {
      if (line.LineType !== 'Ledger') return;
      if (!line.LedgerID) return;

      const ledger = ledgerMap.get(line.LedgerID);
      if (!ledger) return;

      const group = groupMap.get(ledger.GroupID);
      if (!group) return;

      if (group.StatementType !== 'P&L' || group.Nature !== 'Expense') return;

      const amount = parseFloat(line.LedgerDebit || 0);
      const key = ledger.LedgerID;
      
      if (!expenseMap.has(key)) {
        expenseMap.set(key, {
          id: ledger.LedgerID,
          name: ledger.LedgerName,
          groupName: group.GroupName,
          amount: 0
        });
      }
      expenseMap.get(key).amount += amount;
    });

    expenseMap.forEach(item => {
      const expenseItem = {
        id: item.id,
        name: item.name,
        group: item.groupName,
        amount: item.amount
      };

      if (item.groupName === 'Direct Expenses') {
        directExpenses.push(expenseItem);
        totalDirect += item.amount;
      } else if (item.groupName === 'Indirect Expenses') {
        indirectExpenses.push(expenseItem);
        totalIndirect += item.amount;
      }
    });

    return {
      directExpenses: directExpenses.sort((a, b) => b.amount - a.amount),
      indirectExpenses: indirectExpenses.sort((a, b) => b.amount - a.amount),
      totalDirect,
      totalIndirect,
      grandTotal: totalDirect + totalIndirect
    };
  }, [vouchers, voucherLines, groups, apiLedgers]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPercentage = (amount, total) => {
    return ((amount / total) * 100).toFixed(1);
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
          <div className="flex gap-2">
            <Skeleton variant="rounded" className="w-32 h-10 rounded-lg" />
            <Skeleton variant="rounded" className="w-32 h-10 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton variant="rounded" className="h-48 rounded-lg" />
            <Skeleton variant="rounded" className="h-48 rounded-lg" />
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
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Expenses</h1>
              <p className="text-sm text-ink-muted">Direct and Indirect expense breakdown</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Direct Expenses</p>
            <p className="text-lg font-semibold text-orange-600">{formatCurrency(expenseData.totalDirect)}</p>
            <p className="text-xs text-ink-muted mt-1">{expenseData.directExpenses.length} items</p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Indirect Expenses</p>
            <p className="text-lg font-semibold text-red-600">{formatCurrency(expenseData.totalIndirect)}</p>
            <p className="text-xs text-ink-muted mt-1">{expenseData.indirectExpenses.length} items</p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Expenses</p>
            <p className="text-lg font-semibold text-brand-primary">{formatCurrency(expenseData.grandTotal)}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-canvas-faint">
              <h2 className="font-semibold text-ink-default">Direct Expenses</h2>
              <p className="text-xs text-ink-muted">Cost of goods/services sold</p>
            </div>
            <div className="divide-y divide-canvas-faint">
              {expenseData.directExpenses.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-ink-default">{item.name}</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-default">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-ink-muted">{getPercentage(item.amount, expenseData.grandTotal)}%</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-canvas-faint rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${getPercentage(item.amount, expenseData.totalDirect)}%` }}
                    />
                  </div>
                </motion.div>
              ))}
              {expenseData.directExpenses.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-ink-muted">No direct expenses</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 border-b border-canvas-faint">
              <h2 className="font-semibold text-ink-default">Indirect Expenses</h2>
              <p className="text-xs text-ink-muted">Operating & administrative costs</p>
            </div>
            <div className="divide-y divide-canvas-faint">
              {expenseData.indirectExpenses.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-ink-default">{item.name}</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-default">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-ink-muted">{getPercentage(item.amount, expenseData.grandTotal)}%</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-canvas-faint rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${getPercentage(item.amount, expenseData.totalIndirect)}%` }}
                    />
                  </div>
                </motion.div>
              ))}
              {expenseData.indirectExpenses.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-ink-muted">No indirect expenses</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ExpensesReport;
