import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';
import useTallyTrends from '../../hooks/useTallyTrends';

const TrendCharts = () => {
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  const { vouchers, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');
  const tallyTrends = useTallyTrends();
  const trendVouchers = useMemo(() => tallyTrends ? [
    ...(tallyTrends.sales || []).map((row, index) => ({ VoucherID: `tally-sales-${index}`, VoucherDate: row.date, VoucherType: 'Sales', GrandTotal: row.amount })),
    ...(tallyTrends.purchases || []).map((row, index) => ({ VoucherID: `tally-purchase-${index}`, VoucherDate: row.date, VoucherType: 'Purchase', GrandTotal: row.amount })),
  ] : vouchers, [tallyTrends, vouchers]);

  const [chartType, setChartType] = useState('daily');
  const [viewMode, setViewMode] = useState('sales');

  const monthlyData = useMemo(() => {
    if (!trendVouchers) return [];

    const salesByMonth = {};
    const purchaseByMonth = {};

    const dateStart = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const dateEnd = dateRange.endDate ? new Date(dateRange.endDate) : null;

    trendVouchers.forEach(v => {
      const voucherDate = new Date(v.VoucherDate);
      if (dateStart && dateEnd) {
        if (voucherDate < dateStart || voucherDate > dateEnd) return;
      }

      const monthKey = `${voucherDate.getFullYear()}-${String(voucherDate.getMonth() + 1).padStart(2, '0')}`;
      const amount = parseFloat(v.GrandTotal || v.NetAmount || 0);

      if (v.VoucherType === 'Sales') {
        salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + amount;
      } else if (v.VoucherType === 'Purchase') {
        purchaseByMonth[monthKey] = (purchaseByMonth[monthKey] || 0) + amount;
      }
    });

    const allMonths = [...new Set([...Object.keys(salesByMonth), ...Object.keys(purchaseByMonth)])].sort();

    return allMonths.map(month => ({
      month,
      sales: salesByMonth[month] || 0,
      purchase: purchaseByMonth[month] || 0,
    }));
  }, [trendVouchers, dateRange]);

  const dailyData = useMemo(() => {
    if (!trendVouchers) return [];

    const salesByDay = {};
    const purchaseByDay = {};

    const dateStart = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const dateEnd = dateRange.endDate ? new Date(dateRange.endDate) : null;

    trendVouchers.forEach(v => {
      const voucherDate = new Date(v.VoucherDate);
      if (dateStart && dateEnd) {
        if (voucherDate < dateStart || voucherDate > dateEnd) return;
      }

      const dayKey = v.VoucherDate?.split('T')[0] || voucherDate.toISOString().split('T')[0];
      const amount = parseFloat(v.GrandTotal || v.NetAmount || 0);

      if (v.VoucherType === 'Sales') {
        salesByDay[dayKey] = (salesByDay[dayKey] || 0) + amount;
      } else if (v.VoucherType === 'Purchase') {
        purchaseByDay[dayKey] = (purchaseByDay[dayKey] || 0) + amount;
      }
    });

    const allDays = [...new Set([...Object.keys(salesByDay), ...Object.keys(purchaseByDay)])].sort();

    return allDays.slice(-30).map(day => ({
      day,
      sales: salesByDay[day] || 0,
      purchase: purchaseByDay[day] || 0,
    }));
  }, [trendVouchers, dateRange]);

  const summaryStats = useMemo(() => {
    const totalSales = (chartType === 'daily' ? dailyData : monthlyData).reduce((sum, d) => sum + d.sales, 0);
    const totalPurchase = (chartType === 'daily' ? dailyData : monthlyData).reduce((sum, d) => sum + d.purchase, 0);
    const grossProfit = totalSales - totalPurchase;
    const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    return { totalSales, totalPurchase, grossProfit, grossMargin };
  }, [dailyData, monthlyData, chartType]);

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

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
  };

  const formatDay = (dayKey) => {
    const date = new Date(dayKey);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const maxValue = useMemo(() => {
    const data = chartType === 'daily' ? dailyData : monthlyData;
    const values = viewMode === 'sales' 
      ? data.map(d => d.sales) 
      : viewMode === 'purchase' 
        ? data.map(d => d.purchase) 
        : data.map(d => Math.max(d.sales, d.purchase));
    return Math.max(...values, 1);
  }, [dailyData, monthlyData, chartType, viewMode]);

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

  const chartData = chartType === 'daily' ? dailyData : monthlyData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-canvas-default pb-20 md:pb-6"
    >
      <div className="px-4 py-4 md:px-6 md:py-6">
        <motion.div className="mb-6" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Sales & Purchase Trends</h1>
          <p className="text-sm text-ink-muted mt-1">Historical performance analysis</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span className="text-xs text-ink-muted">Total Sales</span>
            </div>
            <div className="text-lg font-bold text-teal-700">{formatCurrency(summaryStats.totalSales)}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span className="text-xs text-ink-muted">Total Purchase</span>
            </div>
            <div className="text-lg font-bold text-rose-700">{formatCurrency(summaryStats.totalPurchase)}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-ink-muted">Gross Profit</span>
            </div>
            <div className="text-lg font-bold text-indigo-700">{formatCurrency(summaryStats.grossProfit)}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-ink-muted">Gross Margin</span>
            </div>
            <div className="text-lg font-bold text-purple-700">{summaryStats.grossMargin.toFixed(1)}%</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-canvas-faint mb-6"
        >
          <div className="px-4 py-3 border-b border-canvas-faint flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">View:</span>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="text-sm border border-canvas-faint rounded-lg px-3 py-1.5 bg-white text-ink-default"
              >
                <option value="daily">Daily (Last 30 days)</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">Type:</span>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="text-sm border border-canvas-faint rounded-lg px-3 py-1.5 bg-white text-ink-default"
              >
                <option value="sales">Sales Only</option>
                <option value="purchase">Purchase Only</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div className="p-4">
            <div className="h-64 flex items-end gap-1">
              {chartData.map((d, idx) => {
                const salesHeight = (d.sales / maxValue) * 100;
                const purchaseHeight = (d.purchase / maxValue) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 min-w-[20px]">
                    <div className="w-full flex flex-col items-center" style={{ height: '200px' }}>
                      <div className="relative w-full h-full flex items-end justify-center gap-0.5">
                        {(viewMode === 'sales' || viewMode === 'both') && (
                          <div
                            className="w-1/2 bg-teal-500 rounded-t transition-all duration-300"
                            style={{ height: `${Math.min(salesHeight, 100)}%` }}
                            title={`Sales: ${formatCurrency(d.sales)}`}
                          />
                        )}
                        {(viewMode === 'purchase' || viewMode === 'both') && (
                          <div
                            className="w-1/2 bg-rose-500 rounded-t transition-all duration-300"
                            style={{ height: `${Math.min(purchaseHeight, 100)}%` }}
                            title={`Purchase: ${formatCurrency(d.purchase)}`}
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-ink-muted text-center truncate w-full">
                      {chartType === 'daily' ? formatDay(d.day) : formatMonth(d.month)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl border border-canvas-faint"
        >
          <div className="px-4 py-3 border-b border-canvas-faint">
            <h3 className="font-medium text-ink-default">Detailed Data</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas-subtle text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium text-right">Sales</th>
                  <th className="px-4 py-3 font-medium text-right">Purchase</th>
                  <th className="px-4 py-3 font-medium text-right">Gross Profit</th>
                  <th className="px-4 py-3 font-medium text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {chartData.map((d, idx) => {
                  const profit = d.sales - d.purchase;
                  const margin = d.sales > 0 ? (profit / d.sales) * 100 : 0;

                  return (
                    <tr key={idx} className="hover:bg-canvas-subtle">
                      <td className="px-4 py-3 font-medium">
                        {chartType === 'daily' ? formatDay(d.day) : formatMonth(d.month)}
                      </td>
                      <td className="px-4 py-3 text-right text-teal-600">{formatCurrency(d.sales)}</td>
                      <td className="px-4 py-3 text-right text-rose-600">{formatCurrency(d.purchase)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${profit >= 0 ? 'text-ink-default' : 'text-rose-600'}`}>
                        {formatCurrency(profit)}
                      </td>
                      <td className={`px-4 py-3 text-right ${margin >= 20 ? 'text-teal-600' : margin >= 10 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TrendCharts;
