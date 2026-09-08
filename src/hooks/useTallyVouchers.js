import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyVouchers(type) {
  const [vouchers, setVouchers] = useState(null);
  useEffect(() => {
    let active = true;
    const request = type === 'sales' ? api.getTallySalesVouchers() : api.getTallyPurchaseVouchers();
    request.then((data) => active && setVouchers(data?.vouchers || [])).catch(() => {});
    return () => { active = false; };
  }, [type]);
  return vouchers;
}
