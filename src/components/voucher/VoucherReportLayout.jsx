import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import StatusPill from '../ui/StatusPill';
import VoucherFilters from './VoucherFilters';
import VoucherPagination, { DEFAULT_PAGE_SIZE } from './VoucherPagination';
import { Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function VoucherReportLayout({
  title,
  data = [],
  loading = false,
  columns = [],
  tallyData = null,
  isTallyPage = false,
  partyList = [],
  onRowClick,
  exportButton = false,
  emptyMessage = 'No vouchers found',
  showBackButton = false,
}) {
  const activeData = tallyData ?? data;

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  const handleRowClick = (row) => {
    if (isTallyPage) {
      const vNo = row.VoucherNo || row.voucherNo || '—';
      const vType = row.VoucherType || row.type || 'Unknown';
      const vId = row.VoucherID || row.id || row.voucher_id || '';
      navigate(`/tally-voucher/${vType}/${encodeURIComponent(vNo)}${vId ? `?id=${encodeURIComponent(vId)}` : ''}`);
    } else if (onRowClick) {
      onRowClick(row);
    }
  };

  const filteredData = useMemo(() => {
    let result = activeData;
    if (filters.voucherNo) {
      const q = filters.voucherNo.toLowerCase();
      result = result.filter((v) => {
        const no = (v.VoucherNo || v.voucherNo || v.VoucherID || v.id || '').toLowerCase();
        return no.includes(q);
      });
    }
    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      result = result.filter((v) => {
        const d = new Date(v.VoucherDate || v.date);
        return d >= from;
      });
    }
    if (filters.toDate) {
      const to = new Date(filters.toDate);
      to.setHours(23, 59, 59, 999);
      result = result.filter((v) => {
        const d = new Date(v.VoucherDate || v.date);
        return d <= to;
      });
    }
    if (filters.party) {
      const q = filters.party.toLowerCase();
      result = result.filter((v) => {
        const p = (v.PartyName || v.party || '').toLowerCase();
        return p.includes(q);
      });
    }
    if (filters.minAmount != null) {
      result = result.filter((v) => {
        const a = parseFloat(v.NetAmount || v.amount || v.GrandTotal) || 0;
        return a >= filters.minAmount;
      });
    }
    if (filters.maxAmount != null) {
      result = result.filter((v) => {
        const a = parseFloat(v.NetAmount || v.amount || v.GrandTotal) || 0;
        return a <= filters.maxAmount;
      });
    }
    return result;
  }, [activeData, filters]);

  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      let va = a[sortBy] ?? a[sortBy.toLowerCase()] ?? '';
      let vb = b[sortBy] ?? b[sortBy.toLowerCase()] ?? '';
      
      if (sortBy === 'date' || sortBy === 'VoucherDate') {
        va = new Date(a.VoucherDate || a.date || 0).getTime();
        vb = new Date(b.VoucherDate || b.date || 0).getTime();
      } else if (sortBy === 'party') {
        va = (a.PartyName || a.party || '').toLowerCase();
        vb = (b.PartyName || b.party || '').toLowerCase();
      } else if (sortBy === 'amount' || sortBy === 'NetAmount') {
        va = parseFloat(a.NetAmount || a.amount || a.GrandTotal) || 0;
        vb = parseFloat(b.NetAmount || b.amount || b.GrandTotal) || 0;
      }
      
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortBy, sortOrder]);

  const totalRecords = sortedData.length;
  const totalPages = Math.ceil(totalRecords / DEFAULT_PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedData = sortedData.slice((safePage - 1) * DEFAULT_PAGE_SIZE, safePage * DEFAULT_PAGE_SIZE);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, v) => sum + (parseFloat(v.NetAmount || v.amount || v.GrandTotal) || 0), 0);
  }, [filteredData]);

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4 text-ink-500" />;
    if (sortOrder === 'asc') return <ArrowUp className="w-4 h-4 text-kinetic-primary" />;
    return <ArrowDown className="w-4 h-4 text-kinetic-primary" />;
  };

  const defaultColumnRender = (row, col) => {
    const val = row[col.key] ?? row[col.key.toLowerCase()];
    if (col.format === 'currency') return formatCurrency(val);
    if (col.format === 'date') return formatDate(val);
    if (col.format === 'status') return <StatusPill status={val || 'POSTED'} />;
    return val ?? '-';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-ink-100 rounded-xl w-64" />
            <div className="h-80 bg-ink-50 rounded-xl" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button onClick={() => window.history.back()} className="p-2 hover:bg-canvas-faint rounded-lg transition-colors -ml-2">
                <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
              {isTallyPage && <span className="text-xs text-kinetic-primary font-medium">LIVE TALLY</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {exportButton && (
              <button className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium text-ink-600 bg-white border border-gray-200 hover:bg-ink-100 transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            )}
          </div>
        </div>

        <VoucherFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
          partyList={partyList}
        />

        <div className="overflow-x-auto -mx-5 mt-4">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-ink-600">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-5 py-3 font-medium ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.sortable ? 'cursor-pointer select-none hover:bg-ink-100 hover:text-ink-900 transition-colors' : ''}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                    title={col.sortable ? `Sort by ${col.label}` : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon column={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-ink-500">{emptyMessage}</td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={row.VoucherID || row.id || idx}
                    className={`hover:bg-ink-50 transition-colors ${isTallyPage || onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => handleRowClick(row)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-5 py-3 ${col.align === 'right' ? 'text-right' : ''} ${col.key === 'voucherNo' || col.key === 'VoucherNo' ? 'font-medium text-brand-600' : 'text-ink-900'} ${col.key === 'amount' || col.key === 'Amount' ? 'font-medium' : ''}`}
                      >
                        {col.render ? col.render(row) : defaultColumnRender(row, col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
          <span className="text-xs text-ink-600">{isTallyPage ? 'LIVE TALLY · ' : ''}Showing {paginatedData.length} of {totalRecords} vouchers</span>
          <span className="text-sm font-medium text-ink-900">Total: {formatCurrency(totalAmount)}</span>
        </div>

        <VoucherPagination
          currentPage={safePage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}