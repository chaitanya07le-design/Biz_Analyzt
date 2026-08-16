import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useGoogleSheetsData from '../hooks/useGoogleSheetsData';
import LedgerHeader from '../components/ledger/LedgerHeader';
import LedgerBalanceRow from '../components/ledger/LedgerBalanceRow';
import { motion } from 'framer-motion';

const LedgerDetail = () => {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { parties, vouchers, loading } = useGoogleSheetsData();
  const [showAging, setShowAging] = useState(true);

  const calculateAging = (party, partyVouchers) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentFYStart = new Date(today.getFullYear(), today.getMonth() >= 3 ? 3 : 3, 1);
    if (today.getMonth() < 3) {
      currentFYStart.setFullYear(today.getFullYear() - 1);
    }

    const partyType = party.PartyType || party.type || '';
    const isReceivable = ['Sundry Debtors', 'Customer', 'Both'].includes(partyType);

    const creditDays = parseInt(party.CreditDays) || 0;

    const invoiceType = isReceivable ? 'Sales' : 'Purchase';
    const paymentTypes = isReceivable ? ['Receipt'] : ['Payment'];

    const invoices = partyVouchers
      .filter(v => v.VoucherType === invoiceType)
      .map(v => ({
        voucherId: v.VoucherID,
        voucherNo: v.VoucherNo,
        date: new Date(v.VoucherDate),
        amount: parseFloat(v.GrandTotal || v.NetAmount || 0),
        dueDate: new Date(new Date(v.VoucherDate).getTime() + creditDays * 24 * 60 * 60 * 1000),
        outstanding: parseFloat(v.GrandTotal || v.NetAmount || 0)
      }))
      .sort((a, b) => a.date - b.date);

    const payments = partyVouchers
      .filter(v => paymentTypes.includes(v.VoucherType))
      .map(v => ({
        voucherId: v.VoucherID,
        date: new Date(v.VoucherDate),
        amount: parseFloat(v.GrandTotal || v.NetAmount || 0)
      }))
      .sort((a, b) => a.date - b.date);

    let remainingPayment = payments.reduce((sum, p) => sum + p.amount, 0);
    invoices.forEach(inv => {
      if (remainingPayment > 0 && inv.outstanding > 0) {
        const applied = Math.min(inv.outstanding, remainingPayment);
        inv.outstanding -= applied;
        inv.settledAmount = applied;
        remainingPayment -= applied;
      }
    });

    const invoiceAging = invoices.map(inv => {
      const daysOverdue = Math.max(0, Math.floor((today - inv.dueDate) / (1000 * 60 * 60 * 24)));
      return {
        ...inv,
        date: inv.date.toISOString().split('T')[0],
        dueDate: inv.dueDate.toISOString().split('T')[0],
        daysOverdue,
        settled: inv.outstanding < 0.01,
        settledAmount: inv.settledAmount || 0
      };
    });

    const invoiceAgingTotal = invoiceAging
      .filter(inv => !inv.settled)
      .reduce((acc, inv) => {
        if (inv.daysOverdue <= 0) {
          acc.notDue += inv.outstanding;
        } else if (inv.daysOverdue <= 30) {
          acc.overdue0to30 += inv.outstanding;
        } else if (inv.daysOverdue <= 60) {
          acc.overdue31to60 += inv.outstanding;
        } else if (inv.daysOverdue <= 90) {
          acc.overdue61to90 += inv.outstanding;
        } else {
          acc.over90 += inv.outstanding;
        }
        return acc;
      }, { notDue: 0, overdue0to30: 0, overdue31to60: 0, overdue61to90: 0, over90: 0 });

    const openingBalance = parseFloat(party.OpeningBalance || 0);
    if (Math.abs(openingBalance) > 0.01) {
      const daysSinceFYStart = Math.floor((today - currentFYStart) / (1000 * 60 * 60 * 24));
      const obAmount = Math.abs(openingBalance);
      if (daysSinceFYStart > 90) {
        invoiceAgingTotal.over90 += obAmount;
      } else if (daysSinceFYStart > 60) {
        invoiceAgingTotal.overdue61to90 += obAmount;
      } else if (daysSinceFYStart > 30) {
        invoiceAgingTotal.overdue31to60 += obAmount;
      } else {
        invoiceAgingTotal.overdue0to30 += obAmount;
      }
    }

    const totalOutstanding = Object.values(invoiceAgingTotal).reduce((sum, v) => sum + v, 0);

    return {
      totalOutstanding,
      openingBalance,
      aging: invoiceAgingTotal,
      invoiceAging: invoiceAging.filter(inv => !inv.settled)
    };
  };

  const { party, transactions, agingData } = useMemo(() => {
    const partyData = parties.find(p => p.id === partyId || p.PartyID === partyId);
    if (!partyData) return { party: null, transactions: [], agingData: null };

    const partyTransactions = [];
    const openingBalance = parseFloat(partyData.OpeningBalance) || 0;

    const partyVouchers = (vouchers || []).filter(v => 
      (v.PartyID === partyId || v.PartyID === partyData.PartyID) && 
      v.IsDeleted !== 'TRUE'
    );

    partyVouchers.forEach(v => {
      const amount = parseFloat(v.NetAmount || v.GrandTotal || 0);
      partyTransactions.push({
        date: v.VoucherDate,
        voucherNo: v.VoucherNo,
        voucherId: v.VoucherID,
        type: v.VoucherType,
        particulars: v.VoucherType === 'Sales' ? 'Sales Invoice' : 
                     v.VoucherType === 'Purchase' ? 'Purchase Invoice' : v.VoucherType,
        debit: ['Receipt', 'Payment'].includes(v.VoucherType) ? amount : 0,
        credit: ['Sales', 'Purchase', 'Credit Note', 'Debit Note', 'Journal'].includes(v.VoucherType) ? amount : 0,
        amount: ['Sales', 'Purchase'].includes(v.VoucherType) ? amount : 
                ['Receipt', 'Payment'].includes(v.VoucherType) ? -amount : 0,
        grandTotal: parseFloat(v.GrandTotal || v.NetAmount || 0),
      });
    });

    partyTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = openingBalance;
    partyTransactions.forEach(t => {
      runningBalance += t.amount;
      t.balance = runningBalance;
    });

    const agingData = calculateAging(partyData, partyVouchers);

    return { party: partyData, transactions: partyTransactions, agingData };
  }, [partyId, parties, vouchers]);

  useEffect(() => {
    if (location.state?.fromOutstanding) {
      setShowAging(true);
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <div className="text-ink-muted">Loading...</div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">Party not found</p>
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

  const handleBack = () => {
    navigate(-1);
  };

  const openingBalance = parseFloat(party.OpeningBalance) || 0;
  const closingBalance = transactions.length > 0 
    ? transactions[transactions.length - 1].balance 
    : openingBalance;

  const getRunningBalanceColor = (balance) => {
    if (balance > 0) return 'text-red-600';
    if (balance < 0) return 'text-green-600';
    return 'text-ink-muted';
  };

  const formatCurrency = (amount) => `₹${Math.abs(amount).toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-canvas-default">
      <LedgerHeader party={{ 
        ...party, 
        name: party.PartyName || party.name, 
        city: party.City || party.city,
        type: party.PartyType || party.type,
        gstin: party.GSTIN || party.gstin,
        creditLimit: party.CreditLimit ? parseFloat(party.CreditLimit) : party.creditLimit ? parseFloat(party.creditLimit) : 0
      }} onBack={handleBack} />
      
      <div className="p-4 md:p-6">
        {agingData && agingData.totalOutstanding > 0.01 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-canvas-faint rounded-lg overflow-hidden mb-4"
          >
            <button
              onClick={() => setShowAging(!showAging)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-canvas-faint transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-ink-default">Outstanding Analysis</p>
                  <p className="text-xs text-ink-muted">Total: {formatCurrency(agingData.totalOutstanding)}</p>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-ink-muted transition-transform ${showAging ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAging && (
              <div className="border-t border-canvas-faint p-4 space-y-4">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-ink-muted">Not Due</p>
                    <p className="text-sm font-semibold text-ink-default">{formatCurrency(agingData.aging.notDue)}</p>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-ink-muted">0-30 Days</p>
                    <p className="text-sm font-semibold text-yellow-700">{formatCurrency(agingData.aging.overdue0to30)}</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <p className="text-xs text-ink-muted">31-60 Days</p>
                    <p className="text-sm font-semibold text-orange-700">{formatCurrency(agingData.aging.overdue31to60)}</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <p className="text-xs text-ink-muted">61-90 Days</p>
                    <p className="text-sm font-semibold text-red-700">{formatCurrency(agingData.aging.overdue61to90)}</p>
                  </div>
                  <div className="text-center p-2 bg-red-100 rounded-lg">
                    <p className="text-xs text-ink-muted">Over 90 Days</p>
                    <p className="text-sm font-semibold text-red-800">{formatCurrency(agingData.aging.over90)}</p>
                  </div>
                  <div className="text-center p-2 bg-canvas-faint rounded-lg">
                    <p className="text-xs text-ink-muted">Total</p>
                    <p className="text-sm font-bold text-ink-default">{formatCurrency(agingData.totalOutstanding)}</p>
                  </div>
                </div>

                {agingData.invoiceAging.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-ink-muted uppercase mb-2">Unpaid Invoices</p>
                    <div className="space-y-2">
                      {agingData.invoiceAging.map((inv, idx) => (
                        <div
                          key={inv.voucherId || idx}
                          className="flex items-center justify-between p-2 bg-canvas-faint rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-ink-muted">{inv.voucherNo}</span>
                            <span className="text-ink-default">{inv.date}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-0.5 rounded-full ${
                              inv.daysOverdue === 0 ? 'bg-gray-100 text-gray-600' :
                              inv.daysOverdue <= 30 ? 'bg-yellow-100 text-yellow-700' :
                              inv.daysOverdue <= 60 ? 'bg-orange-100 text-orange-700' :
                              inv.daysOverdue <= 90 ? 'bg-red-100 text-red-700' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {inv.daysOverdue === 0 ? 'Not Due' : `${inv.daysOverdue}d overdue`}
                            </span>
                            <span className="font-medium text-ink-default">{formatCurrency(inv.outstanding)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {transactions.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-white border border-canvas-faint rounded-lg overflow-hidden">
              <LedgerBalanceRow 
                label="Opening Balance" 
                amount={openingBalance} 
                type="opening" 
              />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-ink-muted uppercase tracking-wider">
                Transactions
              </h2>
              <p className="text-xs text-ink-faint">
                {transactions.length} transactions
              </p>
            </div>
            
            <div className="bg-white border border-canvas-faint rounded-lg overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-canvas-subtle">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Voucher</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Particulars</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase">Debit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase">Credit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-canvas-faint">
                    {transactions.map((txn, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-canvas-subtle cursor-pointer"
                        onClick={() => navigate(`/voucher/${txn.voucherId}`)}
                      >
                        <td className="px-4 py-3 text-sm text-ink-default">{txn.date}</td>
                        <td className="px-4 py-3 text-sm text-ink-muted font-mono">{txn.voucherNo || '—'}</td>
                        <td className="px-4 py-3 text-sm text-ink-default">{txn.particulars}</td>
                        <td className={`px-4 py-3 text-sm text-right font-mono ${txn.debit > 0 ? 'text-red-600' : 'text-ink-muted'}`}>
                          {txn.debit > 0 ? formatCurrency(txn.debit) : '—'}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-mono ${txn.credit > 0 ? 'text-green-600' : 'text-ink-muted'}`}>
                          {txn.credit > 0 ? formatCurrency(txn.credit) : '—'}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-mono ${getRunningBalanceColor(txn.balance)}`}>
                          {formatCurrency(txn.balance)} {txn.balance > 0 ? 'Dr' : txn.balance < 0 ? 'Cr' : ''}
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
                    onClick={() => navigate(`/voucher/${txn.voucherId}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-ink-faint">{txn.date}</p>
                        <p className="text-sm font-mono text-ink-muted">{txn.voucherNo || '—'}</p>
                      </div>
                      <p className={`text-sm font-medium font-mono ${getRunningBalanceColor(txn.balance)}`}>
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
            
            <div className="bg-white border border-canvas-faint rounded-lg overflow-hidden">
              <LedgerBalanceRow 
                label="Closing Balance" 
                amount={closingBalance} 
                type="closing" 
              />
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
      </div>
    </div>
  );
};

export default LedgerDetail;
