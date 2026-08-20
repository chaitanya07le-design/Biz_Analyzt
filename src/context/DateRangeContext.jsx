import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

const DateRangeContext = createContext(null);

export function DateRangeProvider({ children, companyId }) {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    label: 'This financial year'
  });

  // fyStartMonth: 1=Jan...12=Dec. Default 4 = April (Indian FY)
  const [fyStartMonth, setFyStartMonthState] = useState(4);

  const [referenceDate, setReferenceDateState] = useState(() => {
    const saved = localStorage.getItem('referenceDate');
    return saved || '2024-05-01';
  });

  // Load saved FY start month on mount / company change
  useEffect(() => {
    if (!companyId) return;
    settingsService.getAllSettings(companyId)
      .then(data => {
        const saved = data && data.Date && data.Date.fyStartMonth;
        if (saved != null) setFyStartMonthState(parseInt(saved, 10) || 4);
      })
      .catch(() => {});
  }, [companyId]);

  useEffect(() => {
    localStorage.setItem('referenceDate', referenceDate);
  }, [referenceDate]);

  const setReferenceDate = useCallback((date) => setReferenceDateState(date), []);

  // Called by DateSettings after a successful save
  const setFyStartMonth = useCallback((month) => {
    setFyStartMonthState(parseInt(month, 10) || 4);
  }, []);

  const setDateRangeWithLabel = useCallback((label) => {
    const now = new Date(referenceDate);
    let startDate = null;
    let endDate = null;
    const fyMonth = fyStartMonth - 1; // convert to 0-indexed

    switch (label) {
      case 'Today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'Last 10 Days':
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        startDate = new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'This Month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'This Quarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
        break;
      }
      case 'This financial year': {
        const fyStartYear = now.getMonth() >= fyMonth ? now.getFullYear() : now.getFullYear() - 1;
        startDate = new Date(fyStartYear, fyMonth, 1);
        const fyEndMonth = fyMonth === 0 ? 11 : fyMonth - 1;
        endDate = new Date(fyStartYear + 1, fyEndMonth + 1, 0, 23, 59, 59);
        break;
      }
      case 'Previous financial year': {
        const prevStart = now.getMonth() >= fyMonth ? now.getFullYear() - 1 : now.getFullYear() - 2;
        startDate = new Date(prevStart, fyMonth, 1);
        const prevEndMonth = fyMonth === 0 ? 11 : fyMonth - 1;
        endDate = new Date(prevStart + 1, prevEndMonth + 1, 0, 23, 59, 59);
        break;
      }
      default:
        break;
    }

    setDateRange({
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null,
      label
    });
  }, [referenceDate, fyStartMonth]);

  const setCustomDateRange = useCallback((start, end) => {
    setDateRange({ startDate: start, endDate: end, label: 'Custom' });
  }, []);

  return (
    <DateRangeContext.Provider value={{
      dateRange,
      setDateRange: setDateRangeWithLabel,
      setCustomDateRange,
      referenceDate,
      setReferenceDate,
      fyStartMonth,
      setFyStartMonth,
    }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) throw new Error('useDateRange must be used within a DateRangeProvider');
  return context;
};
