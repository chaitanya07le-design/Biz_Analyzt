import React from 'react';
import StockIndicator from './StockIndicator';

const ItemRow = ({ item, index, onClick }) => {
  const isNegative = item.closingQty < 0;
  
  return (
    <motion.tr 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={onClick}
      className={`hover:bg-canvas-subtle cursor-pointer ${
        isNegative ? 'bg-red-50' : ''
      }`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-default font-medium">{item.name}</span>
          {isNegative && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-red-500 text-sm"
            >
              ⚠️
            </motion.span>
          )}
        </div>
        <p className="text-xs text-ink-faint">{item.category}</p>
      </td>
      <td className="px-4 py-3 text-xs text-ink-muted font-mono">{item.hsnSac}</td>
      <td className="px-4 py-3 text-sm text-ink-muted">{item.unit}</td>
      <td className="px-4 py-3">
        <StockIndicator 
          currentStock={item.closingQty} 
          reorderLevel={10}
          showLabel={true}
          showIcon={true}
          size="sm"
        />
      </td>
      <td className={`px-4 py-3 text-sm text-right font-mono ${
        item.closingValue < 0 ? 'text-red-600 font-medium' : 'text-ink-default'
      }`}>
        ₹{Math.abs(item.closingValue).toLocaleString('en-IN')}
      </td>
      <td className="px-4 py-3 text-sm text-right font-mono text-ink-default">
        ₹{item.saleRate.toLocaleString('en-IN')}
      </td>
    </motion.tr>
  );
};

export default ItemRow;
