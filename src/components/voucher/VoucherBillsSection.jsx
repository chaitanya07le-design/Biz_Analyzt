import React from 'react';

const VoucherBillsSection = ({ bills }) => {
  if (!bills || bills.length === 0) return null;

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  return (
    <div className="bg-white border border-canvas-faint rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-canvas-subtle border-b border-canvas-faint">
        <p className="text-xs text-ink-faint uppercase tracking-wider font-medium">Linked Bills</p>
      </div>

      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-ink-muted">Bill No.</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-ink-muted">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-faint">
            {bills.map((bill, idx) => (
              <tr key={idx} className="hover:bg-canvas-subtle">
                <td className="px-4 py-3 text-sm text-ink-default font-mono">{bill.voucherNo || '—'}</td>
                <td className="px-4 py-3 text-sm text-ink-default text-right font-medium">{formatCurrency(bill.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-canvas-faint">
        {bills.map((bill, idx) => (
          <div key={idx} className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-ink-default font-mono">{bill.voucherNo || '—'}</p>
            </div>
            <p className="text-sm font-medium text-ink-default">{formatCurrency(bill.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherBillsSection;
