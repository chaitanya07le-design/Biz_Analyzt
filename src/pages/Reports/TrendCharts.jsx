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

  // MoM & YoY growth from monthlyData (already computed from T39+T40)
  const growthStats = useMemo(() => {
    if (!monthlyData || monthlyData.length < 2) return null;
    const sorted = [...monthlyData].sort((a, b) => a.month.localeCompare(b.month));
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    const momSales = previous.sales > 0 ? ((latest.sales - previous.sales) / previous.sales) * 100 : 0;
    const momPurchase = previous.purchase > 0 ? ((latest.purchase - previous.purchase) / previous.purchase) * 100 : 0;
    const avgMonthlySales = monthlyData.reduce((s, m) => s + m.sales, 0) / monthlyData.length;
    const avgMonthlyPurchase = monthlyData.reduce((s, m) => s + m.purchase, 0) / monthlyData.length;

    // YoY: compare latest month with same month 12 months ago
    const [y, mo] = latest.month.split('-');
    const prevYearMonth = `${parseInt(y) - 1}-${mo}`;
    const prevYearEntry = monthlyData.find(m => m.month === prevYearMonth);
    const yoySales = prevYearEntry && prevYearEntry.sales > 0 ? ((latest.sales - prevYearEntry.sales) / prevYearEntry.sales) * 100 : null;

    return { momSales, momPurchase, avgMonthlySales, avgMonthlyPurchase, yoySales, latestMonth: latest.month, previousMonth: previous.month };
  }, [monthlyData]);

  // YoY comparison table: each month vs same month 12 months prior
  const yoyData = useMemo(() => {
    if (!monthlyData || monthlyData.length < 13) return [];
    const byMonth = {};
    monthlyData.forEach(m => { byMonth[m.month] = m; });
    const current = monthlyData.filter(m => m.month >= '2025-04'); // last 12-24 months
    return current.map(m => {
      const [y, mo] = m.month.split('-');
      const prevMonth = `${parseInt(y) - 1}-${mo}`;
      const prev = byMonth[prevMonth];
      const yoySales = prev && prev.sales > 0 ? ((m.sales - prev.sales) / prev.sales) * 100 : null;
      const yoyPurchase = prev && prev.purchase > 0 ? ((m.purchase - prev.purchase) / prev.purchase) * 100 : null;
      return { month: m.month, salesThisYear: m.sales, salesLastYear: prev?.sales || 0, yoySales, purchaseThisYear: m.purchase, purchaseLastYear: prev?.purchase || 0, yoyPurchase };
    });
  }, [monthlyData]);

  // 3-month moving average for sales trend line
  const movingAverage = useMemo(() => {
    if (!monthlyData || monthlyData.length < 3) return [];
    const sorted = [...monthlyData].sort((a, b) => a.month.localeCompare(b.month));
    const result = [];
    for (let i = 2; i < sorted.length; i++) {
      const avg = (sorted[i-2].sales + sorted[i-1].sales + sorted[i].sales) / 3;
      result.push({ month: sorted[i].month, average: avg, actual: sorted[i].sales });
    }
    const maxAvg = Math.max(...result.map(r => r.average), 1);
    return result.map(r => ({ ...r, normAvg: r.average / maxAvg, normActual: r.actual / maxAvg }));
  }, [monthlyData]);

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
        <motion.div className="mb-6 flex items-center gap-3" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <button onClick={() => window.history.back()} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors">
            <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Sales & Purchase Trends</h1>
            <p className="text-sm text-ink-muted mt-1">Historical performance analysis</p>
          </div>
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

        {growthStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 border border-canvas-faint"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-ink-muted" />
                <span className="text-xs text-ink-muted">Avg Monthly Sales</span>
              </div>
              <div className="text-lg font-bold text-ink-default">{formatCurrency(growthStats.avgMonthlySales)}</div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.32 }}
              className="bg-white rounded-xl p-4 border border-canvas-faint"
            >
              <div className="flex items-center gap-2 mb-2">
                {growthStats.momSales >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
                <span className="text-xs text-ink-muted">MoM Sales Growth</span>
              </div>
              <div className={`text-lg font-bold ${growthStats.momSales >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
                {growthStats.momSales >= 0 ? '↑' : '↓'} {Math.abs(growthStats.momSales).toFixed(1)}%
              </div>
              <div className="text-xs text-ink-muted mt-1">{growthStats.previousMonth.slice(0,7)} → {growthStats.latestMonth.slice(0,7)}</div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.34 }}
              className="bg-white rounded-xl p-4 border border-canvas-faint"
            >
              <div className="flex items-center gap-2 mb-2">
                {growthStats.yoySales != null && growthStats.yoySales >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
                <span className="text-xs text-ink-muted">YoY Sales Growth</span>
              </div>
              <div className={`text-lg font-bold ${growthStats.yoySales != null && growthStats.yoySales >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
                {growthStats.yoySales != null
                  ? `${growthStats.yoySales >= 0 ? '↑' : '↓'} ${Math.abs(growthStats.yoySales).toFixed(1)}%`
                  : '—'}
              </div>
              <div className="text-xs text-ink-muted mt-1">vs 12 months ago</div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.36 }}
              className="bg-white rounded-xl p-4 border border-canvas-faint"
            >
              <div className="flex items-center gap-2 mb-2">
                {growthStats.momPurchase >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                )}
                <span className="text-xs text-ink-muted">MoM Purchase</span>
              </div>
              <div className={`text-lg font-bold ${growthStats.momPurchase >= 0 ? 'text-amber-700' : 'text-rose-700'}`}>
                {growthStats.momPurchase >= 0 ? '↑' : '↓'} {Math.abs(growthStats.momPurchase).toFixed(1)}%
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.38 }}
              className="bg-white rounded-xl p-4 border border-canvas-faint"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-ink-muted">Latest Month</span>
              </div>
              <div className="text-lg font-bold text-ink-default">{formatMonth(growthStats.latestMonth)}</div>
              <div className="text-xs text-ink-muted mt-1">Sales: {formatCurrency(monthlyData[monthlyData.length - 1]?.sales || 0)}</div>
            </motion.div>
          </div>
        )}

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

          <div className="p-4 overflow-x-auto">
            <div className="h-64 flex items-end gap-1 min-w-max">
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

        {movingAverage.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-xl border border-canvas-faint mb-6"
          >
            <div className="px-4 py-3 border-b border-canvas-faint">
              <h3 className="font-medium text-ink-default">3-Month Sales Moving Average</h3>
              <p className="text-xs text-ink-muted">Trend line smoothing monthly fluctuations</p>
            </div>
            <div className="p-4 overflow-x-auto">
              <div className="flex items-end gap-4 min-w-max">
                <div className="text-xs text-ink-muted flex flex-col justify-between h-48 py-2">
                  <span>100%</span><span>50%</span><span>0%</span>
                </div>
                <svg className="flex-1 h-48" viewBox={`0 0 ${movingAverage.length * 20 + 20} 100`} preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="25" x2={movingAverage.length * 20 + 20} y2="25" stroke="#e5e7eb" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2={movingAverage.length * 20 + 20} y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
                  <line x1="0" y1="75" x2={movingAverage.length * 20 + 20} y2="75" stroke="#e5e7eb" strokeWidth="0.5" />

                  {/* Moving average line */}
                  <polyline
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    points={movingAverage.map((m, i) => `${i * 20 + 10},${100 - m.normAvg * 100}`).join(' ')}
                  />

                  {/* Actual dots */}
                  {movingAverage.map((m, i) => (
                    <circle key={i} cx={i * 20 + 10} cy={100 - m.normActual * 100} r="2" fill="#8b5cf6" opacity="0.3" />
                  ))}
                </svg>
              </div>
              <div className="flex gap-4 mt-2 items-center justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full bg-brand-600" />
                  <span className="text-xs text-ink-muted">3-Mo Moving Avg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-600 opacity-30" />
                  <span className="text-xs text-ink-muted">Actual Sales</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

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

        {yoyData.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-canvas-faint mt-6"
          >
            <div className="px-4 py-3 border-b border-canvas-faint">
              <h3 className="font-medium text-ink-default">Year-over-Year Comparison</h3>
              <p className="text-xs text-ink-muted">Monthly performance vs same month last year</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas-subtle text-ink-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Month</th>
                    <th className="px-4 py-3 font-medium text-right">This Year Sales</th>
                    <th className="px-4 py-3 font-medium text-right">Last Year Sales</th>
                    <th className="px-4 py-3 font-medium text-right">YoY Change</th>
                    <th className="px-4 py-3 font-medium text-right">This Year Purchase</th>
                    <th className="px-4 py-3 font-medium text-right">Last Year Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-faint">
                  {yoyData.map((d, idx) => (
                    <tr key={idx} className="hover:bg-canvas-subtle">
                      <td className="px-4 py-3 font-medium">{formatMonth(d.month)}</td>
                      <td className="px-4 py-3 text-right text-teal-600">{formatCurrency(d.salesThisYear)}</td>
                      <td className="px-4 py-3 text-right text-ink-muted">{formatCurrency(d.salesLastYear)}</td>
                      <td className="px-4 py-3 text-right">
                        {d.yoySales != null ? (
                          <span className={`font-medium ${d.yoySales >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                            {d.yoySales >= 0 ? '▲' : '▼'} {Math.abs(d.yoySales).toFixed(1)}%
                          </span>
                        ) : <span className="text-ink-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-rose-600">{formatCurrency(d.purchaseThisYear)}</td>
                      <td className="px-4 py-3 text-right text-ink-muted">{formatCurrency(d.purchaseLastYear)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TrendCharts;
