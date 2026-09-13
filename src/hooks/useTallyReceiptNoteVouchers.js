import { useState, useEffect } from 'react';
import api from '../services/api';
import { useDateRange } from '../context/DateRangeContext';

export default function useTallyReceiptNoteVouchers() {
  const [data, setData] = useState([]);
  const { dateRange } = useDateRange();

  useEffect(() => {
    let active = true;
    const fetchTally = async () => {
      try {
        const response = await api.getTallyReceiptNoteVouchers(dateRange.startDate, dateRange.endDate);
        if (active) {
          setData(response?.vouchers || []);
        }
      } catch (err) {
        console.error('Failed to fetch Tally receipt note vouchers:', err);
      }
    };
    fetchTally();
    return () => { active = false; };
  }, [dateRange]);

  return data;
}
