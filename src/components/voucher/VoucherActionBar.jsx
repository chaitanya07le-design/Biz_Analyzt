import React from 'react';

const VoucherActionBar = ({ onRecordPayment, onShare, onDownload }) => {
  const handleRecordPayment = () => {
    if (onRecordPayment) {
      onRecordPayment();
    } else {
      alert('Coming soon: Record Payment feature');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-canvas-faint p-4 md:relative md:border-t-0 md:mt-4">
      <div className="flex gap-3 md:justify-end">
        <button
          onClick={handleRecordPayment}
          className="flex-1 md:flex-none bg-brand-primary text-white px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Record Payment
        </button>
        <button
          onClick={onShare}
          className="px-4 py-3 border border-canvas-faint rounded-lg text-ink-default hover:bg-canvas-subtle transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        <button
          onClick={onDownload}
          className="px-4 py-3 border border-canvas-faint rounded-lg text-ink-default hover:bg-canvas-subtle transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VoucherActionBar;
