import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const ConnectionError = ({ error, onRetry }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="fixed inset-0 bg-canvas-default flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-ink-default mb-2">
          Cannot Connect to Server
        </h2>
        
        <p className="text-ink-muted mb-6">
          The backend server is not responding. Please ensure the server is running and try again.
        </p>
        
        <button
          onClick={onRetry}
          className="w-full bg-brand-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-secondary transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-ink-muted hover:text-ink-default flex items-center gap-1 mx-auto"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showDetails ? 'Hide' : 'Show'} technical details
        </button>
        
        {showDetails && (
          <div className="mt-4 p-3 bg-canvas-faint rounded text-left">
            <p className="text-xs font-mono text-ink-muted break-all">
              {error || 'Connection refused - backend server not reachable'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionError;
