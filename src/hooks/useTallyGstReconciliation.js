import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyGstReconciliation(fromDate, toDate) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!fromDate || !toDate) return;
    let active = true;
    api.getTallyGstReconciliation(fromDate, toDate).then((d) => active && setData(d?.reconciliation || [])).catch(() => setData([]));
    return () => { active = false; };
  }, [fromDate, toDate]);
  return data;
}