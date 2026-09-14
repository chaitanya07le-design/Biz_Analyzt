import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Calendar, User, FileText, Mail } from 'lucide-react';

const PendingOrderDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order || null;

  const currency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">Order not found</p>
          <button onClick={() => navigate('/reports/pending-sales')} className="text-brand-primary hover:underline">Back to Pending Sales</button>
        </div>
      </div>
    );
  }

  const dispatchPercent = order.orderedQty > 0 ? Math.round((order.dispatchedQty / order.orderedQty) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-3">
          <button onClick={() => navigate('/reports/pending-sales')} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors">
            <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Order #{order.number}</h1>
            <p className="text-sm text-ink-muted">{order.party}</p>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><FileText className="w-4 h-4 text-indigo-600" /><span className="text-xs text-ink-muted">Order Value</span></div>
            <div className="text-lg font-bold text-ink-default">{currency(order.amount)}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-teal-600" /><span className="text-xs text-ink-muted">Ordered Qty</span></div>
            <div className="text-lg font-bold text-ink-default">{order.orderedQty || 0}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-amber-600" /><span className="text-xs text-ink-muted">Dispatched Qty</span></div>
            <div className="text-lg font-bold text-ink-default">{order.dispatchedQty || 0}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-rose-600" /><span className="text-xs text-ink-muted">Pending Qty</span></div>
            <div className="text-lg font-bold text-rose-700">{order.pendingQty || 0}</div>
          </motion.div>
        </div>

        {/* Dispatch progress */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="bg-white rounded-lg border border-canvas-faint p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-ink-default">Dispatch Progress</span>
            <span className="text-sm text-ink-muted">{dispatchPercent}%</span>
          </div>
          <div className="w-full bg-canvas-faint rounded-full h-2.5">
            <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${dispatchPercent}%` }} />
          </div>
        </motion.div>

        {/* Items */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
          <div className="px-4 py-3 border-b border-canvas-faint">
            <h3 className="font-medium text-ink-default">Items</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-canvas-subtle text-ink-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Item</th>
                <th className="px-4 py-3 text-right font-medium">Ordered</th>
                <th className="px-4 py-3 text-right font-medium">Dispatched</th>
                <th className="px-4 py-3 text-right font-medium">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-canvas-faint">
              <tr>
                <td className="px-4 py-3 font-medium text-ink-default">{order.items || '—'}</td>
                <td className="px-4 py-3 text-right text-ink-default">{order.orderedQty || 0}</td>
                <td className="px-4 py-3 text-right text-ink-default">{order.dispatchedQty || 0}</td>
                <td className="px-4 py-3 text-right font-medium text-rose-600">{order.pendingQty || 0}</td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        {/* Order Info */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="bg-white rounded-lg border border-canvas-faint p-4">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Order Information</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-ink-muted flex items-center gap-1"><User className="w-3.5 h-3.5" /> Party</p>
              <p className="text-sm font-medium text-ink-default">{order.party || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Order Date</p>
              <p className="text-sm font-medium text-ink-default">{formatDate(order.date)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Due Date</p>
              <p className="text-sm font-medium text-ink-default">{formatDate(order.dueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Voucher Type</p>
              <p className="text-sm font-medium text-ink-default">{order.voucherType || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</p>
              <p className="text-sm font-medium text-ink-default">{order.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Status</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                order.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                order.status === 'Dispatched' ? 'bg-teal-50 text-teal-700' :
                'bg-blue-50 text-blue-700'
              }`}>{order.status}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PendingOrderDetail;