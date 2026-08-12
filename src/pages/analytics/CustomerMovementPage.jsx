import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import Skeleton from '../../components/shared/Skeleton';

const CustomerMovementPage = () => {
  const { currentCompany } = useCompany();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  
  const { customerMovement, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const normalizedData = useMemo(() => {
    if (!customerMovement || customerMovement.length === 0) return [];
    
    return customerMovement.map(cust => ({
      movementId: cust.MovementID,
      partyId: cust.PartyID,
      partyName: cust.PartyName,
      partyType: cust.PartyType,
      firstTransactionDate: cust.FirstTransactionDate,
      lastTransactionDate: cust.LastTransactionDate,
      totalSalesValue: parseFloat(cust.TotalSalesValue) || 0,
      totalPurchaseValue: parseFloat(cust.TotalPurchaseValue) || 0,
      transactionCount: parseInt(cust.TransactionCount) || 0,
      daysSinceLastTxn: parseInt(cust.DaysSinceLastTxn) || 0,
      status: cust.Status,
      salesPerson: cust.SalesPerson || 'Unassigned',
      city: cust.City,
      state: cust.State,
    }));
  }, [customerMovement]);

  const states = useMemo(() => {
    const stateList = [...new Set(normalizedData.map(c => c.state))];
    return ['all', ...stateList.sort()];
  }, [normalizedData]);

  const filteredData = useMemo(() => {
    return normalizedData.filter(cust => {
      if (statusFilter !== 'all' && cust.status !== statusFilter) return false;
      if (stateFilter !== 'all' && cust.state !== stateFilter) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!cust.partyName.toLowerCase().includes(query) && 
            !cust.city.toLowerCase().includes(query) &&
            !cust.salesPerson.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [statusFilter, stateFilter, searchQuery, normalizedData]);

  const statusSummary = useMemo(() => {
    const summary = { Active: 0, Dormant: 0, Dead: 0, New: 0 };
    normalizedData.forEach(cust => {
      if (summary[cust.status] !== undefined) {
        summary[cust.status]++;
      }
    });
    return summary;
  }, [normalizedData]);

  const statusColors = {
    Active: 'bg-green-100 text-green-700 border-green-200',
    Dormant: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Dead: 'bg-red-100 text-red-700 border-red-200',
    New: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const totalSales = filteredData.reduce((sum, c) => sum + c.totalSalesValue, 0);
  const totalPurchases = filteredData.reduce((sum, c) => sum + c.totalPurchaseValue, 0);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <Skeleton variant="text" className="w-48 h-7" />
          <Skeleton variant="rounded" className="w-full h-96" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Customer Movement</h1>
          <p className="text-sm text-ink-muted mt-1">
            {filteredData.length} parties • Sales: ₹{totalSales.toLocaleString('en-IN')} • Purchases: ₹{totalPurchases.toLocaleString('en-IN')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(statusSummary).map(([status, count]) => (
            <motion.div
              key={status}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`rounded-lg border p-3 cursor-pointer transition-all ${
                statusFilter === status ? 'ring-2 ring-brand-primary' : 'hover:border-canvas-border'
              } ${statusColors[status]}`}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            >
              <p className="text-xs font-medium">{status}</p>
              <p className="text-xl font-semibold mt-1">{count}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-white rounded-lg border border-canvas-faint p-3 space-y-3">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, city, or salesperson..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-canvas-subtle border border-canvas-faint rounded-lg text-sm text-ink-default placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-1.5 bg-canvas-subtle border border-canvas-faint rounded-lg text-xs text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
            >
              {states.map(state => (
                <option key={state} value={state}>
                  {state === 'all' ? 'All States' : state}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle border-b border-canvas-faint">
                <tr>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Party</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Last Txn</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Salesperson</th>
                  <th className="text-right px-4 py-3 text-ink-muted font-medium">Sales</th>
                  <th className="text-right px-4 py-3 text-ink-muted font-medium">Purchases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {filteredData.map((cust, idx) => (
                  <motion.tr
                    key={cust.movementId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className="hover:bg-canvas-subtle transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-ink-default font-medium">{cust.partyName}</p>
                        <p className="text-ink-muted text-xs">{cust.city}, {cust.state}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{cust.partyType}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[cust.status]}`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted text-xs">{cust.lastTransactionDate}</td>
                    <td className="px-4 py-3 text-ink-muted text-xs">{cust.salesPerson}</td>
                    <td className="px-4 py-3 text-ink-default text-right">₹{cust.totalSalesValue.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-ink-default text-right">₹{cust.totalPurchaseValue.toLocaleString('en-IN')}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-ink-muted">No parties found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerMovementPage;
