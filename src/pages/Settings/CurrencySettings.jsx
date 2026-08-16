import React, { useState, useEffect } from 'react';
import { IndianRupee } from 'lucide-react';
import SettingsDetailLayout from '../../components/Settings/SettingsDetailLayout';
import { useCompany } from '../../context/CompanyContext';
import { settingsService } from '../../services/settingsService';

export default function CurrencySettings() {
  const { currentCompany } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [numberFormat, setNumberFormat] = useState('en-IN');
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [roundingRule, setRoundingRule] = useState('nearest');

  useEffect(() => {
    if (currentCompany?.id) {
      settingsService.getAllSettings(currentCompany.id).then(data => {
        if (data.Currency) {
          setCurrencySymbol(data.Currency.currencySymbol ?? '₹');
          setNumberFormat(data.Currency.numberFormat ?? 'en-IN');
          setDecimalPlaces(data.Currency.decimalPlaces ?? 2);
          setRoundingRule(data.Currency.roundingRule ?? 'nearest');
        }
      });
    }
  }, [currentCompany?.id]);

  const handleSave = async () => {
    if (!currentCompany?.id) return;
    setIsSaving(true);
    await settingsService.updateSettings(currentCompany.id, 'Currency', {
      currencySymbol,
      numberFormat,
      decimalPlaces,
      roundingRule,
    });
    setIsSaving(false);
  };

  return (
    <SettingsDetailLayout
      title="Currency"
      description="Set currency and number format"
      icon={IndianRupee}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">Currency Symbol</label>
            <input
              type="text"
              className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">Number Format</label>
            <select
              className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value)}
            >
              <option value="en-IN">Indian (1,00,000)</option>
              <option value="en-US">International (1,000,000)</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-ink-900 mb-4">Decimals & Rounding</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink-900 mb-2">Decimal Places</label>
              <select
                className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
              >
                <option value={0}>0 (No decimals)</option>
                <option value={2}>2 (e.g. .00)</option>
                <option value={3}>3 (e.g. .000)</option>
                <option value={4}>4 (e.g. .0000)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-900 mb-2">Rounding Rule for Totals</label>
              <select
                className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                value={roundingRule}
                onChange={(e) => setRoundingRule(e.target.value)}
              >
                <option value="nearest">Nearest</option>
                <option value="up">Upward</option>
                <option value="down">Downward</option>
                <option value="none">No Rounding</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-ink-900 mb-2">Preview</h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-2xl font-mono text-ink-900">
            {currencySymbol} {new Intl.NumberFormat(numberFormat, { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(1234567.8912)}
          </div>
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
