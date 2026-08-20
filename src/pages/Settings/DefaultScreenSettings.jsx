import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import SettingsDetailLayout from '../../components/Settings/SettingsDetailLayout';
import { useCompany } from '../../context/CompanyContext';
import { settingsService } from '../../services/settingsService';

export default function DefaultScreenSettings() {
  const { currentCompany } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  
  const [defaultScreen, setDefaultScreen] = useState('/dashboard');

  useEffect(() => {
    if (currentCompany?.id) {
      settingsService.getAllSettings(currentCompany.id).then(data => {
        // Appending _USER001 since we simulate a per-user per-company setting
        if (data.UserPreference && data.UserPreference['DefaultScreen_USER001']) {
          setDefaultScreen(data.UserPreference['DefaultScreen_USER001']);
        }
      });
    }
  }, [currentCompany?.id]);

  const handleSave = async () => {
    if (!currentCompany?.id) return;
    setIsSaving(true);
    await settingsService.updateSettings(currentCompany.id, 'UserPreference', {
      'DefaultScreen_USER001': defaultScreen,
    });
    setIsSaving(false);
  };

  const screens = [
    { id: '/dashboard', label: 'Dashboard', desc: 'Main analytical view with KPIs and charts' },
    { id: '/vouchers/sales', label: 'Vouchers', desc: 'Recent transactions and data entry' },
    { id: '/masters/parties', label: 'Masters', desc: 'Parties, items, ledgers list' },
    { id: '/reports', label: 'Reports', desc: 'All financial reports' },
    { id: '/outstanding', label: 'Outstanding', desc: 'Receivable and payable tracking' },
  ];

  return (
    <SettingsDetailLayout
      title="Default App Screen"
      category="UserPreference"
      description="Choose default landing screen (Dashboard)"
      icon={LayoutDashboard}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="space-y-6 max-w-2xl">
        <p className="text-sm text-kinetic-neutral mb-4">
          Select the screen you want to see first when you log into this company.
          (Note: This preference is saved per user).
        </p>

        <div className="space-y-3">
          {screens.map(screen => (
            <label
              key={screen.id}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                defaultScreen === screen.id 
                  ? 'border-kinetic-primary bg-kinetic-primary/5' 
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="defaultScreen"
                  value={screen.id}
                  checked={defaultScreen === screen.id}
                  onChange={(e) => setDefaultScreen(e.target.value)}
                  className="w-4 h-4 text-kinetic-primary focus:ring-kinetic-primary"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-ink-900">{screen.label}</p>
                <p className="text-xs text-kinetic-neutral mt-1">{screen.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
