import React from 'react';
import DateRangePicker from '../shared/DateRangePicker';

const ReportPageHeader = ({ title, startDate, endDate, onDateChange }) => {
  return (
    <div className="bg-white border-b border-canvas-faint">
      <div className="px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors -ml-2">
              <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-ink-default">{title}</h1>
          </div>
          <DateRangePicker 
            startDate={startDate}
            endDate={endDate}
            onDateChange={onDateChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportPageHeader;
