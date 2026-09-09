import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyStockBatches() {
  const [data, setData] = useState({ batches: null, loading: true });

  useEffect(() => {
    let active = true;
    api.getTallyStockBatches()
      .then((d) => {
        const parsedBatches = Array.isArray(d) ? d : (d?.batches || []);
        if (active) setData({ batches: parsedBatches, loading: false });
      })
      .catch(() => {
        if (active) setData({ batches: [], loading: false });
      });
    return () => { active = false; };
  }, []);

  return data;
}