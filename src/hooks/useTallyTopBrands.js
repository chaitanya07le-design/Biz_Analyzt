import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyTopBrands() {
  const [data, setData] = useState({ brands: null, brandTransactions: null });

  useEffect(() => {
    let active = true;
    api.getTallyTopBrands()
      .then((d) => {
        if (!active) return;
        const brands = d?.brands || [];
        const brandTransactions = d?.brandTransactions || {};
        console.log('[useTallyTopBrands] API response brands:', brands.length, 'txn keys:', Object.keys(brandTransactions).length);
        console.log('[useTallyTopBrands] sample brand:', brands[0]?.brand, 'has txns:', brandTransactions[brands[0]?.brand]?.length);
        setData({ brands, brandTransactions });
      })
      .catch((err) => {
        console.error('[useTallyTopBrands] API FAILED:', err.message);
        if (active) setData({ brands: [], brandTransactions: {} });
      });
    return () => { active = false; };
  }, []);

  return data;
}