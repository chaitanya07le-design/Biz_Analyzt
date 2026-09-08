import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyCustomerMovementRollup() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let active = true;
    api.getTallyCustomerMovementRollup().then((d) => active && setData(d?.movement || [])).catch(() => setData([]));
    return () => { active = false; };
  }, []);
  return data;
}