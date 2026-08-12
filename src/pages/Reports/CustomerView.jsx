import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { parties, salesVouchers, receiptVouchers } from '../../data/mockData';

const CustomerView = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const [startDate, setStartDate] = useState('2025-04-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { parties: apiParties, vouchers, loading, useMockData } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const normalizedParties = useMemo(() => {
    if (useMockData || !apiParties || apiParties.length === 0) return parties;
    return apiParties.map(p => ({
      id: p.PartyID || p.id,
      name: p.PartyName || p.name || '',
      type: p.PartyType || p.type || '',
      city: p.City || p.city || '',
    }));
  }, [apiParties, useMockData]);

  const normalizedVouchers = useMemo(() => {
    if (useMockData || !vouchers || vouchers.length === 0) {
      return { sales: salesVouchers, receipts: receiptVouchers };
    }
    const sales = vouchers.filter(v => v.VoucherType === 'Sales' || v.voucherType === 'Sales').map(v => ({
      id: v.VoucherID || v.id,
      partyId: v.PartyID || v.partyId,
      date: v.VoucherDate || v.date,
      netAmount: parseFloat(v.GrandTotal || v.netAmount || 0),
      outstanding: parseFloat(v.Outstanding || v.outstanding || 0),
    }));
    const receipts = vouchers.filter(v => v.VoucherType === 'Receipt' || v.voucherType === 'Receipt').map(v => ({
      id: v.VoucherID || v.id,
      partyId: v.PartyID || v.partyId,
      grossTotal: parseFloat(v.GrandTotal || v.grossTotal || 0),
    }));
    return { sales, receipts };
  }, [vouchers, useMockData]);

  const customerData = useMemo(() => {
    const customers = normalizedParties.filter(p => p.type === 'Sundry Debtors');
    const customerSummary = {};

    customers.forEach(customer => {
      customerSummary[customer.id] = {
        party: customer,
        totalSales: 0,
        totalReceipts: 0,
        outstanding: 0,
        transactionCount: 0,
        lastTransaction: null
      };
    });

    normalizedVouchers.sales.forEach(voucher => {
      if (customerSummary[voucher.partyId]) {
        customerSummary[voucher.partyId].totalSales += voucher.netAmount;
        customerSummary[voucher.partyId].transactionCount++;
        customerSummary[voucher.partyId].outstanding += voucher.outstanding || 0;
        if (!customerSummary[voucher.partyId].lastTransaction || new Date(voucher.date) > new Date(customerSummary[voucher.partyId].lastTransaction)) {
          customerSummary[voucher.partyId].lastTransaction = voucher.date;
        }
      }
    });

    normalizedVouchers.receipts.forEach(voucher => {
      if (customerSummary[voucher.partyId]) {
        customerSummary[voucher.partyId].totalReceipts += voucher.grossTotal;
      }
    });

    return Object.values(customerSummary)
      .filter(c => c.transactionCount > 0 || c.party.openingBalance > 0)
      .filter(c => c.party.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [normalizedParties, normalizedVouchers, searchQuery]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
          <Skeleton variant="rounded" className="w-full h-10 rounded-lg" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" className="w-full h-20 rounded-lg" />
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
              <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Customer View</h1>
              <p className="text-sm text-ink-muted">Customer-wise transaction summary</p>
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
        >
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-canvas-faint rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Total Sales</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Receipts</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-muted uppercase tracking-wide">Outstanding</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-ink-muted uppercase tracking-wide">Trans.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Last Trans.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {customerData.map((item, idx) => (
                  <motion.tr
                    key={item.party.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => navigate(`/outstanding/${item.party.id}`)}
                    className="hover:bg-canvas-faint cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-ink-default">{item.party.name}</p>
                      <p className="text-xs text-ink-muted">{item.party.city} • {item.party.gstin || 'No GST'}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-ink-default">{formatCurrency(item.totalSales)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-green-600">{formatCurrency(item.totalReceipts)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${item.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(item.outstanding)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-ink-default">{item.transactionCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-ink-muted">{formatDate(item.lastTransaction)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {customerData.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-ink-muted">No customers found</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Customers</p>
            <p className="text-lg font-semibold text-ink-default">{customerData.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Sales</p>
            <p className="text-lg font-semibold text-brand-primary">
              {formatCurrency(customerData.reduce((sum, c) => sum + c.totalSales, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Receipts</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(customerData.reduce((sum, c) => sum + c.totalReceipts, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Outstanding</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(customerData.reduce((sum, c) => sum + c.outstanding, 0))}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CustomerView;
