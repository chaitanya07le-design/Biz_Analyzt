import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
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
  const navigate = useNavigate();

  const rnVouchers = useMemo(() => {
    return (vouchers || []).filter((v) => v.VoucherType === 'Receipt Note');
  }, [vouchers]);

  const partyList = useMemo(() => [...new Set(rnVouchers.map((v) => v.PartyName || '').filter(Boolean))].sort(), [rnVouchers]);

  return <VoucherReportLayout title="Receipt Note Vouchers" data={rnVouchers} loading={loading} columns={columns} partyList={partyList} onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)} />;
}