import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const DateRangeContext = createContext(null);

export function DateRangeProvider({ children }) {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    label: 'This financial year'
  });
  
  const [referenceDate, setReferenceDateState] = useState(() => {
    const saved = localStorage.getItem('referenceDate');
    return saved || '2024-05-01';
  });
  
  useEffect(() => {
    localStorage.setItem('referenceDate', referenceDate);
  }, [referenceDate]);
  
  const setReferenceDate = useCallback((date) => {
    setReferenceDateState(date);
  }, []);

  const setDateRangeWithLabel = useCallback((label) => {
    const now = new Date(referenceDate);
    let startDate = null;
    let endDate = null;

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
      case 'This Quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
        break;
      case 'This financial year':
        const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        startDate = new Date(fyStartYear, 3, 1);
        endDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59);
        break;
      case 'Previous financial year':
        const prevFyStartYear = now.getMonth() >= 3 ? now.getFullYear() - 1 : now.getFullYear() - 2;
        startDate = new Date(prevFyStartYear, 3, 1);
        endDate = new Date(prevFyStartYear + 1, 2, 31, 23, 59, 59);
        break;
      case 'All available data':
      default:
        startDate = null;
        endDate = null;
        break;
    }

    setDateRange({
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null,
      label
    });
  }, []);

  const setCustomDateRange = useCallback((start, end) => {
    setDateRange({
      startDate: start,
      endDate: end,
      label: 'Custom'
    });
  }, []);

  return (
    <DateRangeContext.Provider value={{ 
      dateRange, 
      setDateRange: setDateRangeWithLabel, 
      setCustomDateRange,
      referenceDate,
      setReferenceDate
    }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
};
