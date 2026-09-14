import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTallyVouchers from '../../hooks/useTallyVouchers';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const voucherColumns = [
  { key: 'voucherNo', label: 'Voucher No.', sortable: false },
  { key: 'date', label: 'Date', sortable: true, format: 'date' },
  { key: 'party', label: 'Party', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right', format: 'currency' },
  { key: 'status', label: 'Status', format: 'status' },
  { key: 'items', label: 'Items' },
];

export default function VoucherListView({ type }) {
  const navigate = useNavigate();
  // type can be "sales", "purchase", "receipt", "payment", etc.
  const tallyVouchers = useTallyVouchers(type);
  const loading = !tallyVouchers;

  const displayVouchers = useMemo(() => {
    const filterTypeMap = {
      'sales': 'Sales',
      'purchase': 'Purchase',
      'receipt': 'Receipt',
      'payment': 'Payment',
      'journal': 'Journal',
      'contra': 'Contra',
      'debit-note': 'Debit Note',
      'credit-note': 'Credit Note',
      'delivery-note': 'Delivery Note',
      'receipt-note': 'Receipt Note',
    };
    const targetType = filterTypeMap[type?.toLowerCase()] || (type.charAt(0).toUpperCase() + type.slice(1));

    if (tallyVouchers && tallyVouchers.length > 0) {
      return tallyVouchers.map((v) => ({
        ...v,
        VoucherID: v.id || v.VoucherID,
        VoucherNo: v.voucherNo || v.VoucherNo || v.VoucherNo || v.voucher_number || v.VchNo || '',
        VoucherDate: v.date || v.VoucherDate,
        VoucherType: v.type || v.voucher_type || v.voucher_type_name || v.VoucherType || targetType,
        PartyName: v.party || v.PartyName || v.party_name || v.PartyName || '',
        NetAmount: v.amount,
        Status: v.status || 'POSTED',
        items: v.items || 0,
      }));
    }
    return [];
  }, [tallyVouchers, type]);

  const partyList = useMemo(() => {
    return [...new Set(displayVouchers.map((v) => v.PartyName || v.party || '').filter(Boolean))].sort();
  }, [displayVouchers]);

  const title = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Vouchers';

  return (
    <VoucherReportLayout
      title={title}
      data={displayVouchers}
      loading={loading}
      columns={voucherColumns}
      tallyData={tallyVouchers && tallyVouchers.length > 0 ? displayVouchers : null}
      isTallyPage={tallyVouchers && tallyVouchers.length > 0}
      partyList={partyList}
      onRowClick={(row) => navigate(`/voucher/${row.VoucherID || row.id}`)}
      exportButton
    />
  );
}
