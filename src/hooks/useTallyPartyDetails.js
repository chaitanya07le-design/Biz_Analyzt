import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyPartyDetails() {
  const [parties, setParties] = useState(null);
  useEffect(() => { let active = true; api.getTallyPartyDetails().then((d) => active && setParties(d?.parties || [])).catch(() => setParties([])); return () => { active = false; }; }, []);
  return parties;
}