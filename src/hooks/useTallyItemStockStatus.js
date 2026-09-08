import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyItemStockStatus() {
  const [data, setData] = useState({ items: null, loading: true });

  useEffect(() => {
    let active = true;
    api.getTallyItemStockStatus()
      .then((d) => { if (active) setData({ items: d?.items || [], loading: false }); })
      .catch(() => { if (active) setData({ items: [], loading: false }); });
    return () => { active = false; };
  }, []);

  return data;
}