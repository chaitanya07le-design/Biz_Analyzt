import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyLedgers() {
  const [ledgers, setLedgers] = useState(null);
  useEffect(() => { let active = true; api.getTallyLedgers().then((data) => active && setLedgers(data?.ledgers || [])).catch(() => {}); return () => { active = false; }; }, []);
  return ledgers;
}