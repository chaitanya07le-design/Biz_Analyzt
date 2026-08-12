import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import Skeleton from '../../components/shared/Skeleton';

const ItemStockStatusPage = () => {
  const { currentCompany } = useCompany();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { itemStockStatus, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const normalizedData = useMemo(() => {
    if (!itemStockStatus || itemStockStatus.length === 0) return [];
    
    return itemStockStatus.map(item => ({
      statusId: item.StatusID,
      itemId: item.ItemID,
      itemName: item.ItemName,
      currentStock: parseFloat(item.CurrentStock) || 0,
      salesVelocity30d: parseFloat(item.SalesVelocity30d) || 0,
      isUnderstock: item.IsUnderstock === 'TRUE',
      isOverstock: item.IsOverstock === 'TRUE',
      isPopular: item.IsPopular === 'TRUE',
      daysOfStock: parseInt(item.DaysOfStock) || 0,
      reorderLevel: parseFloat(item.ReorderLevel) || 0,
      stockValue: parseFloat(item.StockValue) || 0,
      lastSaleDate: item.LastSaleDate,
      lastPurchaseDate: item.LastPurchaseDate,
    }));
  }, [itemStockStatus]);

  const filteredData = useMemo(() => {
    return normalizedData.filter(item => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'understock' && !item.isUnderstock) return false;
        if (statusFilter === 'overstock' && !item.isOverstock) return false;
        if (statusFilter === 'popular' && !item.isPopular) return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.itemName.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [statusFilter, searchQuery, normalizedData]);

  const summary = useMemo(() => {
    return {
      understock: normalizedData.filter(i => i.isUnderstock).length,
      overstock: normalizedData.filter(i => i.isOverstock).length,
      popular: normalizedData.filter(i => i.isPopular).length,
      totalStockValue: normalizedData.reduce((sum, i) => sum + i.stockValue, 0),
    };
  }, [normalizedData]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <Skeleton variant="text" className="w-48 h-7" />
          <Skeleton variant="rounded" className="w-full h-96" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Item Stock Status</h1>
          <p className="text-sm text-ink-muted mt-1">
            {filteredData.length} items • Total value: ₹{summary.totalStockValue.toLocaleString('en-IN')}
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`bg-red-50 border rounded-lg p-3 cursor-pointer transition-all ${
              statusFilter === 'understock' ? 'border-red-400 ring-1 ring-red-400' : 'border-red-200 hover:border-red-300'
            }`}
            onClick={() => setStatusFilter(statusFilter === 'understock' ? 'all' : 'understock')}
          >
            <p className="text-xs text-red-600 font-medium">📉 Understock</p>
            <p className="text-xl font-semibold text-red-700 mt-1">{summary.understock}</p>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className={`bg-yellow-50 border rounded-lg p-3 cursor-pointer transition-all ${
              statusFilter === 'overstock' ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-yellow-200 hover:border-yellow-300'
            }`}
            onClick={() => setStatusFilter(statusFilter === 'overstock' ? 'all' : 'overstock')}
          >
            <p className="text-xs text-yellow-600 font-medium">📦 Overstock</p>
            <p className="text-xl font-semibold text-yellow-700 mt-1">{summary.overstock}</p>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`bg-green-50 border rounded-lg p-3 cursor-pointer transition-all ${
              statusFilter === 'popular' ? 'border-green-400 ring-1 ring-green-400' : 'border-green-200 hover:border-green-300'
            }`}
            onClick={() => setStatusFilter(statusFilter === 'popular' ? 'all' : 'popular')}
          >
            <p className="text-xs text-green-600 font-medium">⭐ Popular</p>
            <p className="text-xl font-semibold text-green-700 mt-1">{summary.popular}</p>
          </motion.div>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-white rounded-lg border border-canvas-faint p-3">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas-subtle border border-canvas-faint rounded-lg text-sm text-ink-default placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item, idx) => (
            <motion.div
              key={item.statusId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              className="bg-white rounded-lg border border-canvas-faint p-4 hover:border-canvas-border transition-colors"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-medium text-ink-default">{item.itemName}</h3>
                <div className="flex gap-1">
                  {item.isPopular && <span className="text-xs">⭐</span>}
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-ink-muted">Current Stock</p>
                  <p className="text-ink-default font-medium">{item.currentStock} units</p>
                </div>
                <div>
                  <p className="text-ink-muted">Stock Value</p>
                  <p className="text-ink-default font-medium">₹{item.stockValue.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Sales Velocity</p>
                  <p className="text-ink-default font-medium">{item.salesVelocity30d}/mo</p>
                </div>
                <div>
                  <p className="text-ink-muted">Days of Stock</p>
                  <p className={`font-medium ${item.daysOfStock < 7 ? 'text-red-600' : item.daysOfStock > 90 ? 'text-yellow-600' : 'text-ink-default'}`}>
                    {item.daysOfStock} days
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {item.isUnderstock && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">Understock</span>
                )}
                {item.isOverstock && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Overstock</span>
                )}
                {item.isPopular && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Popular</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredData.length === 0 && (
          <div className="bg-white rounded-lg border border-canvas-faint p-8 text-center">
            <p className="text-ink-muted">No items found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ItemStockStatusPage;
