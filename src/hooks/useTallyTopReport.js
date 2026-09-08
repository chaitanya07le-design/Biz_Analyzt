import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyTopReport() {
  const [data, setData] = useState({ customers: null, products: null, vendors: null });

  useEffect(() => {
    let active = true;
    api.getTallyTopReport()
      .then((d) => {
        if (!active) return;
        setData({
          customers: d?.customers || [],
          products: d?.products || [],
          vendors: d?.vendors || [],
        });
      })
      .catch(() => {
        if (active) setData({ customers: [], products: [], vendors: [] });
      });
    return () => { active = false; };
  }, []);

  return data;
}