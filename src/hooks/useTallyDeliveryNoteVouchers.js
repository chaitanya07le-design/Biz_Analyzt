import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyDeliveryNoteVouchers(fromDate, toDate) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    api.getTallyDeliveryNoteVouchers(fromDate, toDate)
      .then((d) => active && setData(d?.vouchers || []))
      .catch(() => active && setData([]));
    return () => { active = false; };
  }, [fromDate, toDate]);

  return data;
}