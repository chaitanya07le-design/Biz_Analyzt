import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import AccountList from '../components/cashbank/AccountList';
import { AccountCardSkeleton } from '../components/shared/ListSkeleton';
import Skeleton from '../components/shared/Skeleton';
import EntityDetailModal from '../components/shared/EntityDetailModal';
import useGoogleSheetsData from '../hooks/useGoogleSheetsData';
import { useCompany } from '../context/CompanyContext';

const CashBankPage = () => {
  const { currentCompany } = useCompany();
  const [viewMode, setViewMode] = useState('grid');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const { ledgers, bankAccounts: apiBankAccounts, cashAccounts: apiCashAccounts, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');
  
  const accounts = useMemo(() => {
    const allAccounts = [];
    
    if (apiBankAccounts && apiBankAccounts.length > 0) {
      allAccounts.push(...apiBankAccounts.map(b => ({
        id: b.BankID || b.AccountID || b.id,
        name: b.BankName || b.AccountName || b.name || b.AccountNo || b.AccountNumber || 'Bank Account',
        group: 'Bank Accounts',
        balance: parseFloat(b.OpeningBalance || b.CurrentBalance || b.balance || 0),
        type: 'bank',
        accountNumber: b.AccountNo || b.AccountNumber || '',
        ifsc: b.IFSCCode || b.ifsc || '',
        bankName: b.BankName || b.bankName || '',
        accountType: b.AccountType || b.accountType || '',
        lastTransaction: b.LastTransaction || b.lastTransaction || '',
      })));
    }
    
    if (apiCashAccounts && apiCashAccounts.length > 0) {
      allAccounts.push(...apiCashAccounts.map(c => ({
        id: c.CashID || c.AccountID || c.id,
        name: c.CashType || c.AccountName || c.name || 'Cash Account',
        group: 'Cash-in-Hand',
        balance: parseFloat(c.OpeningBalance || c.CurrentBalance || c.balance || 0),
        type: 'cash',
        lastTransaction: c.LastTransaction || c.lastTransaction || '',
      })));
    }
    
    if (allAccounts.length === 0 && ledgers && ledgers.length > 0) {
      return ledgers.filter(l => 
        l.Group === 'Cash-in-Hand' || l.Group === 'Bank Accounts' ||
        l.group === 'Cash-in-Hand' || l.group === 'Bank Accounts'
      ).map(l => ({
        id: l.LedgerID || l.id,
        name: l.LedgerName || l.name,
        group: l.Group || l.group,
        balance: parseFloat(l.OpeningBalance || l.balance || 0),
        type: l.Group === 'Bank Accounts' ? 'bank' : 'cash',
        accountNumber: l.AccountNumber || l.accountNumber || '',
        ifsc: l.IFSCCode || l.ifsc || '',
        bankName: l.BankName || l.bankName || '',
        accountType: l.AccountType || l.accountType || '',
        lastTransaction: l.LastTransaction || l.lastTransaction || '',
      }));
    }
    
    return allAccounts;
  }, [ledgers, apiBankAccounts, apiCashAccounts]);

  const cashAccounts = accounts.filter(a => a.group === 'Cash-in-Hand');
  const bankAccounts = accounts.filter(a => a.group === 'Bank Accounts');

  const totalCash = cashAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalBank = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const grandTotal = totalCash + totalBank;

  const negativeAccounts = accounts.filter(a => a.balance < 0);

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAccount(null);
  };

  const filteredCashAccounts = accountTypeFilter === 'bank' ? [] : cashAccounts;
  const filteredBankAccounts = accountTypeFilter === 'cash' ? [] : bankAccounts;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-canvas-default pb-20 md:pb-6"
      >
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <div className="space-y-2">
            <Skeleton variant="text" className="w-32 h-7" />
            <Skeleton variant="text" className="w-48 h-4" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-lg border border-canvas-faint p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Skeleton variant="text" className="w-12 h-3 mb-2" />
                <Skeleton variant="text" className="w-20 h-5" />
              </motion.div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Skeleton variant="rounded" className="w-8 h-8 rounded-lg" />
            <Skeleton variant="rounded" className="w-8 h-8 rounded-lg" />
          </div>

          <div className="space-y-3">
            <Skeleton variant="text" className="w-28 h-5" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <AccountCardSkeleton key={i} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton variant="text" className="w-24 h-5" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <AccountCardSkeleton key={i} />
              ))}
            </div>
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
      <div className="px-4 py-4 md:px-8 md:py-8 space-y-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-card border border-slate-100"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-900 tracking-tight">Cash & Bank</h1>
          <p className="text-sm text-kinetic-neutral font-medium mt-1">Account balances and details</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-3 gap-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <p className="text-xs font-bold text-kinetic-neutral uppercase tracking-widest mb-2">Cash</p>
            <p className="text-xl md:text-2xl font-extrabold text-ink-900">
              ₹{totalCash.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <p className="text-xs font-bold text-kinetic-neutral uppercase tracking-widest mb-2">Bank</p>
            <p className="text-xl md:text-2xl font-extrabold text-ink-900">
              ₹{totalBank.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 bg-gradient-to-br from-indigo-50/50 to-white">
            <p className="text-xs font-bold text-kinetic-primary uppercase tracking-widest mb-2">Total</p>
            <p className="text-xl md:text-2xl font-extrabold text-kinetic-primary">
              ₹{grandTotal.toLocaleString('en-IN')}
            </p>
          </div>
        </motion.div>

        {negativeAccounts.length > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
          >
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">
                {negativeAccounts.length} account{negativeAccounts.length > 1 ? 's have' : ' has'} negative balance
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Review recent transactions to correct balance
              </p>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="bg-white rounded-2xl border border-slate-100 shadow-card p-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2 bg-slate-50 p-1 rounded-xl">
              <button
                onClick={() => setAccountTypeFilter('all')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  accountTypeFilter === 'all'
                    ? 'bg-white text-kinetic-primary shadow-sm'
                    : 'text-kinetic-neutral hover:text-ink-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAccountTypeFilter('bank')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  accountTypeFilter === 'bank'
                    ? 'bg-white text-kinetic-primary shadow-sm'
                    : 'text-kinetic-neutral hover:text-ink-900'
                }`}
              >
                Bank
              </button>
              <button
                onClick={() => setAccountTypeFilter('cash')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  accountTypeFilter === 'cash'
                    ? 'bg-white text-kinetic-primary shadow-sm'
                    : 'text-kinetic-neutral hover:text-ink-900'
                }`}
              >
                Cash
              </button>
            </div>
            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  viewMode === 'grid'
                    ? 'bg-white text-kinetic-primary shadow-sm'
                    : 'text-kinetic-neutral hover:text-ink-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  viewMode === 'list'
                    ? 'bg-white text-kinetic-primary shadow-sm'
                    : 'text-kinetic-neutral hover:text-ink-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>

        {filteredCashAccounts.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-sm font-bold text-kinetic-neutral uppercase tracking-widest mb-4">
              Cash Accounts ({filteredCashAccounts.length})
            </h2>
            <AccountList 
              accounts={filteredCashAccounts}
              viewMode={viewMode}
              onAccountClick={handleAccountClick}
            />
          </motion.div>
        )}

        {filteredBankAccounts.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-sm font-bold text-kinetic-neutral uppercase tracking-widest mb-4">
              Bank Accounts ({filteredBankAccounts.length})
            </h2>
            <AccountList 
              accounts={filteredBankAccounts}
              viewMode={viewMode}
              onAccountClick={handleAccountClick}
            />
          </motion.div>
        )}
      </div>

      <EntityDetailModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        entityType={selectedAccount?.type}
        entityId={selectedAccount?.id}
      />
    </motion.div>
  );
};

export default CashBankPage;
