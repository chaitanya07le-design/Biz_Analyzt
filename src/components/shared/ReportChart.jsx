import React from 'react';

const ReportChart = ({ data, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-ink-faint">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
  const barWidth = 100 / data.length;

  return (
    <div style={{ height }}>
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-end gap-1 px-2">
          {data.map((item, idx) => {
            const barHeight = maxValue > 0 ? (Math.abs(item.value) / maxValue) * 100 : 0;
            const isNegative = item.value < 0;
            
            return (
              <div
                key={idx}
                className="flex flex-col items-center flex-1"
                style={{ width: `${barWidth}%` }}
              >
                <div
                  className={`w-full rounded-t transition-all duration-200 ${
                    isNegative ? 'bg-red-500' : 'bg-brand-primary'
                  }`}
                  style={{ height: `${barHeight}%`, minHeight: item.value !== 0 ? '4px' : '0' }}
                  title={`${item.label}: ₹${Math.abs(item.value).toLocaleString('en-IN')}`}
                />
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-1 px-2 mt-2 border-t border-canvas-faint pt-2">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 text-center"
              style={{ width: `${barWidth}%` }}
            >
              <p className="text-xs text-ink-faint truncate">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportChart;
