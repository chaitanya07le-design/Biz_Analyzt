import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EntityDetailModal from '../../components/shared/EntityDetailModal';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { Plus, Search, Package } from 'lucide-react';
import { useState } from 'react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

export default function Items() {
  const { items, loading } = useGoogleSheetsData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const itemsList = items || [];
  const categories = [...new Set(itemsList.map(i => i.Category || i.category))];

  const filtered = itemsList.filter(i => {
    const name = i.ItemName || i.name || '';
    const category = i.Category || i.category || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (itemId) => {
    setSelectedItemId(itemId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItemId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === 'all' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === cat ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 h-10 bg-ink-50 border border-line rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>
            <Button icon={Plus}>New Item</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const name = item.ItemName || item.name || '';
            const category = item.Category || item.category || '';
            const stock = parseFloat(item.OpeningStock || item.stock) || 0;
            const unit = item.Unit || item.unit || 'Nos';
            const rate = parseFloat(item.SaleRate || item.rate) || 0;
            const gst = parseFloat(item.GST || item.gst) || 18;

            return (
              <div
                key={item.ItemID || item.id}
                onClick={() => handleItemClick(item.ItemID || item.id)}
                className="p-4 rounded-xl border border-line hover:border-brand-300 hover:shadow-card-hover transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{name}</div>
                    <div className="text-xs text-ink-600 mt-1">{category}</div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-600">Stock:</span>
                        <span className={`font-medium ${stock < 20 ? 'text-red-600' : 'text-ink-900'}`}>
                          {stock} {unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-600">Rate:</span>
                        <span className="font-medium text-ink-900">{formatCurrency(rate)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-600">GST:</span>
                        <span className="font-medium text-ink-900">{gst}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <EntityDetailModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        entityType="item"
        entityId={selectedItemId}
      />
    </div>
  );
}
