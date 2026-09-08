import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyItemsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    api.getTallyItemsPage()
      .then((d) => { if (active) setData(d?.items || []); })
      .catch(() => { if (active) setData([]); });
    return () => { active = false; };
  }, []);

  return data;
}