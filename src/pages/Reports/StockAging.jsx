import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Package, Clock, TrendingDown } from 'lucide-react';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import useTallyStockBatches from '../../hooks/useTallyStockBatches';
import useTallyBatchStock from '../../hooks/useTallyBatchStock';

const StockAging = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { items, stockBatches, itemStockStatus, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');
  const tallyBatches = useTallyStockBatches();
  const tallyBatchStock = useTallyBatchStock();

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

  const totalItems = useMemo(() => {
    if (!items) return 0;
    return items.filter(i => i.CompanyID === (currentCompany?.id || 'COMP-0001')).length;
  }, [items, currentCompany]);

  const batchTrackedItems = useMemo(() => {
    if (!items) return 0;
    return items.filter(i => i.CompanyID === (currentCompany?.id || 'COMP-0001') && i.IsBatchTracked === 'TRUE').length;
  }, [items, currentCompany]);

  // NOTE: Batch tracking (IsBatchTracked) is a material master attribute, not random seed data.
  // Future WF-13 workflow will implement batch-wise inventory sync from Tally for tracked items.
  // This badge makes the 5-of-9 split explicit until WF-13 provides real batch data.
  const agingData = useMemo(() => {
    // Priority: Template 88 (pre-computed ageing) > Template 58 (batch stock) > Google Sheets
    const t88 = tallyBatches?.batches?.length > 0 ? tallyBatches.batches : null;
    const t58 = tallyBatchStock?.length > 0 ? tallyBatchStock : null;
    const sourceBatches = t88 || t58 || stockBatches;
    if (!sourceBatches) return [];

    const today = new Date();
    const daysAgo30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return sourceBatches.map((batch, index) => {
      // Template 88 (tallyBatches.batches) — pre-computed ageing from Tally
      if (t88) {
        const ageingDays = parseInt(batch.ageingDays) || 0;
        // Normalize T88 ageingBucket: "90+ Days" → "90+", "0-30 Days" → "0-30", etc.
        const rawBucket = (batch.ageingBucket || '').trim();
        const t88Map = { '0-30 days': '0-30', '31-60 days': '31-60', '61-90 days': '61-90', '90+ days': '90+' };
        const ageingBucket = t88Map[rawBucket.toLowerCase()] || (ageingDays <= 30 ? '0-30' : ageingDays <= 60 ? '31-60' : ageingDays <= 90 ? '61-90' : '90+');
        const isDeadStock = ageingDays > 90;
        return {
          batchId: batch.batchId || `t88-batch-${index}`,
          itemId: batch.itemId || '',
          itemName: batch.itemName || '—',
          brand: '—',
          batchNo: batch.batchNo || '—',
          quantity: parseFloat(batch.quantity) || 0,
          value: parseFloat(batch.value) || 0,
          rate: parseFloat(batch.rate) || 0,
          inwardDate: batch.inwardDate || null,
          ageingDays,
          ageingBucket,
          location: batch.location || '-',
          isDeadStock,
          lastSaleDate: '-',
          salesVelocity: 0,
        };
      }
      // Template 58 (tallyBatchStock) — batch stock details, compute ageing from inwardDate
      if (t58) {
        const inwardDate = batch.inwardDate ? new Date(batch.inwardDate) : new Date(0);
        const ageingDays = Number.isNaN(inwardDate.getTime()) ? 0 : Math.max(0, Math.floor((today - inwardDate) / 86400000));
        const ageingBucket = ageingDays <= 30 ? '0-30' : ageingDays <= 60 ? '31-60' : ageingDays <= 90 ? '61-90' : ageingDays <= 180 ? '91-180' : '180+';
        const isDeadStock = ageingDays > 90;
        return {
          batchId: batch.id || `t58-batch-${index}`,
          itemId: batch.id || '',
          itemName: batch.itemName || '—',
          brand: '—',
          batchNo: batch.batchNo || '—',
          quantity: parseFloat(batch.quantity) || 0,
          value: parseFloat(batch.value) || 0,
          rate: 0,
          inwardDate: batch.inwardDate || null,
          ageingDays,
          ageingBucket,
          location: batch.godown || batch.location || '-',
          isDeadStock,
          lastSaleDate: '-',
          salesVelocity: 0,
        };
      }
      // Google Sheets fallback
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
  }, [stockBatches, tallyBatches, tallyBatchStock, itemMap, statusMap]);

  const filteredData = useMemo(() => {
    let result = agingData;

    if (showDeadOnly) {
      result = result.filter(d => d.isDeadStock);
    } else if (selectedBucket === '31-90') {
      result = result.filter(d => d.ageingBucket === '31-60' || d.ageingBucket === '61-90');
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
      '90+': { count: 0, value: 0 },
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
    '0-30': 'bg-teal-light text-teal-700',
    '31-60': 'bg-amber-light text-amber-700',
    '61-90': 'bg-amber-100 text-amber-800',
    '90+': 'bg-rose-100 text-rose-800',
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
              onClick={() => {
                if (selectedBucket === 'all' && !showDeadOnly) return;
                setSelectedBucket('all');
                setShowDeadOnly(false);
              }}
              className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                selectedBucket === 'all' && !showDeadOnly
                  ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                  : 'border-canvas-faint hover:bg-canvas-subtle'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-ink-muted">Total Batches</span>
              </div>
              <div className="text-lg font-bold text-ink-default">{summaryStats.total}</div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              onClick={() => {
                if (showDeadOnly) { setShowDeadOnly(false); setSelectedBucket('all'); return; }
                setShowDeadOnly(true);
                setSelectedBucket('all');
              }}
              className={`rounded-xl p-4 border cursor-pointer transition-all ${
                showDeadOnly
                  ? 'border-rose-400 bg-rose-50 shadow-sm'
                  : 'border-rose-200 bg-rose-light hover:bg-rose-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="text-xs text-ink-muted">Dead Stock</span>
              </div>
              <div className="text-lg font-bold text-rose-700">{summaryStats.deadStock}</div>
              <div className="text-xs text-rose-600">{summaryStats.deadQty} units</div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 border border-canvas-faint cursor-default"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span className="text-xs text-ink-muted">Dead Stock Value</span>
              </div>
              <div className="text-lg font-bold text-rose-700">{formatCurrency(summaryStats.deadValue)}</div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              onClick={() => {
                if (selectedBucket === '0-30') { setSelectedBucket('all'); return; }
                setSelectedBucket('0-30');
                setShowDeadOnly(false);
              }}
              className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                selectedBucket === '0-30'
                  ? 'border-teal-400 bg-teal-50 shadow-sm'
                  : 'border-canvas-faint hover:bg-canvas-subtle'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${selectedBucket === '0-30' ? 'text-teal-600' : 'text-teal-500'}`} />
                <span className="text-xs text-ink-muted">Fresh (0-30)</span>
              </div>
              <div className="text-lg font-bold text-ink-default">{summaryStats.buckets['0-30']?.count || 0}</div>
              <div className="text-xs text-ink-muted">{formatCurrency(summaryStats.buckets['0-30']?.value || 0)}</div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => {
                if (selectedBucket === '31-90') { setSelectedBucket('all'); return; }
                setSelectedBucket('31-90');
                setShowDeadOnly(false);
              }}
              className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                selectedBucket === '31-90'
                  ? 'border-amber-400 bg-amber-50 shadow-sm'
                  : 'border-canvas-faint hover:bg-canvas-subtle'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${selectedBucket === '31-90' ? 'text-amber-600' : 'text-amber-500'}`} />
                <span className="text-xs text-ink-muted">Aging (31-90)</span>
              </div>
              <div className="text-lg font-bold text-ink-default">
                {(summaryStats.buckets['31-60']?.count || 0) + (summaryStats.buckets['61-90']?.count || 0)}
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
                <option value="90+">90+ days</option>
              </select>
            </div>

            <button
              onClick={() => {
                setShowDeadOnly(!showDeadOnly);
                if (!showDeadOnly) setSelectedBucket('all');
              }}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                showDeadOnly
                  ? 'bg-rose-light border-rose-300 text-rose-700'
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
                    className={`hover:bg-canvas-subtle cursor-pointer ${row.isDeadStock ? 'bg-rose-light' : ''}`}
                    onClick={() => navigate(`/items/${row.itemId}`, { state: { batchDetail: row } })}
                  >
                    <td className="px-4 py-3 font-medium text-ink-default">{row.itemName}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.brand}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.batchNo}</td>
                    <td className="px-4 py-3 text-right">{row.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.value)}</td>
                    <td className="px-4 py-3">{row.ageingDays} days</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${bucketColors[row.ageingBucket] || 'bg-gray-100'}`}>
                        {row.ageingBucket === '90+' ? '90+ Days' : row.ageingBucket === '0-30' ? '0-30 Days' : row.ageingBucket === '31-60' ? '31-60 Days' : row.ageingBucket === '61-90' ? '61-90 Days' : row.ageingBucket}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(row.lastSaleDate)}</td>
                    <td className="px-4 py-3">
                      {row.isDeadStock ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-light text-rose-700 whitespace-nowrap">DEAD</span>
                      ) : row.ageingBucket === '0-30' ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-light text-teal-700 whitespace-nowrap">FRESH</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-light text-amber-700 whitespace-nowrap">AGING</span>
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
