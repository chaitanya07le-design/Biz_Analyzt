import React from 'react';
import { motion } from 'framer-motion';

const ItemCard = ({ item, index, onClick }) => {
  const isNegative = item.closingQty < 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`bg-white rounded-lg border p-4 cursor-pointer transition-shadow hover:shadow-md ${
        isNegative ? 'bg-red-50 border-red-200' : 'border-canvas-faint'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-ink-default">{item.name}</h3>
            {isNegative && (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-red-500"
                title="Negative Stock"
              >
                ⚠️
              </motion.span>
            )}
            {item.isLowStock && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 uppercase tracking-wider">
                Low Stock
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-canvas-subtle rounded text-ink-muted">
              {item.category}
            </span>
            <span className="text-xs text-ink-faint font-mono">
              HSN: {item.hsnSac}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-faint">Stock Level</span>
          <span className={`text-sm font-medium font-mono ${isNegative ? 'text-red-600' : 'text-ink-default'}`}>
            {item.closingQty} {item.unit}
          </span>
        </div>
        
        <div className={`h-2 ${isNegative ? 'bg-red-100' : 'bg-canvas-subtle'} rounded-full overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: isNegative ? '100%' : `${Math.min((item.closingQty / 100) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-2 ${isNegative ? 'bg-red-500' : 'bg-brand-primary'} rounded-full`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-canvas-faint">
          <div>
            <p className="text-xs text-ink-faint">Stock Value</p>
            <p className={`text-sm font-medium font-mono ${item.closingValue < 0 ? 'text-red-600' : 'text-ink-default'}`}>
              ₹{Math.abs(item.closingValue).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-faint">Sale Rate</p>
            <p className="text-sm font-medium font-mono text-ink-default">
              ₹{item.saleRate.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
