import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AgingBarChart = ({ data, height = 250 }) => {
  const getBarColor = (bucket) => {
    const colors = {
      'Not Due': '#6B7280',
      '0-30': '#F59E0B',
      '31-60': '#F97316',
      '61-90': '#EF4444',
      '>90': '#B91C1C',
    };
    return colors[bucket] || '#6B7280';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-canvas-faint rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-ink-default">{data.bucket}</p>
          <p className="text-sm text-ink-muted mt-1">
            ₹{data.amount.toLocaleString('en-IN')}
          </p>
          {data.count !== undefined && (
            <p className="text-xs text-ink-faint mt-1">
              {data.count} bills
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="bucket" 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={{ stroke: '#E5E7EB' }}
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.bucket)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AgingBarChart;
