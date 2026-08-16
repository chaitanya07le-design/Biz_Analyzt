import React, { useState, useEffect } from 'react';
import { Share2, Plus, Trash2 } from 'lucide-react';
import SettingsDetailLayout from '../../components/Settings/SettingsDetailLayout';
import { useCompany } from '../../context/CompanyContext';
import { settingsService } from '../../services/settingsService';

export default function ShareSettings() {
  const { currentCompany } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  const [shares, setShares] = useState([]);
  const [includeVouchers, setIncludeVouchers] = useState(true);
  const [includeMasters, setIncludeMasters] = useState(true);
  const [includeReports, setIncludeReports] = useState(true);
  const [includeOutstanding, setIncludeOutstanding] = useState(true);

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('View-only');

  useEffect(() => {
    if (currentCompany?.id) {
      settingsService.getAllSettings(currentCompany.id).then(data => {
        if (data.Share) {
          setShares(data.Share.shares || []);
          setIncludeVouchers(data.Share.includeVouchers ?? true);
          setIncludeMasters(data.Share.includeMasters ?? true);
          setIncludeReports(data.Share.includeReports ?? true);
          setIncludeOutstanding(data.Share.includeOutstanding ?? true);
        }
      });
    }
  }, [currentCompany?.id]);

  const handleAddShare = () => {
    if (newEmail) {
      setShares([...shares, { email: newEmail, role: newRole }]);
      setNewEmail('');
      setNewRole('View-only');
    }
  };

  const handleRemoveShare = (index) => {
    setShares(shares.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!currentCompany?.id) return;
    setIsSaving(true);
    await settingsService.updateSettings(currentCompany.id, 'Share', {
      shares,
      includeVouchers,
      includeMasters,
      includeReports,
      includeOutstanding,
    });
    setIsSaving(false);
  };

  return (
    <SettingsDetailLayout
      title="Share"
      description="Share company data with accountants or partners"
      icon={Share2}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="space-y-6 max-w-2xl">
        <div>
          <h3 className="text-sm font-bold text-ink-900 mb-3">Add Person</h3>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 focus:border-kinetic-primary outline-none"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <select
              className="rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="Accountant">Accountant</option>
              <option value="Partner">Partner</option>
              <option value="View-only">View-only</option>
            </select>
            <button
              onClick={handleAddShare}
              className="bg-kinetic-primary text-white p-2 rounded-lg hover:bg-kinetic-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink-900 mb-3">Current Shares</h3>
          {shares.length === 0 ? (
            <p className="text-sm text-kinetic-neutral italic">No one currently has access.</p>
          ) : (
            <div className="space-y-2">
              {shares.map((share, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{share.email}</p>
                    <p className="text-xs text-kinetic-neutral">{share.role}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveShare(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-ink-900 mb-4">Data Inclusion</h3>
          <div className="space-y-3">
            {[
              { label: 'Include Vouchers', state: includeVouchers, setState: setIncludeVouchers },
              { label: 'Include Masters', state: includeMasters, setState: setIncludeMasters },
              { label: 'Include Reports', state: includeReports, setState: setIncludeReports },
              { label: 'Include Outstanding', state: includeOutstanding, setState: setIncludeOutstanding },
            ].map((item, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={(e) => item.setState(e.target.checked)}
                  className="w-4 h-4 text-kinetic-primary rounded border-slate-300 focus:ring-kinetic-primary"
                />
                <span className="text-sm font-medium text-ink-900">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
