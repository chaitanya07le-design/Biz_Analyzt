import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ItemsGrid from '../components/items/ItemsGrid';
import ItemsTable from '../components/items/ItemsTable';
import { ItemCardSkeleton } from '../components/shared/ListSkeleton';
import Skeleton from '../components/shared/Skeleton';
import EntityDetailModal from '../components/shared/EntityDetailModal';
import useGoogleSheetsData from '../hooks/useGoogleSheetsData';
import { useCompany } from '../context/CompanyContext';

const ItemsPage = () => {
  const { currentCompany } = useCompany();
  const [viewMode, setViewMode] = useState('grid');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const { items, itemStockStatus, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const stockStatusMap = useMemo(() => {
    if (!itemStockStatus || itemStockStatus.length === 0) return new Map();
    return new Map(itemStockStatus.map(s => [s.ItemID, s]));
  }, [itemStockStatus]);

  const normalizedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    return items.map(item => {
      const stockInfo = stockStatusMap.get(item.ItemID) || {};
      return {
        id: item.ItemID || item.id,
        name: item.ItemName || item.name || '',
        category: item.CategoryName || item.category || 'Uncategorized',
        group: item.ItemGroup || item.group || '',
        hsnSac: item.HSNSAC || item.hsnSac || '',
        unit: item.Unit || item.unit || 'Nos',
        gstRate: parseFloat(item.GSTRate || item.gstRate || 0),
        saleRate: parseFloat(item.SaleRate || item.saleRate || 0),
        purchaseRate: parseFloat(item.PurchaseRate || item.purchaseRate || 0),
        openingQty: parseFloat(item.OpeningQty || item.openingQty || 0),
        openingValue: parseFloat(item.OpeningValue || item.openingValue || 0),
        closingQty: parseFloat(stockInfo.CurrentStock || item.ClosingQty || item.closingQty || 0),
        closingValue: parseFloat(stockInfo.StockValue || item.ClosingValue || item.closingValue || 0),
      };
    });
  }, [items, stockStatusMap]);

  const categories = useMemo(() => {
    const cats = [...new Set(normalizedItems.map(i => i.category))];
    return ['all', ...cats.sort()];
  }, [normalizedItems]);

  const filteredItems = useMemo(() => {
    return normalizedItems.filter(item => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      
      if (stockFilter === 'negative' && item.closingQty >= 0) return false;
      if (stockFilter === 'low' && item.closingQty >= 10) return false;
      if (stockFilter === 'in-stock' && item.closingQty <= 0) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query) && 
            !item.category.toLowerCase().includes(query) &&
            !item.hsnSac.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [categoryFilter, stockFilter, searchQuery, normalizedItems]);

  const negativeCount = normalizedItems.filter(i => i.closingQty < 0).length;
  const lowStockCount = normalizedItems.filter(i => i.closingQty >= 0 && i.closingQty < 10).length;
  const totalStockValue = normalizedItems.reduce((sum, i) => sum + i.closingValue, 0);

  const handleItemClick = (itemId) => {
    setSelectedItemId(itemId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItemId(null);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-canvas-default pb-20 md:pb-6"
      >
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <div className="space-y-2">
            <Skeleton variant="text" className="w-24 h-7" />
            <Skeleton variant="text" className="w-48 h-4" />
          </div>

          <div className="bg-white rounded-lg border border-canvas-faint p-3 space-y-3">
            <div className="relative">
              <Skeleton variant="rounded" className="w-full h-10 rounded-lg" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" className="w-20 h-8 rounded-full" />
              ))}
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" className="w-20 h-8 rounded-lg" />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Skeleton variant="text" className="w-32 h-4" />
            <div className="flex gap-2">
              <Skeleton variant="rounded" className="w-8 h-8 rounded-lg" />
              <Skeleton variant="rounded" className="w-8 h-8 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
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
      className="min-h-screen bg-slate-50 pb-20 md:pb-6 font-sans"
    >
      <div className="px-4 py-4 md:px-8 md:py-8 space-y-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-card border border-slate-100"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-900 tracking-tight">Items</h1>
          <p className="text-sm text-kinetic-neutral font-medium mt-1">
            {normalizedItems.length} items • Total value: ₹{totalStockValue.toLocaleString('en-IN')}
          </p>
        </motion.div>

        {negativeCount > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
          >
            <motion.svg 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </motion.svg>
            <div>
              <p className="text-sm font-medium text-red-800">
                {negativeCount} item{negativeCount > 1 ? 's have' : ' has'} negative stock
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Review and adjust stock entries to correct inventory levels
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 space-y-4"
        >
          <div className="relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-kinetic-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-ink-900 placeholder-kinetic-neutral focus:outline-none focus:ring-2 focus:ring-kinetic-primary/20 focus:border-kinetic-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-kinetic-primary/20 focus:border-kinetic-primary cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-kinetic-primary/20 focus:border-kinetic-primary cursor-pointer"
            >
              <option value="all">All Stock</option>
              <option value="negative">⚠️ Negative ({negativeCount})</option>
              <option value="low">📉 Low Stock ({lowStockCount})</option>
              <option value="in-stock">✓ In Stock</option>
            </select>
          </div>

          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl w-fit">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-white text-kinetic-primary shadow-sm'
                  : 'text-kinetic-neutral hover:text-ink-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-kinetic-primary shadow-sm'
                  : 'text-kinetic-neutral hover:text-ink-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
          </div>
        </motion.div>

        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg border border-canvas-faint p-12 text-center"
          >
            <svg className="w-12 h-12 text-ink-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-ink-muted">No items found</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {viewMode === 'grid' ? (
              <ItemsGrid 
                items={filteredItems}
                onItemClick={(item) => handleItemClick(item.id)}
              />
            ) : (
              <ItemsTable 
                items={filteredItems}
                onItemClick={(item) => handleItemClick(item.id)}
              />
            )}
          </motion.div>
        )}
      </div>

      <EntityDetailModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        entityType="item"
        entityId={selectedItemId}
      />
    </motion.div>
  );
};

export default ItemsPage;
