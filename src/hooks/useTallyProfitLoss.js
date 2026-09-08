import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyProfitLoss() {
  const [data, setData] = useState(null);
  useEffect(() => { let active = true; api.getTallyProfitLoss().then((value) => active && setData(value)).catch(() => {}); return () => { active = false; }; }, []);
  return data;
}
