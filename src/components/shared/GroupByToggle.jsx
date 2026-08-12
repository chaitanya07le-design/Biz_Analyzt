import React from 'react';

const GroupByToggle = ({ view, onViewChange }) => {
  return (
    <div className="inline-flex rounded-lg border border-canvas-faint bg-canvas-subtle p-1">
      <button
        onClick={() => onViewChange('ledger')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          view === 'ledger'
            ? 'bg-white text-ink-default shadow-sm'
            : 'text-ink-muted hover:text-ink-default'
        }`}
      >
        Ledger
      </button>
      <button
        onClick={() => onViewChange('bills')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          view === 'bills'
            ? 'bg-white text-ink-default shadow-sm'
            : 'text-ink-muted hover:text-ink-default'
        }`}
      >
        Bills
      </button>
    </div>
  );
};

export default GroupByToggle;
