import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyCustomerMovement() {
  const [data, setData] = useState({ customers: null, loading: true });

  useEffect(() => {
    let active = true;
    api.getTallyCustomerMovement()
      .then((d) => { if (active) setData({ customers: d?.customers || [], loading: false }); })
      .catch(() => { if (active) setData({ customers: [], loading: false }); });
    return () => { active = false; };
  }, []);

  return data;
}