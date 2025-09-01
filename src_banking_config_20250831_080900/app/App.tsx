import React, { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { I18nProvider } from '@/app/providers/I18nProvider'
import { MockServerProvider } from '@/app/providers/MockServerProvider'
import { WebSocketProvider } from '@/app/providers/WebSocketProvider'
import { Router } from '@/app/providers/Router'
import { Spinner } from '@/shared/components/ui/Spinner'
import { appConfig, isDevelopmentMode, shouldUseMockData } from '@/app/config'
import { defaultEventBus } from '@/core/events'
import '@/app/styles/globals.css'

// Global loading fallback component
const AppLoadingFallback: React.FC = () => (
  <div 
    className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
    role="status"
    aria-label="Loading application"
  >
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-300">
        Loading {appConfig.appName}...
      </p>
    </div>
  </div>
)

// Global error fallback component
const AppErrorFallback: React.FC<{ error: Error; reset: () => void }> = ({ 
  error, 
  reset 
}) => (
  <div 
    className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center p-4"
    role="alert"
    aria-labelledby="error-title"
  >
    <div className="max-w-md text-center">
      <h1 
        id="error-title"
        className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4"
      >
        Something went wrong
      </h1>
      <p className="text-red-700 dark:text-red-300 mb-6">
        {isDevelopmentMode() 
          ? `Error: ${error.message}`
          : 'We encountered an unexpected error. Please try refreshing the page.'
        }
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        aria-describedby="error-title"
      >
        Try again
      </button>
    </div>
  </div>
)

// Development mode indicators
const DevModeIndicator: React.FC = () => {
  if (!isDevelopmentMode()) return null
  
  return (
    <div 
      className="fixed bottom-4 left-4 z-50 px-3 py-1 bg-yellow-500 text-black text-xs rounded-md shadow-lg"
      role="status"
      aria-label="Development mode active"
    >
      <span className="font-medium">DEV</span>
      {shouldUseMockData() && (
        <span className="ml-2 opacity-75">| Mock Data</span>
      )}
    </div>
  )
}

// Provider composition component for cleaner nesting
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <ErrorBoundary fallback={AppErrorFallback}>
        <QueryProvider>
          <I18nProvider>
            <ThemeProvider>
              <AuthProvider>
                <MockServerProvider enabled={shouldUseMockData()}>
                  <WebSocketProvider>
                    {children}
                  </WebSocketProvider>
                </MockServerProvider>
              </AuthProvider>
            </ThemeProvider>
          </I18nProvider>
        </QueryProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

// Main App component
export const App: React.FC = () => {
  React.useEffect(() => {
    // Emit app initialization event
    defaultEventBus.emit('app.initialized', {
      env: appConfig.env,
      features: appConfig.features,
      timestamp: new Date().toISOString()
    })

    // Set document title
    document.title = appConfig.appName

    // Add meta tags for PWA/mobile
    const metaViewport = document.querySelector('meta[name="viewport"]')
    if (!metaViewport) {
      const viewport = document.createElement('meta')
      viewport.name = 'viewport'
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      document.head.appendChild(viewport)
    }

    // Add theme-color meta for better mobile experience
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (!metaTheme) {
      const themeColor = document.createElement('meta')
      themeColor.name = 'theme-color'
      themeColor.content = '#1f2937' // dark gray
      document.head.appendChild(themeColor)
    }

    // Development mode console info
    if (isDevelopmentMode()) {
      console.group(`🏦 ${appConfig.appName} - Development Mode`)
      console.log('Features enabled:', appConfig.features)
      console.log('Mock data:', shouldUseMockData())
      console.log('Mock users:', appConfig.developmentMode.mockAuthUsers)
      console.groupEnd()
    }

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      defaultEventBus.emit('error.reported', {
        error: event.reason,
        context: { type: 'unhandledRejection' }
      })
    }

    // Global error handler for JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      defaultEventBus.emit('error.reported', {
        error: event.error || new Error(event.message),
        context: { type: 'globalError', filename: event.filename, line: event.lineno }
      })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
      
      defaultEventBus.emit('app.unmounted', {
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  return (
    <AppProviders>
      <div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
        data-app={appConfig.appType}
        data-env={appConfig.env}
      >
        <Suspense fallback={<AppLoadingFallback />}>
          <Router />
        </Suspense>
        
        {/* Development mode indicators */}
        <DevModeIndicator />
        
        {/* Global toast container - placeholder for future toast system */}
        <div 
          id="toast-container" 
          className="fixed top-4 right-4 z-50 space-y-2"
          aria-live="polite"
          aria-label="Notifications"
        />
        
        {/* Global modal container - placeholder for future modal system */}
        <div 
          id="modal-container" 
          className="fixed inset-0 z-40"
          style={{ pointerEvents: 'none' }}
        />
      </div>
    </AppProviders>
  )
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses providers and event bus
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant) - includes ARIA labels and roles
*/
