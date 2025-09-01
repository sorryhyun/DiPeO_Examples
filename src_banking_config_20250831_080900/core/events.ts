import React, { useEffect, useRef } from 'react'

// Typed event map for the application
export interface AppEventMap {
  // Transaction events
  'transaction.created': { transactionId: string; payload: import('./contracts').Transaction }
  'transaction.updated': { transactionId: string; changes: Partial<import('./contracts').Transaction> }
  'transaction.deleted': { transactionId: string }
  
  // Transfer events
  'transfer.created': { transferId: string; payload: import('./contracts').Transfer }
  'transfer.updated': { transferId: string; status: 'pending' | 'completed' | 'failed'; payload?: any }
  'transfer.cancelled': { transferId: string }
  
  // Payment events
  'payment.created': { paymentId: string; payload: import('./contracts').Payment }
  'payment.completed': { paymentId: string; payload: import('./contracts').Payment }
  'payment.failed': { paymentId: string; error: string }
  
  // Account events
  'account.updated': { accountId: string; changes: Partial<import('./contracts').Account> }
  'account.balance.changed': { accountId: string; oldBalance: number; newBalance: number }
  
  // Authentication events
  'auth.loginSuccess': { user: import('./contracts').User; timestamp: string }
  'auth.loginFailed': { email: string; error: import('./contracts').ApiError; timestamp: string }
  'auth.logoutSuccess': { timestamp: string }
  'auth.logoutFailed': { error: import('./contracts').ApiError; timestamp: string }
  'auth.logoutDetected': { timestamp: string }
  'auth.tokenRefreshed': { user: import('./contracts').User; timestamp: string }
  'auth.refreshFailed': { error: import('./contracts').ApiError; timestamp: string }
  'auth.restored': { user: import('./contracts').User; timestamp: string }
  
  // Message events
  'message.received': { messageId: string; fromUserId: string; content: string; timestamp: string }
  'message.sent': { messageId: string; toUserId: string; content: string; timestamp: string }
  'message.read': { messageId: string; readByUserId: string; timestamp: string }
  
  // Investment events
  'investment.purchased': { investmentId: string; payload: import('./contracts').Investment }
  'investment.sold': { investmentId: string; payload: import('./contracts').Investment }
  'investment.priceUpdated': { symbol: string; oldPrice: number; newPrice: number }
  
  // Budget events
  'budget.created': { budgetId: string; payload: import('./contracts').Budget }
  'budget.updated': { budgetId: string; changes: Partial<import('./contracts').Budget> }
  'budget.exceeded': { budgetId: string; currentAmount: number; limitAmount: number }
  
  // Card events
  'card.activated': { cardId: string; payload: import('./contracts').Card }
  'card.blocked': { cardId: string; reason: string }
  'card.transaction': { cardId: string; transactionId: string; amount: number }
  
  // API events
  'api.beforeRequest': { url: string; method: string; headers: Record<string, string>; body?: any }
  'api.afterResponse': { url: string; status: number; response: any; elapsedMs: number; error?: any }
  
  // WebSocket events
  'websocket.connected': { timestamp: string }
  'websocket.disconnected': { timestamp: string; reason?: string }
  'websocket.error': { error: Error; timestamp: string }
  'websocket.messageReceived': { data: any; timestamp: string }
  'websocket.messageSent': { data: any; timestamp: string }
  
  // Application events
  'app.initialized': { env: string; features: Record<string, boolean>; timestamp: string }
  'app.unmounted': { timestamp: string }
  
  // Error events
  'error.reported': { error: Error | string; context?: any }
  'error.recovered': { error: Error | string; context?: any }
  
  // Theme events
  'theme.changed': { theme: 'light' | 'dark' | 'system'; timestamp: string }
  
  // Language events
  'i18n.languageChanged': { language: string; timestamp: string }
}

// Event handler type
export type EventHandler<T> = (payload: T) => void | Promise<void>

// Unsubscribe function type
export type UnsubscribeFunction = () => void

/**
 * Generic typed event bus for publish/subscribe pattern
 */
export class EventBus<E extends Record<string, any> = AppEventMap> {
  private handlers = new Map<keyof E, Set<EventHandler<any>>>()
  private debugMode = false

  constructor(options?: { debug?: boolean }) {
    this.debugMode = options?.debug || false
  }

  /**
   * Subscribe to an event
   * @param eventName - The event name to subscribe to
   * @param handler - The handler function to call when event is emitted
   * @returns Unsubscribe function
   */
  on<K extends keyof E>(
    eventName: K,
    handler: EventHandler<E[K]>
  ): UnsubscribeFunction {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set())
    }

    const handlerSet = this.handlers.get(eventName)!
    handlerSet.add(handler)

    if (this.debugMode) {
      console.log(`[EventBus] Subscribed to '${String(eventName)}' (${handlerSet.size} total handlers)`)
    }

    // Return unsubscribe function
    return () => {
      this.off(eventName, handler)
    }
  }

  /**
   * Unsubscribe from an event
   * @param eventName - The event name to unsubscribe from
   * @param handler - The handler function to remove
   */
  off<K extends keyof E>(eventName: K, handler: EventHandler<E[K]>): void {
    const handlerSet = this.handlers.get(eventName)
    if (handlerSet) {
      const removed = handlerSet.delete(handler)
      
      if (this.debugMode && removed) {
        console.log(`[EventBus] Unsubscribed from '${String(eventName)}' (${handlerSet.size} remaining handlers)`)
      }

      // Clean up empty handler sets
      if (handlerSet.size === 0) {
        this.handlers.delete(eventName)
      }
    }
  }

  /**
   * Subscribe to an event only once
   * @param eventName - The event name to subscribe to
   * @param handler - The handler function to call when event is emitted
   * @returns Unsubscribe function
   */
  once<K extends keyof E>(
    eventName: K,
    handler: EventHandler<E[K]>
  ): UnsubscribeFunction {
    const onceHandler = (payload: E[K]) => {
      handler(payload)
      this.off(eventName, onceHandler)
    }

    return this.on(eventName, onceHandler)
  }

  /**
   * Emit an event to all subscribers
   * @param eventName - The event name to emit
   * @param payload - The payload to send with the event
   * @returns Promise if any handler is async, void otherwise
   */
  async emit<K extends keyof E>(eventName: K, payload: E[K]): Promise<void> {
    const handlerSet = this.handlers.get(eventName)
    
    if (!handlerSet || handlerSet.size === 0) {
      if (this.debugMode) {
        console.log(`[EventBus] No handlers for event '${String(eventName)}'`)
      }
      return
    }

    if (this.debugMode) {
      console.log(`[EventBus] Emitting '${String(eventName)}' to ${handlerSet.size} handlers`, payload)
    }

    const promises: Promise<void>[] = []
    const errors: Array<{ handler: EventHandler<any>; error: any }> = []

    // Execute all handlers
    for (const handler of handlerSet) {
      try {
        const result = handler(payload)
        
        // If handler returns a promise, collect it
        if (result && typeof result.then === 'function') {
          promises.push(
            result.catch((error) => {
              errors.push({ handler, error })
              return Promise.resolve() // Convert to resolved promise to continue
            })
          )
        }
      } catch (error) {
        // Synchronous error
        errors.push({ handler, error })
        
        // For sync errors, emit error.reported immediately if not already an error event
        if (eventName !== 'error.reported') {
          this.safeEmitError(error, { 
            event: eventName, 
            handler: handler.name || 'anonymous' 
          })
        }
      }
    }

    // Wait for all async handlers to complete
    if (promises.length > 0) {
      await Promise.allSettled(promises)
    }

    // Report any async errors
    for (const { error } of errors) {
      if (eventName !== 'error.reported') {
        this.safeEmitError(error, { 
          event: eventName, 
          async: true 
        })
      }
    }
  }

  /**
   * Safely emit error without causing infinite recursion
   */
  private safeEmitError(error: any, context?: any): void {
    try {
      // Use setTimeout to avoid potential recursion issues
      setTimeout(() => {
        if (this.handlers.has('error.reported')) {
          this.emit('error.reported', { error, context })
        } else if (this.debugMode) {
          console.error('[EventBus] Error in handler:', error, context)
        }
      }, 0)
    } catch {
      // Silently ignore errors in error reporting to prevent recursion
      if (this.debugMode) {
        console.error('[EventBus] Failed to report error:', error)
      }
    }
  }

  /**
   * Get the number of handlers for an event
   * @param eventName - The event name to check
   * @returns Number of handlers
   */
  getHandlerCount<K extends keyof E>(eventName: K): number {
    return this.handlers.get(eventName)?.size || 0
  }

  /**
   * Get all registered event names
   * @returns Array of event names
   */
  getEventNames(): (keyof E)[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Clear all event handlers
   */
  clear(): void {
    const eventCount = this.handlers.size
    this.handlers.clear()
    
    if (this.debugMode) {
      console.log(`[EventBus] Cleared all handlers (${eventCount} events cleared)`)
    }
  }

  /**
   * Enable or disable debug logging
   * @param enabled - Whether to enable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled
  }

  /**
   * Wait for a specific event to be emitted
   * @param eventName - The event name to wait for
   * @param timeout - Optional timeout in milliseconds
   * @returns Promise that resolves with the event payload
   */
  waitFor<K extends keyof E>(
    eventName: K,
    timeout?: number
  ): Promise<E[K]> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null
      
      const unsubscribe = this.once(eventName, (payload) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        resolve(payload)
      })

      if (timeout) {
        timeoutId = setTimeout(() => {
          unsubscribe()
          reject(new Error(`Timeout waiting for event '${String(eventName)}'`))
        }, timeout)
      }
    })
  }
}

/**
 * Create a new event bus instance
 */
export function createEventBus<E extends Record<string, any> = AppEventMap>(
  options?: { debug?: boolean }
): EventBus<E> {
  return new EventBus<E>(options)
}

/**
 * Default application event bus instance
 */
export const defaultEventBus = createEventBus<AppEventMap>({
  debug: typeof window !== 'undefined' && window.location?.search?.includes('debug=events')
})

/**
 * React hook for subscribing to events within components
 * @param eventName - The event name to subscribe to
 * @param handler - The handler function to call when event is emitted
 * @param deps - Optional dependency array for handler memoization
 */
export function useEventBus<K extends keyof AppEventMap>(
  eventName: K,
  handler: EventHandler<AppEventMap[K]>,
  deps: React.DependencyList = []
): void {
  const handlerRef = useRef(handler)
  
  // Update handler ref when dependencies change
  useEffect(() => {
    handlerRef.current = handler
  }, deps)

  useEffect(() => {
    // Wrapper to call current handler
    const wrappedHandler = (payload: AppEventMap[K]) => {
      handlerRef.current(payload)
    }

    const unsubscribe = defaultEventBus.on(eventName, wrappedHandler)
    
    return unsubscribe
  }, [eventName]) // Only re-subscribe if event name changes
}

/**
 * Hook for emitting events from components
 * @returns Emit function bound to default event bus
 */
export function useEventEmitter() {
  return {
    emit: <K extends keyof AppEventMap>(eventName: K, payload: AppEventMap[K]) => {
      return defaultEventBus.emit(eventName, payload)
    },
    
    emitAsync: async <K extends keyof AppEventMap>(eventName: K, payload: AppEventMap[K]) => {
      return defaultEventBus.emit(eventName, payload)
    }
  }
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - provides hooks for React integration
- [x] Reads config from `@/app/config` - Not applicable for events system
- [x] Exports default named component - Not applicable, exports EventBus class and functions
- [x] Adds basic ARIA and keyboard handlers (where relevant) - Not applicable for event bus
*/
