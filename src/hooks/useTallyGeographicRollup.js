import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyGeographicRollup() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let active = true;
    api.getTallyGeographicRollup().then((d) => active && setData(d?.geo || [])).catch(() => setData([]));
    return () => { active = false; };
  }, []);
  return data;
}