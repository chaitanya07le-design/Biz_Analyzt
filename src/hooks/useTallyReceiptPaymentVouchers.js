import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyReceiptPaymentVouchers(fromDate, toDate) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let active = true;
    api.getTallyReceiptPaymentVouchers(fromDate, toDate).then((d) => active && setData(d?.vouchers || [])).catch(() => setData([]));
    return () => { active = false; };
  }, [fromDate, toDate]);
  return data;
}