import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallySalesQuotations() {
  const [quotations, setQuotations] = useState(null);
  useEffect(() => { let active = true; api.getTallySalesQuotations().then((data) => active && setQuotations(data?.quotations || [])).catch(() => {}); return () => { active = false; }; }, []);
  return quotations;
}
