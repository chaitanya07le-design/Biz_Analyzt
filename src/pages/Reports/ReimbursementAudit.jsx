import { useState } from 'react';
import useTallyReimbursementAudit from '../../hooks/useTallyReimbursementAudit';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ReimbursementAudit() {
  const defaultFrom = new Date();
  defaultFrom.setMonth(defaultFrom.getMonth() - 3);
  const [fromDate, setFromDate] = useState(defaultFrom.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [fetchDates, setFetchDates] = useState({ fromDate: defaultFrom.toISOString().split('T')[0], toDate: new Date().toISOString().split('T')[0] });

  const data = useTallyReimbursementAudit(fetchDates.fromDate, fetchDates.toDate);

  const handleFetch = () => setFetchDates({ fromDate, toDate });

  return <div className="min-h-screen bg-canvas-default p-4 md:p-6 space-y-5">
    <div><h1 className="text-xl md:text-2xl font-semibold text-ink-default">Reimbursement Audit</h1><p className="text-sm text-ink-muted">LIVE TALLY · Reimbursement audit entries</p></div>
    <div className="bg-white border border-canvas-faint rounded-xl p-4 flex gap-3 items-end flex-wrap">
      <div><label className="text-xs text-ink-muted block mb-1">From</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-line rounded-lg px-3 py-2 text-sm" /></div>
      <div><label className="text-xs text-ink-muted block mb-1">To</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-line rounded-lg px-3 py-2 text-sm" /></div>
      <button onClick={handleFetch} className="bg-brand-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors">Fetch</button>
    </div>
    <div className="bg-white border border-canvas-faint rounded-xl overflow-hidden">
      {fromDate && toDate && data === null ? <p className="p-6 text-ink-muted">Loading Tally reimbursement audit…</p> : !data || data.length === 0 ? <p className="p-10 text-center text-ink-muted">No reimbursement entries for the selected date range.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-canvas-subtle text-ink-muted"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Voucher No.</th><th className="p-3 text-left">Employee</th><th className="p-3 text-right">Amount</th><th className="p-3 text-left">Description</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{data.map((row) => <tr key={row.id} className="border-t border-canvas-faint"><td className="p-3">{formatDate(row.date)}</td><td className="p-3 font-mono">{row.voucherNo}</td><td className="p-3">{row.employee}</td><td className="p-3 text-right font-medium">{formatCurrency(row.amount)}</td><td className="p-3">{row.description}</td><td className="p-3">{row.status}</td></tr>)}</tbody></table></div>}
    </div>
  </div>;
}