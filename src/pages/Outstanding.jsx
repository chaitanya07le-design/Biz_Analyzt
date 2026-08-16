import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Skeleton from '../components/shared/Skeleton';
import { PartyCardSkeleton } from '../components/shared/ListSkeleton';
import useGoogleSheetsData from '../hooks/useGoogleSheetsData';
import { useCompany } from '../context/CompanyContext';
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  Calendar,
  IndianRupee,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0 
  }).format(amount || 0);
};

const AgingBucket = ({ label, amount, color, isOverdue }) => (
  <div className={`p-3 rounded-lg text-center ${color} ${isOverdue ? 'ring-1 ring-inset ring-red-200' : ''}`}>
    <p className="text-xs text-ink-muted mb-1">{label}</p>
    <p className="text-sm font-semibold">{formatCurrency(amount)}</p>
  </div>
);

const Outstanding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentCompany } = useCompany();
  
  const initialTab = searchParams.get('type') === 'payable' ? 'payable' : 'receivable';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedParty, setExpandedParty] = useState(null);
  
  const { outstandingReceivables, outstandingPayables, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const data = activeTab === 'receivable' ? outstandingReceivables : outstandingPayables;

  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(p => ({
      partyId: p.partyId || p.PartyID || p.id,
      partyName: p.partyName || p.PartyName || p.name || '',
      city: p.city || p.City || '',
      totalOutstanding: parseFloat(p.totalOutstanding || p.TotalOutstanding || 0),
      openingBalance: parseFloat(p.openingBalance || p.OpeningBalance || p.openingBalance || 0),
      transactionCount: p.transactionCount || 0,
      aging: p.aging || { notDue: 0, overdue0to30: 0, overdue31to60: 0, overdue61to90: 0, over90: 0 },
      invoiceAging: p.invoiceAging || []
    }));
  }, [data]);

  const totals = useMemo(() => {
    return {
      notDue: normalizedData.reduce((sum, p) => sum + (p.aging?.notDue || 0), 0),
      overdue0to30: normalizedData.reduce((sum, p) => sum + (p.aging?.overdue0to30 || 0), 0),
      overdue31to60: normalizedData.reduce((sum, p) => sum + (p.aging?.overdue31to60 || 0), 0),
      overdue61to90: normalizedData.reduce((sum, p) => sum + (p.aging?.overdue61to90 || 0), 0),
      over90: normalizedData.reduce((sum, p) => sum + (p.aging?.over90 || 0), 0)
    };
  }, [normalizedData]);

  const grandTotal = Object.values(totals).reduce((sum, v) => sum + v, 0);

  const handlePartyClick = (party) => {
    if (expandedParty === party.partyId) {
      setExpandedParty(null);
    } else {
      setExpandedParty(party.partyId);
    }
  };

  const handleViewDetails = (party) => {
    navigate(`/outstanding/${party.partyId}`);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-canvas-default pb-20 md:pb-6"
      >
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <div className="flex gap-2">
            <Skeleton variant="rounded" className="flex-1 h-10 rounded-lg" />
            <Skeleton variant="rounded" className="flex-1 h-10 rounded-lg" />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" className="h-20 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PartyCardSkeleton key={i} />
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
      {/* Combined Sticky Header + Aging */}
      <div className="bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="px-4 py-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-900 tracking-tight flex items-center gap-3">
                  <div className="bg-kinetic-primary/10 p-2 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-kinetic-primary" />
                  </div>
                  Outstanding
                </h1>
                <p className="text-sm font-medium text-kinetic-neutral mt-1">
                  {activeTab === 'receivable' ? 'Money owed to you' : 'Money you owe'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-kinetic-neutral uppercase tracking-widest mb-1">Total Outstanding</p>
                <p className={`text-2xl md:text-3xl font-extrabold ${activeTab === 'receivable' ? 'text-kinetic-secondary' : 'text-kinetic-tertiary'}`}>
                  {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-3 bg-slate-50 p-1.5 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('receivable')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'receivable' 
                    ? 'bg-white text-kinetic-primary shadow-sm' 
                    : 'text-kinetic-neutral hover:text-ink-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Receivables ({outstandingReceivables?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('payable')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'payable' 
                    ? 'bg-white text-kinetic-primary shadow-sm' 
                    : 'text-kinetic-neutral hover:text-ink-900'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Payables ({outstandingPayables?.length || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Aging Analysis - inside sticky container */}
        <div className="bg-white border-b border-slate-100 px-4 py-4 md:px-8 max-w-7xl mx-auto w-full">
          <h3 className="text-sm font-bold text-kinetic-neutral uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Aging Analysis
          </h3>
          <div className="grid grid-cols-5 gap-3">
            <AgingBucket label="Not Due" amount={totals.notDue} color="bg-slate-50 border border-slate-100" />
            <AgingBucket label="0-30 days" amount={totals.overdue0to30} color="bg-orange-50 text-orange-900" isOverdue />
            <AgingBucket label="31-60 days" amount={totals.overdue31to60} color="bg-orange-100 text-orange-900" isOverdue />
            <AgingBucket label="61-90 days" amount={totals.overdue61to90} color="bg-red-50 text-red-900" isOverdue />
            <AgingBucket label="90+ days" amount={totals.over90} color="bg-red-100 text-red-900" isOverdue />
          </div>
        </div>
      </div>

      {/* Party List */}
      <div className="px-4 py-6 md:px-8 max-w-7xl mx-auto space-y-4">
        <div className="space-y-4">
          <p className="text-sm font-bold text-kinetic-neutral uppercase tracking-widest">
            {normalizedData.length} {activeTab === 'receivable' ? 'debtor' : 'creditor'}{normalizedData.length !== 1 ? 's' : ''}
          </p>

          {normalizedData.map((party, idx) => {
            const isExpanded = expandedParty === party.partyId;
            const hasInvoices = party.invoiceAging && party.invoiceAging.length > 0;
            
            return (
              <motion.div
                key={party.partyId}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden"
              >
                {/* Party Header */}
                <div 
                  className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => handlePartyClick(party)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {hasInvoices && (
                        <div className={`p-1.5 rounded-lg ${isExpanded ? 'bg-kinetic-primary/10 text-kinetic-primary' : 'bg-slate-100 text-kinetic-neutral'}`}>
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-ink-900 text-lg">{party.partyName}</p>
                        <p className="text-sm font-medium text-kinetic-neutral">{party.city} • {party.transactionCount} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-extrabold ${
                        party.totalOutstanding > 0 ? 'text-ink-900' : 'text-kinetic-secondary'
                      }`}>
                        {formatCurrency(party.totalOutstanding)}
                      </p>
                      {(party.aging?.overdue61to90 > 0 || party.aging?.over90 > 0) && (
                        <p className="text-xs font-bold text-kinetic-tertiary">
                          {formatCurrency((party.aging?.overdue61to90 || 0) + (party.aging?.over90 || 0))} 60+ days overdue
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mini Aging Bar */}
                  <div className="mt-4 flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                    {party.aging?.notDue > 0 && (
                      <div className="bg-kinetic-primary" style={{ width: `${(party.aging.notDue / party.totalOutstanding) * 100}%` }} />
                    )}
                    {party.aging?.overdue0to30 > 0 && (
                      <div className="bg-kinetic-secondary" style={{ width: `${(party.aging.overdue0to30 / party.totalOutstanding) * 100}%` }} />
                    )}
                    {party.aging?.overdue31to60 > 0 && (
                      <div className="bg-orange-400" style={{ width: `${(party.aging.overdue31to60 / party.totalOutstanding) * 100}%` }} />
                    )}
                    {party.aging?.overdue61to90 > 0 && (
                      <div className="bg-kinetic-tertiary" style={{ width: `${(party.aging.overdue61to90 / party.totalOutstanding) * 100}%` }} />
                    )}
                    {party.aging?.over90 > 0 && (
                      <div className="bg-red-600" style={{ width: `${(party.aging.over90 / party.totalOutstanding) * 100}%` }} />
                    )}
                  </div>
                </div>

                {/* Expanded Invoice Details */}
                {isExpanded && hasInvoices && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-canvas-faint bg-canvas-faint"
                  >
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
                          Outstanding Invoices
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(party);
                          }}
                          className="text-xs text-brand-600 hover:text-brand-700"
                        >
                          View Full Ledger
                        </button>
                      </div>
                      
                      {party.invoiceAging.map(inv => (
                        <div key={inv.voucherId} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg text-sm">
                          <div>
                            <p className="font-medium text-ink-900">{inv.voucherNo}</p>
                            <p className="text-xs text-ink-muted">
                              {inv.date} • Due: {inv.dueDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-ink-900">{formatCurrency(inv.outstanding)}</p>
                            {inv.daysOverdue > 0 && (
                              <p className={`text-xs ${inv.daysOverdue > 60 ? 'text-rose-600' : 'text-amber-600'}`}>
                                {inv.daysOverdue} days overdue
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {normalizedData.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-ink-muted">
              No {activeTab === 'receivable' ? 'receivables' : 'payables'} found
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Outstanding;
