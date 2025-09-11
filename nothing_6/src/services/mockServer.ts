// filepath: src/services/mockServer.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for mock server)

/* src/services/mockServer.ts

   Dev-only mock server initializer that mounts endpoints from src/mocks/data.ts and honors appConfig.debug flags.

   Usage:
     import { startMockServer, stopMockServer } from '@/services/mockServer'
     if (appConfig.shouldUseMockData) await startMockServer()
*/

import { appConfig, isDevelopment, shouldUseMockData } from '@/app/config'
import { eventBus } from '@/core/events'
import { hooks } from '@/core/hooks'
import { server } from '@/mocks/server'

let isServerRunning = false
let serverInstance: any = null

export interface MockServerOptions {
  quiet?: boolean
  onUnhandledRequest?: 'warn' | 'error' | 'bypass'
  debug?: boolean
}

export interface MockServerStatus {
  isRunning: boolean
  endpoints: string[]
  requestCount: number
  lastRequest?: {
    method: string
    url: string
    timestamp: number
  }
}

// Internal state for debugging and monitoring
const mockServerState = {
  requestCount: 0,
  lastRequest: undefined as MockServerStatus['lastRequest'],
  startTime: 0,
}

// Start the mock server (dev-only)
export async function startMockServer(options: MockServerOptions = {}): Promise<void> {
  if (!isDevelopment) {
    console.warn('[MockServer] Attempted to start mock server in production mode')
    return
  }

  if (!shouldUseMockData) {
    console.info('[MockServer] Mock data disabled via config')
    return
  }

  if (isServerRunning) {
    console.warn('[MockServer] Server is already running')
    return
  }

  try {
    const startOptions = {
      quiet: options.quiet ?? !appConfig.dev.enable_mock_data,
      onUnhandledRequest: options.onUnhandledRequest ?? 'warn' as const,
      ...options,
    }

    // Configure server based on app config
    if (appConfig.dev.mock_api_endpoints.length > 0) {
      console.info('[MockServer] Configured endpoints:', appConfig.dev.mock_api_endpoints)
    }

    // Set up request interceptor for monitoring
    server.events.on('request:start', ({ request }) => {
      mockServerState.requestCount++
      mockServerState.lastRequest = {
        method: request.method,
        url: request.url,
        timestamp: Date.now(),
      }

      // Emit to event bus for analytics/debugging
      eventBus.emit('analytics:event', {
        name: 'mock:request',
        properties: {
          method: request.method,
          url: request.url,
          count: mockServerState.requestCount,
        },
      })

      // Run hooks for API request interception
      hooks.run('beforeApiRequest', {
        path: request.url,
        method: request.method,
        meta: { mock: true, timestamp: Date.now() },
      }).catch(err => {
        console.error('[MockServer] Hook error:', err)
      })
    })

    // Set up response interceptor
    server.events.on('request:match', ({ request, response }) => {
      hooks.run('afterApiResponse', {
        path: request.url,
        method: request.method,
        response: {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          data: response.body,
          error: response.status >= 400 ? `Mock error ${response.status}` : undefined,
        },
        meta: { mock: true, timestamp: Date.now() },
      }).catch(err => {
        console.error('[MockServer] Hook error:', err)
      })
    })

    // Start the server
    await server.start(startOptions)
    
    isServerRunning = true
    serverInstance = server
    mockServerState.startTime = Date.now()

    if (!startOptions.quiet) {
      console.info('[MockServer] Started successfully')
      console.info('[MockServer] Mock endpoints:', appConfig.dev.mock_api_endpoints)
    }

    // Emit startup event
    eventBus.emit('mock:server:started', {
      endpoints: appConfig.dev.mock_api_endpoints,
      timestamp: mockServerState.startTime,
    })

  } catch (error) {
    console.error('[MockServer] Failed to start:', error)
    eventBus.emit('mock:server:error', {
      error: String(error),
      phase: 'startup',
    })
    throw error
  }
}

// Stop the mock server
export async function stopMockServer(): Promise<void> {
  if (!isServerRunning || !serverInstance) {
    console.warn('[MockServer] No server running to stop')
    return
  }

  try {
    await serverInstance.stop()
    
    isServerRunning = false
    serverInstance = null

    console.info('[MockServer] Stopped successfully')
    
    // Emit shutdown event
    eventBus.emit('mock:server:stopped', {
      uptime: Date.now() - mockServerState.startTime,
      totalRequests: mockServerState.requestCount,
    })

    // Reset state
    mockServerState.requestCount = 0
    mockServerState.lastRequest = undefined
    mockServerState.startTime = 0

  } catch (error) {
    console.error('[MockServer] Failed to stop:', error)
    eventBus.emit('mock:server:error', {
      error: String(error),
      phase: 'shutdown',
    })
    throw error
  }
}

// Get current server status
export function getMockServerStatus(): MockServerStatus {
  return {
    isRunning: isServerRunning,
    endpoints: appConfig.dev.mock_api_endpoints,
    requestCount: mockServerState.requestCount,
    lastRequest: mockServerState.lastRequest,
  }
}

// Reset server statistics
export function resetMockServerStats(): void {
  mockServerState.requestCount = 0
  mockServerState.lastRequest = undefined
  
  eventBus.emit('mock:server:stats:reset', {
    timestamp: Date.now(),
  })
}

// Auto-start if configured (called during app initialization)
export async function initializeMockServer(): Promise<void> {
  if (!isDevelopment || !shouldUseMockData) {
    return
  }

  // Auto-start in development when mock data is enabled
  try {
    await startMockServer({
      quiet: false,
      debug: appConfig.dev.enable_mock_data,
    })
  } catch (error) {
    console.error('[MockServer] Auto-start failed:', error)
  }
}

// Development helpers
export const mockServerUtils = {
  getStatus: getMockServerStatus,
  resetStats: resetMockServerStats,
  getRequestCount: () => mockServerState.requestCount,
  getLastRequest: () => mockServerState.lastRequest,
  getUptime: () => isServerRunning ? Date.now() - mockServerState.startTime : 0,
}

// Default export for convenient importing
const mockServerService = {
  start: startMockServer,
  stop: stopMockServer,
  getStatus: getMockServerStatus,
  resetStats: resetMockServerStats,
  initialize: initializeMockServer,
  utils: mockServerUtils,
}

export default mockServerService

// Example usage (commented):
// import mockServer from '@/services/mockServer'
// if (appConfig.shouldUseMockData) {
//   await mockServer.start({ debug: true })
// }
