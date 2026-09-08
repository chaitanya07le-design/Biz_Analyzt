import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyVoucherAudit() {
  const [vouchers, setVouchers] = useState(null);
  useEffect(() => { let active = true; api.getTallyVoucherAudit().then((data) => active && setVouchers(data?.vouchers || [])).catch(() => {}); return () => { active = false; }; }, []);
  return vouchers;
}
