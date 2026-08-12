import React from 'react';
import DateRangePicker from '../shared/DateRangePicker';

const ReportPageHeader = ({ title, startDate, endDate, onDateChange }) => {
  return (
    <div className="bg-white border-b border-canvas-faint">
      <div className="px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">{title}</h1>
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
