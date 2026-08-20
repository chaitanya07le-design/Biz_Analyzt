import { useEffect, useState } from 'react';
import api from '../services/api';
export default function useTallyGstLiability() { const [taxes, setTaxes] = useState(null); useEffect(() => { let active = true; api.getTallyGstLiability().then((data) => active && setTaxes(data?.taxes || [])).catch(() => {}); return () => { active = false; }; }, []); return taxes; }
