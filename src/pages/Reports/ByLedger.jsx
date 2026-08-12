import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { ledgers, salesVouchers, purchaseVouchers, receiptVouchers, paymentVouchers } from '../../data/mockData';

const ByLedger = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const [startDate, setStartDate] = useState('2025-04-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { ledgers: apiLedgers, vouchers, loading, useMockData } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const normalizedLedgers = useMemo(() => {
    if (useMockData || !apiLedgers || apiLedgers.length === 0) return ledgers;
    return apiLedgers.map(l => ({
      id: l.LedgerID || l.id,
      name: l.LedgerName || l.name || '',
      group: l.Group || l.group || '',
      type: l.LedgerType || l.type || '',
      balance: parseFloat(l.OpeningBalance || l.balance || 0),
    }));
  }, [apiLedgers, useMockData]);

  const ledgerTransactions = useMemo(() => {
    const transactions = {};
    
    normalizedLedgers.forEach(ledger => {
      transactions[ledger.id] = {
        ledger: ledger,
        debits: 0,
        credits: 0,
        count: 0,
        vouchers: []
      };
    });

    const allVouchers = useMockData || !vouchers || vouchers.length === 0
      ? [...salesVouchers, ...purchaseVouchers, ...receiptVouchers, ...paymentVouchers]
      : vouchers.map(v => ({
          id: v.VoucherID || v.id,
          date: v.VoucherDate || v.date,
          voucherNo: v.VoucherNo || v.voucherNo,
          partyName: v.PartyName || v.partyName,
          netAmount: parseFloat(v.GrandTotal || v.netAmount || v.grossTotal || 0),
        }));

    allVouchers.forEach(voucher => {
      const ledgerName = voucher.partyName || voucher.PartyName;
      const ledger = normalizedLedgers.find(l => l.name === ledgerName);
      if (ledger) {
        transactions[ledger.id].count++;
        transactions[ledger.id].vouchers.push({
          id: voucher.id || voucher.VoucherID,
          date: voucher.date || voucher.VoucherDate,
          voucherNo: voucher.voucherNo || voucher.VoucherNo,
          amount: voucher.netAmount || voucher.NetAmount || voucher.grossTotal || 0
        });
      }
    });

    return Object.values(transactions)
      .filter(t => t.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [normalizedLedgers, useMockData, vouchers]);

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
          <div className="flex gap-2">
            <Skeleton variant="rounded" className="w-32 h-10 rounded-lg" />
            <Skeleton variant="rounded" className="w-32 h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" className="w-full h-16 rounded-lg" />
            ))}
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
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">By Ledger</h1>
              <p className="text-sm text-ink-muted">Transactions grouped by ledger</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-canvas-faint rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <span className="text-ink-muted">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-canvas-faint rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-canvas-faint overflow-hidden"
        >
          <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-purple-50 border-b border-canvas-faint">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-ink-default">
                {ledgerTransactions.length} ledgers with transactions
              </p>
            </div>
          </div>
          <div className="divide-y divide-canvas-faint">
            {ledgerTransactions.map((item, idx) => (
              <motion.div
                key={item.ledger.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="px-4 py-3 hover:bg-canvas-faint transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-default">{item.ledger.name}</p>
                    <p className="text-xs text-ink-muted">{item.ledger.group}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink-default">{item.count} transactions</p>
                    <p className="text-xs text-ink-muted">
                      Balance: {formatCurrency(item.ledger.balance)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {ledgerTransactions.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted">No transactions found</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ByLedger;
