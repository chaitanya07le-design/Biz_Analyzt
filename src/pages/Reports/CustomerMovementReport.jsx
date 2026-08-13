import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, TrendingDown, UserX, Clock } from 'lucide-react';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';

const CustomerMovementReport = () => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { customerMovement, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const movementData = useMemo(() => {
    if (!customerMovement) return [];

    return customerMovement.map(cm => ({
      partyId: cm.PartyID,
      partyName: cm.PartyName || 'Unknown',
      partyType: cm.PartyType || 'Customer',
      firstTxn: cm.FirstTransactionDate,
      lastTxn: cm.LastTransactionDate,
      salesValue: parseFloat(cm.TotalSalesValue || 0),
      purchaseValue: parseFloat(cm.TotalPurchaseValue || 0),
      txnCount: parseInt(cm.TransactionCount || 0),
      daysSinceLastTxn: Math.abs(parseInt(cm.DaysSinceLastTxn || 0)),
      status: cm.Status || 'Active',
      salesPerson: cm.SalesPerson || '-',
      city: cm.City || '-',
      state: cm.State || '-',
    }));
  }, [customerMovement]);

  const filteredData = useMemo(() => {
    let result = movementData;

    if (statusFilter !== 'all') {
      result = result.filter(d => d.status.toLowerCase() === statusFilter.toLowerCase());
    }

    switch (sortBy) {
      case 'recent':
        result = [...result].sort((a, b) => a.daysSinceLastTxn - b.daysSinceLastTxn);
        break;
      case 'oldest':
        result = [...result].sort((a, b) => b.daysSinceLastTxn - a.daysSinceLastTxn);
        break;
      case 'value':
        result = [...result].sort((a, b) => b.salesValue - a.salesValue);
        break;
      case 'frequency':
        result = [...result].sort((a, b) => b.txnCount - a.txnCount);
        break;
    }

    return result;
  }, [movementData, statusFilter, sortBy]);

  const summaryStats = useMemo(() => {
    const total = movementData.length;
    const active = movementData.filter(d => d.status === 'Active').length;
    const dormant = movementData.filter(d => d.status === 'Dormant').length;
    const churned = movementData.filter(d => d.status === 'Churned' || d.daysSinceLastTxn > 60).length;
    const totalSales = movementData.reduce((sum, d) => sum + d.salesValue, 0);
    const avgTxn = total > 0 ? movementData.reduce((sum, d) => sum + d.txnCount, 0) / total : 0;

    return { total, active, dormant, churned, totalSales, avgTxn };
  }, [movementData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const statusColors = {
    'Active': 'bg-teal-light text-teal-700',
    'Dormant': 'bg-amber-light text-amber-700',
    'Churned': 'bg-rose-light text-rose-700',
  };

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-canvas-default pb-20 md:pb-6"
    >
      <div className="px-4 py-4 md:px-6 md:py-6">
        <motion.div className="mb-6" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Customer Movement Analysis</h1>
          <p className="text-sm text-ink-muted mt-1">Track customer activity, dormancy, and churn patterns</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-ink-muted">Total Customers</span>
            </div>
            <div className="text-lg font-bold text-ink-default">{summaryStats.total}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl p-4 border border-teal-200 bg-teal-light"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span className="text-xs text-ink-muted">Active</span>
            </div>
            <div className="text-lg font-bold text-teal-700">{summaryStats.active}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-light"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-ink-muted">Dormant</span>
            </div>
            <div className="text-lg font-bold text-amber-700">{summaryStats.dormant}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl p-4 border border-rose-200 bg-rose-light"
          >
            <div className="flex items-center gap-2 mb-2">
              <UserX className="w-4 h-4 text-rose-600" />
              <span className="text-xs text-ink-muted">Churned/At Risk</span>
            </div>
            <div className="text-lg font-bold text-rose-700">{summaryStats.churned}</div>
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
              <span className="text-sm text-ink-muted">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-canvas-faint rounded-lg px-3 py-1.5 bg-white text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="dormant">Dormant</option>
                <option value="churned">Churned</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-canvas-faint rounded-lg px-3 py-1.5 bg-white text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="value">Highest Value</option>
                <option value="frequency">Most Transactions</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas-subtle text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Last Transaction</th>
                  <th className="px-4 py-3 font-medium">Days Since</th>
                  <th className="px-4 py-3 font-medium text-right">Sales Value</th>
                  <th className="px-4 py-3 font-medium">Txns</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Sales Person</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {filteredData.map((row, idx) => (
                  <motion.tr
                    key={row.partyId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    className="hover:bg-canvas-subtle cursor-pointer"
                    onClick={() => navigate(`/outstanding/${row.partyId}`)}
                  >
                    <td className="px-4 py-3 font-medium text-ink-default">{row.partyName}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.city}, {row.state}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(row.lastTxn)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${row.daysSinceLastTxn > 60 ? 'text-rose-600' : row.daysSinceLastTxn > 30 ? 'text-amber-600' : 'text-teal-600'}`}>
                        {row.daysSinceLastTxn}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.salesValue)}</td>
                    <td className="px-4 py-3">{row.txnCount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.status] || 'bg-gray-100'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{row.salesPerson}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-canvas-faint text-xs text-ink-muted">
            Showing {filteredData.length} of {movementData.length} customers
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CustomerMovementReport;
