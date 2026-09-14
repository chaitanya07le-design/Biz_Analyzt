import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import TableSkeleton from '../../components/shared/TableSkeleton';
import VoucherPagination, { DEFAULT_PAGE_SIZE } from '../../components/voucher/VoucherPagination';
import api from '../../services/api';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const DayBookMonth = () => {
  const navigate = useNavigate();
  const { monthKey } = useParams(); // e.g., "2025-10"
  const [vouchers, setVouchers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  const allVouchers = vouchers || [];
  const totalPages = Math.max(1, Math.ceil(allVouchers.length / pageSize));
  const paginatedVouchers = allVouchers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when month changes
  useEffect(() => { setCurrentPage(1); }, [monthKey]);

  const monthLabel = useMemo(() => {
    if (!monthKey) return '';
    const [y, m] = monthKey.split('-');
    const idx = parseInt(m, 10) - 1;
    return `${MONTH_NAMES[idx] || ''} ${y}`;
  }, [monthKey]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getTallyDayBookMonth(monthKey)
      .then((data) => {
        if (active) {
          setVouchers(data?.vouchers || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [monthKey]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Sales': 'text-blue-600 bg-blue-50',
      'Purchase': 'text-purple-600 bg-purple-50',
      'Receipt': 'text-green-600 bg-green-50',
      'Payment': 'text-red-600 bg-red-50',
      'Journal': 'text-gray-600 bg-gray-50',
      'Contra': 'text-orange-600 bg-orange-50',
      'Debit Note': 'text-amber-600 bg-amber-50',
      'Credit Note': 'text-teal-600 bg-teal-50',
    };
    return colors[category] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <div className="h-7 w-48 bg-canvas-faint rounded animate-pulse" />
          <TableSkeleton rows={8} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/reports/day-book')} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors">
              <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">{monthLabel}</h1>
              <p className="text-sm text-ink-muted">LIVE TALLY · {vouchers ? vouchers.length : 0} vouchers</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-canvas-faint border-b border-canvas-faint">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Voucher No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Party/Ledger</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {paginatedVouchers.map((voucher, idx) => (
                  <motion.tr
                    key={voucher.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    onClick={() => navigate(`/tally-voucher/${voucher.voucherType}/${encodeURIComponent(voucher.voucherNo)}`)}
                    className="hover:bg-canvas-faint transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-ink-default whitespace-nowrap">
                      {formatDate(voucher.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getCategoryColor(voucher.voucherType)}`}>
                        {voucher.voucherType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-default font-medium">
                      {voucher.voucherNo || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-default">
                      {voucher.partyName || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-default text-right font-medium whitespace-nowrap">
                      {formatCurrency(voucher.netAmount || 0)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!vouchers || vouchers.length === 0) && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted">No vouchers found for {monthLabel}</p>
            </div>
          )}
        </motion.div>

        {allVouchers.length > 0 && (
          <VoucherPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={allVouchers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-canvas-faint p-4">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0">
              <p className="text-sm text-ink-muted">Total Vouchers</p>
              <p className="text-lg font-semibold text-ink-default">{vouchers ? vouchers.length : 0}</p>
            </div>
            <div className="text-right min-w-0">
              <p className="text-sm text-ink-muted">Total Amount</p>
              <p className="text-[1.1rem] sm:text-lg md:text-xl font-semibold text-brand-primary break-words" title={formatCurrency((vouchers || []).reduce((sum, v) => sum + (v.netAmount || 0), 0))}>
                {formatCurrency((vouchers || []).reduce((sum, v) => sum + (v.netAmount || 0), 0))}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DayBookMonth;