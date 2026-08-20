import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyDashboardTemplates() {
  const [templates, setTemplates] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    api.getTallyDashboardTemplates()
      .then((data) => {
        if (!active) return;
        const nextTemplates = data?.templates || {};
        setTemplates(nextTemplates);
        setDashboard(data?.dashboard || null);
        const templateResults = Object.values(nextTemplates);
        if (templateResults.length > 0 && templateResults.every((template) => template.status === 'error')) {
          setError('Live Tally dashboard data is unavailable.');
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load live Tally dashboard data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { templates, dashboard, loading, error };
}
