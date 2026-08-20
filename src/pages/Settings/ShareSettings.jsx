import React, { useState, useEffect } from 'react';
import { Share2, Plus, Trash2 } from 'lucide-react';
import SettingsDetailLayout from '../../components/Settings/SettingsDetailLayout';
import { useCompany } from '../../context/CompanyContext';
import { settingsService } from '../../services/settingsService';

export default function ShareSettings() {
  const { currentCompany } = useCompany();
  const [shares, setShares] = useState([]);
  const [savedShares, setSavedShares] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Accountant');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (currentCompany?.id) {
      settingsService.getAllSettings(currentCompany.id).then(data => {
        if (data.Share) {
          const existing = data.Share.shares || [];
          setShares(existing);
          setSavedShares([...existing]);
        }
      });
    }
  }, [currentCompany?.id]);

  const handleAddShare = () => {
    if (newEmail) {
      setShares([...shares, { email: newEmail, role: newRole }]);
      setNewEmail('');
      setNewRole('Accountant');
    }
  };

  const handleRemoveShare = (index) => {
    setShares(shares.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!currentCompany?.id) return;
    setIsSaving(true);

    // Persist to backend — only shares list, no include* flags
    await settingsService.updateSettings(currentCompany.id, 'Share', {
      shares,
    });

    setSavedShares([...shares]);
    setIsSaving(false);
  };

  const handleSendInvites = async () => {
    if (!currentCompany?.id) return;
    setIsSending(true);

    // Trigger Pucho W-Share-Access webhook (generates tokens + sends invitation emails)
    try {
      await fetch('https://studio.pucho.ai/api/v1/webhooks/EAsRzoLPUf6cRMevg4PwW', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: currentCompany.id,
          shares,
          previousShares: savedShares,
        }),
      });
      alert('Invites sent successfully!');
    } catch (e) {
      console.warn('Share webhook call failed:', e);
      alert('Failed to send invites.');
    }

    setIsSending(false);
  };

  return (
    <SettingsDetailLayout
      title="Share"
      description="Invite accountants or partners — they get full dashboard access via a magic link"
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
              onKeyDown={(e) => e.key === 'Enter' && handleAddShare()}
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
          <p className="text-xs text-kinetic-neutral mt-2">
            Invited people receive a magic link granting full dashboard access. Role is a descriptive label only.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-ink-900">Current Shares</h3>
            <button
              onClick={handleSendInvites}
              disabled={isSending || shares.length === 0}
              className="bg-brand-100 text-brand-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send Invites'}
            </button>
          </div>
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
      </div>
    </SettingsDetailLayout>
  );
}
