import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyAccounts() {
  const [accounts, setAccounts] = useState(null);
  useEffect(() => { let active = true; api.getTallyAccounts().then((data) => active && setAccounts(data?.accounts || [])).catch(() => {}); return () => { active = false; }; }, []);
  return accounts;
}