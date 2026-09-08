import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Package, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyTopBrands from '../../hooks/useTallyTopBrands';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';

const TopBrands = () => {
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  const { items, vouchers, voucherLines, itemStockStatus, loading: gsLoading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');
  const { brands: tallyBrands, brandTransactions: tallyTransactions } = useTallyTopBrands();

  const [sortBy, setSortBy] = useState('sales');
  const [limit, setLimit] = useState(10);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const tallyActive = tallyBrands && tallyBrands.length > 0;
  const tallyTxnKeys = tallyTransactions ? Object.keys(tallyTransactions) : [];
  console.log('[TopBrands] tallyActive:', tallyActive, 'brands:', tallyBrands?.length, 'txn keys:', tallyTxnKeys.length);
  if (tallyActive) console.log('[TopBrands] first brand:', tallyBrands[0]?.brand, 'has txns:', tallyTxnKeys.includes(tallyBrands[0]?.brand));

  const brandData = useMemo(() => {
    if (tallyActive) {
      return tallyBrands.map((b) => ({
        brand: b.brand || '—',
        itemCount: b.itemCount || 1,
        totalStock: 0,
        stockValue: b.stockValue || 0,
        salesValue: b.salesValue || 0,
        salesQty: b.salesQty || 0,
        purchaseValue: 0,
        purchaseQty: 0,
        topItem: b.topItem || '—',
        salesVelocity30d: b.salesVelocity30d || 0,
        voucherCount: b.voucherCount || 0,
        avgRate: b.avgRate || 0,
      }));
    }

    if (!items || items.length === 0) return [];

    const brands = {};

    items.forEach(item => {
      const brand = item.Brand || 'Generic';
      if (!brands[brand]) {
        brands[brand] = {
          brand,
          itemCount: 0,
          totalStock: 0,
          stockValue: 0,
          salesValue: 0,
          salesQty: 0,
          purchaseValue: 0,
          purchaseQty: 0,
          voucherCount: 0,
          avgRate: 0,
        };
      }
      brands[brand].itemCount += 1;
      brands[brand].totalStock += parseFloat(item.OpeningStock || 0);
    });

    if (itemStockStatus && itemStockStatus.length > 0) {
      itemStockStatus.forEach(status => {
        const item = items.find(i => i.ItemID === status.ItemID);
        if (item) {
          const brand = item.Brand || 'Generic';
          if (brands[brand]) {
            brands[brand].stockValue += parseFloat(status.StockValue || 0);
          }
        }
      });
    }

    if (vouchers && voucherLines) {
      const salesVoucherIds = new Set(vouchers.filter(v => v.VoucherType === 'Sales').map(v => v.VoucherID));
      const purchaseVoucherIds = new Set(vouchers.filter(v => v.VoucherType === 'Purchase').map(v => v.VoucherID));
      const dateStart = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const dateEnd = dateRange.endDate ? new Date(dateRange.endDate) : null;
      const voucherMap = new Map();
      vouchers.forEach(v => voucherMap.set(v.VoucherID, v));

      voucherLines.forEach(line => {
        if (line.LineType !== 'Item' || !line.ItemID) return;
        const parentVoucher = voucherMap.get(line.VoucherID);
        if (!parentVoucher) return;
        const voucherDate = new Date(parentVoucher.VoucherDate);
        if (dateStart && dateEnd && (voucherDate < dateStart || voucherDate > dateEnd)) return;
        const item = items.find(i => i.ItemID === line.ItemID);
        if (!item) return;
        const brand = item.Brand || 'Generic';
        if (!brands[brand]) return;
        const qty = parseFloat(line.Qty || 0);
        const amount = parseFloat(line.Amount || 0);
        if (salesVoucherIds.has(line.VoucherID)) {
          brands[brand].salesValue += amount;
          brands[brand].salesQty += qty;
        } else if (purchaseVoucherIds.has(line.VoucherID)) {
          brands[brand].purchaseValue += amount;
          brands[brand].purchaseQty += qty;
        }
      });
    }

    return Object.values(brands);
  }, [tallyActive, tallyBrands, items, vouchers, voucherLines, itemStockStatus, dateRange]);

  const brandItems = useMemo(() => {
    if (tallyActive && tallyTransactions) {
      console.log('[TopBrands brandItems] using tallyTransactions, keys:', Object.keys(tallyTransactions).length);
      return tallyTransactions;
    }
    console.log('[TopBrands brandItems] falling back to Google Sheets, tallyActive:', tallyActive, 'tallyTransactions:', !!tallyTransactions);

    if (!items) return {};
    const result = {};
    const voucherMap = new Map();
    if (vouchers) vouchers.forEach(v => voucherMap.set(v.VoucherID, v));
    const salesVoucherIds = new Set(vouchers ? vouchers.filter(v => v.VoucherType === 'Sales').map(v => v.VoucherID) : []);
    const dateStart = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const dateEnd = dateRange.endDate ? new Date(dateRange.endDate) : null;

    const itemSales = {};
    if (voucherLines) {
      voucherLines.forEach(line => {
        if (line.LineType !== 'Item' || !line.ItemID) return;
        if (!salesVoucherIds.has(line.VoucherID)) return;
        const pv = voucherMap.get(line.VoucherID);
        if (!pv) return;
        const vd = new Date(pv.VoucherDate);
        if (dateStart && dateEnd && (vd < dateStart || vd > dateEnd)) return;
        if (!itemSales[line.ItemID]) itemSales[line.ItemID] = { salesValue: 0, salesQty: 0 };
        itemSales[line.ItemID].salesValue += parseFloat(line.Amount || 0);
        itemSales[line.ItemID].salesQty += parseFloat(line.Qty || 0);
      });
    }

    items.forEach(item => {
      const brand = item.Brand || 'Generic';
      if (!result[brand]) result[brand] = [];
      const s = itemSales[item.ItemID] || { salesValue: 0, salesQty: 0 };
      const stockItem = itemStockStatus ? itemStockStatus.find(ss => ss.ItemID === item.ItemID) : null;
      result[brand].push({
        id: item.ItemID,
        name: item.ItemName || item.ItemID,
        category: item.CategoryName || '-',
        unit: item.Unit || 'Pcs',
        closingQty: parseFloat(item.ClosingQty || 0),
        stockValue: parseFloat(stockItem?.StockValue || 0),
        salesValue: s.salesValue,
        salesQty: s.salesQty,
      });
    });

    return result;
  }, [tallyActive, tallyTransactions, items, vouchers, voucherLines, itemStockStatus, dateRange]);

  const sortedBrands = useMemo(() => {
    const sorted = [...brandData];
    switch (sortBy) {
      case 'sales': return sorted.sort((a, b) => b.salesValue - a.salesValue);
      case 'vouchers': return sorted.sort((a, b) => b.voucherCount - a.voucherCount);
      case 'stock': return sorted.sort((a, b) => b.stockValue - a.stockValue);
      case 'margin': return sorted.sort((a, b) => {
        const mA = a.salesValue > 0 ? ((a.salesValue - a.purchaseValue) / a.salesValue) * 100 : 0;
        const mB = b.salesValue > 0 ? ((b.salesValue - b.purchaseValue) / b.salesValue) * 100 : 0;
        return mB - mA;
      });
      default: return sorted;
    }
  }, [brandData, sortBy]);

  const topBrands = sortedBrands.slice(0, limit);
  const totalSales = brandData.reduce((sum, b) => sum + b.salesValue, 0);
  const totalItems = brandData.reduce((sum, b) => sum + b.itemCount, 0);

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value);
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (gsLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <Skeleton variant="text" className="w-40 h-7" />
          <Skeleton variant="text" className="w-64 h-4 mt-2" />
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" className="h-24" />)}
          </div>
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" className="h-16" />)}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <div className="px-4 py-4 md:px-6 md:py-6">
        <motion.div className="mb-6" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Top Brands</h1>
          <p className="text-sm text-ink-muted mt-1">Brand-wise sales performance and inventory analysis</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-teal-600" /><span className="text-xs text-ink-muted">Total Sales</span></div>
            <div className="text-lg font-bold text-ink-default">{formatCurrency(totalSales)}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-2"><Package className="w-4 h-4 text-indigo-600" /><span className="text-xs text-ink-muted">Total Items</span></div>
            <div className="text-lg font-bold text-ink-default">{formatNumber(totalItems)}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-2"><Award className="w-4 h-4 text-purple-600" /><span className="text-xs text-ink-muted">Brands</span></div>
            <div className="text-lg font-bold text-ink-default">{brandData.length}</div>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl p-4 border border-canvas-faint">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-amber-600" /><span className="text-xs text-ink-muted">Avg Sales/Brand</span></div>
            <div className="text-lg font-bold text-ink-default">{formatCurrency(totalSales / Math.max(brandData.length, 1))}</div>
          </motion.div>
        </div>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-canvas-faint mb-6">
          <div className="px-4 py-3 border-b border-canvas-faint flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-canvas-faint rounded-lg px-3 py-1.5 bg-white text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary">
                <option value="sales">Sales Value</option>
                <option value="vouchers">Voucher Count</option>
                {!tallyActive && <option value="stock">Stock Value</option>}
                {!tallyActive && <option value="margin">Margin %</option>}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">Show:</span>
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="text-sm border border-canvas-faint rounded-lg px-3 py-1.5 bg-white text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary">
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={brandData.length}>All</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-canvas-faint">
            {topBrands.map((brand, idx) => {
              const salesPercent = totalSales > 0 ? (brand.salesValue / totalSales) * 100 : 0;
              const txnRows = brandItems[brand.brand] || [];
              {selectedBrand === brand.brand && console.log('[TopBrands drill-down] brand:', brand.brand, 'txnRows:', txnRows.length)}
              return (
                <React.Fragment key={brand.brand}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.03 }}
                    className={`px-4 py-4 hover:bg-canvas-subtle cursor-pointer ${selectedBrand === brand.brand ? 'bg-canvas-faint/50' : ''}`}
                    onClick={() => setSelectedBrand(selectedBrand === brand.brand ? null : brand.brand)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-canvas-faint text-ink-muted'}`}>
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink-default">{brand.brand}</span>
                          <span className="text-xs text-ink-faint bg-canvas-faint px-2 py-0.5 rounded-full">
                            {tallyActive ? `${txnRows.length} txns` : `${brand.itemCount} items`}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-ink-muted">
                          <span>Sales: {formatCurrency(brand.salesValue)}</span>
                          {tallyActive && brand.voucherCount > 0 && <span>Vouchers: {brand.voucherCount}</span>}
                          {!tallyActive && <span>Stock: {formatCurrency(brand.stockValue)}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-ink-default">{salesPercent.toFixed(1)}%</div>
                        <div className="w-20 h-2 bg-canvas-faint rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-brand-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(salesPercent, 100)}%` }} />
                        </div>
                      </div>
                      <div className="text-ink-muted ml-2">
                        {selectedBrand === brand.brand ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </motion.div>

                  {selectedBrand === brand.brand && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-canvas-faint bg-canvas-faint/40 px-4 py-4"
                    >
                      <h4 className="text-sm font-semibold text-ink-default mb-3">{brand.brand} — Sales Transactions</h4>
                      {txnRows.length === 0 ? (
                        <div className="bg-white rounded-lg border border-canvas-faint p-6 text-center text-ink-muted text-sm">No transaction details available</div>
                      ) : (
                        <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-canvas-faint">
                              <tr>
                                <th className="px-4 py-2 text-left font-medium text-ink-muted">Date</th>
                                <th className="px-4 py-2 text-left font-medium text-ink-muted">Party</th>
                                <th className="px-4 py-2 text-left font-medium text-ink-muted">Voucher</th>
                                <th className="px-4 py-2 text-right font-medium text-ink-muted">Qty</th>
                                <th className="px-4 py-2 text-right font-medium text-ink-muted">Rate</th>
                                <th className="px-4 py-2 text-right font-medium text-ink-muted">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-canvas-faint">
                              {txnRows.map((row, ri) => (
                                <tr key={ri} className="hover:bg-canvas-faint transition-colors">
                                  <td className="px-4 py-2 text-ink-default">{formatDate(row.date)}</td>
                                  <td className="px-4 py-2 text-ink-default">{row.partyName || '—'}</td>
                                  <td className="px-4 py-2 text-ink-muted">{row.voucherNo || '—'}</td>
                                  <td className="px-4 py-2 text-right text-ink-default">{formatNumber(row.qty)}</td>
                                  <td className="px-4 py-2 text-right text-ink-default">{formatCurrency(row.rate)}</td>
                                  <td className="px-4 py-2 text-right font-medium text-ink-default">{formatCurrency(row.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TopBrands;