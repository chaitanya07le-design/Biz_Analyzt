import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyDayBook() {
  const [entries, setEntries] = useState(null);
  useEffect(() => { let active = true; api.getTallyDayBook().then((value) => active && setEntries(value?.entries || [])).catch(() => {}); return () => { active = false; }; }, []);
  return entries;
}
