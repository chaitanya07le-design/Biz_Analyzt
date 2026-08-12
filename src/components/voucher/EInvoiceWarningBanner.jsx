import React, { useState, useEffect } from 'react';

const EInvoiceWarningBanner = ({ voucherType, eInvoiceStatus, onDismiss }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  
  useEffect(() => {
    const dismissedBanners = JSON.parse(localStorage.getItem('dismissedBanners') || '[]');
    const bannerKey = `einvoice-${voucherType}`;
    if (dismissedBanners.includes(bannerKey)) {
      setIsDismissed(true);
    }
  }, [voucherType]);

  const handleDismiss = () => {
    setIsDismissed(true);
    const dismissedBanners = JSON.parse(localStorage.getItem('dismissedBanners') || '[]');
    const bannerKey = `einvoice-${voucherType}`;
    if (!dismissedBanners.includes(bannerKey)) {
      dismissedBanners.push(bannerKey);
      localStorage.setItem('dismissedBanners', JSON.stringify(dismissedBanners));
    }
    if (onDismiss) onDismiss();
  };

  if (isDismissed || eInvoiceStatus === 'generated') {
    return null;
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">
              e-Invoice not generated
            </p>
            <p className="text-sm text-amber-700 mt-1">
              This {voucherType.toLowerCase()} requires e-Invoice generation as per GST regulations.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-500 hover:text-amber-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EInvoiceWarningBanner;
