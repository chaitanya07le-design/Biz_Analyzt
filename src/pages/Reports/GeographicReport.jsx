import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, TrendingUp, DollarSign, Building } from 'lucide-react';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';

const GeographicReport = () => {
  const { currentCompany } = useCompany();
  const { geographicSummary, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const [sortBy, setSortBy] = useState('sales');
  const [selectedState, setSelectedState] = useState('');

  const geoData = useMemo(() => {
    if (!geographicSummary) return [];

    return geographicSummary.map(geo => ({
      geoId: geo.GeoID,
      state: geo.State || 'Unknown',
      city: geo.City || 'Unknown',
      partyCount: parseInt(geo.PartyCount || 0),
      salesValue: parseFloat(geo.TotalSalesValue || 0),
      purchaseValue: parseFloat(geo.TotalPurchaseValue || 0),
      outstanding: parseFloat(geo.TotalOutstanding || 0),
      topCustomers: geo.TopCustomers || '-',
      topItems: geo.TopItems || '-',
    }));
  }, [geographicSummary]);

  const stateOptions = useMemo(() => {
    const states = [...new Set(geoData.map(d => d.state))].filter(Boolean).sort();
    return states;
  }, [geoData]);

  const filteredData = useMemo(() => {
    let result = geoData;

    if (selectedState) {
      result = result.filter(d => d.state === selectedState);
    }

    switch (sortBy) {
      case 'sales':
        result = [...result].sort((a, b) => b.salesValue - a.salesValue);
        break;
      case 'purchase':
        result = [...result].sort((a, b) => b.purchaseValue - a.purchaseValue);
        break;
      case 'outstanding':
        result = [...result].sort((a, b) => b.outstanding - a.outstanding);
        break;
      case 'customers':
        result = [...result].sort((a, b) => b.partyCount - a.partyCount);
        break;
    }

    return result;
  }, [geoData, sortBy, selectedState]);

  const summaryStats = useMemo(() => {
    const totalCities = geoData.length;
    const totalStates = new Set(geoData.map(d => d.state)).size;
    const totalSales = geoData.reduce((sum, d) => sum + d.salesValue, 0);
    const totalPurchase = geoData.reduce((sum, d) => sum + d.purchaseValue, 0);
    const totalOutstanding = geoData.reduce((sum, d) => sum + d.outstanding, 0);
    const totalCustomers = geoData.reduce((sum, d) => sum + d.partyCount, 0);

    return { totalCities, totalStates, totalSales, totalPurchase, totalOutstanding, totalCustomers };
  }, [geoData]);

  const formatCurrency = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const maxSales = Math.max(...filteredData.map(d => d.salesValue), 1);

  if (loading) {
    return (
      <motion.div className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <Skeleton variant="text" className="w-48 h-7" />
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
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Geographic Report</h1>
          <p className="text-sm text-ink-muted mt-1">Regional sales and customer distribution analysis</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-ink-muted">States</span>
            </div>
            <div className="text-lg font-bold text-ink-default">{summaryStats.totalStates}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-ink-muted">Cities</span>
            </div>
            <div className="text-lg font-bold text-ink-default">{summaryStats.totalCities}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-xs text-ink-muted">Customers</span>
            </div>
            <div className="text-lg font-bold text-ink-default">{summaryStats.totalCustomers}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-ink-muted">Total Sales</span>
            </div>
            <div className="text-lg font-bold text-green-700">{formatCurrency(summaryStats.totalSales)}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-ink-muted">Outstanding</span>
            </div>
            <div className="text-lg font-bold text-orange-700">{formatCurrency(summaryStats.totalOutstanding)}</div>
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
              <span className="text-sm text-ink-muted">State:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="text-sm border border-canvas-faint rounded-lg px-3 py-1.5 bg-white text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">All States</option>
                {stateOptions.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-canvas-faint rounded-lg px-3 py-1.5 bg-white text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="sales">By Sales</option>
                <option value="purchase">By Purchase</option>
                <option value="outstanding">By Outstanding</option>
                <option value="customers">By Customers</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-canvas-faint">
            {filteredData.map((row, idx) => {
              const salesPercent = (row.salesValue / maxSales) * 100;

              return (
                <motion.div
                  key={row.geoId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.02 }}
                  className="px-4 py-4 hover:bg-canvas-subtle"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-ink-muted flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-ink-default">{row.city}</span>
                          <span className="text-ink-muted ml-1">({row.state})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-ink-muted">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {row.partyCount} customers
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Sales: {formatCurrency(row.salesValue)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Outstanding: {formatCurrency(row.outstanding)}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-ink-faint">
                        Top Items: {row.topItems}
                      </div>
                    </div>

                    <div className="w-24 text-right">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(row.salesValue)}
                      </div>
                      <div className="w-full h-2 bg-canvas-faint rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(salesPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="px-4 py-3 border-t border-canvas-faint text-xs text-ink-muted">
            Showing {filteredData.length} of {geoData.length} locations
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GeographicReport;
