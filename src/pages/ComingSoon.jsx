import React from 'react';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-canvas-default flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6">
          <svg className="w-24 h-24 text-brand-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h1a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-ink-default mb-2">Coming Soon</h1>
        <p className="text-ink-muted mb-6">This feature is under development</p>
        <p className="text-sm text-ink-faint">
          We're working hard to bring you this feature. Stay tuned!
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
