import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyCashBank() {
  const [cashBank, setCashBank] = useState(null);
  const [templates, setTemplates] = useState({});
  useEffect(() => {
    let active = true;
    api.getTallyCashBankTemplates().then((data) => {
      if (active) { setCashBank(data?.cashBank || null); setTemplates(data?.templates || {}); }
    }).catch(() => {}).finally(() => {});
    return () => { active = false; };
  }, []);
  return { cashBank, templates };
}
