import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyDeliveryNoteVouchers from '../../hooks/useTallyDeliveryNoteVouchers';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const columns = [
  { key: 'voucherNo', label: 'Voucher No.', sortable: false },
  { key: 'date', label: 'Date', sortable: true, format: 'date' },
  { key: 'party', label: 'Party', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right', format: 'currency' },
  { key: 'status', label: 'Status', format: 'status' },
];

export default function DeliveryNoteVouchers() {
  const { vouchers, loading } = useGoogleSheetsData();
  const tallyData = useTallyDeliveryNoteVouchers();
  const navigate = useNavigate();

  const tallyMapped = useMemo(() => {
    if (!tallyData || tallyData.length === 0) return null;
    return tallyData.map((row) => ({
      voucherNo: row.voucherNo || '—',
      date: row.date || null,
      party: row.party || '—',
      amount: row.amount || 0,
      status: row.status || 'Active',
      VoucherID: row.id || null,
      VoucherType: 'Delivery Note',
    }));
  }, [tallyData]);

  const dnVouchers = useMemo(() => {
    return (vouchers || []).filter((v) => v.VoucherType === 'Delivery Note');
  }, [vouchers]);

  const activeData = tallyMapped ?? dnVouchers;

  const partyList = useMemo(() => [...new Set(dnVouchers.map((v) => v.PartyName || '').filter(Boolean))].sort(), [dnVouchers]);

  return <VoucherReportLayout title="Delivery Note Vouchers" data={activeData} tallyData={tallyMapped} isTallyPage={tallyMapped && tallyMapped.length > 0} loading={loading} columns={columns} partyList={partyList} onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)} />;
}