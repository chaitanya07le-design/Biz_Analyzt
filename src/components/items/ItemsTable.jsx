import React from 'react';
import ItemRow from './ItemRow';

const ItemsTable = ({ items, onItemClick }) => {
  return (
    <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-canvas-subtle">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
              Item
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
              HSN/SAC
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
              Unit
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
              Stock
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">
              Value
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">
              Sale Rate
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-canvas-faint">
          {items.map((item, index) => (
            <ItemRow
              key={item.id}
              item={item}
              index={index}
              onClick={() => onItemClick(item)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;
