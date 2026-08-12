import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';

const LedgerReport = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { ledgers, vouchers, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

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

  const filteredLedgers = useMemo(() => {
    return normalizedLedgers.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [normalizedLedgers, searchQuery]);

  const ledgerTransactions = useMemo(() => {
    if (!selectedLedger || !vouchers) return [];
    
    let filteredVouchers = vouchers;
    if (dateRange.startDate && dateRange.endDate) {
      filteredVouchers = vouchers.filter(v => {
        const voucherDate = new Date(v.VoucherDate || v.date);
        return voucherDate >= new Date(dateRange.startDate) && voucherDate <= new Date(dateRange.endDate);
      });
    }
    
    return filteredVouchers.filter(v => 
      (v.PartyName || v.partyName) === selectedLedger.name ||
      (v.LedgerName || v.ledgerName) === selectedLedger.name
    ).map(v => ({
      id: v.VoucherID || v.id,
      date: v.VoucherDate || v.date,
      voucherNo: v.VoucherNo || v.voucherNo || '',
      voucherType: v.VoucherType || v.voucherType || '',
      amount: parseFloat(v.GrandTotal || v.amount || 0),
      narration: v.Narration || v.narration || '',
    }));
  }, [selectedLedger, vouchers, dateRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const getLedgerTypeColor = (type) => {
    const colors = {
      'asset': 'text-green-600 bg-green-50',
      'liability': 'text-red-600 bg-red-50',
      'revenue': 'text-blue-600 bg-blue-50',
      'expense': 'text-orange-600 bg-orange-50',
      'equity': 'text-purple-600 bg-purple-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const handleLedgerClick = (ledger) => {
    setSelectedLedger(ledger);
  };

  const handleBack = () => {
    setSelectedLedger(null);
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
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" className="w-full h-12 rounded-lg" />
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
              onClick={() => selectedLedger ? handleBack() : navigate('/reports')}
              className="p-2 hover:bg-canvas-faint rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">
                {selectedLedger ? selectedLedger.name : 'Ledger Report'}
              </h1>
              <p className="text-sm text-ink-muted">
                {selectedLedger ? `Group: ${selectedLedger.group}` : 'Transaction history for a ledger'}
              </p>
            </div>
          </div>
        </motion.div>

        {!selectedLedger ? (
          <>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search ledgers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-canvas-faint rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-canvas-faint overflow-hidden"
            >
              <div className="divide-y divide-canvas-faint">
                {filteredLedgers.map((ledger, idx) => (
                  <motion.div
                    key={ledger.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => handleLedgerClick(ledger)}
                    className="px-4 py-3 hover:bg-canvas-faint cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getLedgerTypeColor(ledger.type)}`}>
                          {ledger.type}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-ink-default">{ledger.name}</p>
                          <p className="text-xs text-ink-muted">{ledger.group}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${ledger.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(ledger.balance)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-lg border border-canvas-faint overflow-hidden"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-purple-50 border-b border-canvas-faint">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-ink-muted">Opening Balance</p>
                  <p className={`text-lg font-semibold ${selectedLedger.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedLedger.balance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-ink-muted">Current Balance</p>
                  <p className={`text-lg font-semibold ${selectedLedger.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedLedger.balance)}
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-canvas-faint">
              {ledgerTransactions.length > 0 ? (
                ledgerTransactions.map((txn, idx) => (
                  <div key={txn.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink-default">{txn.voucherNo}</p>
                        <p className="text-xs text-ink-muted">{txn.date} • {txn.voucherType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink-default">{formatCurrency(txn.amount)}</p>
                        {txn.narration && (
                          <p className="text-xs text-ink-muted truncate max-w-48">{txn.narration}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-ink-muted">No transactions found for this period</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LedgerReport;
