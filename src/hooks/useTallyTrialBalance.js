import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyTrialBalance(fromDate, toDate) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let active = true;
    api.getTallyTrialBalance(fromDate, toDate).then((d) => active && setData(d?.trialBalance || [])).catch(() => setData([]));
    return () => { active = false; };
  }, [fromDate, toDate]);
  return data;
}