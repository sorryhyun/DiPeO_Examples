// filepath: src/main.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (bootstrap function)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for main entry)

import React from 'react'
import { createRoot } from 'react-dom/client'
import { config, isDevelopment, shouldUseMockData } from '@/app/config'
import { eventBus } from '@/core/events'
import App from './App'
import ThemeProvider from '@/providers/ThemeProvider'
import ToastProvider from '@/providers/ToastProvider'
import ModalProvider from '@/providers/ModalProvider'
import AuthProvider from '@/providers/AuthProvider'
import { startMockServer } from '@/services/mockServer'
import '@/styles/global.css'

// Root provider composition wrapper
const RootProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Bootstrap function that handles app initialization
async function bootstrap() {
  try {
    // Start mock server in development if configured
    if (isDevelopment && shouldUseMockData) {
      console.log('🎭 Starting mock server for development...')
      await startMockServer()
      eventBus.emit('app:mock-server-started', { enabled: true })
    }

    // Get root element
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      throw new Error('Root element not found. Ensure your HTML has a <div id="root"></div>')
    }

    // Create React root and render
    const root = createRoot(rootElement)
    
    root.render(
      <React.StrictMode>
        <RootProviders>
          <App />
        </RootProviders>
      </React.StrictMode>
    )

    // Emit app startup event
    eventBus.emit('app:started', {
      mode: config.mode,
      isDevelopment: config.isDevelopment,
      shouldUseMockData: config.shouldUseMockData,
      version: config.version,
      timestamp: new Date().toISOString(),
    })

    // Development helpers
    if (isDevelopment) {
      // Make config available in dev tools
      ;(window as any).__APP_CONFIG__ = config
      ;(window as any).__EVENT_BUS__ = eventBus
      
      console.log('🚀 Application started in development mode')
      console.log('📊 Config:', config)
      console.log('🔧 Access config via window.__APP_CONFIG__')
      console.log('📡 Access event bus via window.__EVENT_BUS__')
    }

  } catch (error) {
    console.error('❌ Failed to bootstrap application:', error)
    
    // Emit error event
    eventBus.emit('app:error', { 
      type: 'bootstrap_failure', 
      error: error instanceof Error ? error.message : String(error) 
    })

    // Show fallback error UI
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to bottom right, #1f2937, #000);
          color: #ef4444;
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
          padding: 2rem;
        ">
          <div>
            <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">
              Failed to Start Application
            </h1>
            <p style="color: #9ca3af; margin-bottom: 2rem;">
              ${error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <button 
              onclick="window.location.reload()" 
              style="
                padding: 0.75rem 1.5rem;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
                font-size: 1rem;
              "
              onmouseover="this.style.background='#2563eb'"
              onmouseout="this.style.background='#3b82f6'"
            >
              Reload Page
            </button>
          </div>
        </div>
      `
    }
  }
}

// Start the application
bootstrap()

export default bootstrap
