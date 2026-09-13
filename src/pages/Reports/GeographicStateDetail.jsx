import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building, Users, TrendingUp, DollarSign, ArrowLeft } from 'lucide-react';

const GeographicStateDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const { stateName, cities, aggregated, topProducts } = state;

  const formatCurrency = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value);
  };

  if (!stateName) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <p className="text-ink-muted">No state data available. <button onClick={() => navigate('/reports/geographic')} className="text-brand-primary hover:underline">Go back</button></p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-3">
          <button onClick={() => navigate('/reports/geographic')} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-ink-muted" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-ink-default">{stateName}</h1>
            <p className="text-sm text-ink-muted">
              {aggregated.totalCities} cities · {aggregated.totalCustomers} customers · Sales {formatCurrency(aggregated.totalSales)}
            </p>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><Building className="w-4 h-4 text-purple-600" /><span className="text-xs text-ink-muted">Cities</span></div>
            <div className="text-lg font-bold text-ink-default">{aggregated.totalCities}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-teal-600" /><span className="text-xs text-ink-muted">Customers</span></div>
            <div className="text-lg font-bold text-ink-default">{aggregated.totalCustomers}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-teal-600" /><span className="text-xs text-ink-muted">Sales</span></div>
            <div className="text-lg font-bold text-teal-700">{formatCurrency(aggregated.totalSales)}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-amber-600" /><span className="text-xs text-ink-muted">Purchase</span></div>
            <div className="text-lg font-bold text-ink-default">{formatCurrency(aggregated.totalPurchase)}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-amber-600" /><span className="text-xs text-ink-muted">Outstanding</span></div>
            <div className="text-lg font-bold text-amber-700">{formatCurrency(aggregated.totalOutstanding)}</div>
          </motion.div>
        </div>

        {/* Cities Table */}
        {(cities || []).length > 0 && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-canvas-faint overflow-hidden">
            <div className="px-4 py-3 border-b border-canvas-faint">
              <h2 className="font-semibold text-ink-default">City Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-canvas-faint text-ink-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">City</th>
                    <th className="px-4 py-3 text-right font-medium">Customers</th>
                    <th className="px-4 py-3 text-right font-medium">Sales</th>
                    <th className="px-4 py-3 text-right font-medium">Purchase</th>
                    <th className="px-4 py-3 text-right font-medium">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-faint">
                  {cities.sort((a, b) => b.salesValue - a.salesValue).map((city, idx) => (
                    <motion.tr key={city.geoId || idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + idx * 0.02 }} className="hover:bg-canvas-subtle">
                      <td className="px-4 py-3 font-medium text-ink-default">{city.city}</td>
                      <td className="px-4 py-3 text-right text-ink-default">{city.partyCount}</td>
                      <td className="px-4 py-3 text-right text-teal-700 font-medium">{formatCurrency(city.salesValue)}</td>
                      <td className="px-4 py-3 text-right text-ink-default">{formatCurrency(city.purchaseValue)}</td>
                      <td className="px-4 py-3 text-right text-amber-700 font-medium">{formatCurrency(city.outstanding)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Global Top Items from Template 81 */}
        {topProducts && topProducts.length > 0 && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl border border-canvas-faint overflow-hidden">
            <div className="px-4 py-3 border-b border-canvas-faint">
              <h2 className="font-semibold text-ink-default">Top Products</h2>
              <p className="text-xs text-ink-muted">Global top items (not per-state)</p>
            </div>
            <div className="divide-y divide-canvas-faint">
              {topProducts.slice(0, 10).map((product, idx) => (
                <div key={product.id || idx} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-ink-muted w-6">{idx + 1}</span>
                    <span className="text-sm font-medium text-ink-default">{product.name}</span>
                  </div>
                  <span className="text-sm font-medium text-teal-700">{formatCurrency(product.totalValue)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default GeographicStateDetail;