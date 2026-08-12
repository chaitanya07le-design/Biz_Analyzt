import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import { purchaseOrders, salesOrders } from '../../data/mockData';

const currency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export default function PendingOrders({ type }) {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { orders: allOrders, useMockData, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');
  const isSales = type === 'sales';
  const orderType = isSales ? 'Sales Order' : 'Purchase Order';
  const orders = useMemo(() => {
    const source = useMockData || !allOrders?.length
      ? (isSales ? salesOrders : purchaseOrders)
      : allOrders.filter(o => (o.OrderType || o.orderType) === orderType);
    return source.filter(order => (order.Status || order.status || '').toUpperCase() === 'PENDING').map(order => ({
      id: order.OrderID || order.VoucherID || order.id,
      number: order.OrderNo || order.VoucherNo || order.voucherNo || '—',
      date: order.OrderDate || order.VoucherDate || order.date,
      party: order.PartyName || order.partyName || 'Unknown party',
      amount: Number(order.Amount || order.GrandTotal || order.grossTotal || order.netAmount || 0),
      status: order.Status || order.status || 'PENDING',
      dueDate: order.ExpectedDate || order.DueDate || order.dueDate,
    }));
  }, [allOrders, useMockData, isSales, orderType]);
  const total = orders.reduce((sum, order) => sum + order.amount, 0);

  return <div className="min-h-screen bg-canvas-default p-4 md:p-6 space-y-5">
    <div className="flex items-center gap-3">
      <button onClick={() => navigate('/reports')} className="p-2 hover:bg-canvas-faint rounded-lg">←</button>
      <div><h1 className="text-xl md:text-2xl font-semibold text-ink-default">Pending {isSales ? 'Sales' : 'Purchase'} Orders</h1><p className="text-sm text-ink-muted">Open orders awaiting fulfilment</p></div>
    </div>
    <div className="grid grid-cols-2 gap-3 max-w-xl">
      <div className="bg-white border border-canvas-faint rounded-lg p-4"><p className="text-xs text-ink-muted">Open orders</p><p className="text-xl font-semibold">{orders.length}</p></div>
      <div className="bg-white border border-canvas-faint rounded-lg p-4"><p className="text-xs text-ink-muted">Pending value</p><p className="text-xl font-semibold">{currency(total)}</p></div>
    </div>
    <div className="bg-white border border-canvas-faint rounded-lg overflow-hidden">
      {loading ? <p className="p-6 text-ink-muted">Loading orders…</p> : orders.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-canvas-subtle text-ink-muted"><tr><th className="p-3 text-left">Order no.</th><th className="p-3 text-left">Party</th><th className="p-3 text-left">Order date</th><th className="p-3 text-left">Due date</th><th className="p-3 text-right">Value</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{orders.map(order => <tr key={order.id} className="border-t border-canvas-faint"><td className="p-3 font-mono">{order.number}</td><td className="p-3">{order.party}</td><td className="p-3">{order.date}</td><td className="p-3">{order.dueDate || '—'}</td><td className="p-3 text-right font-medium">{currency(order.amount)}</td><td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-amber-50 text-amber-700">{order.status.replaceAll('_', ' ')}</span></td></tr>)}</tbody></table></div> : <div className="p-12 text-center text-ink-muted"><p>No pending {isSales ? 'sales' : 'purchase'} orders yet.</p><p className="text-xs mt-2">Add rows to the matching Google Sheet tab, or import the supplied CSV template.</p></div>}
    </div>
  </div>;
}
