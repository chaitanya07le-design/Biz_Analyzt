import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_PAGE_SIZE = 20;

export { DEFAULT_PAGE_SIZE };

export default function VoucherPagination({ currentPage, totalPages, totalRecords, pageSize = DEFAULT_PAGE_SIZE, onPageChange }) {
  if (totalRecords === 0) {
    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
        <span className="text-xs text-ink-600">No records found</span>
      </div>
    );
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const pages = [];
  const maxVisible = 2;
  let start = Math.max(1, currentPage - maxVisible);
  let end = Math.min(totalPages, currentPage + maxVisible);
  if (end - start < 4) {
    if (start === 1) end = Math.min(totalPages, start + 4);
    else start = Math.max(1, end - 4);
  }
  if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
      <span className="text-xs text-ink-600">
        Showing {startRecord}–{endRecord} of {totalRecords}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg text-sm text-ink-600 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pages.map((p, i) => (
            <button
              key={i}
              onClick={() => typeof p === 'number' && onPageChange(p)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? 'bg-kinetic-primary text-white shadow-sm'
                  : typeof p === 'number'
                    ? 'text-ink-600 hover:bg-ink-100'
                    : 'text-ink-400 cursor-default'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg text-sm text-ink-600 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}