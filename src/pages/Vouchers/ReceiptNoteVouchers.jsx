import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyReceiptNoteVouchers from '../../hooks/useTallyReceiptNoteVouchers';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const columns = [
  { key: 'voucherNo', label: 'Voucher No.', sortable: false },
  { key: 'date', label: 'Date', sortable: true, format: 'date' },
  { key: 'party', label: 'Party', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right', format: 'currency' },
  { key: 'status', label: 'Status', format: 'status' },
];

export default function ReceiptNoteVouchers() {
  const { vouchers, loading } = useGoogleSheetsData();
  const tallyData = useTallyReceiptNoteVouchers();
  const navigate = useNavigate();

  const tallyMapped = useMemo(() => {
    if (!tallyData || tallyData.length === 0) return null;
    return tallyData.map((row) => ({
      voucherNo: row.voucher_number || row.voucherNo || '—',
      date: row.voucher_date || row.date || null,
      party: row.party || row.party_name || row.partyName || '—',
      amount: Number.parseFloat(row.amount || row.total_amount_inr || 0) || 0,
      status: row.status || (row.isCancelled === 'Yes' ? 'CANCELLED' : 'POSTED'),
      VoucherID: row.VoucherID || row.id || null,
      VoucherType: 'Receipt Note',
    }));
  }, [tallyData]);

  const rnVouchers = useMemo(() => {
    return (vouchers || []).filter((v) => v.VoucherType === 'Receipt Note');
  }, [vouchers]);

  const activeData = tallyMapped ?? rnVouchers;
  const partyList = useMemo(() => [...new Set(activeData.map((v) => v.PartyName || v.party || '').filter(Boolean))].sort(), [activeData]);

  return <VoucherReportLayout title="Receipt Note Vouchers" data={activeData} tallyData={tallyMapped} isTallyPage={tallyMapped && tallyMapped.length > 0} loading={loading} columns={columns} partyList={partyList} onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)} />;
}