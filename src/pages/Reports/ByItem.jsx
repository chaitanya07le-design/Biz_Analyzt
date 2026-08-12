import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { items, salesVouchers } from '../../data/mockData';

const ByItem = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const [startDate, setStartDate] = useState('2025-04-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { items: apiItems, vouchers, loading, useMockData } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const normalizedItems = useMemo(() => {
    if (useMockData || !apiItems || apiItems.length === 0) return items;
    return apiItems.map(i => ({
      id: i.ItemID || i.id,
      name: i.ItemName || i.name || '',
      category: i.CategoryName || i.category || '',
      unit: i.Unit || i.unit || 'Nos',
      closingQty: parseFloat(i.ClosingQty || i.closingQty || 0),
      closingValue: parseFloat(i.ClosingValue || i.closingValue || 0),
    }));
  }, [apiItems, useMockData]);

  const itemTransactions = useMemo(() => {
    const transactions = {};
    
    normalizedItems.forEach(item => {
      transactions[item.id] = {
        item: item,
        qtySold: 0,
        qtyPurchased: 0,
        salesValue: 0,
        purchaseValue: 0,
        count: 0
      };
    });

    if (useMockData || !vouchers || vouchers.length === 0) {
      salesVouchers.forEach(voucher => {
        voucher.items?.forEach(lineItem => {
          if (transactions[lineItem.itemId]) {
            transactions[lineItem.itemId].qtySold += lineItem.qty;
            transactions[lineItem.itemId].salesValue += lineItem.amount;
            transactions[lineItem.itemId].count++;
          }
        });
      });
    } else {
      const salesVouchersOnly = vouchers.filter(v => 
        v.VoucherType === 'Sales' || v.voucherType === 'Sales'
      );
      salesVouchersOnly.forEach(voucher => {
        const itemId = voucher.ItemID || voucher.itemId;
        const qty = parseFloat(voucher.Quantity || voucher.qty || 0);
        const amount = parseFloat(voucher.Amount || voucher.amount || voucher.GrandTotal || 0);
        if (transactions[itemId]) {
          transactions[itemId].qtySold += qty;
          transactions[itemId].salesValue += amount;
          transactions[itemId].count++;
        }
      });
    }

    return Object.values(transactions)
      .filter(t => t.count > 0)
      .sort((a, b) => b.salesValue - a.salesValue);
  }, [normalizedItems, useMockData, vouchers]);

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
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-canvas-faint rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <span className="text-ink-muted">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-canvas-faint rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
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
                  <motion.tr
                    key={item.item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-canvas-faint transition-colors"
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
                      <span className={`text-sm font-medium ${item.item.closingQty >= 0 ? 'text-ink-default' : 'text-red-600'}`}>
                        {formatNumber(item.item.closingQty)} {item.item.unit}
                      </span>
                    </td>
                  </motion.tr>
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
