import { useState } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

export default function VoucherFilters({ filters, onFilterChange, onClear, partyList = [] }) {
  const [showFilters, setShowFilters] = useState(false);
  const [local, setLocal] = useState({
    voucherNo: filters?.voucherNo || '',
    fromDate: filters?.fromDate || '',
    toDate: filters?.toDate || '',
    party: filters?.party || '',
    minAmount: filters?.minAmount || '',
    maxAmount: filters?.maxAmount || '',
  });

  const hasAnyFilter = local.voucherNo || local.fromDate || local.toDate || local.party || local.minAmount || local.maxAmount;
  const activeCount = [local.voucherNo, local.fromDate || local.toDate, local.party, local.minAmount || local.maxAmount].filter(Boolean).length;

  const handleApply = () => {
    onFilterChange({
      voucherNo: local.voucherNo || null,
      fromDate: local.fromDate || null,
      toDate: local.toDate || null,
      party: local.party || null,
      minAmount: local.minAmount ? parseFloat(local.minAmount) : null,
      maxAmount: local.maxAmount ? parseFloat(local.maxAmount) : null,
    });
    setShowFilters(false);
  };

  const handleClear = () => {
    const empty = { voucherNo: '', fromDate: '', toDate: '', party: '', minAmount: '', maxAmount: '' };
    setLocal(empty);
    onClear();
    setShowFilters(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            type="text"
            placeholder="Search by voucher number..."
            value={local.voucherNo}
            onChange={(e) => { setLocal({ ...local, voucherNo: e.target.value }); onFilterChange({ ...filters, voucherNo: e.target.value || null }); }}
            className="w-full pl-9 pr-4 h-10 bg-ink-50 border border-line rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all border ${
            showFilters || hasAnyFilter
              ? 'bg-kinetic-primary/10 border-kinetic-primary/30 text-kinetic-primary'
              : 'bg-white border-gray-200 text-ink-600 hover:bg-ink-100'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        {hasAnyFilter && (
          <button onClick={handleClear} className="flex items-center gap-1 h-10 px-3 rounded-xl text-sm text-ink-600 hover:bg-ink-100 transition-colors">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-ink-50 rounded-xl border border-line">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-ink-900">Filter Vouchers</h3>
            {hasAnyFilter && (
              <button onClick={handleClear} className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-ink-600 mb-1.5">From Date</label>
              <input
                type="date"
                value={local.fromDate}
                onChange={(e) => setLocal({ ...local, fromDate: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-line rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-600 mb-1.5">To Date</label>
              <input
                type="date"
                value={local.toDate}
                onChange={(e) => setLocal({ ...local, toDate: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-line rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-ink-600 mb-1.5">Party</label>
              <div className="relative">
                <select
                  value={local.party}
                  onChange={(e) => setLocal({ ...local, party: e.target.value })}
                  className="w-full h-10 pl-3 pr-8 bg-white border border-line rounded-lg text-sm outline-none focus:border-brand-500 appearance-none"
                >
                  <option value="">All Parties</option>
                  {partyList.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-ink-600 mb-1.5">Min Amount</label>
                <input
                  type="number"
                  placeholder="₹ Min"
                  value={local.minAmount}
                  onChange={(e) => setLocal({ ...local, minAmount: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-line rounded-lg text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-ink-600 mb-1.5">Max Amount</label>
                <input
                  type="number"
                  placeholder="₹ Max"
                  value={local.maxAmount}
                  onChange={(e) => setLocal({ ...local, maxAmount: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-line rounded-lg text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="h-10 px-6 rounded-xl text-sm font-medium text-white shadow-soft hover:brightness-105 transition-all"
              style={{ background: 'linear-gradient(180deg,#5833EF 0%,#3A10CE 100%)', boxShadow: '0 4px 9px rgba(58,16,206,0.25)' }}
            >
              Apply Filters
            </button>
            {hasAnyFilter && (
              <button onClick={handleClear} className="h-10 px-4 rounded-xl text-sm font-medium text-ink-600 bg-white border border-gray-200 hover:bg-ink-100 transition-all">
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}