import React from 'react';
import { motion } from 'framer-motion';
import AccountCard from './AccountCard';

const AccountList = ({ accounts, viewMode, onAccountClick }) => {
  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-canvas-faint p-12 text-center">
        <svg className="w-12 h-12 text-ink-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <p className="text-ink-muted">No accounts found</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' 
      : 'space-y-2'
    }>
      {accounts.map((account, index) => (
        <motion.div
          key={account.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.05,
            ease: 'easeOut'
          }}
        >
          <AccountCard
            account={account}
            onClick={() => onAccountClick(account)}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default AccountList;
