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
      className="min-h-screen bg-canvas-default pb-20 md:pb-6"
    >
      {/* Combined Sticky Header + Aging */}
      <div className="sticky top-0 z-10 bg-canvas-default">
        {/* Header */}
        <div className="bg-white border-b border-canvas-faint">
          <div className="px-4 py-4 md:px-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-ink-default flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-brand-500" />
                  Outstanding
                </h1>
                <p className="text-sm text-ink-muted">
                  {activeTab === 'receivable' ? 'Money owed to you' : 'Money you owe'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-ink-muted">Total Outstanding</p>
                <p className={`text-xl font-semibold ${activeTab === 'receivable' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('receivable')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'receivable' 
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-200' 
                    : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Receivables ({normalizedData.length})
              </button>
              <button
                onClick={() => setActiveTab('payable')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'payable' 
                    ? 'bg-red-50 text-red-700 ring-1 ring-red-200' 
                    : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Payables ({normalizedData.length})
              </button>
            </div>
          </div>
        </div>

        {/* Aging Analysis - inside sticky container */}
        <div className="bg-white border-b border-canvas-faint px-4 py-3 md:px-6">
          <h3 className="text-sm font-semibold text-ink-default mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Aging Analysis
          </h3>
          <div className="grid grid-cols-5 gap-2">
            <AgingBucket label="Not Due" amount={totals.notDue} color="bg-blue-50" />
            <AgingBucket label="0-30 days" amount={totals.overdue0to30} color="bg-amber-50" isOverdue />
            <AgingBucket label="31-60 days" amount={totals.overdue31to60} color="bg-orange-50" isOverdue />
            <AgingBucket label="61-90 days" amount={totals.overdue61to90} color="bg-red-50" isOverdue />
            <AgingBucket label="90+ days" amount={totals.over90} color="bg-red-100" isOverdue />
          </div>
        </div>
      </div>

      {/* Party List */}
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
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
                className="bg-white rounded-lg border border-canvas-faint overflow-hidden"
              >
                {/* Party Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-canvas-faint transition-colors"
                  onClick={() => handlePartyClick(party)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {hasInvoices && (
                        <div className="text-ink-400">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-ink-900">{party.partyName}</p>
                        <p className="text-xs text-ink-500">{party.city} • {party.transactionCount} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        party.totalOutstanding > 0 ? 'text-ink-900' : 'text-green-600'
                      }`}>
                        {formatCurrency(party.totalOutstanding)}
                      </p>
                      {(party.aging?.overdue61to90 > 0 || party.aging?.over90 > 0) && (
                        <p className="text-xs text-red-500">
                          {formatCurrency((party.aging?.overdue61to90 || 0) + (party.aging?.over90 || 0))} 60+ days overdue
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mini Aging Bar */}
                  <div className="mt-3 flex gap-1 h-2 rounded-full overflow-hidden bg-canvas-faint">
                    {party.aging?.notDue > 0 && (
                      <div className="bg-blue-400" style={{ width: `${(party.aging.notDue / party.totalOutstanding) * 100}%` }} />
                    )}
                    {party.aging?.overdue0to30 > 0 && (
                      <div className="bg-amber-400" style={{ width: `${(party.aging.overdue0to30 / party.totalOutstanding) * 100}%` }} />
                    )}
                    {party.aging?.overdue31to60 > 0 && (
                      <div className="bg-orange-400" style={{ width: `${(party.aging.overdue31to60 / party.totalOutstanding) * 100}%` }} />
                    )}
                    {party.aging?.overdue61to90 > 0 && (
                      <div className="bg-red-400" style={{ width: `${(party.aging.overdue61to90 / party.totalOutstanding) * 100}%` }} />
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
                              <p className={`text-xs ${inv.daysOverdue > 60 ? 'text-red-500' : 'text-amber-500'}`}>
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
