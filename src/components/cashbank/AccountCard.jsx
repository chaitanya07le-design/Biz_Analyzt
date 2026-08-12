import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AccountCard = ({ account, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isNegative = account.balance < 0;
  const absBalance = Math.abs(account.balance);
  const balanceType = account.balance > 0 ? 'Dr' : account.balance < 0 ? 'Cr' : '';
  
  const isBank = account.group === 'Bank Accounts';
  const isCash = account.group === 'Cash-in-Hand';

  return (
    <div 
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
      className={`relative bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-lg ${
        isNegative ? 'bg-red-50 border-red-300' : 'border-canvas-faint hover:border-brand-primary'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink-default">{account.name}</p>
            {isNegative && (
              <motion.svg 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-4 h-4 text-red-500 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </motion.svg>
            )}
          </div>
          <p className="text-xs text-ink-faint mt-1">{account.group}</p>
        </div>
        {isBank && (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </motion.div>
        )}
        {isCash && (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </motion.div>
        )}
      </div>
      
      {isBank && account.accountNumber && (
        <div className="mb-3 p-2 bg-canvas-subtle rounded text-xs">
          <div className="flex justify-between items-center">
            <span className="text-ink-faint">Account No:</span>
            <span className="font-mono text-ink-default">{account.accountNumber}</span>
          </div>
          {account.ifsc && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-ink-faint">IFSC:</span>
              <span className="font-mono text-ink-default">{account.ifsc}</span>
            </div>
          )}
          {account.bankName && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-ink-faint">Bank:</span>
              <span className="text-ink-default">{account.bankName}</span>
            </div>
          )}
          {account.accountType && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-ink-faint">Type:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                {account.accountType}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-canvas-faint">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-faint mb-1">Balance</p>
            <p className={`text-lg font-semibold font-mono ${isNegative ? 'text-red-600' : 'text-ink-default'}`}>
              ₹{absBalance.toLocaleString('en-IN')}
              {balanceType && <span className="text-sm ml-1">{balanceType}</span>}
            </p>
          </div>
          {account.lastTransaction && (
            <div className="text-right">
              <p className="text-xs text-ink-faint">Last Txn</p>
              <p className="text-xs text-ink-muted">
                {new Date(account.lastTransaction).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short' 
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {showTooltip && isNegative && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-0 mb-2 w-full bg-red-600 text-white text-xs rounded-lg p-2 shadow-lg"
        >
          ⚠️ Negative balance! Review recent transactions.
          <div className="absolute top-full left-4 border-8 border-transparent border-t-red-600" />
        </motion.div>
      )}
    </div>
  );
};

export default AccountCard;
