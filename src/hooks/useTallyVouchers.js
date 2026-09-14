import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useTallyVouchers(type) {
  const [vouchers, setVouchers] = useState(null);
  useEffect(() => {
    let active = true;
    let request;
    
    switch (type?.toLowerCase()) {
      case 'sales': request = api.getTallySalesVouchers(); break;
      case 'purchase': request = api.getTallyPurchaseVouchers(); break;
      case 'payment': request = api.getTallyPaymentVouchers(); break;
      case 'receipt': request = api.getTallyReceiptPaymentVouchers(); break; // Tally backend currently maps this to receipt/payment
      case 'journal':
      case 'debit-note':
      case 'credit-note': request = api.getTallyJournalDnCnVouchers(); break;
      case 'delivery-note': request = api.getTallyDeliveryNoteVouchers(); break;
      case 'contra': request = api.getTallyContraVouchers(); break;
      case 'receipt-note': request = api.getTallyReceiptNoteVouchers(); break;
      default: request = api.getTallySalesVouchers();
    }
    
    request.then((data) => active && setVouchers(data?.vouchers || data?.content || [])).catch(() => {});
    return () => { active = false; };
  }, [type]);
  return vouchers;
}
