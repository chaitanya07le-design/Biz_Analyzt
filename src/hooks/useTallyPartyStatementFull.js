import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyPartyStatementFull(partyName) {
  const [data, setData] = useState({ ledger: null, transactions: null, loading: true });

  useEffect(() => {
    let active = true;
    if (!partyName) {
      setData({ ledger: null, transactions: null, loading: false });
      return;
    }

    setData(prev => ({ ...prev, loading: true }));
    api.getTallyPartyStatementFull(partyName)
      .then((d) => {
        if (active) {
          setData({ 
            ledger: d?.ledger || null, 
            transactions: d?.transactions || [], 
            loading: false 
          });
        }
      })
      .catch(() => {
        if (active) {
          setData({ ledger: null, transactions: [], loading: false });
        }
      });
      
    return () => { active = false; };
  }, [partyName]);

  return data;
}
