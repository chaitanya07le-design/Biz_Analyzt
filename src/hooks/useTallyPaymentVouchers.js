import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyPaymentVouchers() {
  const [vouchers, setVouchers] = useState(null);
  useEffect(() => {
    let active = true;
    api.getTallyPaymentVouchers().then((data) => active && setVouchers(data?.vouchers || [])).catch(() => {});
    return () => { active = false; };
  }, []);
  return vouchers;
}
