import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import SettingsDetailLayout from '../../components/Settings/SettingsDetailLayout';
import { useCompany } from '../../context/CompanyContext';
import { settingsService } from '../../services/settingsService';

export default function NotificationSettings() {
  const { currentCompany } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  
  const [events, setEvents] = useState({
    newVoucher: { enabled: true, channels: ['in-app'] },
    syncFailure: { enabled: true, channels: ['in-app', 'email'] },
    paymentReceived: { enabled: true, channels: ['in-app'] },
    reminderSent: { enabled: false, channels: ['in-app'] },
    overdueAlert: { enabled: true, channels: ['in-app', 'email'] }
  });

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  useEffect(() => {
    if (currentCompany?.id) {
      settingsService.getAllSettings(currentCompany.id).then(data => {
        if (data.Notification) {
          if (data.Notification.events) setEvents(data.Notification.events);
          setQuietHoursEnabled(data.Notification.quietHoursEnabled ?? false);
          setQuietHoursStart(data.Notification.quietHoursStart ?? '22:00');
          setQuietHoursEnd(data.Notification.quietHoursEnd ?? '08:00');
        }
      });
    }
  }, [currentCompany?.id]);

  const handleSave = async () => {
    if (!currentCompany?.id) return;
    setIsSaving(true);
    await settingsService.updateSettings(currentCompany.id, 'Notification', {
      events,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
    });
    setIsSaving(false);
  };

  const toggleEvent = (key) => {
    setEvents(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  };

  const toggleChannel = (key, channel) => {
    setEvents(prev => {
      const current = prev[key].channels;
      const newChannels = current.includes(channel)
        ? current.filter(c => c !== channel)
        : [...current, channel];
      return {
        ...prev,
        [key]: { ...prev[key], channels: newChannels }
      };
    });
  };

  const eventLabels = {
    newVoucher: 'New voucher synced',
    syncFailure: 'Sync failure',
    paymentReceived: 'Payment received',
    reminderSent: 'Reminder sent',
    overdueAlert: 'Overdue alert'
  };

  return (
    <SettingsDetailLayout
      title="Notification"
      description="Manage notification preferences"
      icon={Bell}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="space-y-6 max-w-2xl">
        <div>
          <h3 className="text-sm font-bold text-ink-900 mb-4">Event Subscriptions</h3>
          <div className="space-y-4">
            {Object.keys(eventLabels).map(key => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={events[key].enabled}
                    onChange={() => toggleEvent(key)}
                    className="w-4 h-4 text-kinetic-primary rounded border-slate-300 focus:ring-kinetic-primary"
                  />
                  <span className="text-sm font-medium text-ink-900">{eventLabels[key]}</span>
                </label>
                
                <div className={`flex gap-3 transition-opacity ${!events[key].enabled ? 'opacity-30 pointer-events-none' : ''}`}>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={events[key].channels.includes('in-app')}
                      onChange={() => toggleChannel(key, 'in-app')}
                      className="text-kinetic-primary rounded"
                    />
                    <span className="text-xs text-kinetic-neutral">In-App</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={events[key].channels.includes('email')}
                      onChange={() => toggleChannel(key, 'email')}
                      className="text-kinetic-primary rounded"
                    />
                    <span className="text-xs text-kinetic-neutral">Email</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-ink-900 mb-3">Quiet Hours</h3>
          <p className="text-xs text-kinetic-neutral mb-4">Mute push and email notifications during this window.</p>
          
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={quietHoursEnabled}
              onChange={(e) => setQuietHoursEnabled(e.target.checked)}
              className="w-4 h-4 text-kinetic-primary rounded border-slate-300 focus:ring-kinetic-primary"
            />
            <span className="text-sm font-medium text-ink-900">Enable Quiet Hours</span>
          </label>

          {quietHoursEnabled && (
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs font-medium text-kinetic-neutral mb-1">Start Time</label>
                <input
                  type="time"
                  className="rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-kinetic-neutral mb-1">End Time</label>
                <input
                  type="time"
                  className="rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
