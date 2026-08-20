import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyPendingSales() {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    let active = true;
    api.getTallyPendingSales().then((data) => active && setOrders(data?.orders || [])).catch(() => {});
    return () => { active = false; };
  }, []);
  return orders;
}
