import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyExpenses() {
  const [data, setData] = useState(null);
  useEffect(() => { let active = true; api.getTallyExpenses().then((value) => active && setData(value)).catch(() => {}); return () => { active = false; }; }, []);
  return data;
}
