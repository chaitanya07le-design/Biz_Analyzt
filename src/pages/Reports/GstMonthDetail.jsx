import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import VoucherPagination, { DEFAULT_PAGE_SIZE } from '../../components/voucher/VoucherPagination';
import api from '../../services/api';

const GstMonthDetail = () => {
  const navigate = useNavigate();
  const { month: paramMonth } = useParams();
  const month = decodeURIComponent(paramMonth || '');

  const [vouchers, setVouchers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  // Reset to page 1 when month changes
  useEffect(() => { setCurrentPage(1); }, [month]);

  useEffect(() => {
    if (!month) return;
    let active = true;
    setLoading(true);
    api.getTallyGstMonthVouchers(month)
      .then((data) => { if (active) { setVouchers(data?.vouchers || []); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [month]);

  const allVouchers = vouchers || [];
  const totalPages = Math.max(1, Math.ceil(allVouchers.length / pageSize));
  const paginatedVouchers = allVouchers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const summary = useMemo(() => {
    if (!vouchers) return { totalTaxable: 0, totalTax: 0, totalValue: 0 };
    return vouchers.reduce((s, v) => ({
      totalTaxable: s.totalTaxable + (v.taxableAmount || 0),
      totalTax: s.totalTax + (v.cgst || 0) + (v.sgst || 0) + (v.igst || 0) + (v.cess || 0),
      totalValue: s.totalValue + (v.totalInvoiceValue || 0),
    }), { totalTaxable: 0, totalTax: 0, totalValue: 0 });
  }, [vouchers]);

  const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <div className="h-7 w-48 bg-canvas-faint rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-canvas-faint rounded-xl animate-pulse" />)}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-3">
          <button onClick={() => navigate('/reports/gst-liability')} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-ink-muted" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-ink-default">{month}</h1>
            <p className="text-sm text-ink-muted">LIVE TALLY · {vouchers ? vouchers.length : 0} invoices</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <p className="text-xs text-ink-muted mb-1">Total Taxable Value</p>
            <p className="text-lg font-bold text-ink-default">{formatCurrency(summary.totalTaxable)}</p>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <p className="text-xs text-ink-muted mb-1">Total Tax (CGST+SGST+IGST)</p>
            <p className="text-lg font-bold text-amber-700">{formatCurrency(summary.totalTax)}</p>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <p className="text-xs text-ink-muted mb-1">Total Invoice Value</p>
            <p className="text-lg font-bold text-teal-700">{formatCurrency(summary.totalValue)}</p>
          </motion.div>
        </div>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle text-ink-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Invoice No</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Party</th>
                  <th className="px-4 py-3 text-left font-medium">GSTIN</th>
                  <th className="px-4 py-3 text-right font-medium">Taxable</th>
                  <th className="px-4 py-3 text-right font-medium">CGST</th>
                  <th className="px-4 py-3 text-right font-medium">SGST</th>
                  <th className="px-4 py-3 text-right font-medium">IGST</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {(paginatedVouchers).map((v, idx) => (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    className="hover:bg-canvas-subtle cursor-pointer"
                    onClick={() => navigate(`/tally-voucher/Sales/${encodeURIComponent(v.invoiceNo)}`)}
                  >
                    <td className="px-4 py-3 font-medium text-ink-default">{v.invoiceNo}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(v.date)}</td>
                    <td className="px-4 py-3 text-ink-default">{v.partyName}</td>
                    <td className="px-4 py-3 text-ink-muted font-mono text-xs">{v.gstin || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(v.taxableAmount)}</td>
                    <td className="px-4 py-3 text-right text-ink-default">{formatCurrency(v.cgst)}</td>
                    <td className="px-4 py-3 text-right text-ink-default">{formatCurrency(v.sgst)}</td>
                    <td className="px-4 py-3 text-right text-ink-default">{formatCurrency(v.igst)}</td>
                    <td className="px-4 py-3 text-right font-medium text-teal-700">{formatCurrency(v.totalInvoiceValue)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!vouchers || vouchers.length === 0) && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted">No invoices found for {month}</p>
            </div>
          )}
        </motion.div>

        {allVouchers.length > pageSize && (
          <VoucherPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={allVouchers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}

        <div className="text-sm text-ink-muted text-right">
          {vouchers ? vouchers.length : 0} invoices · Total Value {formatCurrency(summary.totalValue)}
        </div>
      </div>
    </motion.div>
  );
};

export default GstMonthDetail;