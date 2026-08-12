import React from 'react';

const KpiCard = ({ title, value, trend, trendDirection, icon, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    teal: 'bg-teal-50 text-teal-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-ink-muted',
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-canvas-faint p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-ink-muted text-sm font-medium">{title}</p>
          <p className="text-2xl font-semibold text-ink-default mt-1">
            {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
          </p>
          {trend && (
            <p className={`text-sm mt-2 ${trendColors[trendDirection] || trendColors.neutral}`}>
              {trendDirection === 'up' && '↑ '}
              {trendDirection === 'down' && '↓ '}
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
