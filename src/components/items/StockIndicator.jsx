import React, { useState } from 'react';
import { motion } from 'framer-motion';

const StockIndicator = ({ 
  currentStock, 
  reorderLevel = 10, 
  maxStock = 100,
  showLabel = true,
  showIcon = true,
  size = 'md'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isNegative = currentStock < 0;
  const absStock = Math.abs(currentStock);
  const percentage = isNegative ? 0 : Math.min((absStock / maxStock) * 100, 100);
  
  const getStatus = () => {
    if (isNegative) return 'negative';
    if (absStock < reorderLevel) return 'critical';
    if (absStock < reorderLevel * 1.5) return 'low';
    return 'healthy';
  };

  const status = getStatus();

  const colors = {
    negative: {
      bg: 'bg-red-100',
      bar: 'bg-red-500',
      text: 'text-red-600',
      icon: '⚠️'
    },
    critical: {
      bg: 'bg-amber-100',
      bar: 'bg-amber-500',
      text: 'text-amber-600',
      icon: '⚡'
    },
    low: {
      bg: 'bg-yellow-100',
      bar: 'bg-yellow-500',
      text: 'text-yellow-600',
      icon: '📉'
    },
    healthy: {
      bg: 'bg-green-100',
      bar: 'bg-green-500',
      text: 'text-green-600',
      icon: '✓'
    }
  };

  const sizeClasses = {
    sm: { height: 'h-1.5', text: 'text-xs', icon: 'text-xs' },
    md: { height: 'h-2', text: 'text-sm', icon: 'text-sm' },
    lg: { height: 'h-3', text: 'text-base', icon: 'text-base' }
  };

  const currentColor = colors[status];
  const currentSize = sizeClasses[size];

  const labels = {
    negative: 'Negative Stock',
    critical: 'Critical Low',
    low: 'Low Stock',
    healthy: 'In Stock'
  };

  return (
    <div 
      className="relative inline-flex items-center gap-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showIcon && (
        <motion.span 
          initial={{ scale: 1 }}
          animate={{ scale: status === 'critical' ? [1, 1.1, 1] : 1 }}
          transition={{ 
            duration: 1, 
            repeat: status === 'critical' ? Infinity : 0 
          }}
          className={`${currentColor.text} ${currentSize.icon}`}
        >
          {currentColor.icon}
        </motion.span>
      )}
      
      <div className={`flex-1 min-w-[60px] ${currentSize.height} ${currentColor.bg} rounded-full overflow-hidden relative`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`${currentSize.height} ${currentColor.bar} rounded-full`}
        />
        
        {isNegative && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600"
          />
        )}
      </div>

      {showLabel && (
        <span className={`${currentSize.text} ${currentColor.text} font-medium`}>
          {currentStock} {status !== 'healthy' && `(${labels[status]})`}
        </span>
      )}

      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 text-white text-xs rounded-lg p-2 shadow-lg z-50"
        >
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-300">Current Stock:</span>
              <span className="font-medium">{currentStock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Reorder Level:</span>
              <span className="font-medium">{reorderLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Status:</span>
              <span className={`font-medium ${currentColor.text.replace('text-', 'text-')}`}>
                {labels[status]}
              </span>
            </div>
            {isNegative && (
              <p className="pt-1 border-t border-slate-600 text-red-300">
                ⚠️ Negative stock! Review entries.
              </p>
            )}
          </div>
          <div className="absolute top-full left-4 border-8 border-transparent border-t-slate-800" />
        </motion.div>
      )}
    </div>
  );
};

export default StockIndicator;
