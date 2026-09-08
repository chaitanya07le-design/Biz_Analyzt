import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyBatchStock() {
  const [batches, setBatches] = useState(null);
  useEffect(() => { let active = true; api.getTallyBatchStock().then((d) => active && setBatches(d?.batches || [])).catch(() => setBatches([])); return () => { active = false; }; }, []);
  return batches;
}