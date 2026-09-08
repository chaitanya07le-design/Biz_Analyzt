import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallySalesRegister() {
  const [register, setRegister] = useState(null);
  useEffect(() => { let active = true; api.getTallySalesRegister().then((data) => active && setRegister(data?.register || [])).catch(() => {}); return () => { active = false; }; }, []);
  return register;
}