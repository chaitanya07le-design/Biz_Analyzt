import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyLedgerReport() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    api.getTallyLedgerReport()
      .then((d) => {
        if (!active) return;
        setData(d?.ledgers || []);
      })
      .catch(() => {
        if (active) setData([]);
      });
    return () => { active = false; };
  }, []);

  return data;
}