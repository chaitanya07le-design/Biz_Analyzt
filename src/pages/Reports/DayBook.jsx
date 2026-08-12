import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import TableSkeleton from '../../components/shared/TableSkeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';

const DayBook = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const [startDate, setStartDate] = useState('2025-04-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { vouchers, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const allVouchers = useMemo(() => {
    if (!vouchers || vouchers.length === 0) {
      return [];
    }
    
    return vouchers.map(v => ({
      id: v.VoucherID || v.id,
      voucherNo: v.VoucherNo || v.voucherNo || '',
      date: v.VoucherDate || v.date,
      category: v.VoucherType || v.category || '',
      partyName: v.PartyName || v.partyName || '',
      netAmount: parseFloat(v.GrandTotal || v.netAmount || 0),
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    return allVouchers.filter(v => {
      const voucherDate = new Date(v.date);
      return voucherDate >= new Date(startDate) && voucherDate <= new Date(endDate);
    });
  }, [allVouchers, startDate, endDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Sales': 'text-blue-600 bg-blue-50',
      'Purchase': 'text-purple-600 bg-purple-50',
      'Receipt': 'text-green-600 bg-green-50',
      'Payment': 'text-red-600 bg-red-50',
      'Journal': 'text-gray-600 bg-gray-50'
    };
    return colors[category] || 'text-gray-600 bg-gray-50';
  };

  const handleVoucherClick = (voucherId) => {
    navigate(`/voucher/${voucherId}`);
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
          <TableSkeleton rows={10} />
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
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Day Book</h1>
              <p className="text-sm text-ink-muted">Chronological list of all vouchers</p>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-canvas-faint border-b border-canvas-faint">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Voucher No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Party/Ledger</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Narration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {filteredVouchers.map((voucher, idx) => (
                  <motion.tr
                    key={voucher.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => handleVoucherClick(voucher.id)}
                    className="hover:bg-canvas-faint cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-ink-default whitespace-nowrap">
                      {formatDate(voucher.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getCategoryColor(voucher.category)}`}>
                        {voucher.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-default font-medium">
                      {voucher.voucherNo || 'Draft'}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-default">
                      {voucher.partyName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-default text-right font-medium whitespace-nowrap">
                      {formatCurrency(voucher.netAmount || voucher.grossTotal || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-muted truncate max-w-xs">
                      {voucher.narration || '-'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredVouchers.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted">No vouchers found for the selected period</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-canvas-faint p-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-ink-muted">Total Vouchers</p>
              <p className="text-lg font-semibold text-ink-default">{filteredVouchers.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink-muted">Total Amount</p>
              <p className="text-lg font-semibold text-brand-primary">
                {formatCurrency(filteredVouchers.reduce((sum, v) => sum + (v.netAmount || v.grossTotal || 0), 0))}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DayBook;
