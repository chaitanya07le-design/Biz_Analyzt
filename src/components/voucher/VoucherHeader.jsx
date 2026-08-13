import React from 'react';
import StatusPill from '../ui/StatusPill';

const VoucherHeader = ({ voucher, onBack }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'UNPAID': 'amber',
      'PARTIALLY_PAID': 'blue',
      'PAID': 'green',
      'OPEN': 'blue',
      'PARTIALLY_FULFILLED': 'amber',
      'DELIVERED': 'green',
      'RECEIVED': 'green',
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="bg-white border-b border-canvas-faint">
      <div className="px-4 py-4 md:px-6">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-canvas-subtle rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg md:text-xl font-semibold text-ink-default">
                {voucher.type}
              </h1>
              <span className="text-ink-muted font-mono">
                {voucher.voucherNo || '—'}
              </span>
            </div>
          </div>
          {voucher.status && (
            <StatusPill status={voucher.status} color={getStatusColor(voucher.status)} />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-ink-faint">Date</p>
            <p className="text-sm text-ink-default font-medium">{formatDate(voucher.date)}</p>
          </div>
          {voucher.dueDate && (
            <div>
              <p className="text-xs text-ink-faint">Due Date</p>
              <p className="text-sm text-ink-default font-medium">{formatDate(voucher.dueDate)}</p>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-xs text-ink-faint">Party</p>
            <p className="text-sm text-ink-default font-medium">{voucher.partyName || '—'}</p>
          </div>
        </div>

        {voucher.eInvoiceStatus === 'generated' && voucher.eInvoiceIrn && (
          <div className="mt-4 pt-4 border-t border-canvas-faint">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-ink-muted">e-Invoice IRN:</span>
              <span className="text-xs text-ink-default font-mono">{voucher.eInvoiceIrn}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherHeader;
