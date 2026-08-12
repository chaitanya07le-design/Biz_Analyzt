import React, { useState } from 'react';

const DateRangePicker = ({ startDate, endDate, onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('thisMonth');

  const presets = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'This Quarter', value: 'thisQuarter' },
    { label: 'This Year', value: 'thisYear' },
    { label: 'Custom', value: 'custom' },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const today = new Date();
      let start = new Date();
      let end = new Date();

      switch (preset) {
        case 'today':
          break;
        case 'thisWeek':
          start.setDate(today.getDate() - today.getDay());
          break;
        case 'thisMonth':
          start.setDate(1);
          break;
        case 'thisQuarter':
          const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
          start.setMonth(quarterMonth, 1);
          break;
        case 'thisYear':
          const fyStart = new Date(today.getFullYear(), 3, 1);
          if (today < fyStart) {
            start.setFullYear(today.getFullYear() - 1, 3, 1);
          } else {
            start = fyStart;
          }
          break;
      }

      onDateChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-canvas-faint rounded-lg bg-white hover:bg-canvas-subtle transition-colors"
      >
        <svg className="w-5 h-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm text-ink-default">
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
        <svg className="w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-canvas-faint rounded-lg shadow-lg p-4 z-50 w-80">
          <div className="space-y-3 mb-4">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetChange(preset.value)}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  selectedPreset === preset.value
                    ? 'bg-brand-primary text-white'
                    : 'hover:bg-canvas-subtle text-ink-default'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {selectedPreset === 'custom' && (
            <div className="border-t border-canvas-faint pt-4 space-y-3">
              <div>
                <label className="text-xs text-ink-muted block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onDateChange(e.target.value, endDate)}
                  className="w-full px-3 py-2 border border-canvas-faint rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onDateChange(startDate, e.target.value)}
                  className="w-full px-3 py-2 border border-canvas-faint rounded text-sm"
                />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-brand-primary text-white py-2 rounded text-sm font-medium hover:opacity-90"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
