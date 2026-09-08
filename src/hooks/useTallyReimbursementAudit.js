import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyReimbursementAudit(fromDate, toDate) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!fromDate || !toDate) return;
    let active = true;
    api.getTallyReimbursementAudit(fromDate, toDate).then((d) => active && setData(d?.audit || [])).catch(() => setData([]));
    return () => { active = false; };
  }, [fromDate, toDate]);
  return data;
}