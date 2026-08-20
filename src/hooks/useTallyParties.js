import { useEffect, useState } from 'react'; import api from '../services/api';
export default function useTallyParties() { const [parties, setParties] = useState(null); useEffect(() => { let active = true; api.getTallyParties().then((data) => active && setParties(data?.parties || [])).catch(() => {}); return () => { active = false; }; }, []); return parties; }
