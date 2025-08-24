import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useI18n } from '@/providers/I18nProvider';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// ErrorBoundary needs to be a class component to use componentDidCatch
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Could send to error tracking service
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onReset: () => void;
  error?: Error;
}

function ErrorFallback({ onReset, error }: ErrorFallbackProps) {
  const { t } = useI18n();

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
      role="alert"
      aria-labelledby="error-title"
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500 mb-4">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
          <h2 
            id="error-title"
            className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white"
          >
            {t('error.boundary.title', 'Something went wrong')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('error.boundary.description', 'An unexpected error occurred. Please try again.')}
          </p>
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('error.boundary.details', 'Error Details')}
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
        </div>
        <div>
          <button
            onClick={onReset}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
            aria-describedby="retry-description"
          >
            {t('error.boundary.retry', 'Try Again')}
          </button>
          <p 
            id="retry-description" 
            className="sr-only"
          >
            {t('error.boundary.retry.description', 'Click to reload the application and try again')}
          </p>
        </div>
      </div>
    </div>
  );
}

export { ErrorBoundaryClass as ErrorBoundary };
```

/*
## SELF-CHECK
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useI18n from I18nProvider
- [ ] Reads config from `@/app/config` - not applicable for this component
- [x] Exports default named component - exports named ErrorBoundary
- [x] Adds basic ARIA and keyboard handlers (where relevant) - includes role="alert", aria-labelledby, aria-describedby, and proper semantic structure
*/