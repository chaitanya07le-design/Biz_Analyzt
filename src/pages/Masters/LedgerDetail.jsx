import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useTallyLedgerDetail from '../../hooks/useTallyLedgerDetail';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Wallet, TrendingUp, CreditCard } from 'lucide-react';
import VoucherPagination, { DEFAULT_PAGE_SIZE } from '../../components/voucher/VoucherPagination';

const formatCurrency = (amount) => `₹${Math.abs(amount || 0).toLocaleString('en-IN')}`;

const LedgerDetail = () => {
  const { ledgerId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const { ledger: tallyLedger, transactions: tallyTransactions, loading: tallyLoading } = useTallyLedgerDetail(ledgerId);

  const { ledger, group, transactions, balance } = useMemo(() => {
    if (!tallyLedger) return { ledger: null, group: null, transactions: [], balance: 0 };

    let runningBalance = tallyLedger.openingBalance || 0;
    const txns = (tallyTransactions || []).map((t, idx) => {
      runningBalance += t.debit - t.credit;
      return {
        voucherId: `tally-txn-${idx}`,
        voucherNo: t.voucherNo || '—',
        date: t.date ? new Date(t.date).toLocaleDateString('en-IN') : '—',
        type: t.type || '—',
        rawType: t.type || '—',
        rawVoucherNo: t.voucherNo || '—',
        particulars: t.particulars || '—',
        debit: t.debit || 0,
        credit: t.credit || 0,
        balance: runningBalance,
      };
    });

    const accountType = tallyLedger.accountNumber ? 'bank' : 'ledger';

    return {
      ledger: { LedgerName: tallyLedger.name, accountType, ...tallyLedger },
      group: { GroupName: tallyLedger.group },
      transactions: txns,
      balance: runningBalance,
    };
  }, [tallyLedger, tallyTransactions]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const paginatedTransactions = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (tallyLoading) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <div className="text-ink-muted">Loading...</div>
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">Ledger not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-brand-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const openingBalance = tallyLedger.openingBalance;
  const closingBalance = balance;
  const totalDebit = tallyLedger.totalDebit;
  const totalCredit = tallyLedger.totalCredit;

  const getBalanceColor = (bal) => {
    if (bal > 0) return 'text-red-600';
    if (bal < 0) return 'text-green-600';
    return 'text-ink-muted';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-canvas-default pb-20 md:pb-6"
    >
      <div className="bg-white border-b border-canvas-faint sticky top-0 z-10">
        <div className="px-4 py-4 md:px-6 md:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-lg hover:bg-canvas-subtle transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-ink-muted" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  ledger.accountType === 'bank' ? 'bg-blue-100' :
                  ledger.accountType === 'cash' ? 'bg-green-100' :
                  'bg-purple-100'
                }`}>
                  {ledger.accountType === 'bank' ? (
                    <Building2 className="w-5 h-5 text-blue-600" />
                  ) : ledger.accountType === 'cash' ? (
                    <Wallet className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-ink-default">{ledger.LedgerName || ledger.name}</h1>
                  <p className="text-sm text-ink-muted">
                    {group?.GroupName || group?.name || 'Uncategorized'} • {ledger.accountType === 'bank' ? 'Bank Account' : ledger.accountType === 'cash' ? 'Cash Account' : 'Ledger'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 md:px-6 md:py-6">
        {tallyLedger.accountNumber && (
          <div className="bg-white rounded-xl p-4 border border-canvas-faint mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-ink-default">Bank Account Details</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-ink-muted">Account No</p>
                <p className="font-mono text-ink-default">{tallyLedger.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Bank</p>
                <p className="text-ink-default">{tallyLedger.bankName}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">IFSC</p>
                <p className="font-mono text-ink-default">{tallyLedger.ifsc}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Branch</p>
                <p className="text-ink-default">{tallyLedger.branchName}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-canvas-faint">
            <p className="text-xs text-ink-muted mb-1">Opening Balance</p>
            <p className={`text-lg font-bold ${getBalanceColor(openingBalance)}`}>
              {formatCurrency(openingBalance)} {openingBalance > 0 ? 'Dr' : openingBalance < 0 ? 'Cr' : ''}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-canvas-faint">
            <p className="text-xs text-ink-muted mb-1">Total Debit</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(totalDebit)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-canvas-faint">
            <p className="text-xs text-ink-muted mb-1">Total Credit</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(totalCredit)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-canvas-faint">
            <p className="text-xs text-ink-muted mb-1">Closing Balance</p>
            <p className={`text-lg font-bold ${getBalanceColor(closingBalance)}`}>
              {formatCurrency(closingBalance)} {closingBalance > 0 ? 'Dr' : closingBalance < 0 ? 'Cr' : ''}
            </p>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="bg-white border border-canvas-faint rounded-lg overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-canvas-subtle">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Voucher</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Particulars</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase">Debit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase">Credit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-faint">
                  {paginatedTransactions.map((txn, idx) => (
                    <tr
                      key={idx}
                      onClick={() => navigate(`/tally-voucher/${txn.rawType}/${encodeURIComponent(txn.rawVoucherNo)}`)}
                      className="hover:bg-canvas-subtle cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm text-ink-default">{txn.date}</td>
                      <td className="px-4 py-3 text-sm text-ink-muted font-mono">{txn.voucherNo || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          txn.type === 'Sales' ? 'bg-blue-50 text-blue-700' :
                          txn.type === 'Purchase' ? 'bg-orange-50 text-orange-700' :
                          txn.type === 'Receipt' ? 'bg-green-50 text-green-700' :
                          txn.type === 'Payment' ? 'bg-red-50 text-red-700' :
                          txn.type === 'Journal' ? 'bg-purple-50 text-purple-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-default">{txn.particulars}</td>
                      <td className={`px-4 py-3 text-sm text-right font-mono ${txn.debit > 0 ? 'text-red-600' : 'text-ink-muted'}`}>
                        {txn.debit > 0 ? formatCurrency(txn.debit) : '—'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-mono ${txn.credit > 0 ? 'text-green-600' : 'text-ink-muted'}`}>
                        {txn.credit > 0 ? formatCurrency(txn.credit) : '—'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-mono ${getBalanceColor(txn.balance)}`}>
                        {formatCurrency(txn.balance)} {txn.balance > 0 ? 'Dr' : txn.balance < 0 ? 'Cr' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-canvas-faint">
              {paginatedTransactions.map((txn, idx) => (
                <div
                  key={idx}
                  className="p-4 cursor-pointer hover:bg-canvas-subtle"
                  onClick={() => navigate(`/tally-voucher/${txn.rawType}/${encodeURIComponent(txn.rawVoucherNo)}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-ink-faint">{txn.date}</p>
                      <p className="text-sm font-mono text-ink-muted">{txn.voucherNo || '—'}</p>
                    </div>
                    <p className={`text-sm font-medium font-mono ${getBalanceColor(txn.balance)}`}>
                      {formatCurrency(txn.balance)} {txn.balance > 0 ? 'Dr' : txn.balance < 0 ? 'Cr' : ''}
                    </p>
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
        ) : (
          <div className="bg-white border border-canvas-faint rounded-lg p-12 text-center">
            <svg className="w-12 h-12 text-ink-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-ink-muted">No transactions found</p>
          </div>
        )}
        {transactions.length > pageSize && (
          <VoucherPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={transactions.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </motion.div>
  );
};

export default LedgerDetail;