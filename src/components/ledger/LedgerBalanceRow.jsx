import React from 'react';

const LedgerBalanceRow = ({ label, amount, type = 'opening', isNegative = false }) => {
  const absAmount = Math.abs(amount);
  const formattedAmount = `₹${absAmount.toLocaleString('en-IN')}`;
  
  let colorClass = 'text-ink-default';
  if (type === 'closing') {
    colorClass = amount > 0 ? 'text-red-600' : amount < 0 ? 'text-green-600' : 'text-ink-muted';
  }
  
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-canvas-subtle">
      <span className="text-sm font-medium text-ink-muted">{label}</span>
      <div className="flex items-center gap-2">
        {isNegative && (
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        <span className={`text-sm font-medium font-mono ${colorClass}`}>
          {formattedAmount}
          {amount !== 0 && (
            <span className="text-xs ml-1">
              {amount > 0 ? 'Dr' : 'Cr'}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default LedgerBalanceRow;
