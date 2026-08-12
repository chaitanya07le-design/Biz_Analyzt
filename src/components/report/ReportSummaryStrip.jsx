import React from 'react';

const ReportSummaryStrip = ({ items }) => {
  return (
    <div className="bg-canvas-subtle border-b border-canvas-faint">
      <div className="px-4 py-3 md:px-6">
        <div className="flex gap-6 overflow-x-auto">
          {items.map((item, idx) => (
            <div key={idx} className="flex-shrink-0">
              <p className="text-xs text-ink-faint uppercase tracking-wider">{item.label}</p>
              <p className={`text-sm font-semibold mt-0.5 ${item.color || 'text-ink-default'}`}>
                {item.isCurrency ? `₹${item.value.toLocaleString('en-IN')}` : item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportSummaryStrip;
