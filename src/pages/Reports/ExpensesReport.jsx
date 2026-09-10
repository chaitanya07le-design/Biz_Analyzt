import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';
import useTallyExpenses from '../../hooks/useTallyExpenses';

const ExpensesReport = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  
  const { ledgers: apiLedgers, groups, vouchers, voucherLines, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');
  const tallyExpenses = useTallyExpenses();

  const expenseData = useMemo(() => {
    if (tallyExpenses?.expenses?.length) {
      const directExpenses = tallyExpenses.expenses.filter((item) => /direct/i.test(item.group));
      const indirectExpenses = tallyExpenses.expenses.filter((item) => !/direct/i.test(item.group));
      const totalDirect = directExpenses.reduce((sum, item) => sum + item.amount, 0);
      const totalIndirect = indirectExpenses.reduce((sum, item) => sum + item.amount, 0);
      return { directExpenses, indirectExpenses, totalDirect, totalIndirect, grandTotal: totalDirect + totalIndirect };
    }
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
  }, [vouchers, voucherLines, groups, apiLedgers, tallyExpenses]);

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
              <p className="text-sm text-ink-muted">Direct and Indirect expense breakdown {tallyExpenses?.expenses?.length ? <span className="font-bold text-brand-primary">· LIVE TALLY</span> : ''}</p>
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
            <p className="text-lg font-semibold text-amber-600">{formatCurrency(expenseData.totalDirect)}</p>
            <p className="text-xs text-ink-muted mt-1">{expenseData.directExpenses.length} items</p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Indirect Expenses</p>
            <p className="text-lg font-semibold text-rose-600">{formatCurrency(expenseData.totalIndirect)}</p>
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
            <div className="px-4 py-3 bg-gradient-to-r from-amber-light to-amber-100 border-b border-canvas-faint">
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
                      className="h-full bg-amber-500 rounded-full"
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
            <div className="px-4 py-3 bg-gradient-to-r from-rose-light to-rose-100 border-b border-canvas-faint">
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
                      className="h-full bg-rose-500 rounded-full"
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

        {tallyExpenses?.today?.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-canvas-faint overflow-hidden"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-canvas-faint">
              <h2 className="font-semibold text-ink-default">Today's Transactions</h2>
              <p className="text-xs text-ink-muted">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {tallyExpenses.today.length} transactions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-canvas-faint border-b border-canvas-faint">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Voucher No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Party</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Notes</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Bill Ref</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-faint">
                  {tallyExpenses.today.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => {
                        const vId = item.voucherId || '';
                        navigate(`/tally-voucher/${item.expenseType}/${encodeURIComponent(item.voucherNo)}${vId ? '/' + encodeURIComponent(vId) : ''}`);
                      }}
                      className="hover:bg-canvas-faint transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm text-ink-default font-medium">{item.voucherNo}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          item.expenseType === 'Sales' ? 'text-blue-600 bg-blue-50' :
                          item.expenseType === 'Purchase' ? 'text-purple-600 bg-purple-50' :
                          item.expenseType === 'Payment' ? 'text-red-600 bg-red-50' :
                          item.expenseType === 'Receipt' ? 'text-green-600 bg-green-50' :
                          'text-gray-600 bg-gray-50'
                        }`}>
                          {item.expenseType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-default">{item.partyName}</td>
                      <td className="px-4 py-3 text-sm text-ink-default max-w-xs truncate">{item.notes || '—'}</td>
                      <td className="px-4 py-3 text-sm text-ink-default">{item.billReference || '—'}</td>
                      <td className="px-4 py-3 text-sm text-ink-default text-right font-medium whitespace-nowrap">{formatCurrency(item.amount)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ExpensesReport;
