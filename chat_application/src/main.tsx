import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Providers
import { QueryProvider } from './shared/context/QueryProvider'
import { AuthProvider } from './shared/context/AuthProvider'
import { WebSocketProvider } from './shared/context/WebSocketProvider'
import { ThemeProvider } from './shared/context/ThemeProvider'
import { I18nProvider } from './shared/context/I18nProvider'
import { ToastProvider } from './shared/hooks/useToast'
import ErrorBoundary from './shared/ErrorBoundary'

// Dev configuration and mocks
import { devConfig } from './config/devConfig'
import { setupMocks } from './services/mock/mockServer'

// Initialize mock server in development mode
if (devConfig.enable_mock_data) {
  setupMocks()
}

// Get root element
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Create root and render app
const root = createRoot(rootElement)

root.render(
  <ErrorBoundary>
    <QueryProvider>
      <AuthProvider>
        <WebSocketProvider>
          <ThemeProvider>
            <I18nProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </I18nProvider>
          </ThemeProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryProvider>
  </ErrorBoundary>
)
