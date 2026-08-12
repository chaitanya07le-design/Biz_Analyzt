import React from 'react';

const OutstandingStatRow = ({ stats }) => {
  const buckets = [
    { key: 'notDue', label: 'Not Due', color: 'bg-gray-400' },
    { key: 'overdue0to30', label: '0-30', color: 'bg-amber-500' },
    { key: 'overdue31to60', label: '31-60', color: 'bg-orange-500' },
    { key: 'overdue61to90', label: '61-90', color: 'bg-red-500' },
    { key: 'over90', label: '>90', color: 'bg-red-700' },
  ];

  const total = buckets.reduce((sum, b) => sum + stats[b.key], 0);

  return (
    <div className="bg-white border border-canvas-faint rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-ink-muted">Aging Analysis</p>
        <p className="text-sm font-semibold text-ink-default font-mono">
          ₹{total.toLocaleString('en-IN')}
        </p>
      </div>
      
      <div className="flex gap-1 h-8 mb-3 rounded overflow-hidden">
        {buckets.map(bucket => {
          const percentage = total > 0 ? (stats[bucket.key] / total) * 100 : 0;
          return (
            <div
              key={bucket.key}
              className={`${bucket.color} transition-all`}
              style={{ width: `${Math.max(percentage, 2)}%` }}
              title={`${bucket.label}: ₹${stats[bucket.key].toLocaleString('en-IN')}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-5 gap-2 text-xs">
        {buckets.map(bucket => (
          <div key={bucket.key} className="text-center">
            <div className={`w-2 h-2 rounded-full ${bucket.color} mx-auto mb-1`} />
            <p className="text-ink-faint">{bucket.label}</p>
            <p className="font-medium text-ink-default font-mono">
              ₹{stats[bucket.key].toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutstandingStatRow;
