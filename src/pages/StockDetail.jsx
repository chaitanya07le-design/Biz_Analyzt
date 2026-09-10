import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, TrendingUp, TrendingDown, Star, Clock, AlertTriangle, MapPin, IndianRupee, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const StockDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemId } = useParams();

  // Merge: initial state (instant display) + API data (fills in blanks)
  const state = location.state || {};
  const initialBatch = state.batchDetail || {};
  const initialItem = state.batchDetail || state;

  const [apiData, setApiData] = useState(null);
  useEffect(() => {
    if (!itemId) return;
    let active = true;
    api.getTallyItemDetail(itemId)
      .then((d) => { if (active) setApiData(d); })
      .catch(() => {});
    return () => { active = false; };
  }, [itemId]);

  // Merged item: API data wins for item-level fields, initial wins for batch fields
  const item = {
    itemName: apiData?.item?.itemName || initialItem.itemName || '—',
    brand: apiData?.item?.brand || initialItem.brand || null,
    category: apiData?.item?.categoryId || initialItem.category || null,
    hsn: apiData?.item?.hsn || initialItem.hsn || '—',
    unit: apiData?.item?.unit || initialItem.unit || '—',
    gstRate: apiData?.item?.gstRate || initialItem.gstRate || 0,
    saleRate: apiData?.item?.saleRate || initialItem.saleRate || 0,
    purchaseRate: apiData?.item?.purchaseRate || initialItem.purchaseRate || 0,
    currentStock: apiData?.item?.currentStock ?? initialItem.currentStock ?? initialItem.quantity ?? 0,
    stockValue: apiData?.item?.stockValue ?? initialItem.stockValue ?? initialItem.value ?? 0,
    salesVelocity30d: apiData?.item?.salesVelocity30d ?? initialItem.salesVelocity30d ?? initialItem.salesVelocity ?? 0,
    isUnderstock: apiData?.item?.isUnderstock ?? initialItem.isUnderstock ?? false,
    isOverstock: apiData?.item?.isOverstock ?? initialItem.isOverstock ?? false,
    isPopular: apiData?.item?.isPopular ?? initialItem.isPopular ?? false,
    daysOfStock: apiData?.item?.daysOfStock ?? initialItem.daysOfStock ?? 0,
    reorderLevel: apiData?.item?.reorderLevel ?? initialItem.reorderLevel ?? 0,
    lastSaleDate: apiData?.item?.lastSaleDate || initialItem.lastSaleDate || initialItem.lastSale || null,
    lastPurchaseDate: apiData?.item?.lastPurchaseDate || initialItem.lastPurchaseDate || initialItem.lastPurchase || null,
    location: apiData?.item?.location || initialItem.location || null,
  };

  // Batches from API, fall back to single initial batch
  const batches = apiData?.batches?.length > 0 ? apiData.batches : (initialBatch.batchNo ? [initialBatch] : []);
  const activeBatch = batches[0] || initialBatch;

  const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatNumber = (v) => (v != null ? Number(v).toLocaleString('en-IN') : '—');

  const hasBatch = !!(activeBatch.batchNo || activeBatch.ageingDays != null);
  const stockQty = item.currentStock ?? 0;
  const stockValue = item.stockValue ?? 0;
  const velocity = item.salesVelocity30d ?? 0;
  const daysStock = item.daysOfStock ?? 0;
  const reorder = item.reorderLevel ?? 0;
  const isUnder = item.isUnderstock ?? false;
  const isOver = item.isOverstock ?? false;
  const isPopular = item.isPopular ?? false;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        {/* Back button + header */}
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-ink-muted" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-ink-default">{item.itemName || 'Stock Item'}</h1>
            <p className="text-sm text-ink-muted">{[item.brand, item.category].filter(Boolean).join(' · ') || '—'}</p>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-indigo-600" /><span className="text-xs text-ink-muted">Stock</span></div>
            <div className="text-lg font-bold text-ink-default">{formatNumber(stockQty)}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><IndianRupee className="w-4 h-4 text-green-600" /><span className="text-xs text-ink-muted">Value</span></div>
            <div className="text-lg font-bold text-ink-default">{formatCurrency(stockValue)}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-teal-600" /><span className="text-xs text-ink-muted">Velocity</span></div>
            <div className="text-lg font-bold text-ink-default">{formatNumber(velocity)}<span className="text-xs font-normal text-ink-muted">/mo</span></div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-amber-600" /><span className="text-xs text-ink-muted">Days Left</span></div>
            <div className={`text-lg font-bold ${daysStock <= 7 ? 'text-rose-600' : daysStock <= 14 ? 'text-amber-600' : 'text-ink-default'}`}>{formatNumber(daysStock)}d</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-indigo-600" /><span className="text-xs text-ink-muted">Reorder</span></div>
            <div className="text-lg font-bold text-ink-default">{formatNumber(reorder)}</div>
          </motion.div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          {isUnder && <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-rose-light text-rose-700"><TrendingDown className="w-4 h-4" /> Understock</span>}
          {isOver && <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-light text-amber-700"><TrendingUp className="w-4 h-4" /> Overstock</span>}
          {isPopular && <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-teal-light text-teal-700"><Star className="w-4 h-4" /> Fast Mover</span>}
        </div>

        {/* Item info card */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-lg border border-canvas-faint p-4">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Item Information</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><p className="text-xs text-ink-muted">HSN/SAC</p><p className="text-sm font-medium text-ink-default">{item.hsnSac || item.hsn || '—'}</p></div>
            <div><p className="text-xs text-ink-muted">Unit</p><p className="text-sm font-medium text-ink-default">{item.unit || '—'}</p></div>
            <div><p className="text-xs text-ink-muted">GST Rate</p><p className="text-sm font-medium text-ink-default">{item.gstRate ? `${item.gstRate}%` : '—'}</p></div>
            <div><p className="text-xs text-ink-muted">Sale Rate</p><p className="text-sm font-medium text-ink-default">{item.saleRate ? formatCurrency(item.saleRate) : '—'}</p></div>
            <div><p className="text-xs text-ink-muted">Purchase Rate</p><p className="text-sm font-medium text-ink-default">{item.purchaseRate ? formatCurrency(item.purchaseRate) : '—'}</p></div>
            <div><p className="text-xs text-ink-muted">Location</p><p className="text-sm font-medium text-ink-default">{item.location || '—'}</p></div>
            <div><p className="text-xs text-ink-muted">Last Sale</p><p className="text-sm font-medium text-ink-default">{formatDate(item.lastSale || item.lastSaleDate)}</p></div>
            <div><p className="text-xs text-ink-muted">Last Purchase</p><p className="text-sm font-medium text-ink-default">{formatDate(item.lastPurchase || item.lastPurchaseDate)}</p></div>
          </div>
        </motion.div>

        {/* Batch-specific detail (only when coming from StockAging) */}
        {hasBatch && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="bg-white rounded-lg border border-canvas-faint p-4">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Batch Detail {batches.length > 1 ? `(${batches.length} batches)` : ''}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><p className="text-xs text-ink-muted">Batch No</p><p className="text-sm font-medium text-ink-default">{activeBatch.batchNo || '—'}</p></div>
              <div><p className="text-xs text-ink-muted">Inward Date</p><p className="text-sm font-medium text-ink-default">{formatDate(activeBatch.inwardDate)}</p></div>
              <div><p className="text-xs text-ink-muted">Age</p><p className="text-sm font-medium text-ink-default">{activeBatch.ageingDays != null ? `${activeBatch.ageingDays} days` : '—'}</p></div>
              <div><p className="text-xs text-ink-muted">Bucket</p><p className="text-sm font-medium text-ink-default">{activeBatch.ageingBucket || '—'}</p></div>
              <div><p className="text-xs text-ink-muted">Qty in Batch</p><p className="text-sm font-medium text-ink-default">{formatNumber(activeBatch.quantity)}</p></div>
              <div><p className="text-xs text-ink-muted">Batch Value</p><p className="text-sm font-medium text-ink-default">{formatCurrency(activeBatch.value)}</p></div>
              <div><p className="text-xs text-ink-muted">Rate</p><p className="text-sm font-medium text-ink-default">{activeBatch.rate ? formatCurrency(activeBatch.rate) : '—'}</p></div>
              <div><p className="text-xs text-ink-muted">Location</p><p className="text-sm font-medium text-ink-default">{activeBatch.location || item.location || '—'}</p></div>
            </div>
            <div className="mt-3">
              {activeBatch.isDeadStock ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-rose-light text-rose-700"><AlertTriangle className="w-4 h-4" /> DEAD STOCK</span>
              ) : activeBatch.ageingDays <= 30 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-teal-light text-teal-700"><Clock className="w-4 h-4" /> FRESH</span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-light text-amber-700"><Clock className="w-4 h-4" /> AGING</span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StockDetail;