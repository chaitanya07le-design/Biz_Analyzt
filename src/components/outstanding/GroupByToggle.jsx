import React, { useState, useEffect } from 'react';

const GroupByToggle = ({ view, onViewChange }) => {
  const [savedView, setSavedView] = useState(view);

  useEffect(() => {
    const stored = localStorage.getItem('outstandingViewMode');
    if (stored) {
      setSavedView(stored);
      onViewChange(stored);
    }
  }, []);

  const handleViewChange = (newView) => {
    setSavedView(newView);
    localStorage.setItem('outstandingViewMode', newView);
    onViewChange(newView);
  };

  return (
    <div className="flex gap-1 bg-canvas-subtle p-1 rounded-lg">
      <button
        onClick={() => handleViewChange('party')}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          savedView === 'party'
            ? 'bg-white text-ink-default shadow-sm'
            : 'text-ink-muted hover:text-ink-default'
        }`}
      >
        Party View
      </button>
      <button
        onClick={() => handleViewChange('group')}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          savedView === 'group'
            ? 'bg-white text-ink-default shadow-sm'
            : 'text-ink-muted hover:text-ink-default'
        }`}
      >
        Group View
      </button>
    </div>
  );
};

export default GroupByToggle;
