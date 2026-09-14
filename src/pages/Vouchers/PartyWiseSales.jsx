import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyItemPartyWiseSales from '../../hooks/useTallyItemPartyWiseSales';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const columns = [
  { key: 'party', label: 'Party', sortable: true },
  { key: 'voucherCount', label: 'Vouchers', sortable: true },
  { key: 'totalSales', label: 'Total Sales', sortable: true, align: 'right', format: 'currency' },
];

export default function PartyWiseSales() {
  const { vouchers, loading } = useGoogleSheetsData();
  const { partyWiseData } = useTallyItemPartyWiseSales();
  const navigate = useNavigate();

  const tallyPartySales = useMemo(() => {
    if (!partyWiseData || partyWiseData.length === 0) return null;
    return partyWiseData.map((row) => ({
      party: row.partyName || '—',
      voucherCount: row.voucherCount || 0,
      totalSales: row.totalSalesAmount || 0,
    }));
  }, [partyWiseData]);

  const salesVouchers = useMemo(() => {
    return (vouchers || []).filter((v) => v.VoucherType === 'Sales');
  }, [vouchers]);

  const partySales = useMemo(() => {
    const byParty = {};
    salesVouchers.forEach((v) => {
      const key = v.PartyName || v.PartyID || v.party || 'Unknown';
      if (!byParty[key]) byParty[key] = { party: key, voucherCount: 0, totalSales: 0 };
      byParty[key].voucherCount++;
      byParty[key].totalSales += parseFloat(v.NetAmount || v.GrandTotal || v.amount || 0);
    });
    return Object.values(byParty);
  }, [salesVouchers]);

  const partyList = useMemo(() => [...new Set(salesVouchers.map((v) => v.PartyName || '').filter(Boolean))].sort(), [salesVouchers]);

  const activeData = tallyPartySales ?? partySales;

  return <VoucherReportLayout title="Party-wise Sales Report" showBackButton={true} data={activeData} tallyData={tallyPartySales} loading={loading} columns={columns} partyList={partyList} emptyMessage="No sales vouchers found" />;
}