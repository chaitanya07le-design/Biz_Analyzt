import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import SettingsDetailLayout from '../../components/Settings/SettingsDetailLayout';
import { useCompany } from '../../context/CompanyContext';
import { settingsService } from '../../services/settingsService';

export default function DataEntrySettings() {
  const { currentCompany } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  
  const [defaultVoucherType, setDefaultVoucherType] = useState('Sales');
  const [defaultLedger, setDefaultLedger] = useState('');
  const [autoNumbering, setAutoNumbering] = useState(true);
  const [prefillLastUsed, setPrefillLastUsed] = useState(false);

  useEffect(() => {
    if (currentCompany?.id) {
      settingsService.getAllSettings(currentCompany.id).then(data => {
        if (data.DataEntry) {
          setDefaultVoucherType(data.DataEntry.defaultVoucherType ?? 'Sales');
          setDefaultLedger(data.DataEntry.defaultLedger ?? '');
          setAutoNumbering(data.DataEntry.autoNumbering ?? true);
          setPrefillLastUsed(data.DataEntry.prefillLastUsed ?? false);
        }
      });
    }
  }, [currentCompany?.id]);

  const handleSave = async () => {
    if (!currentCompany?.id) return;
    setIsSaving(true);
    await settingsService.updateSettings(currentCompany.id, 'DataEntry', {
      defaultVoucherType,
      defaultLedger,
      autoNumbering,
      prefillLastUsed,
    });
    setIsSaving(false);
  };

  return (
    <SettingsDetailLayout
      title="Data Entry"
      category="DataEntry"
      description="Customize default values for voucher entry"
      icon={Database}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">Default Voucher Type</label>
            <select
              className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
              value={defaultVoucherType}
              onChange={(e) => setDefaultVoucherType(e.target.value)}
            >
              <option value="Sales">Sales</option>
              <option value="Purchase">Purchase</option>
              <option value="Receipt">Receipt</option>
              <option value="Payment">Payment</option>
              <option value="Journal">Journal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">Default Ledger</label>
            <input
              type="text"
              placeholder="e.g. Cash Account"
              className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
              value={defaultLedger}
              onChange={(e) => setDefaultLedger(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-ink-900 mb-3">Preferences</h3>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoNumbering}
              onChange={(e) => setAutoNumbering(e.target.checked)}
              className="w-4 h-4 text-kinetic-primary rounded border-slate-300 focus:ring-kinetic-primary"
            />
            <div>
              <p className="text-sm font-medium text-ink-900">Enable Auto-numbering</p>
              <p className="text-xs text-kinetic-neutral">Automatically generate the next voucher number.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefillLastUsed}
              onChange={(e) => setPrefillLastUsed(e.target.checked)}
              className="w-4 h-4 text-kinetic-primary rounded border-slate-300 focus:ring-kinetic-primary"
            />
            <div>
              <p className="text-sm font-medium text-ink-900">Prefill Last Used Values</p>
              <p className="text-xs text-kinetic-neutral">Instead of defaults, prefill the form with values from your last entry.</p>
            </div>
          </label>
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
