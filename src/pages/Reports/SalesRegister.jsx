import useTallySalesRegister from '../../hooks/useTallySalesRegister';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function SalesRegister() {
  const register = useTallySalesRegister();
  const total = (register || []).reduce((sum, row) => sum + row.amount, 0);
  return <div className="min-h-screen bg-canvas-default p-4 md:p-6 space-y-5">
    <div><h1 className="text-xl md:text-2xl font-semibold text-ink-default">Sales Register</h1><p className="text-sm text-ink-muted">LIVE TALLY · Previous month sales transactions</p></div>
    <div className="grid grid-cols-2 gap-3 max-w-lg"><div className="bg-white border border-canvas-faint rounded-xl p-4"><p className="text-xs text-ink-muted">Transactions</p><p className="text-xl font-semibold">{register?.length || 0}</p></div><div className="bg-white border border-canvas-faint rounded-xl p-4"><p className="text-xs text-ink-muted">Total Sales</p><p className="text-xl font-semibold">{formatCurrency(total)}</p></div></div>
    <div className="bg-white border border-canvas-faint rounded-xl overflow-hidden">{register === null ? <p className="p-6 text-ink-muted">Loading Tally sales register…</p> : register.length === 0 ? <p className="p-10 text-center text-ink-muted">No sales register data was returned from Tally.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-canvas-subtle text-ink-muted"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Voucher No.</th><th className="p-3 text-left">Party</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{register.map((row) => <tr key={row.id} className="border-t border-canvas-faint"><td className="p-3">{formatDate(row.date)}</td><td className="p-3 font-mono">{row.voucherNo}</td><td className="p-3">{row.party}</td><td className="p-3 text-right font-medium">{formatCurrency(row.amount)}</td></tr>)}</tbody></table></div>}</div>
  </div>;
}