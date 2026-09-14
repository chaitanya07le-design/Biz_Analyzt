import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReportCard from '../components/reports/ReportCard';
import { ReportCardSkeleton } from '../components/shared/ListSkeleton';

const MastersPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const items = [
    {
      id: 'parties',
      title: 'Parties',
      description: 'Manage customers and suppliers',
      icon: 'customer',
      path: '/masters/parties',
      disabled: false,
    },
    {
      id: 'items',
      title: 'Items',
      description: 'Manage inventory items',
      icon: 'item',
      path: '/masters/items',
      disabled: false,
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Item classifications',
      icon: 'brand',
      path: '/masters/categories',
      disabled: false,
    },
    {
      id: 'groups',
      title: 'Groups',
      description: 'Ledger groups',
      icon: 'ledger',
      path: '/masters/groups',
      disabled: false,
    },
    {
      id: 'ledgers',
      title: 'Ledgers',
      description: 'Chart of accounts',
      icon: 'ledger',
      path: '/masters/ledgers',
      disabled: false,
    },
    {
      id: 'accounts',
      title: 'Bank & Cash',
      description: 'Manage liquid accounts',
      icon: 'balance-sheet',
      path: '/masters/accounts',
      disabled: false,
    },
  ];

  const filteredItems = items.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item) => {
    if (!item.disabled) {
      navigate(item.path);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-slate-50 pb-20 md:pb-6 font-sans"
      >
        <div className="px-4 py-4 md:px-8 max-w-7xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
            <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-64 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-900 tracking-tight">Masters</h1>
          <p className="text-sm font-medium text-kinetic-neutral mt-1">Manage master data and entities</p>
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
              placeholder="Search masters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-ink-900 placeholder-kinetic-neutral focus:outline-none focus:ring-2 focus:ring-kinetic-primary/20 focus:border-kinetic-primary transition-all"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              className="h-full w-full flex"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + idx * 0.03 }}
            >
              <ReportCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MastersPage;
