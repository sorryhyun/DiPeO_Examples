import React, { Component, ReactNode } from 'react';
import { trackEvent } from '@/utils/analytics';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Track error to analytics
    trackEvent({
      event: 'component_error_caught',
      category: 'error',
      properties: {
        label: error.name || 'unknown_error',
        value: 1,
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });

    // Call optional reset callback
    if (this.props.onReset) {
      this.props.onReset();
    }

    // Track retry action
    trackEvent({
      event: 'retry_clicked',
      category: 'error',
      properties: {
        label: 'error_recovery_attempt',
        value: 1,
      },
      timestamp: new Date().toISOString(),
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <svg 
                  className="w-8 h-8 text-red-600 dark:text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We encountered an error while rendering this part of Nothing™. 
                Don't worry, even our errors contain nothing of value.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Details (Development)
                </summary>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1 overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-describedby="retry-description"
              >
                Try Again
              </button>
              <p id="retry-description" className="text-sm text-gray-500 dark:text-gray-400">
                Click to reload this section and continue experiencing nothing
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Error ID: {Date.now().toString(36)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
