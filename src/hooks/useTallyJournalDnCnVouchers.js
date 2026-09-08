import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyJournalDnCnVouchers(fromDate, toDate) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let active = true;
    api.getTallyJournalDnCnVouchers(fromDate, toDate).then((d) => active && setData(d?.vouchers || [])).catch(() => setData([]));
    return () => { active = false; };
  }, [fromDate, toDate]);
  return data;
}