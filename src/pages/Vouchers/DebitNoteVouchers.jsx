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

export default function DebitNoteVouchers() {
  const { vouchers, loading } = useGoogleSheetsData();
  const navigate = useNavigate();
  const tallyVouchers = useTallyJournalDnCnVouchers();

  const dnVouchers = useMemo(() => {
    if (tallyVouchers && tallyVouchers.length > 0) {
      return tallyVouchers.filter((v) => (v.type || '').toLowerCase() === 'debit note').map((v) => ({ ...v, VoucherID: v.id || v.VoucherID, VoucherNo: v.voucherNo || v.VoucherNo, VoucherDate: v.date || v.VoucherDate, VoucherType: 'Debit Note', PartyName: v.party || v.PartyName, NetAmount: v.amount, Status: v.status || 'POSTED' }));
    }
    return (vouchers || []).filter((v) => v.VoucherType === 'Debit Note');
  }, [vouchers, tallyVouchers]);

  const partyList = useMemo(() => [...new Set(dnVouchers.map((v) => v.PartyName || '').filter(Boolean))].sort(), [dnVouchers]);

  return <VoucherReportLayout title="Debit Note Vouchers" data={dnVouchers} loading={loading} columns={columns} tallyData={tallyVouchers && tallyVouchers.length > 0 ? dnVouchers : null} isTallyPage={tallyVouchers && tallyVouchers.length > 0} partyList={partyList} onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)} />;
}