import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyItems() {
  const [items, setItems] = useState(null);
  useEffect(() => { let active = true; api.getTallyItems().then((data) => active && setItems(data?.items || [])).catch(() => {}); return () => { active = false; }; }, []);
  return items;
}