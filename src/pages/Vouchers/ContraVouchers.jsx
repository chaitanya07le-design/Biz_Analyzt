import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyContraVouchers from '../../hooks/useTallyContraVouchers';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const columns = [
  { key: 'voucherNo', label: 'Voucher No.', sortable: false },
  { key: 'date', label: 'Date', sortable: true, format: 'date' },
  { key: 'party', label: 'Particulars', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right', format: 'currency' },
  { key: 'status', label: 'Status', format: 'status' },
];

export default function ContraVouchers() {
  const { vouchers, loading } = useGoogleSheetsData();
  const tallyData = useTallyContraVouchers();
  const navigate = useNavigate();

  const tallyMapped = useMemo(() => {
    if (!tallyData || tallyData.length === 0) return null;
    return tallyData.map((row) => ({
      voucherNo: row.voucherNo || '—',
      date: row.date || null,
      party: row.particulars || row.narration || 'Contra Entry',
      amount: row.amount || 0,
      status: row.status || 'Active',
      id: row.id || null,
      VoucherType: 'Contra',
    }));
  }, [tallyData]);

  const contraVouchers = useMemo(() => {
    return (vouchers || []).filter((v) => v.VoucherType === 'Contra').map((v) => ({ ...v, PartyName: v.Narration || v.PartyName || 'Contra Entry' }));
  }, [vouchers]);

  const activeData = tallyMapped ?? contraVouchers;

  const partyList = useMemo(() => [...new Set(contraVouchers.map((v) => v.PartyName || '').filter(Boolean))].sort(), [contraVouchers]);

  return <VoucherReportLayout title="Contra Vouchers" data={activeData} tallyData={tallyMapped} isTallyPage={tallyMapped && tallyMapped.length > 0} loading={loading} columns={columns} partyList={partyList} onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)} />;
}