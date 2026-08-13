import React from 'react';

const KpiCard = ({ title, value, trend, trendDirection, icon, color = 'indigo', onClick, subtitle }) => {
  const colorConfig = {
    indigo: {
      border: 'border-l-indigo-DEFAULT',
      gradient: 'from-indigo-light/30',
      orb: 'bg-indigo-DEFAULT/10',
      iconBg: 'from-indigo-light to-indigo-DEFAULT/20',
      iconText: 'text-indigo-DEFAULT',
    },
    teal: {
      border: 'border-l-teal-DEFAULT',
      gradient: 'from-teal-light/30',
      orb: 'bg-teal-DEFAULT/10',
      iconBg: 'from-teal-light to-teal-DEFAULT/20',
      iconText: 'text-teal-DEFAULT',
    },
    rose: {
      border: 'border-l-rose-DEFAULT',
      gradient: 'from-rose-light/30',
      orb: 'bg-rose-DEFAULT/10',
      iconBg: 'from-rose-light to-rose-DEFAULT/20',
      iconText: 'text-rose-DEFAULT',
    },
    amber: {
      border: 'border-l-amber-DEFAULT',
      gradient: 'from-amber-light/30',
      orb: 'bg-amber-DEFAULT/10',
      iconBg: 'from-amber-light to-amber-DEFAULT/20',
      iconText: 'text-amber-DEFAULT',
    },
    blue: {
      border: 'border-l-indigo-DEFAULT',
      gradient: 'from-indigo-light/30',
      orb: 'bg-indigo-DEFAULT/10',
      iconBg: 'from-indigo-light to-indigo-DEFAULT/20',
      iconText: 'text-indigo-DEFAULT',
    },
    green: {
      border: 'border-l-teal-DEFAULT',
      gradient: 'from-teal-light/30',
      orb: 'bg-teal-DEFAULT/10',
      iconBg: 'from-teal-light to-teal-DEFAULT/20',
      iconText: 'text-teal-DEFAULT',
    },
    red: {
      border: 'border-l-rose-DEFAULT',
      gradient: 'from-rose-light/30',
      orb: 'bg-rose-DEFAULT/10',
      iconBg: 'from-rose-light to-rose-DEFAULT/20',
      iconText: 'text-rose-DEFAULT',
    },
    purple: {
      border: 'border-l-indigo-DEFAULT',
      gradient: 'from-indigo-light/30',
      orb: 'bg-indigo-DEFAULT/10',
      iconBg: 'from-indigo-light to-indigo-DEFAULT/20',
      iconText: 'text-indigo-DEFAULT',
    },
  };

  const config = colorConfig[color] || colorConfig.indigo;

  const trendColors = {
    up: 'text-teal-DEFAULT',
    down: 'text-rose-DEFAULT',
    neutral: 'text-ink-muted',
  };

  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} to-white border border-border border-l-4 ${config.border} rounded-xl shadow-sm p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className={`absolute -top-8 -right-8 w-24 h-24 ${config.orb} rounded-full blur-2xl pointer-events-none`} />
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-ink-muted text-sm font-medium">{title}</p>
          <p className="text-2xl font-semibold text-ink-DEFAULT mt-1">
            {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
          </p>
          {subtitle && (
            <p className="text-xs text-ink-faint mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm mt-2 ${trendColors[trendDirection] || trendColors.neutral}`}>
              {trendDirection === 'up' && '↑ '}
              {trendDirection === 'down' && '↓ '}
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${config.iconBg} rounded-lg flex items-center justify-center`}>
            <div className={config.iconText}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
