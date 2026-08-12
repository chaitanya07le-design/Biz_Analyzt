import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReportList = ({ 
  items, 
  columns, 
  viewMode = 'ledger',
  basePath,
  onItemClick 
}) => {
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (onItemClick) {
      onItemClick(item);
    } else if (basePath) {
      navigate(`${basePath}/${item.id}`);
    }
  };

  const formatValue = (value, type) => {
    if (value === null || value === undefined) return '—';
    if (type === 'currency') return `₹${Math.abs(value).toLocaleString('en-IN')}`;
    if (type === 'date') return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
    return value;
  };

  const getAmountColor = (value) => {
    if (viewMode === 'bills') {
      return value > 0 ? 'text-red-600' : value < 0 ? 'text-green-600' : 'text-ink-default';
    }
    return 'text-ink-default';
  };

  return (
    <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-canvas-subtle">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx}
                  className={`px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-faint">
            {items.map((item, idx) => (
              <tr 
                key={idx}
                className="hover:bg-canvas-subtle cursor-pointer"
                onClick={() => handleClick(item)}
              >
                {columns.map((col, colIdx) => (
                  <td 
                    key={colIdx}
                    className={`px-4 py-3 text-sm ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.type === 'currency' ? getAmountColor(item[col.key]) : 'text-ink-default'} ${
                      col.monospace ? 'font-mono' : ''
                    }`}
                  >
                    {col.render ? col.render(item) : formatValue(item[col.key], col.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-canvas-faint">
        {items.map((item, idx) => (
          <div 
            key={idx}
            className="p-4 cursor-pointer hover:bg-canvas-subtle"
            onClick={() => handleClick(item)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                {columns.slice(0, 2).map((col, colIdx) => (
                  <div key={colIdx}>
                    {colIdx === 0 && (
                      <p className="text-sm font-medium text-ink-default">
                        {col.render ? col.render(item) : formatValue(item[col.key], col.type)}
                      </p>
                    )}
                    {colIdx === 1 && (
                      <p className="text-xs text-ink-muted mt-0.5">
                        {col.render ? col.render(item) : formatValue(item[col.key], col.type)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-right">
                {columns.filter(c => c.type === 'currency').slice(0, 1).map((col, colIdx) => (
                  <p key={colIdx} className={`text-sm font-semibold ${getAmountColor(item[col.key])}`}>
                    {formatValue(item[col.key], col.type)}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex gap-4 text-xs text-ink-muted">
              {columns.slice(2).filter(c => c.type === 'currency' || c.type === 'date').map((col, colIdx) => (
                <span key={colIdx}>
                  {col.header}: {formatValue(item[col.key], col.type)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="p-12 text-center">
          <svg className="w-12 h-12 text-ink-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-ink-muted">No records found</p>
        </div>
      )}
    </div>
  );
};

export default ReportList;
