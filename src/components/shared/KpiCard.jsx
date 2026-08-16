import React from 'react';

const KpiCard = ({ title, value, trend, trendDirection, icon, color = 'kinetic-primary', onClick, subtitle }) => {
  const colorConfig = {
    'indigo': {
      border: 'border-t-kinetic-primary',
      gradient: 'from-surface to-slate-50',
      orb: 'bg-kinetic-primary/5',
      iconBg: 'bg-kinetic-primary/10',
      iconText: 'text-kinetic-primary',
    },
    'teal': {
      border: 'border-t-kinetic-secondary',
      gradient: 'from-surface to-slate-50',
      orb: 'bg-kinetic-secondary/5',
      iconBg: 'bg-kinetic-secondary/10',
      iconText: 'text-kinetic-secondary',
    },
    'rose': {
      border: 'border-t-kinetic-tertiary',
      gradient: 'from-surface to-slate-50',
      orb: 'bg-kinetic-tertiary/5',
      iconBg: 'bg-kinetic-tertiary/10',
      iconText: 'text-kinetic-tertiary',
    },
    'amber': {
      border: 'border-t-kinetic-tertiary',
      gradient: 'from-surface to-slate-50',
      orb: 'bg-kinetic-tertiary/5',
      iconBg: 'bg-kinetic-tertiary/10',
      iconText: 'text-kinetic-tertiary',
    },
    'kinetic-primary': {
      border: 'border-t-kinetic-primary',
      gradient: 'from-surface to-slate-50',
      orb: 'bg-kinetic-primary/5',
      iconBg: 'bg-kinetic-primary/10',
      iconText: 'text-kinetic-primary',
    },
    'kinetic-secondary': {
      border: 'border-t-kinetic-secondary',
      gradient: 'from-surface to-slate-50',
      orb: 'bg-kinetic-secondary/5',
      iconBg: 'bg-kinetic-secondary/10',
      iconText: 'text-kinetic-secondary',
    }
  };

  const config = colorConfig[color] || colorConfig['kinetic-primary'];

  const trendColors = {
    up: 'text-kinetic-secondary',
    down: 'text-kinetic-tertiary',
    neutral: 'text-kinetic-neutral',
  };

  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} border border-border border-t-4 ${config.border} rounded-xl shadow-card p-5 ${onClick ? 'cursor-pointer hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1' : ''}`}
      onClick={onClick}
    >
      <div className={`absolute -bottom-8 -right-8 w-32 h-32 ${config.orb} rounded-full blur-2xl pointer-events-none`} />
      
      <div className="flex flex-col relative z-10 h-full justify-between">
        <div className="flex items-start justify-between">
          <p className="font-display font-bold text-xs uppercase tracking-wider text-kinetic-neutral mb-2">{title}</p>
          {icon && (
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.iconBg}`}>
              <div className={config.iconText}>
                {icon}
              </div>
            </div>
          )}
        </div>
        
        <div>
          <p className="font-sans text-3xl font-extrabold text-ink-DEFAULT tracking-tight">
            {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            {subtitle && (
              <p className="font-sans text-xs text-kinetic-neutral font-medium">{subtitle}</p>
            )}
            
            {trend && (
              <p className={`font-sans font-semibold text-xs flex items-center gap-1 ${trendColors[trendDirection] || trendColors.neutral}`}>
                {trendDirection === 'up' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                )}
                {trendDirection === 'down' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                )}
                {trend}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
