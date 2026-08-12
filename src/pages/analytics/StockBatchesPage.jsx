import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import Skeleton from '../../components/shared/Skeleton';

const StockBatchesPage = () => {
  const { currentCompany } = useCompany();
  const [ageingFilter, setAgeingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  
  const { stockBatches, items, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const itemMap = useMemo(() => {
    if (!items) return {};
    return items.reduce((acc, item) => {
      acc[item.ItemID] = item.ItemName;
      return acc;
    }, {});
  }, [items]);

  const normalizedBatches = useMemo(() => {
    if (!stockBatches || stockBatches.length === 0) return [];
    
    return stockBatches.map(batch => ({
      batchId: batch.BatchID,
      itemId: batch.ItemID,
      itemName: itemMap[batch.ItemID] || batch.ItemID,
      batchNo: batch.BatchNo,
      quantity: parseFloat(batch.Quantity) || 0,
      inwardDate: batch.InwardDate,
      mfgDate: batch.MfgDate,
      expDate: batch.ExpDate,
      rate: parseFloat(batch.Rate) || 0,
      value: parseFloat(batch.Value) || 0,
      ageingDays: parseInt(batch.AgeingDays) || 0,
      ageingBucket: batch.AgeingBucket,
      location: batch.Location,
    }));
  }, [stockBatches, itemMap]);

  const locations = useMemo(() => {
    const locs = [...new Set(normalizedBatches.map(b => b.location))];
    return ['all', ...locs.sort()];
  }, [normalizedBatches]);

  const filteredBatches = useMemo(() => {
    return normalizedBatches.filter(batch => {
      if (ageingFilter !== 'all' && batch.ageingBucket !== ageingFilter) return false;
      if (locationFilter !== 'all' && batch.location !== locationFilter) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!batch.itemName.toLowerCase().includes(query) && 
            !batch.batchNo.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [ageingFilter, locationFilter, searchQuery, normalizedBatches]);

  const ageingSummary = useMemo(() => {
    const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '91-180': 0, '180+': 0 };
    normalizedBatches.forEach(batch => {
      if (buckets[batch.ageingBucket] !== undefined) {
        buckets[batch.ageingBucket] += batch.value;
      }
    });
    return buckets;
  }, [normalizedBatches]);

  const totalValue = filteredBatches.reduce((sum, b) => sum + b.value, 0);

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
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Stock Batches</h1>
          <p className="text-sm text-ink-muted mt-1">
            {filteredBatches.length} batches • Total value: ₹{totalValue.toLocaleString('en-IN')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(ageingSummary).map(([bucket, value]) => (
            <motion.div
              key={bucket}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`bg-white rounded-lg border p-3 cursor-pointer transition-all ${
                ageingFilter === bucket ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-canvas-faint hover:border-canvas-border'
              }`}
              onClick={() => setAgeingFilter(ageingFilter === bucket ? 'all' : bucket)}
            >
              <p className="text-xs text-ink-muted">{bucket} days</p>
              <p className="text-sm font-semibold text-ink-default mt-1">₹{value.toLocaleString('en-IN')}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-white rounded-lg border border-canvas-faint p-3 space-y-3">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by item or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas-subtle border border-canvas-faint rounded-lg text-sm text-ink-default placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-1.5 bg-canvas-subtle border border-canvas-faint rounded-lg text-xs text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc === 'all' ? 'All Locations' : loc}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle border-b border-canvas-faint">
                <tr>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Item</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Batch</th>
                  <th className="text-right px-4 py-3 text-ink-muted font-medium">Qty</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Inward</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Ageing</th>
                  <th className="text-right px-4 py-3 text-ink-muted font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {filteredBatches.map((batch, idx) => (
                  <motion.tr
                    key={batch.batchId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className="hover:bg-canvas-subtle transition-colors"
                  >
                    <td className="px-4 py-3 text-ink-default">{batch.itemName}</td>
                    <td className="px-4 py-3 text-ink-muted">{batch.batchNo}</td>
                    <td className="px-4 py-3 text-ink-default text-right">{batch.quantity}</td>
                    <td className="px-4 py-3 text-ink-muted">{batch.inwardDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        batch.ageingBucket === '0-30' ? 'bg-green-100 text-green-700' :
                        batch.ageingBucket === '31-60' ? 'bg-yellow-100 text-yellow-700' :
                        batch.ageingBucket === '61-90' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {batch.ageingDays}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-default text-right font-medium">₹{batch.value.toLocaleString('en-IN')}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBatches.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-ink-muted">No batches found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StockBatchesPage;
