import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import SettingsDetailLayout from '../../components/Settings/SettingsDetailLayout';
import { useCompany } from '../../context/CompanyContext';
import { settingsService } from '../../services/settingsService';

export default function OutstandingSettings() {
  const { currentCompany } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  
  const [bucket1, setBucket1] = useState(30);
  const [bucket2, setBucket2] = useState(60);
  const [bucket3, setBucket3] = useState(90);
  const [overdueThreshold, setOverdueThreshold] = useState(0);
  const [defaultSort, setDefaultSort] = useState('amount_desc');
  const [defaultFilter, setDefaultFilter] = useState('all');

  useEffect(() => {
    if (currentCompany?.id) {
      settingsService.getAllSettings(currentCompany.id).then(data => {
        if (data.Outstanding) {
          setBucket1(data.Outstanding.bucket1 ?? 30);
          setBucket2(data.Outstanding.bucket2 ?? 60);
          setBucket3(data.Outstanding.bucket3 ?? 90);
          setOverdueThreshold(data.Outstanding.overdueThreshold ?? 0);
          setDefaultSort(data.Outstanding.defaultSort ?? 'amount_desc');
          setDefaultFilter(data.Outstanding.defaultFilter ?? 'all');
        }
      });
    }
  }, [currentCompany?.id]);

  const handleSave = async () => {
    if (!currentCompany?.id) return;
    setIsSaving(true);
    await settingsService.updateSettings(currentCompany.id, 'Outstanding', {
      bucket1,
      bucket2,
      bucket3,
      overdueThreshold,
      defaultSort,
      defaultFilter,
    });
    setIsSaving(false);
  };

  return (
    <SettingsDetailLayout
      title="Outstanding"
      description="Configure outstanding receivable/payable settings"
      icon={AlertCircle}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="space-y-6 max-w-2xl">
        <div>
          <h3 className="text-sm font-bold text-ink-900 mb-3">Aging Buckets (Days)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-kinetic-neutral mb-1">Bucket 1 (0 to X)</label>
              <input
                type="number"
                className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                value={bucket1}
                onChange={(e) => setBucket1(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-kinetic-neutral mb-1">Bucket 2 (X+1 to Y)</label>
              <input
                type="number"
                className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                value={bucket2}
                onChange={(e) => setBucket2(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-kinetic-neutral mb-1">Bucket 3 (Y+1 to Z)</label>
              <input
                type="number"
                className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                value={bucket3}
                onChange={(e) => setBucket3(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <p className="text-xs text-kinetic-neutral mt-2">
            Remaining invoices will be grouped in the "{bucket3}+ days" bucket.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-ink-900 mb-3">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-900 mb-1">Overdue Threshold (Days)</label>
              <p className="text-xs text-kinetic-neutral mb-2">Days after due date before an invoice is marked as overdue.</p>
              <input
                type="number"
                className="w-32 rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                value={overdueThreshold}
                onChange={(e) => setOverdueThreshold(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">Default Sort Order</label>
                <select
                  className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                  value={defaultSort}
                  onChange={(e) => setDefaultSort(e.target.value)}
                >
                  <option value="amount_desc">Amount (High to Low)</option>
                  <option value="amount_asc">Amount (Low to High)</option>
                  <option value="name_asc">Party Name (A-Z)</option>
                  <option value="due_date">Due Date</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">Default Filter</label>
                <select
                  className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                  value={defaultFilter}
                  onChange={(e) => setDefaultFilter(e.target.value)}
                >
                  <option value="all">All Outstanding</option>
                  <option value="overdue">Overdue Only</option>
                  <option value="not_due">Not Due</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
