import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DonutChart = ({ data, height = 200, innerRadius = 60, outerRadius = 80 }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-canvas-faint rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-ink-default">{data.name}</p>
          <p className="text-sm text-ink-muted mt-1">
            ₹{data.value.toLocaleString('en-IN')}
          </p>
          {data.percentage !== undefined && (
            <p className="text-xs text-ink-faint mt-1">
              {data.percentage.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;
