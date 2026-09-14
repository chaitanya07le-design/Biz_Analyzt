import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../components/shared/Skeleton';
import VoucherPagination, { DEFAULT_PAGE_SIZE } from '../../components/voucher/VoucherPagination';
import useTallyCustomerMovementRollup from '../../hooks/useTallyCustomerMovementRollup';
import useTallyOutstandingGroupView from '../../hooks/useTallyOutstandingGroupView';
import { useCompany } from '../../context/CompanyContext';
import { useDateRange } from '../../context/DateRangeContext';

const CustomerView = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange } = useDateRange();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const [tallyTxns, setTallyTxns] = useState(null);

  const tallyMovement = useTallyCustomerMovementRollup();
  const { receivables: groupReceivables, loading: outstandingLoading } = useTallyOutstandingGroupView();

  const loading = outstandingLoading || !tallyMovement;

  // Reset page on search change
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const customerData = useMemo(() => {
    if (!tallyMovement || !groupReceivables) return [];

    const nameIndex = new Map();
    const customerSummary = [];

    // Base from Outstanding (T91)
    groupReceivables.forEach(customer => {
      const normName = customer.partyName.toLowerCase().trim();
      const summary = {
        party: {
          id: customer.partyId,
          name: customer.partyName,
          type: 'Customer',
          city: '',
          state: '',
          pin: '',
          gstin: '',
          mobile: '',
          email: '',
          pan: '',
          creditLimit: customer.creditLimit || 0,
          creditDays: customer.creditDays || 0,
        },
        totalSales: 0,
        totalReceipts: 0,
        outstanding: customer.totalOutstanding || 0,
        transactionCount: 0,
        lastTransaction: null
      };
      nameIndex.set(normName, summary);
      customerSummary.push(summary);
    });

    // Enrich with Movement (T90)
    tallyMovement.forEach(movement => {
      if (movement.partyType !== 'Customer') return;
      const normName = movement.partyName.toLowerCase().trim();
      let found = nameIndex.get(normName);
      if (!found) {
        found = {
          party: {
            id: movement.partyId,
            name: movement.partyName,
            type: 'Customer',
            city: movement.city || '',
            state: movement.state || '',
          },
          totalSales: 0,
          totalReceipts: 0,
          outstanding: 0,
          transactionCount: 0,
          lastTransaction: null
        };
        customerSummary.push(found);
        nameIndex.set(normName, found);
      }
      
      found.totalSales = movement.totalSalesValue || 0;
      found.transactionCount = movement.transactionCount || 0;
      found.lastTransaction = movement.lastTransactionDate || null;
      if (movement.city) found.party.city = movement.city;
      if (movement.state) found.party.state = movement.state;
    });

    let result = customerSummary;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.party.name.toLowerCase().includes(q) ||
        (c.party.city || '').toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.totalSales - a.totalSales);
  }, [tallyMovement, groupReceivables, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(customerData.length / pageSize));
  const paginatedCustomers = customerData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
              <p className="text-sm text-ink-muted">Customer-wise transaction summary {tallyMovement && tallyMovement.length > 0 ? <span className="font-bold text-brand-primary">· LIVE TALLY</span> : ''}</p>
            </div>
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
                {paginatedCustomers.map((item, idx) => (
                  <motion.tr
                    key={item.party.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => navigate(`/outstanding/${encodeURIComponent(item.party.name)}`, {
                        state: {
                          fromOutstanding: true,
                          outstandingParty: item,
                          contactDetails: {
                            city: item.party.city || null,
                            gstin: item.party.gstin || null,
                            creditLimit: item.party.creditLimit || 0,
                            phone: item.party.mobile || null,
                            email: item.party.email || null,
                            address: item.party.address || null,
                            pan: item.party.pan || null,
                            creditDays: item.party.creditDays || 0,
                            salesPerson: item.party.salesPerson || null,
                            state: item.party.state || null,
                            pin: item.party.pin || null,
                            openingBalance: item.party.openingBalance || 0,
                          },
                        },
                      })}
                    className="hover:bg-canvas-faint cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-ink-default">{item.party.name}</p>
                      <p className="text-xs text-ink-muted">{[item.party.city, item.party.state].filter(Boolean).join(', ') || '—'} • {item.party.gstin || 'No GST'}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-ink-default">{formatCurrency(item.totalSales)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-teal-600">{formatCurrency(item.totalReceipts)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${item.outstanding > 0 ? 'text-rose-600' : 'text-teal-600'}`}>
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

        {customerData.length > 0 && (
          <VoucherPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={customerData.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}

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
            <p className="text-lg font-semibold text-teal-600">
              {formatCurrency(customerData.reduce((sum, c) => sum + c.totalReceipts, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-canvas-faint p-3 text-center">
            <p className="text-xs text-ink-muted mb-1">Total Outstanding</p>
            <p className="text-lg font-semibold text-rose-600">
              {formatCurrency(customerData.reduce((sum, c) => sum + c.outstanding, 0))}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CustomerView;
