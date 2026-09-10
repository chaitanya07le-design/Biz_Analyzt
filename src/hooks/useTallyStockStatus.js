import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyStockStatus() {
  const [items, setItems] = useState(null);
  useEffect(() => { let active = true; api.getTallyStockStatusFull().then((value) => active && setItems(value?.items || [])).catch(() => {}); return () => { active = false; }; }, []);
  return items;
}
