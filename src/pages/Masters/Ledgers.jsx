import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { Plus, Search, Calculator } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

export default function Ledgers() {
  const { ledgers, groups, loading } = useGoogleSheetsData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const ledgersList = ledgers || [];
  const groupsList = groups || [];

  const groupsById = useMemo(() => {
    const map = {};
    groupsList.forEach(g => {
      const id = g.GroupID || g.id;
      if (id) map[id] = g;
    });
    return map;
  }, [groupsList]);

  const normalizedLedgers = useMemo(() => {
    return ledgersList.map(l => {
      const groupId = l.GroupID || l.groupId || '';
      const group = groupsById[groupId] || {};
      const nature = (group.Nature || '').toLowerCase();
      
      let type = nature;
      if (nature === 'income') {
        type = 'revenue';
      } else if (nature === 'equity') {
        type = 'liability';
      }
      
      return {
        id: l.LedgerID || l.id,
        name: l.LedgerName || l.name || '',
        group: group.GroupName || l.Group || l.group || '',
        groupId: groupId,
        type: type,
        balance: parseFloat(l.OpeningBalance || l.balance || 0),
      };
    });
  }, [ledgersList, groupsById]);

  const filtered = normalizedLedgers.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.group.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getLedgerTypeColor = (type) => {
    const colors = {
      'asset': 'text-green-600 bg-green-50',
      'liability': 'text-red-600 bg-red-50',
      'revenue': 'text-blue-600 bg-blue-50',
      'expense': 'text-orange-600 bg-orange-50',
      'equity': 'text-purple-600 bg-purple-50'
    };
    return colors[type?.toLowerCase()] || 'text-gray-600 bg-gray-50';
  };

  const handleLedgerClick = (ledgerId) => {
    navigate(`/ledger/${ledgerId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === 'all' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('asset')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === 'asset' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              Assets
            </button>
            <button
              onClick={() => setTypeFilter('liability')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === 'liability' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              Liabilities
            </button>
            <button
              onClick={() => setTypeFilter('revenue')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === 'revenue' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === 'expense' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              Expenses
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input
                type="text"
                placeholder="Search ledgers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 h-10 bg-ink-50 border border-line rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>
            <Button icon={Plus}>New Ledger</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ledger) => (
            <div
              key={ledger.id}
              onClick={() => handleLedgerClick(ledger.id)}
              className="p-4 rounded-xl border border-line hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 truncate">{ledger.name}</div>
                  <div className="text-xs text-ink-600 mt-1">{ledger.group}</div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLedgerTypeColor(ledger.type)}`}>
                      {ledger.type}
                    </span>
                    <span className={`text-sm font-semibold ${
                      ledger.balance >= 0 ? 'text-green-700' : 'text-red-600'
                    }`}>
                      {formatCurrency(ledger.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-ink-muted">
            <p>No ledgers found</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
          <span className="text-xs text-ink-600">Showing {filtered.length} of {normalizedLedgers.length} ledgers</span>
        </div>
      </Card>
    </div>
  );
}
