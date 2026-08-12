import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { Plus, Search, FolderOpen, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Groups() {
  const { groups, loading } = useGoogleSheetsData();
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const groupsList = groups || [];

  const normalizedGroups = useMemo(() => {
    return groupsList.map(g => ({
      id: g.GroupID || g.id,
      name: g.GroupName || g.name || '',
      type: g.GroupType || g.type || '',
      parentId: g.ParentGroupID || g.parentId || g.ParentID,
      isSystem: g.IsSystem === 'TRUE' || g.isSystem === true,
    }));
  }, [groupsList]);

  const filtered = normalizedGroups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const rootGroups = filtered.filter(g => !g.parentId);
  const childGroups = (parentId) => filtered.filter(g => g.parentId === parentId);

  const toggleGroup = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getGroupTypeColor = (type) => {
    const colors = {
      'Assets': 'bg-green-50 text-green-700',
      'Liabilities': 'bg-red-50 text-red-700',
      'Income': 'bg-blue-50 text-blue-700',
      'Expense': 'bg-orange-50 text-orange-700',
      'Equity': 'bg-purple-50 text-purple-700'
    };
    return colors[type] || 'bg-gray-50 text-gray-700';
  };

  const renderGroup = (group, level = 0) => {
    const children = childGroups(group.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedGroups.has(group.id);

    return (
      <div key={group.id}>
        <div 
          className={`flex items-center justify-between px-4 py-3 hover:bg-ink-50 cursor-pointer transition-colors ${level > 0 ? 'ml-6 border-l-2 border-canvas-faint' : ''}`}
          onClick={() => hasChildren && toggleGroup(group.id)}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <ChevronRight className={`w-4 h-4 text-ink-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            ) : (
              <div className="w-4" />
            )}
            <FolderOpen className="w-5 h-5 text-brand-500" />
            <div>
              <p className="text-sm font-medium text-ink-900">{group.name}</p>
              <p className="text-xs text-ink-500">{group.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {group.isSystem && (
              <span className="text-xs text-ink-400 bg-canvas-faint px-2 py-0.5 rounded">System</span>
            )}
            <span className={`text-xs font-medium px-2 py-1 rounded ${getGroupTypeColor(group.type)}`}>
              {group.type}
            </span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-0">
            {children.map(child => renderGroup(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 bg-ink-50 border border-line rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
          </div>
          
          <Button icon={Plus}>New Group</Button>
        </div>

        <div className="divide-y divide-canvas-faint">
          {rootGroups.map(group => renderGroup(group))}
        </div>

        {rootGroups.length === 0 && (
          <div className="px-4 py-8 text-center text-ink-muted">
            <p>No groups found</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
          <span className="text-xs text-ink-600">
            {filtered.length} groups ({normalizedGroups.filter(g => g.isSystem).length} system, {normalizedGroups.filter(g => !g.isSystem).length} custom)
          </span>
        </div>
      </Card>
    </div>
  );
}
