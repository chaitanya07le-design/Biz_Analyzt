import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';

const TopReport = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  const [activeTab, setActiveTab] = useState('customers');
  
  const { parties: apiParties, vouchers, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const normalizedParties = useMemo(() => {
    if (!apiParties || apiParties.length === 0) return [];
    return apiParties.map(p => ({
      id: p.PartyID || p.id,
      name: p.PartyName || p.name || '',
      type: p.PartyType || p.type || '',
      city: p.City || p.city || '',
    }));
  }, [apiParties]);

  const normalizedVouchers = useMemo(() => {
    if (!vouchers || vouchers.length === 0) return [];
    let filteredVouchers = vouchers;
    if (dateRange.startDate && dateRange.endDate) {
      filteredVouchers = vouchers.filter(v => {
        const voucherDate = new Date(v.VoucherDate || v.date);
        return voucherDate >= new Date(dateRange.startDate) && voucherDate <= new Date(dateRange.endDate);
      });
    }
    return filteredVouchers.map(v => ({
      id: v.VoucherID || v.id,
      voucherNo: v.VoucherNo || v.voucherNo || '',
      date: v.VoucherDate || v.date,
      partyId: v.PartyID || v.partyId,
      partyName: v.PartyName || v.partyName || '',
      voucherType: v.VoucherType || v.voucherType || '',
      netAmount: parseFloat(v.GrandTotal || v.netAmount || 0),
      outstanding: parseFloat(v.Outstanding || v.outstanding || 0),
      status: v.Status || v.status || '',
    }));
  }, [vouchers, dateRange]);

  const topData = useMemo(() => {
    const customerData = {};
    const supplierData = {};

    const salesOnly = normalizedVouchers.filter(v => v.voucherType === 'Sales' || v.VoucherType === 'Sales');
    const purchaseOnly = normalizedVouchers.filter(v => v.voucherType === 'Purchase' || v.VoucherType === 'Purchase');

    const partyReceipts = {};
    normalizedVouchers.filter(v => v.voucherType === 'Receipt' || v.voucherType === 'Credit Note').forEach(v => {
      partyReceipts[v.partyId] = (partyReceipts[v.partyId] || 0) + v.netAmount;
    });

    const partyPayments = {};
    normalizedVouchers.filter(v => v.voucherType === 'Payment' || v.voucherType === 'Debit Note').forEach(v => {
      partyPayments[v.partyId] = (partyPayments[v.partyId] || 0) + v.netAmount;
    });

    salesOnly.forEach(voucher => {
      if (!customerData[voucher.partyId]) {
        customerData[voucher.partyId] = {
          party: normalizedParties.find(p => p.id === voucher.partyId),
          totalAmount: 0,
          transactionCount: 0,
          outstanding: 0
        };
      }
      customerData[voucher.partyId].totalAmount += voucher.netAmount;
      customerData[voucher.partyId].transactionCount++;
    });

    Object.keys(customerData).forEach(partyId => {
      const r = partyReceipts[partyId] || 0;
      // Outstanding = Total Sales - Receipts (capped at 0 for this basic report metric)
      customerData[partyId].outstanding = Math.max(0, customerData[partyId].totalAmount - r);
    });

    purchaseOnly.forEach(voucher => {
      if (!supplierData[voucher.partyId]) {
        supplierData[voucher.partyId] = {
          party: normalizedParties.find(p => p.id === voucher.partyId),
          totalAmount: 0,
          transactionCount: 0,
          outstanding: 0
        };
      }
      supplierData[voucher.partyId].totalAmount += voucher.netAmount;
      supplierData[voucher.partyId].transactionCount++;
    });

    Object.keys(supplierData).forEach(partyId => {
      const p = partyPayments[partyId] || 0;
      // Outstanding = Total Purchases - Payments
      supplierData[partyId].outstanding = Math.max(0, supplierData[partyId].totalAmount - p);
    });

    const topCustomers = Object.values(customerData)
      .filter(d => d.party)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    const topSuppliers = Object.values(supplierData)
      .filter(d => d.party)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    return { topCustomers, topSuppliers };
  }, [normalizedParties, normalizedVouchers]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const currentData = activeTab === 'customers' ? topData.topCustomers : topData.topSuppliers;

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
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">
                {activeTab === 'customers' ? 'Top Customers' : 'Top Suppliers'}
              </h1>
              <p className="text-sm text-ink-muted">Ranking by transaction volume</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-canvas-faint p-1"
        >
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'customers'
                  ? 'bg-brand-primary text-white'
                  : 'text-ink-muted hover:bg-canvas-faint'
              }`}
            >
              Top Customers
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-brand-primary text-white'
                  : 'text-ink-muted hover:bg-canvas-faint'
              }`}
            >
              Top Suppliers
            </button>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Party Name</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wide">Transactions</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Total Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {currentData.map((item, idx) => (
                  <motion.tr
                    key={item.party.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-canvas-faint transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        idx < 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold' : 'bg-canvas-faint text-ink-default'
                      }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-ink-default">{item.party.name}</p>
                      <p className="text-xs text-ink-muted">{item.party.city}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-ink-default">{item.transactionCount}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-ink-default">{formatCurrency(item.totalAmount)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${item.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(item.outstanding)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentData.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted">No data available</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TopReport;
