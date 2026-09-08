import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyVendorPurchaseHistory() {
  const [history, setHistory] = useState(null);
  useEffect(() => { let active = true; api.getTallyVendorPurchaseHistory().then((data) => active && setHistory(data?.history || [])).catch(() => {}); return () => { active = false; }; }, []);
  return history;
}