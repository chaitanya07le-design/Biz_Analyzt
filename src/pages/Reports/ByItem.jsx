import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyByItemFull from '../../hooks/useTallyByItemFull';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';

const ROWS_PER_PAGE = 20;

const ByItem = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  const [currentPage, setCurrentPage] = useState(1);
  
  const { items: apiItems, vouchers, voucherLines, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');
  const { data: tallyFull, loading: tallyFullLoading } = useTallyByItemFull();
  const tallyActive = tallyFull?.items && tallyFull.items.length > 0;

  const normalizedItems = useMemo(() => {
    if (!apiItems || apiItems.length === 0) return [];
    return apiItems.map(i => ({
      id: i.ItemID || i.id,
      name: i.ItemName || i.name || '',
      category: i.CategoryName || i.category || '',
      unit: i.Unit || i.unit || 'Nos',
      closingQty: parseFloat(i.ClosingQty || i.closingQty || 0),
      closingValue: parseFloat(i.ClosingValue || i.closingValue || 0),
    }));
  }, [apiItems]);

  const itemTransactions = useMemo(() => {
    if (tallyActive) {
      return tallyFull.items.map((t, i) => ({
        item: {
          id: t.itemName || `tally-byitem-${i}`,
          name: t.itemName || '—',
          category: '',
          unit: t.unit || '',
          closingQty: t.stockBalance || 0,
          closingValue: t.stockValue || 0,
          hsnSac: t.hsn || '',
        },
        qtySold: t.qtySold || 0,
        qtyPurchased: t.purchaseQty || 0,
        salesValue: t.salesValue || 0,
        purchaseValue: t.purchaseValue || 0,
        count: t.voucherCount || 0,
        vouchers: [],
        brand: t.brand || '',
        saleRate: t.saleRate || 0,
        gst: t.gst || '',
        itemGroup: t.itemGroup || '',
      })).sort((a, b) => b.salesValue - a.salesValue);
    }

    const transactions = {};
    normalizedItems.forEach(item => {
      transactions[item.id] = { item, qtySold: 0, qtyPurchased: 0, salesValue: 0, purchaseValue: 0, count: 0, vouchers: [] };
    });

    if (!vouchers || !voucherLines) {
      return Object.values(transactions).filter(t => t.count > 0).sort((a, b) => b.salesValue - a.salesValue);
    }
    
    const voucherMap = new Map();
    vouchers.forEach(v => { voucherMap.set(v.VoucherID, v); });
    const salesVoucherIds = new Set(vouchers.filter(v => v.VoucherType === 'Sales').map(v => v.VoucherID));
    const dateStart = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const dateEnd = dateRange.endDate ? new Date(dateRange.endDate) : null;

    voucherLines
      .filter(line => line.LineType === 'Item' && salesVoucherIds.has(line.VoucherID) && line.ItemID)
      .forEach(line => {
        const parentVoucher = voucherMap.get(line.VoucherID);
        if (!parentVoucher) return;
        const voucherDate = new Date(parentVoucher.VoucherDate);
        if (dateStart && dateEnd && (voucherDate < dateStart || voucherDate > dateEnd)) return;
        const itemId = line.ItemID;
        const qty = parseFloat(line.Qty || 0);
        const amount = parseFloat(line.Amount || 0);
        if (transactions[itemId]) {
          transactions[itemId].qtySold += qty;
          transactions[itemId].salesValue += amount;
          transactions[itemId].count++;
          transactions[itemId].vouchers.push({ id: line.VoucherID, date: parentVoucher.VoucherDate, voucherNo: parentVoucher.VoucherNo, type: parentVoucher.VoucherType, qty, rate: parseFloat(line.Rate || 0), amount, partyName: parentVoucher.PartyName || 'Cash/Bank' });
        }
      });

    return Object.values(transactions).map(t => { t.vouchers.sort((a, b) => new Date(a.date) - new Date(b.date)); return t; }).filter(t => t.count > 0).sort((a, b) => b.salesValue - a.salesValue);
  }, [normalizedItems, vouchers, voucherLines, dateRange, tallyActive, tallyFull]);

  const totalPages = Math.ceil(itemTransactions.length / ROWS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const pagedData = itemTransactions.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num);

  if ((loading || tallyFullLoading) && !tallyActive) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <Skeleton variant="text" className="w-48 h-7" />
          <Skeleton variant="rounded" className="w-32 h-10 rounded-lg" />
          {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} variant="rounded" className="w-full h-16 rounded-lg" />))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/reports')} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors">
              <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">By Item</h1>
              <p className="text-sm text-ink-muted">Transactions grouped by item</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Items</p>
            <p className="text-lg font-semibold text-ink-default">{itemTransactions.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Qty Sold</p>
            <p className="text-lg font-semibold text-ink-default">{formatNumber(itemTransactions.reduce((sum, t) => sum + t.qtySold, 0))}</p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Sales Value</p>
            <p className="text-lg font-semibold text-brand-primary">{formatCurrency(itemTransactions.reduce((sum, t) => sum + t.salesValue, 0))}</p>
          </div>
          {tallyActive && (
            <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
              <p className="text-xs text-ink-muted mb-1">Purchase Value</p>
              <p className="text-lg font-semibold text-ink-default">{formatCurrency(itemTransactions.reduce((sum, t) => sum + (t.purchaseValue || 0), 0))}</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-canvas-faint border-b border-canvas-faint">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Item</th>
                  {tallyActive && <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Brand</th>}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wide">Unit</th>
                  {tallyActive && <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Sale Rate</th>}
                  {tallyActive && <th className="px-4 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wide">GST</th>}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wide">Qty Sold</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wide">Vouchers</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Sales Value</th>
                  {tallyActive && <th className="px-4 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wide">Purchase Qty</th>}
                  {tallyActive && <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Purchase Value</th>}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Closing Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {pagedData.map((item, idx) => (
                  <React.Fragment key={item.item.id}>
                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                      onClick={() => setExpandedItemId(expandedItemId === item.item.id ? null : item.item.id)}
                      className={`hover:bg-canvas-faint transition-colors cursor-pointer ${expandedItemId === item.item.id ? 'bg-canvas-faint' : ''}`}>
                      <td className="px-4 py-3"><p className="text-sm font-medium text-ink-default">{item.item.name}</p>{tallyActive && <p className="text-xs text-ink-muted">{item.itemGroup || item.brand || ''}</p>}</td>
                      {tallyActive && <td className="px-4 py-3 text-sm text-ink-muted">{item.brand || '—'}</td>}
                      <td className="px-4 py-3 text-center text-sm text-ink-muted">{item.item.unit || (tallyActive ? item.unit : '—')}</td>
                      {tallyActive && <td className="px-4 py-3 text-right text-sm text-ink-default">{formatCurrency(item.saleRate || 0)}</td>}
                      {tallyActive && <td className="px-4 py-3 text-center text-sm text-ink-muted">{item.gst || '—'}</td>}
                      <td className="px-4 py-3 text-center"><span className="text-sm text-ink-default">{formatNumber(item.qtySold)}</span></td>
                      <td className="px-4 py-3 text-center"><span className="text-sm text-ink-default">{item.count}</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-sm font-medium text-ink-default">{formatCurrency(item.salesValue)}</span></td>
                      {tallyActive && <td className="px-4 py-3 text-center text-sm text-ink-muted">{formatNumber(item.qtyPurchased || 0)}</td>}
                      {tallyActive && <td className="px-4 py-3 text-right text-sm text-ink-muted">{formatCurrency(item.purchaseValue || 0)}</td>}
                      <td className="px-4 py-3 text-right"><span className={`text-sm font-medium ${item.item.closingQty >= 0 ? 'text-ink-default' : 'text-rose-600'}`}>{formatNumber(item.item.closingQty)}</span></td>
                    </motion.tr>
                    {expandedItemId === item.item.id && item.vouchers.length > 0 && (
                      <tr><td colSpan={tallyActive ? 12 : 5} className="px-0 py-0 bg-white">
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden bg-brand-50/30 border-y border-brand-100">
                          <div className="p-4 md:p-6">
                            <h4 className="text-sm font-semibold text-ink-default mb-3">Transaction History</h4>
                            <div className="bg-white rounded border border-canvas-faint overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-canvas-faint"><tr><th className="px-4 py-2 text-left font-medium text-ink-muted">Date</th><th className="px-4 py-2 text-left font-medium text-ink-muted">Voucher</th><th className="px-4 py-2 text-left font-medium text-ink-muted">Party</th><th className="px-4 py-2 text-right font-medium text-ink-muted">Qty</th><th className="px-4 py-2 text-right font-medium text-ink-muted">Rate</th><th className="px-4 py-2 text-right font-medium text-ink-muted">Amount</th></tr></thead>
                                <tbody className="divide-y divide-canvas-faint">
                                  {item.vouchers.map((v, vIdx) => (
                                    <tr key={`${v.id}-${vIdx}`} className="hover:bg-canvas-faint transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/voucher/${v.id}`); }}>
                                      <td className="px-4 py-2 text-ink-default whitespace-nowrap">{v.date ? new Date(v.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                                      <td className="px-4 py-2"><span className="text-brand-primary">{v.voucherNo}</span></td>
                                      <td className="px-4 py-2 text-ink-muted truncate max-w-[150px]">{v.partyName}</td>
                                      <td className="px-4 py-2 text-right text-ink-default">{formatNumber(v.qty)}</td>
                                      <td className="px-4 py-2 text-right text-ink-muted">{formatCurrency(v.rate)}</td>
                                      <td className="px-4 py-2 text-right font-medium text-ink-default">{formatCurrency(v.amount)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </motion.div>
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-canvas-faint flex items-center justify-between">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
                className="px-3 py-1.5 text-sm rounded-md border border-canvas-faint text-ink-muted hover:bg-canvas-faint disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Prev</button>
              <span className="text-sm text-ink-muted">Page {safePage} of {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                className="px-3 py-1.5 text-sm rounded-md border border-canvas-faint text-ink-muted hover:bg-canvas-faint disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next →</button>
            </div>
          )}

          {itemTransactions.length === 0 && (
            <div className="px-4 py-12 text-center"><p className="text-sm text-ink-muted">No items with transactions found</p></div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ByItem;