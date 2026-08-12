import React from 'react';
import { useNavigate } from 'react-router-dom';

const LedgerTransactionList = ({ transactions }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    return `₹${absValue.toLocaleString('en-IN')}`;
  };

  const getBalanceDisplay = (balance) => {
    const absBalance = Math.abs(balance);
    const suffix = balance > 0 ? ' (Dr)' : balance < 0 ? ' (Cr)' : '';
    return `₹${absBalance.toLocaleString('en-IN')}${suffix}`;
  };

  const handleRowClick = (transaction) => {
    navigate(`/voucher/${transaction.voucherId}`);
  };

  return (
    <div className="bg-white border border-canvas-faint rounded-lg overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-canvas-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">Voucher</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">Particulars</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">Debit</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">Credit</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-faint">
            {transactions.map((txn, idx) => (
              <tr 
                key={idx} 
                className="hover:bg-canvas-subtle cursor-pointer"
                onClick={() => handleRowClick(txn)}
              >
                <td className="px-4 py-3 text-sm text-ink-default">{formatDate(txn.date)}</td>
                <td className="px-4 py-3 text-sm text-ink-muted font-mono">{txn.voucherNo || '—'}</td>
                <td className="px-4 py-3 text-sm text-ink-default">{txn.particulars}</td>
                <td className={`px-4 py-3 text-sm text-right font-mono ${txn.debit > 0 ? 'text-red-600' : 'text-ink-muted'}`}>
                  {txn.debit > 0 ? formatCurrency(txn.debit) : '—'}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-mono ${txn.credit > 0 ? 'text-green-600' : 'text-ink-muted'}`}>
                  {txn.credit > 0 ? formatCurrency(txn.credit) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-ink-default font-mono">
                  {getBalanceDisplay(txn.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-canvas-faint">
        {transactions.map((txn, idx) => (
          <div 
            key={idx} 
            className="p-4 cursor-pointer hover:bg-canvas-subtle"
            onClick={() => handleRowClick(txn)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-ink-faint">{formatDate(txn.date)}</p>
                <p className="text-sm font-mono text-ink-muted">{txn.voucherNo || '—'}</p>
              </div>
              <p className="text-sm font-medium text-ink-default">{getBalanceDisplay(txn.balance)}</p>
            </div>
            <p className="text-sm text-ink-default mb-2">{txn.particulars}</p>
            <div className="flex justify-between text-xs">
              <span className={txn.debit > 0 ? 'text-red-600' : 'text-ink-muted'}>
                Dr: {txn.debit > 0 ? formatCurrency(txn.debit) : '—'}
              </span>
              <span className={txn.credit > 0 ? 'text-green-600' : 'text-ink-muted'}>
                Cr: {txn.credit > 0 ? formatCurrency(txn.credit) : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LedgerTransactionList;
