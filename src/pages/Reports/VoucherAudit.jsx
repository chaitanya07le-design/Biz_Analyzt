import useTallyVoucherAudit from '../../hooks/useTallyVoucherAudit';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export default function VoucherAudit() {
  const vouchers = useTallyVoucherAudit();
  return <div className="min-h-screen bg-canvas-default p-4 md:p-6 space-y-5">
    <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors">
            <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Voucher Audit</h1><p className="text-sm text-ink-muted">LIVE TALLY · Vouchers created or altered this week</p>
          </div>
        </div>
    <div className="bg-white border border-canvas-faint rounded-xl overflow-hidden">
      {vouchers === null ? <p className="p-6 text-ink-muted">Loading Tally voucher audit…</p> : vouchers.length === 0 ? <p className="p-10 text-center text-ink-muted">No changed vouchers were returned for this week.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-canvas-subtle text-ink-muted"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Voucher no.</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Party</th><th className="p-3 text-right">Amount</th><th className="p-3 text-left">Created / altered</th></tr></thead><tbody>{vouchers.map((voucher) => <tr key={voucher.id} className="border-t border-canvas-faint"><td className="p-3">{voucher.date || '—'}</td><td className="p-3 font-mono">{voucher.voucherNo}</td><td className="p-3">{voucher.type}</td><td className="p-3">{voucher.party}</td><td className="p-3 text-right font-medium">{formatCurrency(voucher.amount)}</td><td className="p-3">{voucher.createdAt || '—'}</td></tr>)}</tbody></table></div>}
    </div>
  </div>;
}
