// filepath: src/shared/components/ErrorBoundary.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { eventBus } from '@/core/events'
import { config } from '@/app/config'
import GlassCard from '@/shared/components/GlassCard'
import Button from '@/shared/components/Button'

// Error boundary state interface
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  retryCount: number
}

// Error boundary props
export interface ErrorBoundaryProps {
  children: ReactNode
  /** Fallback component to render when error occurs */
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode
  /** Called when error occurs (for custom logging) */
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  /** Show retry button */
  showRetry?: boolean
  /** Maximum retry attempts */
  maxRetries?: number
  /** Custom error title */
  errorTitle?: string
  /** Custom error message */
  errorMessage?: string
  /** Enable detailed error info in development */
  showDetails?: boolean
}

// Error severity levels
type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

// Determine error severity based on error type and stack
function getErrorSeverity(error: Error): ErrorSeverity {
  const errorMessage = error.message.toLowerCase()
  const errorStack = error.stack?.toLowerCase() || ''
  
  // Critical errors
  if (errorMessage.includes('out of memory') || 
      errorMessage.includes('maximum call stack') ||
      errorStack.includes('react-dom') && errorStack.includes('render')) {
    return 'critical'
  }
  
  // High severity
  if (errorMessage.includes('network') || 
      errorMessage.includes('fetch') ||
      errorMessage.includes('chunk load') ||
      errorStack.includes('async')) {
    return 'high'
  }
  
  // Medium severity
  if (errorMessage.includes('undefined') || 
      errorMessage.includes('null') ||
      errorMessage.includes('cannot read')) {
    return 'medium'
  }
  
  return 'low'
}

// Generate unique error ID
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Default error boundary component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || generateErrorId()
    const severity = getErrorSeverity(error)
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId,
    })

    // Log to console in development
    if (config.isDevelopment) {
      console.group(`🚨 ErrorBoundary caught error [${errorId}]`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // Emit error event to event bus
    eventBus.emit('error:boundary', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      errorId,
      severity,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo, errorId)
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError)
      }
    }

    // Emit analytics event
    eventBus.emit('analytics:track', {
      event: 'error_boundary_triggered',
      properties: {
        error_id: errorId,
        error_name: error.name,
        error_message: error.message,
        severity,
        retry_count: this.state.retryCount,
        component_stack_length: errorInfo.componentStack?.split('\n').length || 0,
      }
    })
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries ?? 3
    
    if (this.state.retryCount >= maxRetries) {
      eventBus.emit('error:max_retries_reached', {
        errorId: this.state.errorId,
        retryCount: this.state.retryCount,
      })
      return
    }

    // Emit retry event
    eventBus.emit('analytics:track', {
      event: 'error_boundary_retry',
      properties: {
        error_id: this.state.errorId,
        retry_count: this.state.retryCount + 1,
      }
    })

    // Clear error state and increment retry count
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
    }))
  }

  handleReload =() => {
    eventBus.emit('analytics:track', {
      event: 'error_boundary_reload',
      properties: {
        error_id: this.state.errorId,
        retry_count: this.state.retryCount,
      }
    })

    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  handleReport = () => {
    const { error, errorInfo, errorId } = this.state
    
    if (!error || !errorInfo || !errorId) return

    eventBus.emit('analytics:track', {
      event: 'error_boundary_report',
      properties: {
        error_id: errorId,
      }
    })

    // Emit detailed error report event
    eventBus.emit('error:report', {
      errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      context: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        timestamp: new Date().toISOString(),
        retryCount: this.state.retryCount,
      }
    })
  }

  render() {
    const { 
      hasError, 
      error, 
      errorInfo, 
      errorId, 
      retryCount 
    } = this.state
    
    const {
      children,
      fallback,
      showRetry = true,
      maxRetries = 3,
      errorTitle = 'Something went wrong',
      errorMessage = 'An unexpected error occurred. Please try again.',
      showDetails = config.isDevelopment,
    } = this.props

    if (hasError && error && errorInfo) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo, this.handleRetry)
      }

      const canRetry = showRetry && retryCount < maxRetries
      const severity = getErrorSeverity(error)

      return (
        <GlassCard className="max-w-2xl mx-auto p-8 text-center">
          <div className="mb-6">
            {/* Error icon based on severity */}
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              severity === 'critical' ? 'bg-red-100 dark:bg-red-900/20' :
              severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/20' :
              severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
              'bg-blue-100 dark:bg-blue-900/20'
            }`}>
              <span className={`text-2xl ${
                severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                severity === 'high' ? 'text-orange-600 dark:text-orange-400' :
                severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-blue-600 dark:text-blue-400'
              }`}>
                {severity === 'critical' ? '💥' : severity === 'high' ? '⚠️' : severity === 'medium' ? '⚡' : '🤔'}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {errorTitle}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {errorMessage}
            </p>

            {errorId && (
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                Error ID: {errorId}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            {canRetry && (
              <Button
                onClick={this.handleRetry}
                variant="primary"
                size="md"
                className="min-w-[120px]"
                aria-label={`Retry (${maxRetries - retryCount} attempts remaining)`}
              >
                Try Again {retryCount > 0 && `(${maxRetries - retryCount} left)`}
              </Button>
            )}
            
            <Button
              onClick={this.handleReload}
              variant="secondary"
              size="md"
              className="min-w-[120px]"
              aria-label="Reload page"
            >
              Reload Page
            </Button>
            
            <Button
              onClick={this.handleReport}
              variant="outline"
              size="md"
              className="min-w-[120px]"
              aria-label="Report this error"
            >
              Report Issue
            </Button>
          </div>

          {/* Detailed error information (dev only) */}
          {showDetails && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 hover:text-gray-900 dark:hover:text-white">
                Show Error Details
              </summary>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm font-mono">
                <div className="mb-4">
                  <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Error:</h4>
                  <p className="text-gray-800 dark:text-gray-200">{error.name}: {error.message}</p>
                </div>
                
                {error.stack && (
                  <div className="mb-4">
                    <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-2">Stack Trace:</h4>
                    <pre className="whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </div>
                )}
                
                {errorInfo.componentStack && (
                  <div>
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">Component Stack:</h4>
                    <pre className="whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </GlassCard>
      )
    }

    return children
  }
}

// Hook for using error boundary programmatically
export function useErrorHandler() {
  return (error: Error, errorInfo?: Partial<ErrorInfo>) => {
    // Throw error to trigger nearest error boundary
    throw error
  }
}

// Higher-order component for automatic error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  return function ErrorBoundaryWrapped(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary
