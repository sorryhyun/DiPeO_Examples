import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from '@/providers/AppProvider'
import { HomePage } from '@/pages/index'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

root.render(
  <React.StrictMode>
    <AppProvider>
      <HomePage />
    </AppProvider>
  </React.StrictMode>
)
