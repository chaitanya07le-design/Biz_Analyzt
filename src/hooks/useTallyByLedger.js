import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyByLedger(fromDate, toDate) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    api.getTallyByLedger(fromDate, toDate)
      .then((d) => {
        if (!active) return;
        setData(d?.ledgers || []);
      })
      .catch(() => {
        if (active) setData([]);
      });
    return () => { active = false; };
  }, [fromDate, toDate]);

  return data;
}