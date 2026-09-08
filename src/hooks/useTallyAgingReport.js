import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyAgingReport() {
  const [aging, setAging] = useState(null);
  useEffect(() => { let active = true; api.getTallyAgingReport().then((d) => active && setAging(d?.aging || [])).catch(() => setAging([])); return () => { active = false; }; }, []);
  return aging;
}