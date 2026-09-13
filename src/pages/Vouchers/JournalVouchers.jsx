import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyJournalDnCnVouchers from '../../hooks/useTallyJournalDnCnVouchers';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const columns = [
  { key: 'voucherNo', label: 'Voucher No.', sortable: false },
  { key: 'date', label: 'Date', sortable: true, format: 'date' },
  { key: 'party', label: 'Particulars', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right', format: 'currency' },
  { key: 'status', label: 'Status', format: 'status' },
];

export default function JournalVouchers() {
  const { vouchers, loading } = useGoogleSheetsData();
  const navigate = useNavigate();
  const tallyVouchers = useTallyJournalDnCnVouchers();

  const journalVouchers = useMemo(() => {
    if (tallyVouchers && tallyVouchers.length > 0) {
      return tallyVouchers.filter((v) => (v.type || '').toLowerCase() === 'journal').map((v) => ({ 
        ...v, 
        VoucherID: v.id || v.VoucherID, 
        VoucherNo: v.voucherNo || v.VoucherNo, 
        VoucherDate: v.date || v.VoucherDate, 
        VoucherType: 'Journal', 
        PartyName: v.party || v.particulars || v.partyName || '—', 
        party: v.party || v.particulars || v.partyName || '—', // Ensure the 'party' key is set for the column
        NetAmount: v.amount, 
        Status: v.status || 'POSTED' 
      }));
    }
    return (vouchers || []).filter((v) => v.VoucherType === 'Journal').map((v) => ({ 
      ...v, 
      PartyName: v.Narration || v.PartyName || 'Journal Entry',
      party: v.Narration || v.PartyName || 'Journal Entry'
    }));
  }, [vouchers, tallyVouchers]);

  const partyList = useMemo(() => [...new Set(journalVouchers.map((v) => v.PartyName || '').filter(Boolean))].sort(), [journalVouchers]);

  return <VoucherReportLayout title="Journal Vouchers" data={journalVouchers} loading={loading} columns={columns} tallyData={tallyVouchers && tallyVouchers.length > 0 ? journalVouchers : null} isTallyPage={tallyVouchers && tallyVouchers.length > 0} partyList={partyList} onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)} />;
}