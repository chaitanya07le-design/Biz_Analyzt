import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/settingsService';

const SettingsContext = createContext(null);

export function SettingsProvider({ children, companyId }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    newVoucher: true, overdueInvoice: true, lowStock: true, dailySummary: true
  });

  const loadSettings = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    settingsService.getAllSettings(companyId)
      .then(data => {
        setSettings(data || {});
        if (data && data.Notification) {
          setNotificationSettings({
            newVoucher: data.Notification.newVoucher ?? true,
            overdueInvoice: data.Notification.overdueInvoice ?? true,
            lowStock: data.Notification.lowStock ?? true,
            dailySummary: data.Notification.dailySummary ?? true,
          });
        }
      })
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Called after any settings save to refresh context
  const refreshSettings = useCallback(() => {
    loadSettings();
  }, [loadSettings]);

  // Currency formatter built from saved Currency settings
  const formatCurrency = useCallback((value) => {
    const amount = parseFloat(value) || 0;
    const symbol = settings?.Currency?.currencySymbol || '?';
    const locale = settings?.Currency?.numberFormat || 'en-IN';
    const decimals = parseInt(settings?.Currency?.decimalPlaces ?? 0, 10);
    try {
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(Math.abs(amount));
      return (amount < 0 ? '-' : '') + symbol + formatted;
    } catch {
      return symbol + Math.abs(amount).toLocaleString('en-IN');
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, formatCurrency, notificationSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
};
