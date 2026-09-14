import useTallySalesQuotations from '../../hooks/useTallySalesQuotations';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export default function SalesQuotations() {
  const quotations = useTallySalesQuotations();
  const total = (quotations || []).reduce((sum, quotation) => sum + quotation.amount, 0);
  return <div className="min-h-screen bg-canvas-default p-4 md:p-6 space-y-5">
    <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors">
            <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Sales Quotations</h1><p className="text-sm text-ink-muted">LIVE TALLY · Customer quotations</p>
          </div>
        </div>
    <div className="grid grid-cols-2 gap-3 max-w-lg"><div className="bg-white border border-canvas-faint rounded-xl p-4"><p className="text-xs text-ink-muted">Quotations</p><p className="text-xl font-semibold">{quotations?.length || 0}</p></div><div className="bg-white border border-canvas-faint rounded-xl p-4"><p className="text-xs text-ink-muted">Quoted value</p><p className="text-xl font-semibold">{formatCurrency(total)}</p></div></div>
    <div className="bg-white border border-canvas-faint rounded-xl overflow-hidden">{quotations === null ? <p className="p-6 text-ink-muted">Loading Tally quotations…</p> : quotations.length === 0 ? <p className="p-10 text-center text-ink-muted">No quotations were returned from Tally.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-canvas-subtle text-ink-muted"><tr><th className="p-3 text-left">Quotation no.</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Customer</th><th className="p-3 text-right">Value</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{quotations.map((quotation) => <tr key={quotation.id} className="border-t border-canvas-faint"><td className="p-3 font-mono">{quotation.number}</td><td className="p-3">{quotation.date || '—'}</td><td className="p-3">{quotation.party}</td><td className="p-3 text-right font-medium">{formatCurrency(quotation.amount)}</td><td className="p-3">{quotation.status}</td></tr>)}</tbody></table></div>}</div>
  </div>;
}
