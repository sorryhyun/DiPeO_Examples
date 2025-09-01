import { useEffect, useRef, useCallback, useState } from 'react'
import { defaultEventBus, type EventHandler, type AppEventMap, type UnsubscribeFunction } from '@/core/events'
import { appConfig } from '@/app/config'

// WebSocket connection status
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

// WebSocket options
export interface UseWebSocketOptions {
  // Whether to automatically connect when hook mounts
  autoConnect?: boolean
  // Retry configuration
  retry?: {
    attempts: number
    delay: number
    backoff?: number
  }
  // Connection timeout in milliseconds
  timeout?: number
  // Whether to reconnect on window focus
  reconnectOnFocus?: boolean
  // Debug mode
  debug?: boolean
}

// WebSocket hook return value
export interface UseWebSocketReturn {
  status: WebSocketStatus
  lastMessage: any
  send: (data: any) => void
  connect: () => void
  disconnect: () => void
  reconnect: () => void
  isConnected: boolean
  isConnecting: boolean
  connectionAttempts: number
}

/**
 * Hook for managing WebSocket connections with automatic reconnection,
 * event bus integration, and connection state management
 */
export function useWebSocket(
  url?: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    autoConnect = true,
    retry = { attempts: 3, delay: 1000, backoff: 1.5 },
    timeout = 10000,
    reconnectOnFocus = true,
    debug = false
  } = options

  // WebSocket state
  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  // Refs for persistent values across re-renders
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const urlRef = useRef(url)
  const optionsRef = useRef(options)

  // Update refs when props change
  useEffect(() => {
    urlRef.current = url
    optionsRef.current = options
  }, [url, options])

  // Get WebSocket URL (with runtime computation for SSR safety)
  const getWebSocketUrl = useCallback((): string => {
    if (urlRef.current) {
      return urlRef.current
    }

    // Use config function to get WebSocket URL
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${protocol}//${window.location.host}/ws`
    }

    // Fallback for SSR
    return 'ws://localhost:8000/ws'
  }, [])

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }
  }, [])

  // Send data through WebSocket
  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data)
        wsRef.current.send(message)
        
        // Emit event to event bus
        defaultEventBus.emit('websocket.messageSent', {
          data,
          timestamp: new Date().toISOString()
        })
        
        if (debug) {
          console.log('[useWebSocket] Message sent:', data)
        }
      } catch (error) {
        console.error('[useWebSocket] Failed to send message:', error)
        defaultEventBus.emit('error.reported', {
          error: error instanceof Error ? error : new Error('WebSocket send failed'),
          context: { action: 'send', data }
        })
      }
    } else {
      console.warn('[useWebSocket] Cannot send message - WebSocket not connected')
    }
  }, [debug])

  // Attempt reconnection with exponential backoff
  const scheduleReconnect = useCallback((attempt: number) => {
    if (attempt >= retry.attempts) {
      if (debug) {
        console.log('[useWebSocket] Max reconnection attempts reached')
      }
      return
    }

    const delay = retry.delay * Math.pow(retry.backoff || 1.5, attempt)
    
    if (debug) {
      console.log(`[useWebSocket] Scheduling reconnection attempt ${attempt + 1} in ${delay}ms`)
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      connect()
    }, delay)
  }, [retry, debug])

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Don't connect if already connecting or connected
    if (status === 'connecting' || status === 'connected') {
      return
    }

    // Skip connection in development if disabled
    if (appConfig.developmentMode.disableWebsocketInDev && appConfig.env === 'development') {
      if (debug) {
        console.log('[useWebSocket] WebSocket disabled in development mode')
      }
      return
    }

    clearTimeouts()
    setStatus('connecting')

    const wsUrl = getWebSocketUrl()
    
    if (debug) {
      console.log(`[useWebSocket] Connecting to ${wsUrl}`)
    }

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      // Connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close()
          setStatus('error')
          
          defaultEventBus.emit('websocket.error', {
            error: new Error('Connection timeout'),
            timestamp: new Date().toISOString()
          })
        }
      }, timeout)

      ws.onopen = () => {
        clearTimeout(connectionTimeoutRef.current!)
        setStatus('connected')
        setConnectionAttempts(0)
        
        defaultEventBus.emit('websocket.connected', {
          timestamp: new Date().toISOString()
        })
        
        if (debug) {
          console.log('[useWebSocket] Connected successfully')
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
          
          // Emit to event bus
          defaultEventBus.emit('websocket.messageReceived', {
            data,
            timestamp: new Date().toISOString()
          })
          
          if (debug) {
            console.log('[useWebSocket] Message received:', data)
          }
        } catch (error) {
          // Handle non-JSON messages
          setLastMessage(event.data)
          
          defaultEventBus.emit('websocket.messageReceived', {
            data: event.data,
            timestamp: new Date().toISOString()
          })
          
          if (debug) {
            console.log('[useWebSocket] Raw message received:', event.data)
          }
        }
      }

      ws.onerror = (event) => {
        const error = new Error('WebSocket error')
        setStatus('error')
        
        defaultEventBus.emit('websocket.error', {
          error,
          timestamp: new Date().toISOString()
        })
        
        if (debug) {
          console.error('[useWebSocket] WebSocket error:', event)
        }
      }

      ws.onclose = (event) => {
        clearTimeouts()
        wsRef.current = null
        
        const wasConnected = status === 'connected'
        setStatus('disconnected')
        
        defaultEventBus.emit('websocket.disconnected', {
          timestamp: new Date().toISOString(),
          reason: event.reason || `Code: ${event.code}`
        })
        
        if (debug) {
          console.log(`[useWebSocket] Connection closed: ${event.code} - ${event.reason}`)
        }

        // Only attempt reconnection if we were previously connected
        // and the close wasn't intentional (code 1000)
        if (wasConnected && event.code !== 1000) {
          setConnectionAttempts(prev => prev + 1)
          scheduleReconnect(connectionAttempts)
        }
      }
    } catch (error) {
      setStatus('error')
      console.error('[useWebSocket] Failed to create WebSocket:', error)
      
      defaultEventBus.emit('error.reported', {
        error: error instanceof Error ? error : new Error('WebSocket creation failed'),
        context: { url: wsUrl }
      })
    }
  }, [status, getWebSocketUrl, timeout, debug, scheduleReconnect, connectionAttempts])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    clearTimeouts()
    
    if (wsRef.current) {
      // Use code 1000 for normal closure
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    
    setStatus('disconnected')
    setConnectionAttempts(0)
    
    if (debug) {
      console.log('[useWebSocket] Manually disconnected')
    }
  }, [debug, clearTimeouts])

  // Reconnect (disconnect then connect)
  const reconnect = useCallback(() => {
    if (debug) {
      console.log('[useWebSocket] Manual reconnection triggered')
    }
    
    disconnect()
    // Small delay to ensure clean disconnection
    setTimeout(connect, 100)
  }, [connect, disconnect, debug])

  // Handle window focus for reconnection
  useEffect(() => {
    if (!reconnectOnFocus) return

    const handleFocus = () => {
      if (status === 'disconnected' && wsRef.current === null) {
        if (debug) {
          console.log('[useWebSocket] Window focus detected, attempting reconnection')
        }
        connect()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [status, reconnectOnFocus, connect, debug])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    // Cleanup on unmount
    return () => {
      clearTimeouts()
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting')
      }
    }
  }, []) // Empty dependency array for mount/unmount only

  // Computed status booleans
  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting'

  return {
    status,
    lastMessage,
    send,
    connect,
    disconnect,
    reconnect,
    isConnected,
    isConnecting,
    connectionAttempts
  }
}

/**
 * Hook to subscribe to specific WebSocket event types via the event bus
 * @param eventType - The WebSocket event type to subscribe to
 * @param handler - The handler function to call when the event is received
 * @param deps - Dependency array for the handler
 */
export function useWebSocketEvent<K extends keyof AppEventMap>(
  eventType: K,
  handler: EventHandler<AppEventMap[K]>,
  deps: React.DependencyList = []
): void {
  const handlerRef = useRef(handler)

  // Update handler ref when dependencies change
  useEffect(() => {
    handlerRef.current = handler
  }, deps)

  useEffect(() => {
    const unsubscribe = defaultEventBus.on(eventType, handlerRef.current)
    return unsubscribe
  }, [eventType])
}

/**
 * Hook to subscribe to WebSocket messages with optional filtering
 * @param filter - Optional filter function to determine which messages to handle
 * @param handler - The handler function to call for matching messages
 * @param deps - Dependency array for the handler and filter
 */
export function useWebSocketMessages<T = any>(
  filter: ((data: any) => boolean) | undefined,
  handler: (data: T) => void,
  deps: React.DependencyList = []
): void {
  const handlerRef = useRef(handler)
  const filterRef = useRef(filter)

  // Update refs when dependencies change
  useEffect(() => {
    handlerRef.current = handler
    filterRef.current = filter
  }, deps)

  useWebSocketEvent('websocket.messageReceived', (event) => {
    const { data } = event
    
    // Apply filter if provided
    if (filterRef.current && !filterRef.current(data)) {
      return
    }
    
    handlerRef.current(data)
  }, [])
}

/**
 * Hook for getting WebSocket connection status
 * @returns Current WebSocket connection information
 */
export function useWebSocketStatus(): {
  status: WebSocketStatus
  isConnected: boolean
  isConnecting: boolean
  lastConnected: string | null
} {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const [lastConnected, setLastConnected] = useState<string | null>(null)

  useWebSocketEvent('websocket.connected', (event) => {
    setStatus('connected')
    setLastConnected(event.timestamp)
  })

  useWebSocketEvent('websocket.disconnected', () => {
    setStatus('disconnected')
  })

  useWebSocketEvent('websocket.error', () => {
    setStatus('error')
  })

  return {
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    lastConnected
  }
}
