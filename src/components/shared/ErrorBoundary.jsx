import React from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-canvas-default flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl shadow-lg border border-canvas-faint p-6 max-w-md w-full text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </motion.div>

            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold text-ink-default mb-2"
            >
              Something went wrong
            </motion.h2>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-ink-muted mb-6"
            >
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </motion.p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-left"
              >
                <p className="text-xs font-medium text-red-800 mb-1">Error details:</p>
                <p className="text-xs text-red-600 font-mono break-all">
                  {this.state.error.toString()}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3"
            >
              <button
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2.5 bg-brand-primary text-white rounded-lg font-medium text-sm hover:bg-brand-secondary transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-ink-default rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Go Home
              </button>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

export function withErrorBoundary(WrappedComponent, fallback = null, onRetry = null) {
  return function ErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary fallback={fallback} onRetry={onRetry}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
