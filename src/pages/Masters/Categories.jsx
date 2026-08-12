import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EntityDetailModal from '../../components/shared/EntityDetailModal';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { Plus, Search, Tags, Package } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Categories() {
  const { itemCategories, itemGroups, items, loading } = useGoogleSheetsData();
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categoriesList = itemCategories || [];

  const normalizedCategories = useMemo(() => {
    return categoriesList.map(c => ({
      id: c.CategoryID || c.id,
      name: c.CategoryName || c.name || '',
    }));
  }, [categoriesList]);

  const groupsList = itemGroups || [];

  const normalizedGroups = useMemo(() => {
    return groupsList.map(g => ({
      id: g.GroupID || g.id,
      name: g.GroupName || g.name || '',
      categoryId: g.CategoryID || g.categoryId,
    }));
  }, [groupsList]);

  const itemsList = items || [];

  const getCategoryStats = (categoryId) => {
    const categoryGroups = normalizedGroups.filter(g => g.categoryId === categoryId);
    const groupIds = categoryGroups.map(g => g.id);
    const itemCount = itemsList.filter(i => 
      groupIds.includes(i.ItemGroupID || i.itemGroupId)
    ).length;
    return { groupCount: categoryGroups.length, itemCount };
  };

  const filtered = normalizedCategories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCategoryId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 bg-ink-50 border border-line rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
          </div>
          
          <Button icon={Plus}>New Category</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((category) => {
            const stats = getCategoryStats(category.id);
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="p-4 rounded-xl border border-line hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Tags className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{category.name}</div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-ink-600">
                        <Package className="w-3 h-3" />
                        <span>{stats.groupCount} groups</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-ink-600">
                        <span>{stats.itemCount} items</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-ink-muted">
            <p>No categories found</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
          <span className="text-xs text-ink-600">
            {filtered.length} categories, {normalizedGroups.length} item groups, {itemsList.length} items
          </span>
        </div>
      </Card>

      <EntityDetailModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        entityType="category"
        entityId={selectedCategoryId}
      />
    </div>
  );
}
