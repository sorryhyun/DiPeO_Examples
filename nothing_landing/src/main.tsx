import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppProvider } from './shared/providers/AppProvider'
import './index.css'

async function bootstrap() {
  // Initialize mock server in development
  if (process.env.NODE_ENV === 'development') {
    try {
      const { start } = await import('./mock/server')
      await start()
      console.log('Mock server started')
    } catch (error) {
      console.warn('Failed to start mock server:', error)
    }
  }

  // Render the app
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </StrictMode>
  )
}

bootstrap().catch(console.error)
