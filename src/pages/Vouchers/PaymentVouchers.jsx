import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusPill from '../../components/ui/StatusPill';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useTallyPaymentVouchers from '../../hooks/useTallyPaymentVouchers';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function PaymentVouchers() {
  const { vouchers, loading } = useGoogleSheetsData();
  const tallyPaymentVouchers = useTallyPaymentVouchers();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const paymentVouchers = useMemo(() => {
    return tallyPaymentVouchers ?? (vouchers || []).filter(v => v.VoucherType === 'Payment' || v.voucherType === 'Payment');
  }, [vouchers, tallyPaymentVouchers]);

  const filtered = paymentVouchers.filter(v => {
    const party = v.PartyName || v.partyName || v.party || '';
    const id = v.VoucherID || v.id || '';
    return party.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input
              type="text"
              placeholder="Search vouchers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 bg-ink-50 border border-line rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="secondary" icon={Filter}>Filter</Button>
            <Button variant="secondary" icon={Download}>Export</Button>
            <Button icon={Plus}>New Payment</Button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-ink-600">
              <tr>
                <th className="px-5 py-3 font-medium">Voucher No.</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Party</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((voucher) => {
                const voucherNo = voucher.VoucherNo || voucher.voucherNo || voucher.VoucherID || voucher.id;
                const date = voucher.VoucherDate || voucher.date;
                const party = voucher.PartyName || voucher.partyName || voucher.party || '';
                const amount = parseFloat(voucher.NetAmount || voucher.amount || voucher.GrandTotal) || 0;
                const status = voucher.Status || voucher.status || 'PAID';

                return (
                  <tr key={voucher.VoucherID || voucher.id} className="hover:bg-ink-50">
                    <td className="px-5 py-3 font-medium text-brand-600">{voucherNo}</td>
                    <td className="px-5 py-3 text-ink-900">{formatDate(date)}</td>
                    <td className="px-5 py-3 text-ink-900">{party}</td>
                    <td className="px-5 py-3 text-right font-medium text-red-600">{formatCurrency(amount)}</td>
                    <td className="px-5 py-3"><StatusPill status={status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
          <span className="text-xs text-ink-600">Showing {filtered.length} of {paymentVouchers.length} vouchers</span>
        </div>
      </Card>
    </div>
  );
}
