import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyJournalDnCnVouchers from '../../hooks/useTallyJournalDnCnVouchers';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const columns = [
  { key: 'voucherNo', label: 'Voucher No.', sortable: false },
  { key: 'date', label: 'Date', sortable: true, format: 'date' },
  { key: 'party', label: 'Party', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right', format: 'currency' },
  { key: 'status', label: 'Status', format: 'status' },
];

export default function CreditNoteVouchers() {
  const { vouchers, loading } = useGoogleSheetsData();
  const navigate = useNavigate();
  const tallyVouchers = useTallyJournalDnCnVouchers();

  const cnVouchers = useMemo(() => {
    if (tallyVouchers && tallyVouchers.length > 0) {
      return tallyVouchers.filter((v) => (v.type || '').toLowerCase() === 'credit note').map((v) => ({ ...v, VoucherID: v.id || v.VoucherID, VoucherNo: v.voucherNo || v.VoucherNo, VoucherDate: v.date || v.VoucherDate, VoucherType: 'Credit Note', PartyName: v.party || v.PartyName, NetAmount: v.amount, Status: v.status || 'POSTED' }));
    }
    return (vouchers || []).filter((v) => v.VoucherType === 'Credit Note');
  }, [vouchers, tallyVouchers]);

  const partyList = useMemo(() => [...new Set(cnVouchers.map((v) => v.PartyName || '').filter(Boolean))].sort(), [cnVouchers]);

  return <VoucherReportLayout title="Credit Note Vouchers" data={cnVouchers} loading={loading} columns={columns} tallyData={tallyVouchers && tallyVouchers.length > 0 ? cnVouchers : null} isTallyPage={tallyVouchers && tallyVouchers.length > 0} partyList={partyList} onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)} />;
}