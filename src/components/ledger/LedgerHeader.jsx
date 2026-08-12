import React from 'react';

const LedgerHeader = ({ party, onBack }) => {
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
            <h1 className="text-lg md:text-xl font-semibold text-ink-default">{party.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-ink-faint">City</p>
            <p className="text-sm text-ink-default font-medium">{party.city}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">Type</p>
            <p className="text-sm text-ink-default font-medium">{party.type}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">GSTIN</p>
            <p className="text-sm text-ink-muted font-mono">{party.gstin || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">Credit Limit</p>
            <p className="text-sm text-ink-default font-medium">
              {party.creditLimit ? `₹${party.creditLimit.toLocaleString('en-IN')}` : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerHeader;
