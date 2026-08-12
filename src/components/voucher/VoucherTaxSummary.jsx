import React from 'react';

const VoucherTaxSummary = ({ taxSummary, grossTotal, roundOff, netAmount }) => {
  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  const taxEntries = Object.entries(taxSummary).filter(([key]) => key !== 'roundOff');

  return (
    <div className="bg-canvas-subtle rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-ink-muted">Gross Total</span>
        <span className="text-sm font-medium text-ink-default">{formatCurrency(grossTotal)}</span>
      </div>

      {taxEntries.map(([type, amount]) => (
        <div key={type} className="flex justify-between items-center">
          <span className="text-sm text-ink-muted capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
          <span className="text-sm text-ink-default">{formatCurrency(amount)}</span>
        </div>
      ))}

      {roundOff !== 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-ink-muted">Round Off</span>
          <span className={`text-sm ${roundOff > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {roundOff > 0 ? '+' : ''}{formatCurrency(Math.abs(roundOff))}
          </span>
        </div>
      )}

      <div className="border-t border-canvas-faint pt-3 flex justify-between items-center">
        <span className="text-sm font-medium text-ink-default">Net Amount</span>
        <span className="text-lg font-semibold text-ink-default">{formatCurrency(netAmount)}</span>
      </div>
    </div>
  );
};

export default VoucherTaxSummary;
