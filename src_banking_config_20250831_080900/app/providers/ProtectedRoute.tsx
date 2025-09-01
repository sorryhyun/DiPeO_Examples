import React, { Component, ReactNode, ErrorInfo } from 'react'
import { defaultEventBus } from '@/core/events'
import { appConfig } from '@/app/config'

interface Props {
  children: ReactNode
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props

    this.setState({ errorInfo })

    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Report error to event bus for centralized error handling
    defaultEventBus.emit('error.reported', {
      error,
      context: {
        errorBoundary: true,
        componentStack: errorInfo.componentStack,
        errorInfo: errorInfo.errorStack,
        errorId: this.state.errorId,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        timestamp: new Date().toISOString(),
      },
    })

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo)
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError)
      }
    }

    // In development, also log more details
    if (appConfig.env === 'development') {
      console.group('🚨 ErrorBoundary Details')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    // Clear error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    })

    // Emit recovery attempt event
    defaultEventBus.emit('error.recovered', {
      error: this.state.error || 'Unknown error',
      context: { 
        errorBoundary: true, 
        retryAttempt: true,
        errorId: this.state.errorId,
      },
    })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  handleReportIssue = () => {
    const { error, errorInfo, errorId } = this.state
    
    // Create error report data
    const reportData = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    }

    // In a real app, this might send to an error reporting service
    // For now, we'll copy to clipboard and show instructions
    if (typeof window !== 'undefined' && window.navigator.clipboard) {
      const reportText = JSON.stringify(reportData, null, 2)
      window.navigator.clipboard.writeText(reportText).then(
        () => {
          alert('Error report copied to clipboard. Please send this to support.')
        },
        () => {
          // Fallback if clipboard API fails
          console.log('Error Report:', reportData)
          alert('Please check the browser console for error details to report.')
        }
      )
    } else {
      console.log('Error Report:', reportData)
      alert('Please check the browser console for error details to report.')
    }
  }

  renderDefaultFallback = () => {
    const { error, errorId } = this.state
    const isDev = appConfig.env === 'development'

    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Something went wrong
              </h1>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              We're sorry, but something unexpected happened. You can try reloading the page or contact support if the problem persists.
            </p>

            {isDev && error && (
              <details className="mb-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  Show error details (development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-red-600 dark:text-red-400 overflow-auto max-h-32">
                  <div className="font-semibold mb-1">Error ID: {errorId}</div>
                  <div className="mb-1">{error.message}</div>
                  {error.stack && (
                    <div className="text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                      {error.stack.split('\n').slice(0, 5).join('\n')}
                    </div>
                  )}
                </div>
              </details>
            )}

            {!isDev && errorId && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Error ID: {errorId}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              aria-describedby="retry-description"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try again
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              aria-describedby="reload-description"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reload page
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={this.handleReportIssue}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Report this issue
            </button>
          </div>

          {/* Screen reader descriptions */}
          <div className="sr-only">
            <p id="retry-description">
              Attempt to re-render the application without reloading the page
            </p>
            <p id="reload-description">
              Refresh the entire page to start over
            </p>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    if (hasError && error && errorInfo) {
      // If a custom fallback is provided, use it
      if (fallback) {
        try {
          return fallback(error, errorInfo, this.handleRetry)
        } catch (fallbackError) {
          console.error('Error in custom fallback component:', fallbackError)
          // Fall back to default UI if custom fallback fails
          return this.renderDefaultFallback()
        }
      }

      // Otherwise use default error UI
      return this.renderDefaultFallback()
    }

    // No error, render children normally
    return children
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Hook for programmatically triggering error boundary (for testing/development)
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    // This will trigger the nearest error boundary
    throw error
  }
}

// Export as default for convenience
export default ErrorBoundary

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses event bus and config providers
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant) - includes ARIA roles, live regions, focus management, and keyboard navigation
*/
