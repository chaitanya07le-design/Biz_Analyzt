import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCompany } from '../../context/CompanyContext';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';

const GstLiability = () => {
  const { currentCompany } = useCompany();
  const { ledgers, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const gstData = useMemo(() => {
    if (!ledgers) return [];
    
    return ledgers
      .filter(l => 
        l.Group === 'Duties & Taxes' || 
        l.group === 'Duties & Taxes' ||
        l.LedgerName?.includes('CGST') ||
        l.LedgerName?.includes('SGST') ||
        l.LedgerName?.includes('IGST') ||
        l.name?.includes('CGST') ||
        l.name?.includes('SGST') ||
        l.name?.includes('IGST')
      )
      .map(l => ({
        id: l.LedgerID || l.id,
        name: l.LedgerName || l.name,
        balance: parseFloat(l.OpeningBalance || l.Balance || l.balance) || 0,
      }));
  }, [ledgers]);

  const totalLiability = gstData.reduce((sum, item) => sum + Math.abs(item.balance), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-default p-6 flex items-center justify-center">
        <p className="text-ink-muted">Loading GST Liability...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-canvas-default pb-20 md:pb-6"
    >
      <div className="bg-white border-b border-canvas-faint sticky top-0 z-20">
        <div className="px-4 py-4 md:px-6 md:py-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold text-ink-default">GST Liability</h1>
            <div className="p-4 bg-brand-50 rounded-lg border border-brand-100">
              <p className="text-sm text-brand-600 mb-1 font-medium">Total Liability</p>
              <h2 className="text-3xl font-bold text-brand-700">₹{totalLiability.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        <div className="bg-white border border-canvas-faint rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-canvas-subtle border-b border-canvas-faint">
                  <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider">Tax Ledger</th>
                  <th className="py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wider text-right">Balance Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {gstData.length > 0 ? (
                  gstData.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-canvas-subtle/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-ink-default">{item.name}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-ink-default text-right">
                        ₹{Math.abs(item.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {item.balance < 0 ? ' (Dr)' : ' (Cr)'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-8 text-center text-ink-muted">
                      No GST liability data found. Check Duties & Taxes ledgers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GstLiability;
