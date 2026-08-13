import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusPill from '../../components/ui/StatusPill';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { Plus, Search, Filter, Download, X, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function PurchaseVouchers() {
  const { vouchers, voucherLines, items, loading } = useGoogleSheetsData();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const navigate = useNavigate();

  const purchaseVouchers = useMemo(() => {
    return (vouchers || []).filter(v => v.VoucherType === 'Purchase' || v.type === 'Purchase');
  }, [vouchers]);

  const brands = useMemo(() => {
    if (!items) return [];
    const uniqueBrands = [...new Set(items.map(i => i.Brand).filter(Boolean))];
    return uniqueBrands.sort();
  }, [items]);

  const subCategories = useMemo(() => {
    if (!items) return [];
    const uniqueSubCats = [...new Set(items.map(i => i.SubCategory).filter(Boolean))];
    return uniqueSubCats.sort();
  }, [items]);

  const itemMap = useMemo(() => {
    if (!items) return new Map();
    return new Map(items.map(i => [i.ItemID, i]));
  }, [items]);

  const filtered = useMemo(() => {
    let result = purchaseVouchers;

    if (search) {
      result = result.filter(v => {
        const party = v.PartyName || v.party || '';
        const id = v.VoucherID || v.id || '';
        return party.toLowerCase().includes(search.toLowerCase()) ||
          id.toLowerCase().includes(search.toLowerCase());
      });
    }

    if (selectedBrand || selectedSubCategory) {
      const purchaseVoucherIds = new Set(
        purchaseVouchers.map(v => v.VoucherID)
      );

      const matchingItemIds = new Set();
      items?.forEach(item => {
        if (selectedBrand && item.Brand !== selectedBrand) return;
        if (selectedSubCategory && item.SubCategory !== selectedSubCategory) return;
        matchingItemIds.add(item.ItemID);
      });

      const matchingVoucherIds = new Set();
      voucherLines?.forEach(line => {
        if (line.LineType !== 'Item') return;
        if (!purchaseVoucherIds.has(line.VoucherID)) return;
        if (matchingItemIds.has(line.ItemID)) {
          matchingVoucherIds.add(line.VoucherID);
        }
      });

      result = result.filter(v => matchingVoucherIds.has(v.VoucherID));
    }

    return result;
  }, [purchaseVouchers, search, selectedBrand, selectedSubCategory, voucherLines, items]);

  const totalAmount = filtered.reduce((sum, v) => {
    return sum + (parseFloat(v.NetAmount) || parseFloat(v.GrandTotal) || 0);
  }, 0);

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedSubCategory('');
    setSearch('');
  };

  const hasFilters = search || selectedBrand || selectedSubCategory;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input
              type="text"
              placeholder="Search by party or voucher ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 bg-ink-50 border border-line rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={showFilters ? 'primary' : 'secondary'} 
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {hasFilters && `(${[search && 'search', selectedBrand && 'brand', selectedSubCategory && 'subcat'].filter(Boolean).length})`}
            </Button>
            <Button variant="secondary" icon={Download}>Export</Button>
            <Button icon={Plus}>New Purchase</Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-ink-50 rounded-xl border border-line">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-ink-900">Filter Purchases</h3>
              {hasFilters && (
                <button 
                  onClick={clearFilters}
                  className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-ink-600 mb-1.5">Brand</label>
                <div className="relative">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full h-10 pl-3 pr-8 bg-white border border-line rounded-lg text-sm outline-none focus:border-brand-500 appearance-none"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-ink-600 mb-1.5">Sub-Category</label>
                <div className="relative">
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className="w-full h-10 pl-3 pr-8 bg-white border border-line rounded-lg text-sm outline-none focus:border-brand-500 appearance-none"
                  >
                    <option value="">All Sub-Categories</option>
                    {subCategories.map(subcat => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-ink-600">
              <tr>
                <th className="px-5 py-3 font-medium">Voucher No.</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Party</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((voucher) => {
                const voucherNo = voucher.VoucherNo || voucher.voucherNo || voucher.VoucherID || voucher.id;
                const date = voucher.VoucherDate || voucher.date;
                const party = voucher.PartyName || voucher.party || '';
                const amount = parseFloat(voucher.NetAmount || voucher.amount || voucher.GrandTotal) || 0;
                const status = voucher.Status || voucher.status || 'UNPAID';
                const items = voucher.ItemCount || (Array.isArray(voucher.items) ? voucher.items.length : voucher.items) || (voucher.Items?.length) || 0;

                return (
                  <tr key={voucher.VoucherID || voucher.id} className="hover:bg-ink-50 cursor-pointer" onClick={() => navigate(`/voucher/${voucher.VoucherID || voucher.id}`)}>
                    <td className="px-5 py-3 font-medium text-brand-600">{voucherNo}</td>
                    <td className="px-5 py-3 text-ink-900">{formatDate(date)}</td>
                    <td className="px-5 py-3 text-ink-900">{party}</td>
                    <td className="px-5 py-3 text-right font-medium text-ink-900">{formatCurrency(amount)}</td>
                    <td className="px-5 py-3"><StatusPill status={status} /></td>
                    <td className="px-5 py-3 text-ink-600">{items}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
          <span className="text-xs text-ink-600">Showing {filtered.length} of {purchaseVouchers.length} vouchers</span>
          <span className="text-sm font-medium text-ink-900">Total: {formatCurrency(totalAmount)}</span>
        </div>
      </Card>
    </div>
  );
}
