import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import useTallyItemPartyWiseSales from '../../hooks/useTallyItemPartyWiseSales';
import VoucherReportLayout from '../../components/voucher/VoucherReportLayout';

const columns = [
  { key: 'item', label: 'Item', sortable: true },
  { key: 'brand', label: 'Brand', sortable: true },
  { key: 'unit', label: 'Unit', sortable: true },
  { key: 'saleRate', label: 'Sale Rate', sortable: true, align: 'right', format: 'currency' },
  { key: 'gst', label: 'GST %', sortable: true },
  { key: 'hsn', label: 'HSN', sortable: true },
  { key: 'qtySold', label: 'Qty Sold', sortable: true },
  { key: 'voucherCount', label: 'Vouchers', sortable: true },
  { key: 'totalSales', label: 'Total Sales', sortable: true, align: 'right', format: 'currency' },
  { key: 'lastSaleDate', label: 'Last Sale Date', sortable: true },
];

export default function ItemWiseSales() {
  const { vouchers, voucherLines, items, loading } = useGoogleSheetsData();
  const { itemWiseData } = useTallyItemPartyWiseSales();
  const navigate = useNavigate();

  const tallyItemSales = useMemo(() => {
    if (!itemWiseData || itemWiseData.length === 0) return null;
    return itemWiseData.map((row) => ({
      item: row.itemName || '—',
      brand: row.brand || '—',
      unit: row.unit || '—',
      saleRate: row.saleRate || 0,
      gst: row.gst || '—',
      hsn: row.hsn || '—',
      qtySold: row.totalQty || 0,
      voucherCount: row.voucherCount || 0,
      totalSales: row.totalAmount || 0,
      lastSaleDate: row.lastSaleDate ? new Date(row.lastSaleDate).toLocaleDateString('en-IN') : '—',
    }));
  }, [itemWiseData]);

  const salesVoucherIds = useMemo(() => {
    return new Set((vouchers || []).filter((v) => v.VoucherType === 'Sales').map((v) => v.VoucherID));
  }, [vouchers]);

  const itemMap = useMemo(() => {
    const map = {};
    (items || []).forEach((i) => { map[i.ItemID] = i.ItemName || i.ItemID; });
    return map;
  }, [items]);

  const itemSales = useMemo(() => {
    const byItem = {};
    const countedVouchers = {};
    (voucherLines || []).forEach((line) => {
      if (line.LineType !== 'Item' || !salesVoucherIds.has(line.VoucherID) || !line.ItemID) return;
      const itemName = itemMap[line.ItemID] || line.ItemID;
      if (!byItem[itemName]) byItem[itemName] = { item: itemName, brand: '—', unit: '—', saleRate: 0, gst: '—', hsn: '—', qtySold: 0, voucherCount: 0, totalSales: 0, lastSaleDate: '—' };
      byItem[itemName].qtySold += parseFloat(line.Qty || 0);
      byItem[itemName].totalSales += parseFloat(line.Amount || 0);
      const key = `${itemName}-${line.VoucherID}`;
      if (!countedVouchers[key]) { countedVouchers[key] = true; byItem[itemName].voucherCount++; }
    });
    return Object.values(byItem);
  }, [voucherLines, salesVoucherIds, itemMap]);

  const activeData = tallyItemSales ?? itemSales;

  return <VoucherReportLayout title="Item-wise Sales Report" showBackButton={true} data={activeData} tallyData={tallyItemSales} loading={loading} columns={columns} emptyMessage="No sales line items found" />;
}