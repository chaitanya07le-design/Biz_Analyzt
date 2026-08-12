import React from 'react';

const VoucherTerms = ({ terms }) => {
  if (!terms || terms.length === 0) return null;

  return (
    <div className="bg-white border border-canvas-faint rounded-lg p-4">
      <p className="text-xs text-ink-faint mb-2 uppercase tracking-wider font-medium">Terms & Conditions</p>
      <ul className="space-y-1">
        {terms.map((term, idx) => (
          <li key={idx} className="text-sm text-ink-default flex items-start">
            <span className="text-ink-muted mr-2">•</span>
            {term}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VoucherTerms;
