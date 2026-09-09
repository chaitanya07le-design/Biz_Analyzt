import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyOutstandingGroupView() {
  const [data, setData] = useState({ receivables: null, payables: null, loading: true });

  useEffect(() => {
    let active = true;
    api.getTallyOutstandingGroupView()
      .then((d) => {
        if (active) setData({
          receivables: d?.receivables || [],
          payables: d?.payables || [],
          loading: false,
        });
      })
      .catch(() => {
        if (active) setData({ receivables: [], payables: [], loading: false });
      });
    return () => { active = false; };
  }, []);

  return data;
}