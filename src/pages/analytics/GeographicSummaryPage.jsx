import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import Skeleton from '../../components/shared/Skeleton';

const GeographicSummaryPage = () => {
  const { currentCompany } = useCompany();
  const [stateFilter, setStateFilter] = useState('all');
  
  const { geographicSummary, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const normalizedData = useMemo(() => {
    if (!geographicSummary || geographicSummary.length === 0) return [];
    
    return geographicSummary.map(geo => ({
      geoId: geo.GeoID,
      state: geo.State,
      city: geo.City,
      partyCount: parseInt(geo.PartyCount) || 0,
      totalSalesValue: parseFloat(geo.TotalSalesValue) || 0,
      totalPurchaseValue: parseFloat(geo.TotalPurchaseValue) || 0,
      totalOutstanding: parseFloat(geo.TotalOutstanding) || 0,
      topCustomers: geo.TopCustomers || '',
      topItems: geo.TopItems || '',
      periodStart: geo.PeriodStart,
      periodEnd: geo.PeriodEnd,
    }));
  }, [geographicSummary]);

  const states = useMemo(() => {
    const stateList = [...new Set(normalizedData.map(g => g.state))];
    return ['all', ...stateList.sort()];
  }, [normalizedData]);

  const filteredData = useMemo(() => {
    return normalizedData.filter(geo => {
      if (stateFilter !== 'all' && geo.state !== stateFilter) return false;
      return true;
    });
  }, [stateFilter, normalizedData]);

  const summary = useMemo(() => {
    const totalSales = filteredData.reduce((sum, g) => sum + g.totalSalesValue, 0);
    const totalPurchases = filteredData.reduce((sum, g) => sum + g.totalPurchaseValue, 0);
    const totalOutstanding = filteredData.reduce((sum, g) => sum + g.totalOutstanding, 0);
    const totalParties = filteredData.reduce((sum, g) => sum + g.partyCount, 0);
    
    return { totalSales, totalPurchases, totalOutstanding, totalParties };
  }, [filteredData]);

  const formatCurrency = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

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
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Geographic Summary</h1>
          <p className="text-sm text-ink-muted mt-1">
            {filteredData.length} locations • Sales: {formatCurrency(summary.totalSales)} • Outstanding: {formatCurrency(summary.totalOutstanding)}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg border border-canvas-faint p-3">
            <p className="text-xs text-ink-muted">Total Sales</p>
            <p className="text-lg font-semibold text-green-600 mt-1">{formatCurrency(summary.totalSales)}</p>
          </motion.div>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 }} className="bg-white rounded-lg border border-canvas-faint p-3">
            <p className="text-xs text-ink-muted">Total Purchases</p>
            <p className="text-lg font-semibold text-orange-600 mt-1">{formatCurrency(summary.totalPurchases)}</p>
          </motion.div>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg border border-canvas-faint p-3">
            <p className="text-xs text-ink-muted">Outstanding</p>
            <p className="text-lg font-semibold text-red-600 mt-1">{formatCurrency(summary.totalOutstanding)}</p>
          </motion.div>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-white rounded-lg border border-canvas-faint p-3">
            <p className="text-xs text-ink-muted">Total Parties</p>
            <p className="text-lg font-semibold text-ink-default mt-1">{summary.totalParties}</p>
          </motion.div>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-white rounded-lg border border-canvas-faint p-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-2 bg-canvas-subtle border border-canvas-faint rounded-lg text-sm text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
          >
            {states.map(state => (
              <option key={state} value={state}>
                {state === 'all' ? 'All States' : state}
              </option>
            ))}
          </select>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((geo, idx) => (
            <motion.div
              key={geo.geoId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="bg-white rounded-lg border border-canvas-faint p-4 hover:border-canvas-border transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-ink-default">{geo.city}</h3>
                  <p className="text-xs text-ink-muted">{geo.state}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {geo.partyCount} parties
                </span>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-ink-muted">Sales</p>
                  <p className="text-ink-default font-medium">{formatCurrency(geo.totalSalesValue)}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Purchases</p>
                  <p className="text-ink-default font-medium">{formatCurrency(geo.totalPurchaseValue)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-ink-muted">Outstanding</p>
                  <p className={`font-medium ${geo.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(geo.totalOutstanding)}
                  </p>
                </div>
              </div>

              {geo.topCustomers && (
                <div className="mt-3 pt-3 border-t border-canvas-faint">
                  <p className="text-xs text-ink-muted mb-1">Top Customers</p>
                  <p className="text-xs text-ink-default">{geo.topCustomers}</p>
                </div>
              )}

              {geo.topItems && (
                <div className="mt-2">
                  <p className="text-xs text-ink-muted mb-1">Top Items</p>
                  <p className="text-xs text-ink-default">{geo.topItems}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {filteredData.length === 0 && (
          <div className="bg-white rounded-lg border border-canvas-faint p-8 text-center">
            <p className="text-ink-muted">No geographic data found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GeographicSummaryPage;
