import useTallyCustomerPurchaseHistory from '../../hooks/useTallyCustomerPurchaseHistory';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function CustomerPurchaseHistory() {
  const history = useTallyCustomerPurchaseHistory();
  return <div className="min-h-screen bg-canvas-default p-4 md:p-6 space-y-5">
    <div><h1 className="text-xl md:text-2xl font-semibold text-ink-default">Customer Purchase History</h1><p className="text-sm text-ink-muted">LIVE TALLY · Customer-wise item purchase history</p></div>
    <div className="bg-white border border-canvas-faint rounded-xl overflow-hidden">{history === null ? <p className="p-6 text-ink-muted">Loading Tally purchase history…</p> : history.length === 0 ? <p className="p-10 text-center text-ink-muted">No customer purchase history was returned from Tally.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-canvas-subtle text-ink-muted"><tr><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Item</th><th className="p-3 text-left">Last Purchase Date</th><th className="p-3 text-left">Voucher No.</th><th className="p-3 text-right">Quantity</th></tr></thead><tbody>{history.map((row) => <tr key={row.id} className="border-t border-canvas-faint"><td className="p-3">{row.customer}</td><td className="p-3">{row.item}</td><td className="p-3">{formatDate(row.date)}</td><td className="p-3 font-mono">{row.voucherNo || '—'}</td><td className="p-3 text-right">{row.quantity}</td></tr>)}</tbody></table></div>}</div>
  </div>;
}
