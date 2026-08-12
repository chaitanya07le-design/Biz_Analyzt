import React from 'react';

const VoucherItemsTable = ({ items, showTax = true }) => {
  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  return (
    <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-canvas-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">HSN/SAC</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">Rate</th>
              {showTax && (
                <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">Tax</th>
              )}
              <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-faint">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-canvas-subtle">
                <td className="px-4 py-3 text-sm text-ink-default">{item.name}</td>
                <td className="px-4 py-3 text-sm text-ink-muted font-mono">{item.hsnSac}</td>
                <td className="px-4 py-3 text-sm text-ink-default text-right">{item.qty} {item.unit}</td>
                <td className="px-4 py-3 text-sm text-ink-default text-right">{formatCurrency(item.rate)}</td>
                {showTax && (
                  <td className="px-4 py-3 text-sm text-ink-muted text-right">
                    {item.tax.map((t, i) => (
                      <div key={i} className="text-xs">
                        {t.type} {t.percent}%: {formatCurrency(t.amount)}
                      </div>
                    ))}
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-ink-default text-right font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-canvas-faint">
        {items.map((item, idx) => (
          <div key={idx} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-ink-default">{item.name}</p>
                <p className="text-xs text-ink-faint font-mono">{item.hsnSac}</p>
              </div>
              <p className="text-sm font-semibold text-ink-default">{formatCurrency(item.amount)}</p>
            </div>
            <div className="flex justify-between text-xs text-ink-muted">
              <span>{item.qty} {item.unit} × {formatCurrency(item.rate)}</span>
            </div>
            {showTax && item.tax && item.tax.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.tax.map((t, i) => (
                  <span key={i} className="text-xs text-ink-muted">
                    {t.type} {t.percent}%: {formatCurrency(t.amount)}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherItemsTable;
