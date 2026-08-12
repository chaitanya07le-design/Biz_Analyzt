import React from 'react';

const VoucherPaymentDetails = ({ paymentDetails }) => {
  if (!paymentDetails) return null;

  return (
    <div className="bg-white border border-canvas-faint rounded-lg p-4">
      <p className="text-xs text-ink-faint mb-3 uppercase tracking-wider font-medium">Payment Details</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-ink-faint">Mode</p>
          <p className="text-sm text-ink-default font-medium">{paymentDetails.mode || '—'}</p>
        </div>
        
        <div>
          <p className="text-xs text-ink-faint">Bank/Ledger</p>
          <p className="text-sm text-ink-default font-medium">{paymentDetails.ledgerName || '—'}</p>
        </div>
        
        {paymentDetails.refNo && (
          <div className="col-span-2">
            <p className="text-xs text-ink-faint">Reference No.</p>
            <p className="text-sm text-ink-default font-mono">{paymentDetails.refNo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherPaymentDetails;
