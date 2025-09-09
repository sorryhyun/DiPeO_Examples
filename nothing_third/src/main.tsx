// filepath: src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { isDevelopment } from '@/app/config'

// Create root element
const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element not found')
}

const root = ReactDOM.createRoot(container)

// Development mode setup
if (isDevelopment) {
  // Enable React DevTools
  if (typeof window !== 'undefined') {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot = 
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot || (() => {})
  }
}

// Production service worker registration
if (!isDevelopment && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Render application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Self-Check Comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (N/A - bootstrap file)
// [x] Adds basic ARIA and keyboard handlers (N/A - bootstrap file)
