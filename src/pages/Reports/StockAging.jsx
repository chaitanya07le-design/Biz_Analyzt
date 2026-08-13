import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Package, Clock, TrendingDown } from 'lucide-react';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';

const StockAging = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { items, stockBatches, itemStockStatus, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const [selectedBucket, setSelectedBucket] = useState('all');
  const [showDeadOnly, setShowDeadOnly] = useState(false);

  const itemMap = useMemo(() => {
    if (!items) return new Map();
    return new Map(items.map(i => [i.ItemID, i]));
  }, [items]);

  const statusMap = useMemo(() => {
    if (!itemStockStatus) return new Map();
    return new Map(itemStockStatus.map(s => [s.ItemID, s]));
  }, [itemStockStatus]);

  const agingData = useMemo(() => {
    if (!stockBatches) return [];

    const today = new Date();
    const daysAgo30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return stockBatches.map(batch => {
      const item = itemMap.get(batch.ItemID) || {};
      const status = statusMap.get(batch.ItemID) || {};

      const inwardDate = new Date(batch.InwardDate);
      const ageingDays = parseInt(batch.AgeingDays || 0);
      const lastSaleDate = status.LastSaleDate ? new Date(status.LastSaleDate) : null;

      const isDeadStock = ageingDays > 90 && (!lastSaleDate || lastSaleDate < daysAgo30);

      return {
        batchId: batch.BatchID,
        itemId: batch.ItemID,
        itemName: item.ItemName || batch.ItemID,
        brand: item.Brand || 'Generic',
        batchNo: batch.BatchNo,
        quantity: parseInt(batch.Quantity || 0),
        value: parseFloat(batch.Value || 0),
        rate: parseFloat(batch.Rate || 0),
        inwardDate: batch.InwardDate,
        ageingDays,
        ageingBucket: batch.AgeingBucket || '0-30',
        location: batch.Location || '-',
        isDeadStock,
        lastSaleDate: status.LastSaleDate || '-',
        salesVelocity: parseFloat(status.SalesVelocity30d || 0),
      };
    });
  }, [stockBatches, itemMap, statusMap]);

  const filteredData = useMemo(() => {
    let result = agingData;

    if (showDeadOnly) {
      result = result.filter(d => d.isDeadStock);
    } else if (selectedBucket !== 'all') {
      result = result.filter(d => d.ageingBucket === selectedBucket);
    }

    return result.sort((a, b) => b.ageingDays - a.ageingDays);
  }, [agingData, selectedBucket, showDeadOnly]);

  const summaryStats = useMemo(() => {
    const total = agingData.length;
    const deadStock = agingData.filter(d => d.isDeadStock);
    const deadValue = deadStock.reduce((sum, d) => sum + d.value, 0);
    const deadQty = deadStock.reduce((sum, d) => sum + d.quantity, 0);

    const buckets = {
      '0-30': { count: 0, value: 0 },
      '31-60': { count: 0, value: 0 },
      '61-90': { count: 0, value: 0 },
      '91-180': { count: 0, value: 0 },
      '180+': { count: 0, value: 0 },
    };

    agingData.forEach(d => {
      const bucket = d.ageingBucket;
      if (buckets[bucket]) {
        buckets[bucket].count++;
        buckets[bucket].value += d.value;
      }
    });

    return { total, deadStock: deadStock.length, deadValue, deadQty, buckets };
  }, [agingData]);

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
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const bucketColors = {
    '0-30': 'bg-green-100 text-green-700',
    '31-60': 'bg-yellow-100 text-yellow-700',
    '61-90': 'bg-orange-100 text-orange-700',
    '91-180': 'bg-red-100 text-red-700',
    '180+': 'bg-red-200 text-red-800',
  };

  if (loading) {
    return (
      <motion.div className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <Skeleton variant="text" className="w-40 h-7" />
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
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
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Stock Aging Report</h1>
          <p className="text-sm text-ink-muted mt-1">FIFO batch-wise aging analysis with dead stock identification</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-ink-muted">Total Batches</span>
            </div>
            <div className="text-lg font-bold text-ink-default">{summaryStats.total}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl p-4 border border-red-200 bg-red-50"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs text-ink-muted">Dead Stock</span>
            </div>
            <div className="text-lg font-bold text-red-700">{summaryStats.deadStock}</div>
            <div className="text-xs text-red-600">{summaryStats.deadQty} units</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-red-200 bg-red-50"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs text-ink-muted">Dead Stock Value</span>
            </div>
            <div className="text-lg font-bold text-red-700">{formatCurrency(summaryStats.deadValue)}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-xs text-ink-muted">Fresh (0-30)</span>
            </div>
            <div className="text-lg font-bold text-ink-default">{summaryStats.buckets['0-30'].count}</div>
            <div className="text-xs text-ink-muted">{formatCurrency(summaryStats.buckets['0-30'].value)}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-ink-muted">Aging (31-90)</span>
            </div>
            <div className="text-lg font-bold text-ink-default">
              {summaryStats.buckets['31-60'].count + summaryStats.buckets['61-90'].count}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl border border-canvas-faint mb-6"
        >
          <div className="px-4 py-3 border-b border-canvas-faint flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">Filter:</span>
              <select
                value={selectedBucket}
                onChange={(e) => {
                  setSelectedBucket(e.target.value);
                  setShowDeadOnly(false);
                }}
                className="text-sm border border-canvas-faint rounded-lg px-3 py-1.5 bg-white text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All Batches</option>
                <option value="0-30">0-30 days</option>
                <option value="31-60">31-60 days</option>
                <option value="61-90">61-90 days</option>
                <option value="91-180">91-180 days</option>
                <option value="180+">180+ days</option>
              </select>
            </div>

            <button
              onClick={() => {
                setShowDeadOnly(!showDeadOnly);
                if (!showDeadOnly) setSelectedBucket('all');
              }}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                showDeadOnly
                  ? 'bg-red-100 border-red-300 text-red-700'
                  : 'border-canvas-faint text-ink-muted hover:bg-canvas-subtle'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
              Dead Stock Only
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas-subtle text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium text-right">Qty</th>
                  <th className="px-4 py-3 font-medium text-right">Value</th>
                  <th className="px-4 py-3 font-medium">Age</th>
                  <th className="px-4 py-3 font-medium">Bucket</th>
                  <th className="px-4 py-3 font-medium">Last Sale</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {filteredData.map((row, idx) => (
                  <motion.tr
                    key={row.batchId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`hover:bg-canvas-subtle cursor-pointer ${row.isDeadStock ? 'bg-red-50' : ''}`}
                    onClick={() => navigate(`/items/${row.itemId}`)}
                  >
                    <td className="px-4 py-3 font-medium text-ink-default">{row.itemName}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.brand}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.batchNo}</td>
                    <td className="px-4 py-3 text-right">{row.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.value)}</td>
                    <td className="px-4 py-3">{row.ageingDays} days</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bucketColors[row.ageingBucket] || 'bg-gray-100'}`}>
                        {row.ageingBucket}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(row.lastSaleDate)}</td>
                    <td className="px-4 py-3">
                      {row.isDeadStock && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          DEAD
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-canvas-faint text-xs text-ink-muted">
            Showing {filteredData.length} of {agingData.length} batches
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StockAging;
