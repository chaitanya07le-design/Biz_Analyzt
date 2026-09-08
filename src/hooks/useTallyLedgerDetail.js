import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyLedgerDetail(ledgerId) {
  const [data, setData] = useState({ ledger: null, transactions: null, loading: false });

  useEffect(() => {
    if (!ledgerId) { setData({ ledger: null, transactions: null, loading: false }); return; }
    setData({ ledger: null, transactions: null, loading: true });
    let active = true;
    api.getTallyLedgerDetail(ledgerId, '')
      .then((d) => {
        if (!active) return;
        setData({ ledger: d?.ledger || null, transactions: d?.transactions || [], loading: false });
      })
      .catch(() => {
        if (active) setData({ ledger: null, transactions: [], loading: false });
      });
    return () => { active = false; };
  }, [ledgerId]);

  return data;
}