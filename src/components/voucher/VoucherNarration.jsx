import React from 'react';

const VoucherNarration = ({ narration }) => {
  if (!narration) return null;

  return (
    <div className="bg-white border border-canvas-faint rounded-lg p-4">
      <p className="text-xs text-ink-faint mb-1 uppercase tracking-wider font-medium">Narration</p>
      <p className="text-sm text-ink-default">{narration}</p>
    </div>
  );
};

export default VoucherNarration;
