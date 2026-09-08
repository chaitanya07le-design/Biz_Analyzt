import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyVouchers from '../../hooks/useTallyVouchers';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const columns = [
  { key: 'voucherNo', label: 'Voucher No.', sortable: false },
  { key: 'date', label: 'Date', sortable: true, format: 'date' },
  { key: 'party', label: 'Party', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right', format: 'currency' },
  { key: 'status', label: 'Status', format: 'status' },
  { key: 'items', label: 'Items' },
];

export default function PurchaseVouchers() {
  const { vouchers, loading } = useGoogleSheetsData();
  const navigate = useNavigate();
  const tallyVouchers = useTallyVouchers('purchase');

  const purchaseVouchers = useMemo(() => {
    if (tallyVouchers && tallyVouchers.length > 0) {
      return tallyVouchers.map((v) => ({ ...v, VoucherID: v.id || v.VoucherID, VoucherNo: v.voucherNo || v.VoucherNo, VoucherDate: v.date || v.VoucherDate, VoucherType: 'Purchase', PartyName: v.party || v.PartyName, NetAmount: v.amount, Status: v.status || 'POSTED', items: v.items || 0 }));
    }
    return (vouchers || []).filter((v) => v.VoucherType === 'Purchase');
  }, [vouchers, tallyVouchers]);

  const partyList = useMemo(() => [...new Set(purchaseVouchers.map((v) => v.PartyName || '').filter(Boolean))].sort(), [purchaseVouchers]);

  return <VoucherReportLayout title="Purchase Vouchers" data={purchaseVouchers} loading={loading} columns={columns} tallyData={tallyVouchers && tallyVouchers.length > 0 ? purchaseVouchers : null} isTallyPage={tallyVouchers && tallyVouchers.length > 0} partyList={partyList} onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)} exportButton />;
}