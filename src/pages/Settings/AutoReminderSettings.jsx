import React, { useState, useEffect } from 'react';
import { BellRing, Send } from 'lucide-react';
import SettingsDetailLayout from '../../components/Settings/SettingsDetailLayout';
import { useCompany } from '../../context/CompanyContext';
import { settingsService } from '../../services/settingsService';

// Pucho W-Reminder-Send-Now webhook — replace with the published URL
const SEND_NOW_WEBHOOK_URL = 'https://studio.pucho.ai/api/v1/webhooks/6hNVqXRCYXttMGSFx0Mcv';

export default function AutoReminderSettings() {
  const { currentCompany } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendMessage, setSendMessage] = useState('');
  
  const [enabled, setEnabled] = useState(false);
  const [triggerDays, setTriggerDays] = useState(3);
  const [triggerType, setTriggerType] = useState('after');
  const [frequency, setFrequency] = useState('once');
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(false);
  const [template, setTemplate] = useState('Hi {party_name},\n\nThis is a reminder that your payment of {amount} for invoice {invoice_no} is due on {due_date}.\n\nPlease arrange for payment at your earliest convenience.\n\nThank you,\n{company_name}');

  useEffect(() => {
    if (currentCompany?.id) {
      settingsService.getAllSettings(currentCompany.id).then(data => {
        if (data.AutoReminder) {
          setEnabled(data.AutoReminder.enabled ?? false);
          setTriggerDays(data.AutoReminder.triggerDays ?? 3);
          setTriggerType(data.AutoReminder.triggerType ?? 'after');
          setFrequency(data.AutoReminder.frequency ?? 'once');
          setChannelEmail(data.AutoReminder.channelEmail ?? true);
          setChannelWhatsapp(data.AutoReminder.channelWhatsapp ?? false);
          if (data.AutoReminder.template) setTemplate(data.AutoReminder.template);
        }
      });
    }
  }, [currentCompany?.id]);

  const handleSave = async () => {
    if (!currentCompany?.id) return;
    setIsSaving(true);
    await settingsService.updateSettings(currentCompany.id, 'AutoReminder', {
      enabled,
      triggerDays,
      triggerType,
      frequency,
      channelEmail,
      channelWhatsapp,
      template,
    });
    setIsSaving(false);
  };

  const handleSendNow = async () => {
    if (!currentCompany?.id || !enabled) return;
    setIsSending(true);
    setSendMessage('');
    try {
      // 1. Save settings so the workflow reads the latest triggerDays
      await settingsService.updateSettings(currentCompany.id, 'AutoReminder', {
        enabled, triggerDays, triggerType, frequency, channelEmail, channelWhatsapp, template,
      });
      // 2. Trigger the send-now workflow
      await fetch(SEND_NOW_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: currentCompany.id }),
      });
      setSendMessage('Reminders sent! Check the ReminderLog sheet.');
    } catch (e) {
      console.warn('Send now failed:', e);
      setSendMessage('Failed to send reminders. Check the Pucho workflow logs.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SettingsDetailLayout
      title="Auto Reminder"
      category="AutoReminder"
      description="Set up automatic payment reminders"
      icon={BellRing}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="space-y-6 max-w-2xl">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-5 h-5 text-kinetic-primary rounded border-slate-300 focus:ring-kinetic-primary"
          />
          <div>
            <p className="text-sm font-bold text-ink-900">Enable Automatic Reminders</p>
            <p className="text-xs text-kinetic-neutral">Send reminders to parties automatically based on rules below.</p>
          </div>
        </label>

        {/* Send Reminders Now Button */}
        <div className={!enabled ? 'opacity-50 pointer-events-none' : ''}>
          <button
            onClick={handleSendNow}
            disabled={!enabled || isSending}
            className="flex items-center gap-2 px-6 py-3 bg-kinetic-primary text-white rounded-xl font-bold text-sm hover:bg-kinetic-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send Reminders Now'}
          </button>
          {sendMessage && (
            <p className={`text-sm font-medium mt-2 ${sendMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {sendMessage}
            </p>
          )}
        </div>

        <div className={`space-y-6 transition-opacity ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <h3 className="text-sm font-bold text-ink-900 mb-3">Trigger Rule</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink-900">Send reminder</span>
              <input
                type="number"
                className="w-20 rounded-lg border-slate-200 border p-2 text-sm text-center focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                value={triggerDays}
                onChange={(e) => setTriggerDays(parseInt(e.target.value) || 0)}
              />
              <span className="text-sm text-ink-900">days</span>
              <select
                className="rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
              >
                <option value="before">Before</option>
                <option value="after">After</option>
              </select>
              <span className="text-sm text-ink-900">due date.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-ink-900 mb-3">Frequency</h3>
              <select
                className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="once">Send once</option>
                <option value="daily">Repeat daily until paid</option>
                <option value="weekly">Repeat weekly until paid</option>
              </select>
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-900 mb-3">Channels</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={channelEmail} onChange={(e) => setChannelEmail(e.target.checked)} className="rounded text-kinetic-primary" />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={channelWhatsapp} onChange={(e) => setChannelWhatsapp(e.target.checked)} className="rounded text-kinetic-primary" />
                  <span className="text-sm">WhatsApp</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink-900 mb-2">Message Template</h3>
            <p className="text-xs text-kinetic-neutral mb-3">
              Available variables: <code className="bg-slate-100 px-1 rounded">{'{party_name}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{amount}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{invoice_no}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{due_date}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{company_name}'}</code>
            </p>
            <textarea
              className="w-full rounded-lg border-slate-200 border p-3 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none font-mono"
              rows={8}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
          </div>
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
