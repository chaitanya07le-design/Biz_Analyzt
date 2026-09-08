import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyPartyStatement(partyName) {
  const [transactions, setTransactions] = useState(null);
  useEffect(() => {
    if (!partyName) { setTransactions(null); return undefined; }
    let active = true;
    api.getTallyPartyStatement(partyName).then((value) => active && setTransactions(value?.transactions || [])).catch(() => {});
    return () => { active = false; };
  }, [partyName]);
  return transactions;
}
