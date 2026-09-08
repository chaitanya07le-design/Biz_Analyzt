import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyDashboardSummary(fromDate, toDate) {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    let active = true;
    api.getTallyDashboardSummary(fromDate, toDate).then((d) => active && setSummary(d?.summary || null)).catch(() => setSummary(null));
    return () => { active = false; };
  }, [fromDate, toDate]);
  return summary;
}