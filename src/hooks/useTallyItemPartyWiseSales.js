import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyItemPartyWiseSales() {
  const [itemWiseData, setItemWiseData] = useState(null);
  const [partyWiseData, setPartyWiseData] = useState(null);

  useEffect(() => {
    let active = true;
    api.getTallyItemPartyWiseSales()
      .then((d) => {
        if (!active) return;
        setItemWiseData(d?.itemWise || []);
        setPartyWiseData(d?.partyWise || []);
      })
      .catch(() => {
        if (active) {
          setItemWiseData([]);
          setPartyWiseData([]);
        }
      });
    return () => { active = false; };
  }, []);

  return { itemWiseData, partyWiseData };
}