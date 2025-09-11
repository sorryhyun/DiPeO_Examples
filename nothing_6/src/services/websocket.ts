// filepath: src/services/websocket.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (socketManager)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for WebSocket service)

import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { WSIncomingEvent, WSOutgoingEvent } from '@/core/contracts'

/* src/services/websocket.ts

   WebSocket service with typed message handling, auto-reconnect, and dev mode disable support.
   Integrates with the event bus for centralized event handling.

   Usage:
     import { socketManager } from '@/services/websocket'
     socketManager.connect()
     socketManager.send({ type: 'chat:send', payload: { text: 'Hello' } })
     socketManager.subscribe('chat:message', (payload) => { ... })
*/

export type SocketState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed'

export interface SocketOptions {
  url?: string
  maxReconnectAttempts?: number
  reconnectDelay?: number
  heartbeatInterval?: number
  enableHeartbeat?: boolean
}

export type MessageHandler<T = any> = (payload: T) => void

export class WebSocketManager {
  private socket: WebSocket | null = null
  private state: SocketState = 'disconnected'
  private options: Required<SocketOptions>
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private subscribers = new Map<string, Set<MessageHandler>>()
  private messageQueue: WSOutgoingEvent[] = []

  constructor(options: SocketOptions = {}) {
    this.options = {
      url: options.url || this.getDefaultSocketUrl(),
      maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
      reconnectDelay: options.reconnectDelay ?? 3000,
      heartbeatInterval: options.heartbeatInterval ?? 30000,
      enableHeartbeat: options.enableHeartbeat ?? true,
    }

    // Auto-connect unless disabled in dev
    if (!config.dev.disable_websocket_in_dev || config.isProduction) {
      // Delay initial connection slightly to let providers initialize
      setTimeout(() => this.connect(), 100)
    }
  }

  private getDefaultSocketUrl(): string {
    if (typeof window === 'undefined') return 'ws://localhost:8080/ws'
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = config.isDevelopment ? 'localhost:8080' : window.location.host
    return `${protocol}//${host}/ws`
  }

  async connect(): Promise<void> {
    if (config.dev.disable_websocket_in_dev && config.isDevelopment) {
      eventBus.emit('websocket:disabled', { reason: 'dev_config' })
      return
    }

    if (this.state === 'connecting' || this.state === 'connected') {
      return
    }

    this.setState('connecting')
    
    try {
      this.socket = new WebSocket(this.options.url)
      this.attachEventHandlers()
      
      // Wait for connection or failure
      await new Promise<void>((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket creation failed'))
          return
        }

        const onOpen = () => {
          this.socket?.removeEventListener('open', onOpen)
          this.socket?.removeEventListener('error', onError)
          resolve()
        }

        const onError = (error: Event) => {
          this.socket?.removeEventListener('open', onOpen)
          this.socket?.removeEventListener('error', onError)
          reject(error)
        }

        this.socket.addEventListener('open', onOpen)
        this.socket.addEventListener('error', onError)
      })

    } catch (error) {
      this.handleConnectionError(error)
      throw error
    }
  }

  private attachEventHandlers(): void {
    if (!this.socket) return

    this.socket.onopen = () => {
      this.setState('connected')
      this.reconnectAttempts = 0
      this.flushMessageQueue()
      this.startHeartbeat()
      
      eventBus.emit('websocket:connected', { 
        url: this.options.url,
        reconnectAttempts: this.reconnectAttempts 
      })
    }

    this.socket.onmessage = (event) => {
      try {
        const message: WSIncomingEvent = JSON.parse(event.data)
        this.handleIncomingMessage(message)
      } catch (error) {
        eventBus.emit('websocket:parse_error', { 
          data: event.data, 
          error: String(error) 
        })
      }
    }

    this.socket.onclose = (event) => {
      this.setState('disconnected')
      this.stopHeartbeat()
      
      eventBus.emit('websocket:closed', { 
        code: event.code, 
        reason: event.reason,
        wasClean: event.wasClean 
      })

      // Auto-reconnect unless explicitly closed
      if (!event.wasClean && this.reconnectAttempts < this.options.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }

    this.socket.onerror = (error) => {
      eventBus.emit('websocket:error', { error: String(error) })
      this.handleConnectionError(error)
    }
  }

  private handleIncomingMessage(message: WSIncomingEvent): void {
    const { type, payload } = message

    // Handle system messages
    if (type === 'system:ping') {
      this.send({ type: 'client:hello', payload: { clientId: this.getClientId() } })
      return
    }

    // Notify subscribers
    const handlers = this.subscribers.get(type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload)
        } catch (error) {
          eventBus.emit('websocket:handler_error', { 
            type, 
            error: String(error) 
          })
        }
      })
    }

    // Emit to global event bus
    eventBus.emit('websocket:message', { type, payload })
  }

  send(message: WSOutgoingEvent): void {
    if (this.state !== 'connected') {
      // Queue message for when connection is restored
      this.messageQueue.push(message)
      return
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(message)
      return
    }

    try {
      this.socket.send(JSON.stringify(message))
      eventBus.emit('websocket:sent', { type: message.type })
    } catch (error) {
      eventBus.emit('websocket:send_error', { 
        message: message.type, 
        error: String(error) 
      })
      // Re-queue failed message
      this.messageQueue.push(message)
    }
  }

  subscribe<T = any>(messageType: string, handler: MessageHandler<T>): () => void {
    if (!this.subscribers.has(messageType)) {
      this.subscribers.set(messageType, new Set())
    }
    
    const handlers = this.subscribers.get(messageType)!
    handlers.add(handler)

    // Return unsubscribe function
    return () => {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.subscribers.delete(messageType)
      }
    }
  }

  private setState(newState: SocketState): void {
    const oldState = this.state
    this.state = newState
    eventBus.emit('websocket:state_change', { from: oldState, to: newState })
  }

  private handleConnectionError(error: any): void {
    this.setState('failed')
    this.stopHeartbeat()
    
    if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.scheduleReconnect()
    } else {
      eventBus.emit('websocket:max_reconnects_exceeded', { 
        attempts: this.reconnectAttempts 
      })
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.setState('reconnecting')
    this.reconnectAttempts++
    
    const delay = Math.min(
      this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    )

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        eventBus.emit('websocket:reconnect_failed', { 
          attempt: this.reconnectAttempts, 
          error: String(error) 
        })
      })
    }, delay)

    eventBus.emit('websocket:reconnecting', { 
      attempt: this.reconnectAttempts, 
      delay 
    })
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return

    const queuedMessages = [...this.messageQueue]
    this.messageQueue = []
    
    queuedMessages.forEach(message => this.send(message))
    
    eventBus.emit('websocket:queue_flushed', { 
      messageCount: queuedMessages.length 
    })
  }

  private startHeartbeat(): void {
    if (!this.options.enableHeartbeat) return

    this.heartbeatTimer = setInterval(() => {
      if (this.state === 'connected') {
        this.send({ 
          type: 'client:hello', 
          payload: { clientId: this.getClientId() } 
        })
      }
    }, this.options.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private getClientId(): string {
    // Generate or retrieve persistent client ID
    const stored = globalThis.localStorage?.getItem('ws_client_id')
    if (stored) return stored

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    globalThis.localStorage?.setItem('ws_client_id', clientId)
    return clientId
  }

  // Public API
  getState(): SocketState {
    return this.state
  }

  isConnected(): boolean {
    return this.state === 'connected' && this.socket?.readyState === WebSocket.OPEN
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.stopHeartbeat()
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect')
      this.socket = null
    }
    
    this.setState('disconnected')
    this.messageQueue = []
    this.reconnectAttempts = 0
  }

  // Development helpers
  getStats() {
    return {
      state: this.state,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      subscriberCount: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0),
      options: this.options,
    }
  }
}

// Factory function for creating socket instances
export const createSocket = (options?: SocketOptions) => new WebSocketManager(options)

// Default socket manager instance
export const socketManager = new WebSocketManager()

// Convenience exports for common patterns
export const sendChatMessage = (text: string, tempId?: string) => {
  socketManager.send({ 
    type: 'chat:send', 
    payload: { text, tempId } 
  })
}

export const trackAnalyticsEvent = (name: string, properties?: Record<string, unknown>) => {
  socketManager.send({ 
    type: 'analytics:batch', 
    payload: { events: [{ name, properties }] } 
  })
}

// Development helper
export const debugWebSocket = () => socketManager.getStats()

// Default export is the manager instance
export default socketManager
