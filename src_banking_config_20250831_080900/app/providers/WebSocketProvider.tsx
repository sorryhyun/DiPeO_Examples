import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { appConfig, shouldUseMockData } from '@/app/config'
import { defaultEventBus } from '@/core/events'
import { 
  startMockWebSocket, 
  stopMockWebSocket, 
  connectMockClient, 
  disconnectMockClient, 
  sendMockMessage 
} from '@/mocks/websocket'

export interface WebSocketMessage {
  id: string
  type: string
  data: any
  timestamp: string
  userId?: string
}

export interface WebSocketContextValue {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastMessage: WebSocketMessage | null
  error: string | null
  send: (message: any) => void
  subscribe: (eventType: string, handler: (data: any) => void) => () => void
  connectionId?: string
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

export interface WebSocketProviderProps {
  children: React.ReactNode
  url?: string
  reconnectAttempts?: number
  reconnectInterval?: number
  userId?: string
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url,
  reconnectAttempts = 5,
  reconnectInterval = 3000,
  userId
}) => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionId, setConnectionId] = useState<string | undefined>(undefined)

  // Refs for connection management
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectCountRef = useRef(0)
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())
  const isUnmountingRef = useRef(false)
  const eventBusUnsubscribeRef = useRef<(() => void) | null>(null)

  // WebSocket URL resolution
  const resolvedUrl = url || appConfig.websocket?.url || 'ws://localhost:8080/ws'

  // Subscribe to event types
  const subscribe = useCallback((eventType: string, handler: (data: any) => void) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set())
    }
    subscribersRef.current.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(eventType)
      if (subscribers) {
        subscribers.delete(handler)
        if (subscribers.size === 0) {
          subscribersRef.current.delete(eventType)
        }
      }
    }
  }, [])

  // Notify subscribers
  const notifySubscribers = useCallback((message: WebSocketMessage) => {
    const subscribers = subscribersRef.current.get(message.type)
    if (subscribers) {
      subscribers.forEach(handler => {
        try {
          handler(message.data)
        } catch (err) {
          console.error(`Error in WebSocket subscriber for ${message.type}:`, err)
        }
      })
    }
  }, [])

  // Send message function
  const send = useCallback((message: any) => {
    if (shouldUseMockData()) {
      // Use mock WebSocket in development
      const messageToSend = typeof message === 'string' 
        ? { type: 'message', data: message }
        : message

      sendMockMessage(messageToSend, userId)
      
      // Emit send event
      defaultEventBus.emit('websocket.messageSent', {
        data: messageToSend,
        timestamp: new Date().toISOString()
      })
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageToSend = typeof message === 'string' ? message : JSON.stringify(message)
        wsRef.current.send(messageToSend)
        
        // Emit event
        defaultEventBus.emit('websocket.messageSent', {
          data: messageToSend,
          timestamp: new Date().toISOString()
        })
      } catch (err) {
        console.error('Failed to send WebSocket message:', err)
        setError('Failed to send message')
        
        defaultEventBus.emit('error.reported', {
          error: err as Error,
          context: { websocket: true, operation: 'send' }
        })
      }
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message)
      setError('WebSocket not connected')
    }
  }, [userId])

  // Handle WebSocket message
  const handleMessage = useCallback((event: MessageEvent | any) => {
    try {
      let parsedData: any
      
      // Handle both real WebSocket events and mock events
      const rawData = event.data || event
      
      try {
        parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData
      } catch {
        // If parsing fails, use raw data
        parsedData = rawData
      }

      const message: WebSocketMessage = {
        id: parsedData.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: parsedData.type || 'message',
        data: parsedData.data || parsedData,
        timestamp: parsedData.timestamp || new Date().toISOString(),
        userId: parsedData.userId
      }

      // Only process if not unmounting and message is for this user or broadcast
      if (!isUnmountingRef.current && (!message.userId || message.userId === userId)) {
        setLastMessage(message)
        setError(null)

        // Notify local subscribers
        notifySubscribers(message)

        // Emit to global event bus
        defaultEventBus.emit('websocket.messageReceived', {
          data: message.data,
          timestamp: message.timestamp
        })
      }

    } catch (err) {
      console.error('Error handling WebSocket message:', err)
      setError('Error processing message')
      
      defaultEventBus.emit('error.reported', {
        error: err as Error,
        context: { websocket: true, operation: 'handleMessage' }
      })
    }
  }, [userId, notifySubscribers])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (shouldUseMockData()) {
      // Use mock WebSocket in development
      setConnectionStatus('connecting')
      
      // Start mock server if not running
      startMockWebSocket()
      
      // Simulate connection delay
      setTimeout(() => {
        if (!isUnmountingRef.current) {
          try {
            const mockConnectionId = connectMockClient(userId)
            setConnectionId(mockConnectionId)
            setIsConnected(true)
            setConnectionStatus('connected')
            setError(null)
            reconnectCountRef.current = 0
            
            defaultEventBus.emit('websocket.connected', {
              timestamp: new Date().toISOString()
            })
          } catch (err) {
            console.error('Mock WebSocket connection failed:', err)
            setError('Mock connection failed')
            setConnectionStatus('error')
          }
        }
      }, 500)

      // Set up event bus listener for mock messages
      eventBusUnsubscribeRef.current = defaultEventBus.on('websocket.message', ({ message }) => {
        if (!isUnmountingRef.current && (!message.userId || message.userId === userId)) {
          handleMessage(message)
        }
      })

      return
    }

    // Production WebSocket connection
    if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) {
      return // Already connecting or connected
    }

    try {
      setConnectionStatus('connecting')
      setError(null)

      const ws = new WebSocket(resolvedUrl)
      wsRef.current = ws

      ws.onopen = () => {
        if (!isUnmountingRef.current) {
          setIsConnected(true)
          setConnectionStatus('connected')
          setError(null)
          reconnectCountRef.current = 0
          setConnectionId(`ws-${Date.now()}`)

          defaultEventBus.emit('websocket.connected', {
            timestamp: new Date().toISOString()
          })
        }
      }

      ws.onmessage = handleMessage

      ws.onclose = (event) => {
        if (!isUnmountingRef.current) {
          setIsConnected(false)
          setConnectionStatus('disconnected')
          setConnectionId(undefined)

          defaultEventBus.emit('websocket.disconnected', {
            timestamp: new Date().toISOString(),
            reason: event.reason
          })

          // Attempt reconnection if not a clean close
          if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
            reconnectCountRef.current++
            console.log(`WebSocket disconnected. Reconnecting in ${reconnectInterval}ms (${reconnectCountRef.current}/${reconnectAttempts})`)
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (!isUnmountingRef.current) {
                connect()
              }
            }, reconnectInterval)
          } else if (reconnectCountRef.current >= reconnectAttempts) {
            setError(`Failed to reconnect after ${reconnectAttempts} attempts`)
            setConnectionStatus('error')
          }
        }
      }

      ws.onerror = (event) => {
        if (!isUnmountingRef.current) {
          console.error('WebSocket error:', event)
          setError('Connection error')
          setConnectionStatus('error')

          defaultEventBus.emit('websocket.error', {
            error: new Error('WebSocket connection error'),
            timestamp: new Date().toISOString()
          })
        }
      }

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setError('Failed to connect')
      setConnectionStatus('error')

      defaultEventBus.emit('error.reported', {
        error: err as Error,
        context: { websocket: true, operation: 'createConnection', url: resolvedUrl }
      })
    }
  }, [resolvedUrl, reconnectAttempts, reconnectInterval, handleMessage, userId])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // Clean up event bus subscription
    if (eventBusUnsubscribeRef.current) {
      eventBusUnsubscribeRef.current()
      eventBusUnsubscribeRef.current = null
    }

    if (shouldUseMockData() && connectionId) {
      // Clean up mock WebSocket
      try {
        disconnectMockClient(connectionId)
      } catch (err) {
        console.warn('Error disconnecting mock client:', err)
      }
    }

    if (wsRef.current) {
      if (!shouldUseMockData()) {
        // Clean up real WebSocket
        wsRef.current.close(1000, 'Component unmounting')
      }
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionStatus('disconnected')
    setConnectionId(undefined)
    setError(null)
    reconnectCountRef.current = 0
  }, [connectionId])

  // Initialize connection on mount
  useEffect(() => {
    if (appConfig.features.realTimeUpdates) {
      connect()
    }

    return () => {
      isUnmountingRef.current = true
      disconnect()
    }
  }, [connect, disconnect])

  // Listen for network status changes
  useEffect(() => {
    const handleOnline = () => {
      if (appConfig.features.realTimeUpdates && !isConnected) {
        console.log('Network back online, attempting to reconnect WebSocket')
        connect()
      }
    }

    const handleOffline = () => {
      console.log('Network offline detected')
      setError('Network offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isConnected, connect])

  // Context value
  const contextValue: WebSocketContextValue = {
    isConnected,
    connectionStatus,
    lastMessage,
    error,
    send,
    subscribe,
    connectionId
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

// Hook to use WebSocket context
export const useWebSocketClient = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext)
  
  if (!context) {
    throw new Error('useWebSocketClient must be used within a WebSocketProvider')
  }
  
  return context
}

// Export alias for easier imports
export const useWebSocket = useWebSocketClient
