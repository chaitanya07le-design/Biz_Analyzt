import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyTrialBalanceFull(fromDate, toDate, prevFromDate, prevToDate) {
  const [result, setResult] = useState({ data: null, loading: true });

  useEffect(() => {
    let active = true;
    api.getTallyTrialBalanceFull(fromDate, toDate, prevFromDate, prevToDate)
      .then((d) => { if (active) setResult({ data: d, loading: false }); })
      .catch(() => { if (active) setResult({ data: null, loading: false }); });
    return () => { active = false; };
  }, [fromDate, toDate, prevFromDate, prevToDate]);

  return result;
}