import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { Plus, Search, Building2, Wallet } from 'lucide-react';
import { useState, useMemo } from 'react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

export default function Accounts() {
  const { bankAccounts, cashAccounts, loading } = useGoogleSheetsData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const bankAccountsList = bankAccounts || [];
  const cashAccountsList = cashAccounts || [];

  const normalizedAccounts = useMemo(() => {
    const bankAccs = bankAccountsList.map(b => ({
      id: b.BankID || b.id,
      name: b.BankName || b.name || '',
      type: 'Bank',
      accountNo: b.AccountNo || b.accountNo || '',
      branch: b.BranchName || b.branch || '',
      balance: parseFloat(b.OpeningBalance || b.balance || 0),
    }));
    
    const cashAccs = cashAccountsList.map(c => ({
      id: c.CashID || c.id,
      name: c.CashType || c.name || 'Cash',
      type: 'Cash',
      accountNo: '',
      branch: '',
      balance: parseFloat(c.OpeningBalance || c.balance || 0),
    }));
    
    return [...bankAccs, ...cashAccs];
  }, [bankAccountsList, cashAccountsList]);

  const filtered = normalizedAccounts.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.accountNo.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const totalBalance = filtered.reduce((sum, a) => sum + a.balance, 0);

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
              onClick={() => setTypeFilter('bank')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === 'bank' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              Bank
            </button>
            <button
              onClick={() => setTypeFilter('cash')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === 'cash' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              Cash
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 h-10 bg-ink-50 border border-line rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>
            <Button icon={Plus}>New Account</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((account) => (
            <div
              key={account.id}
              className="p-4 rounded-xl border border-line hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  account.type === 'Bank' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {account.type === 'Bank' ? (
                    <Building2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Wallet className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 truncate">{account.name}</div>
                  {account.accountNo && (
                    <div className="text-xs text-ink-500 font-mono mt-0.5">{account.accountNo}</div>
                  )}
                  {account.branch && (
                    <div className="text-xs text-ink-600 mt-1">{account.branch}</div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      account.type === 'Bank' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {account.type}
                    </span>
                    <span className={`text-sm font-semibold ${
                      account.balance >= 0 ? 'text-green-700' : 'text-red-600'
                    }`}>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-ink-muted">
            <p>No accounts found</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
          <span className="text-xs text-ink-600">Showing {filtered.length} accounts</span>
          <span className="text-sm font-semibold text-ink-900">
            Total: {formatCurrency(totalBalance)}
          </span>
        </div>
      </Card>
    </div>
  );
}
