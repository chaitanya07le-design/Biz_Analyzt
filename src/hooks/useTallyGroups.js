import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyGroups() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    api.getTallyGroups()
      .then((d) => { if (active) setData(d?.groups || []); })
      .catch(() => { if (active) setData([]); });
    return () => { active = false; };
  }, []);

  return data;
}