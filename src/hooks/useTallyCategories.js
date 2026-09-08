import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyCategories() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    api.getTallyCategories()
      .then((d) => { if (active) setData(d?.categories || []); })
      .catch(() => { if (active) setData([]); });
    return () => { active = false; };
  }, []);

  return data;
}