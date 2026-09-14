import { useState } from 'react';
import useTallyGstReconciliation from '../../hooks/useTallyGstReconciliation';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function GstReconciliation() {
  const defaultFrom = new Date();
  defaultFrom.setMonth(defaultFrom.getMonth() - 3);
  const [fromDate, setFromDate] = useState(defaultFrom.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [fetchDates, setFetchDates] = useState({ fromDate: defaultFrom.toISOString().split('T')[0], toDate: new Date().toISOString().split('T')[0] });

  const data = useTallyGstReconciliation(fetchDates.fromDate, fetchDates.toDate);

  const handleFetch = () => setFetchDates({ fromDate, toDate });

  return <div className="min-h-screen bg-canvas-default p-4 md:p-6 space-y-5">
    <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors">
            <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-ink-default">GST Reconciliation</h1><p className="text-sm text-ink-muted">LIVE TALLY · GSTR-2B reconciliation</p>
          </div>
        </div>
    <div className="bg-white border border-canvas-faint rounded-xl p-4 flex gap-3 items-end flex-wrap">
      <div><label className="text-xs text-ink-muted block mb-1">From</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-line rounded-lg px-3 py-2 text-sm" /></div>
      <div><label className="text-xs text-ink-muted block mb-1">To</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-line rounded-lg px-3 py-2 text-sm" /></div>
      <button onClick={handleFetch} className="bg-brand-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors">Fetch</button>
    </div>
    <div className="bg-white border border-canvas-faint rounded-xl overflow-hidden">
      {fromDate && toDate && data === null ? <p className="p-6 text-ink-muted">Loading Tally GST reconciliation…</p> : !data || data.length === 0 ? <p className="p-10 text-center text-ink-muted">No reconciliation data for the selected date range.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-canvas-subtle text-ink-muted"><tr><th className="p-3 text-left">GSTIN</th><th className="p-3 text-left">Supplier</th><th className="p-3 text-left">Sup. Inv No</th><th className="p-3 text-left">Sup. Date</th><th className="p-3 text-right">Taxable</th><th className="p-3 text-right">IGST</th><th className="p-3 text-right">CGST</th><th className="p-3 text-right">SGST</th><th className="p-3 text-left">Sales Inv</th><th className="p-3 text-left">Sales Party</th><th className="p-3 text-left">Sales Date</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{data.map((row) => <tr key={row.id} className="border-t border-canvas-faint"><td className="p-3 font-mono">{row.gstin}</td><td className="p-3">{row.party}</td><td className="p-3 font-mono">{row.supplierInvoiceNo}</td><td className="p-3">{formatDate(row.supplierInvoiceDate)}</td><td className="p-3 text-right">{formatCurrency(row.taxableValue)}</td><td className="p-3 text-right">{formatCurrency(row.igst)}</td><td className="p-3 text-right">{formatCurrency(row.cgst)}</td><td className="p-3 text-right">{formatCurrency(row.sgst)}</td><td className="p-3 font-mono">{row.salesInvoiceNo}</td><td className="p-3">{row.salesParty}</td><td className="p-3">{formatDate(row.salesInvoiceDate)}</td><td className="p-3"><span className={row.matchStatus === 'Matched' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{row.matchStatus}</span></td></tr>)}</tbody></table></div>}
    </div>
  </div>;
}