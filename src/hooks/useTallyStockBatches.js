import { useEffect, useState } from 'react';
import api from '../services/api';
export default function useTallyStockBatches() { const [batches, setBatches] = useState(null); useEffect(() => { let active = true; api.getTallyStockBatches().then((data) => active && setBatches(data?.batches || [])).catch(() => {}); return () => { active = false; }; }, []); return batches; }
