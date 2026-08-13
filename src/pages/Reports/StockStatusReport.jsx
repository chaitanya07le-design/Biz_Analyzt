import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, TrendingUp, Star, ArrowDown, ArrowUp } from 'lucide-react';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';

const StockStatusReport = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { items, itemStockStatus, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const [filter, setFilter] = useState('all');

  const statusData = useMemo(() => {
    if (!itemStockStatus || !items) return [];

    const itemMap = new Map(items.map(i => [i.ItemID, i]));

    return itemStockStatus.map(status => {
      const item = itemMap.get(status.ItemID) || {};

      return {
        itemId: status.ItemID,
        itemName: status.ItemName || item.ItemName || status.ItemID,
        brand: item.Brand || 'Generic',
        category: item.CategoryID || '-',
        currentStock: parseInt(status.CurrentStock || 0),
        stockValue: parseFloat(status.StockValue || 0),
        salesVelocity: parseFloat(status.SalesVelocity30d || 0),
        isUnderstock: status.IsUnderstock === 'TRUE',
        isOverstock: status.IsOverstock === 'TRUE',
        isPopular: status.IsPopular === 'TRUE',
        daysOfStock: parseInt(status.DaysOfStock || 0),
        reorderLevel: parseInt(status.ReorderLevel || 0),
        lastSale: status.LastSaleDate || '-',
        lastPurchase: status.LastPurchaseDate || '-',
      };
    });
  }, [itemStockStatus, items]);

  const filteredData = useMemo(() => {
    let result = statusData;

    switch (filter) {
      case 'understock':
        result = result.filter(d => d.isUnderstock);
        break;
      case 'overstock':
        result = result.filter(d => d.isOverstock);
        break;
      case 'fast':
        result = result.filter(d => d.isPopular);
        break;
    }

    return result.sort((a, b) => b.salesVelocity - a.salesVelocity);
  }, [statusData, filter]);

  const summaryStats = useMemo(() => {
    const total = statusData.length;
    const understock = statusData.filter(d => d.isUnderstock).length;
    const overstock = statusData.filter(d => d.isOverstock).length;
    const fastMovers = statusData.filter(d => d.isPopular).length;
    const totalStockValue = statusData.reduce((sum, d) => sum + d.stockValue, 0);
    const totalUnits = statusData.reduce((sum, d) => sum + d.currentStock, 0);

    return { total, understock, overstock, fastMovers, totalStockValue, totalUnits };
  }, [statusData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <motion.div className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <Skeleton variant="text" className="w-48 h-7" />
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rounded" className="h-24" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-canvas-default pb-20 md:pb-6"
    >
      <div className="px-4 py-4 md:px-6 md:py-6">
        <motion.div className="mb-6" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Stock Status Report</h1>
          <p className="text-sm text-ink-muted mt-1">Overstock, Understock, and Fast-Mover analysis</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-ink-muted">Total Items</span>
            </div>
            <div className="text-lg font-bold text-ink-default">{summaryStats.total}</div>
            <div className="text-xs text-ink-muted">{summaryStats.totalUnits} units</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl p-4 border border-red-200 bg-red-50 cursor-pointer hover:bg-red-100"
            onClick={() => setFilter(filter === 'understock' ? 'all' : 'understock')}
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className="w-4 h-4 text-red-600" />
              <span className="text-xs text-ink-muted">Understock</span>
            </div>
            <div className="text-lg font-bold text-red-700">{summaryStats.understock}</div>
            <div className="text-xs text-red-600">Need reorder</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-yellow-200 bg-yellow-50 cursor-pointer hover:bg-yellow-100"
            onClick={() => setFilter(filter === 'overstock' ? 'all' : 'overstock')}
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-ink-muted">Overstock</span>
            </div>
            <div className="text-lg font-bold text-yellow-700">{summaryStats.overstock}</div>
            <div className="text-xs text-yellow-600">Slow moving</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl p-4 border border-green-200 bg-green-50 cursor-pointer hover:bg-green-100"
            onClick={() => setFilter(filter === 'fast' ? 'all' : 'fast')}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-green-600" />
              <span className="text-xs text-ink-muted">Fast Movers</span>
            </div>
            <div className="text-lg font-bold text-green-700">{summaryStats.fastMovers}</div>
            <div className="text-xs text-green-600">High velocity</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-canvas-faint mb-6"
        >
          <div className="px-4 py-3 border-b border-canvas-faint flex items-center justify-between">
            <h3 className="font-medium text-ink-default">
              {filter === 'all' ? 'All Items' : filter === 'understock' ? 'Understock Items' : filter === 'overstock' ? 'Overstock Items' : 'Fast Moving Items'}
            </h3>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="text-sm text-brand-600 hover:text-brand-700">
                Clear filter
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas-subtle text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Value</th>
                  <th className="px-4 py-3 font-medium text-right">Velocity</th>
                  <th className="px-4 py-3 font-medium">Days Left</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {filteredData.map((row, idx) => (
                  <motion.tr
                    key={row.itemId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    className="hover:bg-canvas-subtle cursor-pointer"
                    onClick={() => navigate(`/items/${row.itemId}`)}
                  >
                    <td className="px-4 py-3 font-medium text-ink-default">{row.itemName}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.brand}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={row.currentStock === 0 ? 'text-red-600 font-bold' : ''}>{row.currentStock}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.stockValue)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={row.isPopular ? 'text-green-600 font-medium' : ''}>{row.salesVelocity}/mo</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${row.daysOfStock <= 7 ? 'text-red-600 font-bold' : row.daysOfStock <= 14 ? 'text-yellow-600' : 'text-ink-muted'}`}>
                        {row.daysOfStock}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {row.isUnderstock && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            UNDER
                          </span>
                        )}
                        {row.isOverstock && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            OVER
                          </span>
                        )}
                        {row.isPopular && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            FAST
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-canvas-faint flex justify-between text-xs text-ink-muted">
            <span>Showing {filteredData.length} items</span>
            <span>Total Value: {formatCurrency(summaryStats.totalStockValue)}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StockStatusReport;
