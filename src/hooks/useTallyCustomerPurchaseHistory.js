import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyCustomerPurchaseHistory() {
  const [history, setHistory] = useState(null);
  useEffect(() => { let active = true; api.getTallyCustomerPurchaseHistory().then((data) => active && setHistory(data?.history || [])).catch(() => {}); return () => { active = false; }; }, []);
  return history;
}
