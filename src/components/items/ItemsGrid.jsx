import React from 'react';
import ItemCard from './ItemCard';

const ItemsGrid = ({ items, onItemClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          item={item}
          index={index}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
};

export default ItemsGrid;
