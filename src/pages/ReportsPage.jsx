import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReportCard from '../components/reports/ReportCard';
import { ReportCardSkeleton } from '../components/shared/ListSkeleton';
import Skeleton from '../components/shared/Skeleton';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const reports = [
    {
      id: 'balance-sheet',
      title: 'Balance Sheet',
      description: 'Assets vs Liabilities as of a date',
      icon: 'balance-sheet',
      path: '/reports/balance-sheet',
      disabled: false,
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss',
      description: 'Income vs Expenses for a period',
      icon: 'profit-loss',
      path: '/reports/profit-loss',
      disabled: false,
    },
    {
      id: 'day-book',
      title: 'Day Book',
      description: 'Chronological list of all vouchers',
      icon: 'day-book',
      path: '/reports/day-book',
      disabled: false,
    },
    {
      id: 'ledger',
      title: 'Ledger Report',
      description: 'Transaction history for a ledger',
      icon: 'ledger',
      path: '/reports/ledger',
      disabled: false,
    },
    {
      id: 'by-ledger',
      title: 'By Ledger',
      description: 'Transactions grouped by ledger',
      icon: 'ledger',
      path: '/reports/by-ledger',
      disabled: false,
    },
    {
      id: 'by-item',
      title: 'By Item',
      description: 'Transactions grouped by item',
      icon: 'item',
      path: '/reports/by-item',
      disabled: false,
    },
    {
      id: 'top',
      title: 'Top Report',
      description: 'Ranking by transaction volume',
      icon: 'top',
      path: '/reports/top',
      disabled: false,
    },
    {
      id: 'brands',
      title: 'Top Brands',
      description: 'Brand-wise sales and inventory',
      icon: 'brand',
      path: '/reports/brands',
      disabled: false,
    },
    {
      id: 'stock-aging',
      title: 'Stock Aging',
      description: 'FIFO aging with dead stock alerts',
      icon: 'aging',
      path: '/reports/stock-aging',
      disabled: false,
    },
    {
      id: 'stock-status',
      title: 'Stock Status',
      description: 'Overstock/Understock/Fast-mover',
      icon: 'stock',
      path: '/reports/stock-status',
      disabled: false,
    },
    {
      id: 'customer-movement',
      title: 'Customer Movement',
      description: 'Active/Dormant/Churned customers',
      icon: 'customer',
      path: '/reports/customer-movement',
      disabled: false,
    },
    {
      id: 'trends',
      title: 'Sales/Purchase Trends',
      description: 'Historical trend charts',
      icon: 'trend',
      path: '/reports/trends',
      disabled: false,
    },
    {
      id: 'geographic',
      title: 'Geographic Report',
      description: 'Region-wise sales analysis',
      icon: 'geo',
      path: '/reports/geographic',
      disabled: false,
    },
    {
      id: 'sync-log',
      title: 'Sync Log',
      description: 'Data sync history and status',
      icon: 'sync',
      path: '/reports/sync-log',
      disabled: false,
    },
    {
      id: 'expenses',
      title: 'Expenses',
      description: 'Direct and Indirect expense breakdown',
      icon: 'expense',
      path: '/reports/expenses',
      disabled: false,
    },
    {
      id: 'customer',
      title: 'Customer View',
      description: 'Customer-wise transaction summary',
      icon: 'customer',
      path: '/reports/customer',
      disabled: false,
    },
    {
      id: 'pending-purchase',
      title: 'Pending Purchase Orders',
      description: 'Unfulfilled purchase orders',
      icon: 'pending',
      path: '/purchase-order',
      disabled: false,
    },
    {
      id: 'pending-sales',
      title: 'Pending Sales Orders',
      description: 'Unfulfilled sales orders',
      icon: 'pending',
      path: '/sales-order',
      disabled: false,
    },
  ];

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportClick = (report) => {
    if (!report.disabled) {
      navigate(report.path);
    }
  };

  if (loading) {
    return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-slate-50 pb-20 md:pb-6 font-sans"
        >
          <div className="px-4 py-4 md:px-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <Skeleton variant="text" className="w-24 h-7" />
            <Skeleton variant="text" className="w-48 h-4 mt-2" />
          </div>

          <div className="mb-4">
            <Skeleton variant="rounded" className="w-full h-10 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 11 }).map((_, i) => (
              <ReportCardSkeleton key={i} />
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
      className="min-h-screen bg-slate-50 pb-20 md:pb-6 font-sans"
    >
      <div className="px-4 py-4 md:px-8 max-w-7xl mx-auto space-y-6">
        <motion.div
          className="bg-white p-6 rounded-2xl shadow-card border border-slate-100"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-900 tracking-tight">Reports</h1>
          <p className="text-sm font-medium text-kinetic-neutral mt-1">Financial and operational reports</p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl shadow-card border border-slate-100 p-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-kinetic-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-ink-900 placeholder-kinetic-neutral focus:outline-none focus:ring-2 focus:ring-kinetic-primary/20 focus:border-kinetic-primary transition-all"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredReports.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + idx * 0.03 }}
            >
              <ReportCard
                title={report.title}
                description={report.description}
                icon={report.icon}
                disabled={report.disabled}
                onClick={() => handleReportClick(report)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsPage;
