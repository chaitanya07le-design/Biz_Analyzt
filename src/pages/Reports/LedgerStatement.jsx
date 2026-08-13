import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';

const LedgerStatement = () => {
  const { ledgerId } = useParams();
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  
  const { ledgers, vouchers, voucherLines, groups, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const ledger = useMemo(() => {
    if (!ledgers) return null;
    return ledgers.find(l => (l.LedgerID || l.id) === ledgerId);
  }, [ledgers, ledgerId]);

  const ledgerGroup = useMemo(() => {
    if (!groups || !ledger) return null;
    return groups.find(g => g.GroupID === ledger?.GroupID);
  }, [groups, ledger]);

  const transactions = useMemo(() => {
    if (!vouchers || !voucherLines || !ledgerId) return [];

    const voucherMap = new Map();
    vouchers.forEach(v => {
      voucherMap.set(v.VoucherID, v);
    });

    const dateStart = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const dateEnd = dateRange.endDate ? new Date(dateRange.endDate) : null;

    const lines = voucherLines
      .filter(line => line.LedgerID === ledgerId)
      .map(line => {
        const parentVoucher = voucherMap.get(line.VoucherID);
        if (!parentVoucher) return null;
        
        const voucherDate = new Date(parentVoucher.VoucherDate);
        if (dateStart && dateEnd) {
          if (voucherDate < dateStart || voucherDate > dateEnd) return null;
        }

        return {
          date: parentVoucher.VoucherDate,
          voucherNo: parentVoucher.VoucherNo,
          voucherType: parentVoucher.VoucherType,
          voucherId: parentVoucher.VoucherID,
          debit: parseFloat(line.LedgerDebit || 0),
          credit: parseFloat(line.LedgerCredit || 0),
          particulars: line.ItemName || line.LedgerName || '-'
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = parseFloat(ledger?.OpeningBalance || 0);
    const isDebitNature = ledgerGroup?.Nature === 'Expense' || ledgerGroup?.Nature === 'Asset';
    
    return lines.map(txn => {
      if (isDebitNature) {
        runningBalance += txn.debit - txn.credit;
      } else {
        runningBalance += txn.credit - txn.debit;
      }
      return { ...txn, balance: runningBalance };
    });
  }, [vouchers, voucherLines, ledgerId, dateRange, ledger, ledgerGroup]);

  const totals = useMemo(() => {
    return transactions.reduce((acc, txn) => ({
      debit: acc.debit + txn.debit,
      credit: acc.credit + txn.credit
    }), { debit: 0, credit: 0 });
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" className="w-full h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!ledger) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-canvas-default pb-20 md:pb-6"
      >
        <div className="px-4 py-4 md:px-6 md:py-6">
          <div className="text-center py-12">
            <p className="text-ink-muted">Ledger not found</p>
            <button
              onClick={() => navigate('/reports/by-ledger')}
              className="mt-4 text-brand-primary hover:underline"
            >
              Back to By Ledger
            </button>
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
              onClick={() => navigate('/reports/by-ledger')}
              className="p-2 hover:bg-canvas-faint rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">{ledger.LedgerName}</h1>
              <p className="text-sm text-ink-muted">{ledgerGroup?.GroupName || 'Unknown Group'} • Opening: {formatCurrency(ledger.OpeningBalance || 0)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-canvas-faint overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-canvas-faint border-b border-canvas-faint">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Voucher</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Particulars</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase">Debit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase">Credit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {transactions.map((txn, idx) => (
                  <motion.tr
                    key={`${txn.voucherId}-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => navigate(`/voucher/${txn.voucherId}`)}
                    className="hover:bg-canvas-faint cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-ink-default">{formatDate(txn.date)}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-brand-primary">{txn.voucherNo}</span>
                      <span className="text-xs text-ink-muted ml-2">({txn.voucherType})</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-muted">{txn.particulars}</td>
                    <td className="px-4 py-3 text-right text-sm text-ink-default">
                      {txn.debit > 0 ? formatCurrency(txn.debit) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-ink-default">
                      {txn.credit > 0 ? formatCurrency(txn.credit) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-ink-default">
                      {formatCurrency(txn.balance)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot className="bg-canvas-faint border-t-2 border-canvas-faint">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-sm font-semibold text-ink-default">Total</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-ink-default">
                    {formatCurrency(totals.debit)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-ink-default">
                    {formatCurrency(totals.credit)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-ink-default">
                    {formatCurrency((transactions[transactions.length - 1]?.balance || 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted">No transactions found for this ledger in the selected date range</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Debits</p>
            <p className="text-lg font-semibold text-ink-default">{formatCurrency(totals.debit)}</p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Credits</p>
            <p className="text-lg font-semibold text-ink-default">{formatCurrency(totals.credit)}</p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Closing Balance</p>
            <p className="text-lg font-semibold text-ink-default">
              {formatCurrency(transactions[transactions.length - 1]?.balance || ledger?.OpeningBalance || 0)}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LedgerStatement;
