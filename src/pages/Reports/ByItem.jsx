import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';

const ByItem = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  
  const { items: apiItems, vouchers, voucherLines, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

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
    const transactions = {};
    
    normalizedItems.forEach(item => {
      transactions[item.id] = {
        item: item,
        qtySold: 0,
        qtyPurchased: 0,
        salesValue: 0,
        purchaseValue: 0,
        count: 0,
        vouchers: []
      };
    });

    if (!vouchers || !voucherLines) {
      return Object.values(transactions).filter(t => t.count > 0).sort((a, b) => b.salesValue - a.salesValue);
    }
    
    const voucherMap = new Map();
    vouchers.forEach(v => {
      voucherMap.set(v.VoucherID, v);
    });

    const salesVoucherIds = new Set(
      vouchers
        .filter(v => v.VoucherType === 'Sales')
        .map(v => v.VoucherID)
    );

    const dateStart = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const dateEnd = dateRange.endDate ? new Date(dateRange.endDate) : null;

    voucherLines
      .filter(line => 
        line.LineType === 'Item' && 
        salesVoucherIds.has(line.VoucherID) &&
        line.ItemID
      )
      .forEach(line => {
        const parentVoucher = voucherMap.get(line.VoucherID);
        if (!parentVoucher) return;

        const voucherDate = new Date(parentVoucher.VoucherDate);
        if (dateStart && dateEnd) {
          if (voucherDate < dateStart || voucherDate > dateEnd) return;
        }

        const itemId = line.ItemID;
        const qty = parseFloat(line.Qty || 0);
        const amount = parseFloat(line.Amount || 0);
        
        if (transactions[itemId]) {
          transactions[itemId].qtySold += qty;
          transactions[itemId].salesValue += amount;
          transactions[itemId].count++;
          transactions[itemId].vouchers.push({
            id: line.VoucherID,
            date: parentVoucher.VoucherDate,
            voucherNo: parentVoucher.VoucherNo,
            type: parentVoucher.VoucherType,
            qty: qty,
            rate: parseFloat(line.Rate || 0),
            amount: amount,
            partyName: parentVoucher.PartyName || 'Cash/Bank'
          });
        }
      });

    return Object.values(transactions)
      .map(t => {
        t.vouchers.sort((a, b) => new Date(a.date) - new Date(b.date));
        return t;
      })
      .filter(t => t.count > 0)
      .sort((a, b) => b.salesValue - a.salesValue);
  }, [normalizedItems, vouchers, voucherLines, dateRange]);

  const [expandedItemId, setExpandedItemId] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-canvas-default pb-20 md:pb-6"
      >
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <Skeleton variant="text" className="w-48 h-7" />
          <div className="flex gap-2">
            <Skeleton variant="rounded" className="w-32 h-10 rounded-lg" />
            <Skeleton variant="rounded" className="w-32 h-10 rounded-lg" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" className="w-full h-16 rounded-lg" />
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
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-canvas-default pb-20 md:pb-6"
    >
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/reports')}
              className="p-2 hover:bg-canvas-faint rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">By Item</h1>
              <p className="text-sm text-ink-muted">Transactions grouped by item</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Items Sold</p>
            <p className="text-lg font-semibold text-ink-default">
              {itemTransactions.reduce((sum, t) => sum + t.count, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Qty</p>
            <p className="text-lg font-semibold text-ink-default">
              {formatNumber(itemTransactions.reduce((sum, t) => sum + t.qtySold, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Value</p>
            <p className="text-lg font-semibold text-brand-primary">
              {formatCurrency(itemTransactions.reduce((sum, t) => sum + t.salesValue, 0))}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-canvas-faint overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-canvas-faint border-b border-canvas-faint">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Item</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wide">Qty Sold</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wide">Transactions</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Sales Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Closing Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {itemTransactions.map((item, idx) => (
                  <React.Fragment key={item.item.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setExpandedItemId(expandedItemId === item.item.id ? null : item.item.id)}
                      className={`hover:bg-canvas-faint transition-colors cursor-pointer ${expandedItemId === item.item.id ? 'bg-canvas-faint' : ''}`}
                    >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-ink-default">{item.item.name}</p>
                      <p className="text-xs text-ink-muted">{item.item.category} • {item.item.hsnSac}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-ink-default">{formatNumber(item.qtySold)}</span>
                      <span className="text-xs text-ink-muted ml-1">{item.item.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-ink-default">{item.count}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-ink-default">{formatCurrency(item.salesValue)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${item.item.closingQty >= 0 ? 'text-ink-default' : 'text-rose-600'}`}>
                        {formatNumber(item.item.closingQty)} {item.item.unit}
                      </span>
                    </td>
                    </motion.tr>
                    {expandedItemId === item.item.id && (
                      <tr>
                        <td colSpan="5" className="px-0 py-0 bg-white">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-brand-50/30 border-y border-brand-100"
                          >
                            <div className="p-4 md:p-6">
                              <h4 className="text-sm font-semibold text-ink-default mb-3">Transaction History</h4>
                              <div className="bg-white rounded border border-canvas-faint overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-canvas-faint">
                                    <tr>
                                      <th className="px-4 py-2 text-left font-medium text-ink-muted">Date</th>
                                      <th className="px-4 py-2 text-left font-medium text-ink-muted">Voucher</th>
                                      <th className="px-4 py-2 text-left font-medium text-ink-muted">Party</th>
                                      <th className="px-4 py-2 text-right font-medium text-ink-muted">Qty</th>
                                      <th className="px-4 py-2 text-right font-medium text-ink-muted">Rate</th>
                                      <th className="px-4 py-2 text-right font-medium text-ink-muted">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-canvas-faint">
                                    {item.vouchers.map((v, vIdx) => (
                                      <tr key={`${v.id}-${vIdx}`} className="hover:bg-canvas-faint transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/voucher/${v.id}`); }}>
                                        <td className="px-4 py-2 text-ink-default whitespace-nowrap">
                                          {v.date ? new Date(v.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-4 py-2">
                                          <span className="text-brand-primary">{v.voucherNo}</span>
                                        </td>
                                        <td className="px-4 py-2 text-ink-muted truncate max-w-[150px]">{v.partyName}</td>
                                        <td className="px-4 py-2 text-right text-ink-default">{formatNumber(v.qty)} {item.item.unit}</td>
                                        <td className="px-4 py-2 text-right text-ink-muted">{formatCurrency(v.rate)}</td>
                                        <td className="px-4 py-2 text-right font-medium text-ink-default">{formatCurrency(v.amount)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {itemTransactions.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted">No items with transactions found</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ByItem;
