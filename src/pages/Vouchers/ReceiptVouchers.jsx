import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyReceiptPaymentVouchers from '../../hooks/useTallyReceiptPaymentVouchers';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const columns = [
  { key: 'voucherNo', label: 'Voucher No.', sortable: false },
  { key: 'date', label: 'Date', sortable: true, format: 'date' },
  { key: 'party', label: 'Party', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right', format: 'currency' },
  { key: 'status', label: 'Status', format: 'status' },
];

export default function ReceiptVouchers() {
  const { vouchers, loading } = useGoogleSheetsData();
  const navigate = useNavigate();
  const tallyVouchers = useTallyReceiptPaymentVouchers();

  const receiptVouchers = useMemo(() => {
    if (tallyVouchers && tallyVouchers.length > 0) {
      return tallyVouchers.filter((v) => (v.type || '').toLowerCase() === 'receipt').map((v) => ({ ...v, VoucherID: v.id || v.VoucherID, VoucherNo: v.voucherNo || v.VoucherNo, VoucherDate: v.date || v.VoucherDate, VoucherType: 'Receipt', PartyName: v.party || v.PartyName, NetAmount: v.amount, Status: v.status || 'POSTED' }));
    }
    return (vouchers || []).filter((v) => v.VoucherType === 'Receipt');
  }, [vouchers, tallyVouchers]);

  const partyList = useMemo(() => [...new Set(receiptVouchers.map((v) => v.PartyName || '').filter(Boolean))].sort(), [receiptVouchers]);

  return <VoucherReportLayout title="Receipt Vouchers" data={receiptVouchers} loading={loading} columns={columns} tallyData={tallyVouchers && tallyVouchers.length > 0 ? receiptVouchers : null} isTallyPage={tallyVouchers && tallyVouchers.length > 0} partyList={partyList} onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)} />;
}