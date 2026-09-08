import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyVouchers from '../../hooks/useTallyVouchers';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const salesColumns = [
  { key: 'voucherNo', label: 'Voucher No.', sortable: false },
  { key: 'date', label: 'Date', sortable: true, format: 'date' },
  { key: 'party', label: 'Party', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right', format: 'currency' },
  { key: 'status', label: 'Status', format: 'status' },
  { key: 'items', label: 'Items' },
];

export default function SalesVouchers() {
  const { vouchers, loading } = useGoogleSheetsData();
  const navigate = useNavigate();
  const tallyVouchers = useTallyVouchers('sales');

  const salesVouchers = useMemo(() => {
    if (tallyVouchers && tallyVouchers.length > 0) {
      return tallyVouchers.map((v) => ({
        ...v,
        VoucherID: v.id || v.VoucherID,
        VoucherNo: v.voucherNo || v.VoucherNo,
        VoucherDate: v.date || v.VoucherDate,
        VoucherType: 'Sales',
        PartyName: v.party || v.PartyName,
        NetAmount: v.amount,
        Status: v.status || 'POSTED',
        items: v.items || 0,
      }));
    }
    return (vouchers || []).filter((v) => v.VoucherType === 'Sales');
  }, [vouchers, tallyVouchers]);

  const partyList = useMemo(() => {
    return [...new Set(salesVouchers.map((v) => v.PartyName || v.party || '').filter(Boolean))].sort();
  }, [salesVouchers]);

  return (
    <VoucherReportLayout
      title="Sales Vouchers"
      data={salesVouchers}
      loading={loading}
      columns={salesColumns}
      tallyData={tallyVouchers && tallyVouchers.length > 0 ? salesVouchers : null}
      isTallyPage={tallyVouchers && tallyVouchers.length > 0}
      partyList={partyList}
      onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)}
      exportButton
    />
  );
}