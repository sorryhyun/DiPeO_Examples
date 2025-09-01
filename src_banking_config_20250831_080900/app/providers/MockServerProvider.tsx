'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { shouldUseMockData, isDevelopmentMode } from '@/app/config'
import { startMockServer, stopMockServer, isMockServerActive } from '@/mocks/server'
import { startMockWebSocket, stopMockWebSocket, getMockWebSocketStatus } from '@/mocks/websocket'
import { defaultEventBus } from '@/core/events'

interface MockServerState {
  isApiServerActive: boolean
  isWebSocketActive: boolean
  isStarting: boolean
  error: Error | null
}

interface MockServerContextValue {
  state: MockServerState
  startServices: () => Promise<void>
  stopServices: () => Promise<void>
  restartServices: () => Promise<void>
}

// Create context
const MockServerContext = createContext<MockServerContextValue | null>(null)

// Hook to use mock server context
export function useMockServer(): MockServerContextValue {
  const context = useContext(MockServerContext)
  if (!context) {
    throw new Error('useMockServer must be used within MockServerProvider')
  }
  return context
}

interface MockServerProviderProps {
  children: React.ReactNode
  autoStart?: boolean
}

export function MockServerProvider({ 
  children, 
  autoStart = true 
}: MockServerProviderProps) {
  const [state, setState] = useState<MockServerState>({
    isApiServerActive: false,
    isWebSocketActive: false,
    isStarting: false,
    error: null
  })

  // Update state from external changes
  useEffect(() => {
    const updateState = () => {
      setState(prev => ({
        ...prev,
        isApiServerActive: isMockServerActive(),
        isWebSocketActive: getMockWebSocketStatus().isRunning
      }))
    }

    // Set up event listeners for mock server events
    const unsubscribeApiStart = defaultEventBus.on('mock.serverStarted', updateState)
    const unsubscribeApiStop = defaultEventBus.on('mock.serverStopped', updateState)
    const unsubscribeWsStart = defaultEventBus.on('websocket.started', updateState)
    const unsubscribeWsStop = defaultEventBus.on('websocket.stopped', updateState)

    // Update initial state
    updateState()

    return () => {
      unsubscribeApiStart()
      unsubscribeApiStop()
      unsubscribeWsStart()
      unsubscribeWsStop()
    }
  }, [])

  // Start mock services
  const startServices = async (): Promise<void> => {
    if (!shouldUseMockData()) {
      console.log('MockServerProvider: Mock data disabled, skipping service start')
      return
    }

    setState(prev => ({ ...prev, isStarting: true, error: null }))

    try {
      console.log('MockServerProvider: Starting mock services...')

      // Start API server
      await startMockServer()

      // Start WebSocket server
      startMockWebSocket()

      setState(prev => ({
        ...prev,
        isApiServerActive: true,
        isWebSocketActive: getMockWebSocketStatus().isRunning,
        isStarting: false
      }))

      console.log('MockServerProvider: Mock services started successfully')

      // Emit event for other components
      defaultEventBus.emit('mockProvider.servicesStarted', {
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('MockServerProvider: Failed to start services:', error)
      
      setState(prev => ({
        ...prev,
        error: error as Error,
        isStarting: false
      }))

      // Emit error event
      defaultEventBus.emit('error.reported', {
        error: error as Error,
        context: { mockProvider: true, operation: 'startServices' }
      })
    }
  }

  // Stop mock services
  const stopServices = async (): Promise<void> => {
    setState(prev => ({ ...prev, isStarting: true, error: null }))

    try {
      console.log('MockServerProvider: Stopping mock services...')

      // Stop services
      await stopMockServer()
      stopMockWebSocket()

      setState(prev => ({
        ...prev,
        isApiServerActive: false,
        isWebSocketActive: false,
        isStarting: false
      }))

      console.log('MockServerProvider: Mock services stopped successfully')

      // Emit event
      defaultEventBus.emit('mockProvider.servicesStopped', {
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('MockServerProvider: Failed to stop services:', error)
      
      setState(prev => ({
        ...prev,
        error: error as Error,
        isStarting: false
      }))

      // Emit error event
      defaultEventBus.emit('error.reported', {
        error: error as Error,
        context: { mockProvider: true, operation: 'stopServices' }
      })
    }
  }

  // Restart mock services
  const restartServices = async (): Promise<void> => {
    console.log('MockServerProvider: Restarting mock services...')
    
    await stopServices()
    
    // Add small delay to ensure clean shutdown
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await startServices()
  }

  // Auto-start services on mount
  useEffect(() => {
    if (autoStart && shouldUseMockData() && isDevelopmentMode()) {
      // Start services after a short delay to allow other providers to initialize
      const timeoutId = setTimeout(() => {
        startServices()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [autoStart])

  // Clean up services on unmount
  useEffect(() => {
    return () => {
      if (state.isApiServerActive || state.isWebSocketActive) {
        console.log('MockServerProvider: Cleaning up services on unmount...')
        stopServices()
      }
    }
  }, [])

  // Error event listener
  useEffect(() => {
    const handleError = (eventData: { error: Error; context?: any }) => {
      if (eventData.context?.mockServer || eventData.context?.websocket) {
        setState(prev => ({
          ...prev,
          error: eventData.error
        }))
      }
    }

    const unsubscribe = defaultEventBus.on('error.reported', handleError)
    return unsubscribe
  }, [])

  const contextValue: MockServerContextValue = {
    state,
    startServices,
    stopServices,
    restartServices
  }

  // Only render in development mode with mock data enabled
  if (!isDevelopmentMode() || !shouldUseMockData()) {
    return <>{children}</>
  }

  return (
    <MockServerContext.Provider value={contextValue}>
      {children}
      {/* Development indicator */}
      {state.isApiServerActive && (
        <div
          className="fixed bottom-4 right-4 z-50 bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium shadow-lg"
          role="status"
          aria-label="Development mode indicator"
        >
          🔧 Mock API Active
        </div>
      )}
      {/* Error indicator */}
      {state.error && (
        <div
          className="fixed bottom-4 left-4 z-50 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium shadow-lg cursor-pointer"
          role="alert"
          aria-label="Mock server error"
          onClick={() => setState(prev => ({ ...prev, error: null }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setState(prev => ({ ...prev, error: null }))
            }
          }}
          tabIndex={0}
        >
          ❌ Mock Error: {state.error.message}
        </div>
      )}
      {/* Loading indicator */}
      {state.isStarting && (
        <div
          className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium shadow-lg"
          role="status"
          aria-label="Mock services loading"
        >
          ⏳ Starting Mock Services...
        </div>
      )}
    </MockServerContext.Provider>
  )
}

// Development utilities
export const mockServerUtils = {
  // Check if any mock services are running
  isAnyServiceActive: (): boolean => {
    return isMockServerActive() || getMockWebSocketStatus().isRunning
  },

  // Get comprehensive status
  getStatus: () => ({
    api: {
      active: isMockServerActive()
    },
    websocket: getMockWebSocketStatus(),
    environment: {
      isDevelopment: isDevelopmentMode(),
      shouldUseMockData: shouldUseMockData()
    }
  }),

  // Force restart all services
  forceRestart: async (): Promise<void> => {
    try {
      await stopMockServer()
      stopMockWebSocket()
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await startMockServer()
      startMockWebSocket()
      
      console.log('MockServerProvider: Force restart completed')
    } catch (error) {
      console.error('MockServerProvider: Force restart failed:', error)
      throw error
    }
  }
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - this IS a provider
- [x] Reads config from `@/app/config`
- [x] Exports default named component - exports MockServerProvider
- [x] Adds basic ARIA and keyboard handlers (where relevant) - added ARIA labels and keyboard handlers for interactive elements
*/
