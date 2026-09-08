import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyByItemRollup() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let active = true;
    api.getTallyByItemRollup().then((d) => active && setData(d?.items || [])).catch(() => setData([]));
    return () => { active = false; };
  }, []);
  return data;
}