import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import SettingsDetailLayout from '../../components/Settings/SettingsDetailLayout';
import { useCompany } from '../../context/CompanyContext';
import { settingsService } from '../../services/settingsService';

export default function DateSettings() {
  const { currentCompany } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  
  const [fyStartMonth, setFyStartMonth] = useState(4); // April (1-indexed)
  const [dateFormat, setDateFormat] = useState('DD-MM-YYYY');
  const [defaultRange, setDefaultRange] = useState('this_fy');

  useEffect(() => {
    if (currentCompany?.id) {
      settingsService.getAllSettings(currentCompany.id).then(data => {
        if (data.Date) {
          setFyStartMonth(data.Date.fyStartMonth ?? 4);
          setDateFormat(data.Date.dateFormat ?? 'DD-MM-YYYY');
          setDefaultRange(data.Date.defaultRange ?? 'this_fy');
        }
      });
    }
  }, [currentCompany?.id]);

  const handleSave = async () => {
    if (!currentCompany?.id) return;
    setIsSaving(true);
    await settingsService.updateSettings(currentCompany.id, 'Date', {
      fyStartMonth,
      dateFormat,
      defaultRange,
    });
    setIsSaving(false);
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <SettingsDetailLayout
      title="Date Settings"
      description="Set financial year and date preferences"
      icon={Calendar}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">Financial Year Start Month</label>
            <select
              className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
              value={fyStartMonth}
              onChange={(e) => setFyStartMonth(parseInt(e.target.value))}
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">Default Date Format</label>
            <select
              className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
            >
              <option value="DD-MM-YYYY">DD-MM-YYYY (e.g. 31-12-2024)</option>
              <option value="MM-DD-YYYY">MM-DD-YYYY (e.g. 12-31-2024)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2024-12-31)</option>
              <option value="DD MMM YYYY">DD MMM YYYY (e.g. 31 Dec 2024)</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <label className="block text-sm font-bold text-ink-900 mb-2">Default Dashboard Date Range</label>
          <p className="text-xs text-kinetic-neutral mb-3">The default date range applied when you log in.</p>
          <select
            className="w-1/2 rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
            value={defaultRange}
            onChange={(e) => setDefaultRange(e.target.value)}
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_fy">This Financial Year</option>
            <option value="last_fy">Last Financial Year</option>
            <option value="all_time">All Time</option>
          </select>
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
