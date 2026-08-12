import React from 'react';
import DateRangePicker from '../shared/DateRangePicker';

const OutstandingHeader = ({ activeTab, onTabChange, onDateChange, startDate, endDate }) => {
  return (
    <div className="bg-white border-b border-canvas-faint px-4 py-3 md:px-6 md:py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Outstanding</h1>
        <DateRangePicker 
          startDate={startDate}
          endDate={endDate}
          onChange={onDateChange}
        />
      </div>
      
      <div className="flex gap-2 bg-canvas-subtle p-1 rounded-lg">
        <button
          onClick={() => onTabChange('receivable')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'receivable'
              ? 'bg-white text-ink-default shadow-sm'
              : 'text-ink-muted hover:text-ink-default'
          }`}
        >
          Receivables
        </button>
        <button
          onClick={() => onTabChange('payable')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'payable'
              ? 'bg-white text-ink-default shadow-sm'
              : 'text-ink-muted hover:text-ink-default'
          }`}
        >
          Payables
        </button>
      </div>
    </div>
  );
};

export default OutstandingHeader;
