import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyOutstanding() {
  const [outstanding, setOutstanding] = useState(null);
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api.getTallyOutstandingTemplates()
      .then((data) => {
        if (!active) return;
        setOutstanding(data?.outstanding || null);
        setTemplates(data?.templates || {});
      })
      .catch((requestError) => active && setError(requestError.message || 'Unable to load live Tally outstanding data.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return { outstanding, templates, loading, error };
}
