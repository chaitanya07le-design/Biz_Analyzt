import React from 'react';

const VoucherJournalEntries = ({ entries }) => {
  if (!entries || entries.length === 0) return null;

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);

  return (
    <div className="bg-white border border-canvas-faint rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-canvas-subtle border-b border-canvas-faint">
        <p className="text-xs text-ink-faint uppercase tracking-wider font-medium">Journal Entries</p>
      </div>

      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-ink-muted">Ledger</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-ink-muted">Debit</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-ink-muted">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-faint">
            {entries.map((entry, idx) => (
              <tr key={idx} className="hover:bg-canvas-subtle">
                <td className="px-4 py-3 text-sm text-ink-default">{entry.ledgerName}</td>
                <td className="px-4 py-3 text-sm text-ink-default text-right font-mono">
                  {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-ink-default text-right font-mono">
                  {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-canvas-subtle">
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-ink-default">Total</td>
              <td className="px-4 py-3 text-sm text-ink-default text-right font-medium font-mono">
                {formatCurrency(totalDebit)}
              </td>
              <td className="px-4 py-3 text-sm text-ink-default text-right font-medium font-mono">
                {formatCurrency(totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="md:hidden divide-y divide-canvas-faint">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-4">
            <p className="text-sm font-medium text-ink-default mb-2">{entry.ledgerName}</p>
            <div className="flex justify-between text-xs text-ink-muted">
              <span>Debit: {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}</span>
              <span>Credit: {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}</span>
            </div>
          </div>
        ))}
        <div className="p-4 bg-canvas-subtle space-y-1">
          <div className="flex justify-between text-sm font-medium text-ink-default">
            <span>Total Debit</span>
            <span>{formatCurrency(totalDebit)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-ink-default">
            <span>Total Credit</span>
            <span>{formatCurrency(totalCredit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherJournalEntries;
