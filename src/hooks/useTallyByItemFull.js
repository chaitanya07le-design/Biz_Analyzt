import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyByItemFull() {
  const [result, setResult] = useState({ data: null, loading: true });

  useEffect(() => {
    let active = true;
    api.getTallyByItemFull()
      .then((d) => { if (active) setResult({ data: d, loading: false }); })
      .catch(() => { if (active) setResult({ data: null, loading: false }); });
    return () => { active = false; };
  }, []);

  return result;
}