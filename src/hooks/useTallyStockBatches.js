import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyStockBatches() {
  const [data, setData] = useState({ batches: null, loading: true });

  useEffect(() => {
    let active = true;
    api.getTallyStockBatches()
      .then((d) => {
        console.log('[useTallyStockBatches] RAW d:', d);
        console.log('[useTallyStockBatches] d?.batches length:', d?.batches?.length);
        console.log('[useTallyStockBatches] first item:', d?.batches?.[0]);
        if (active) setData({ batches: d?.batches || [], loading: false });
      })
      .catch((err) => {
        console.error('[useTallyStockBatches] FAILED:', err.message, err);
        if (active) setData({ batches: [], loading: false });
      });
    return () => { active = false; };
  }, []);

  return data;
}