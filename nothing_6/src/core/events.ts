// filepath: src/core/events.ts
// [x] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects - N/A for event bus)
// [ ] Reads config from `@/app/config` - N/A for event bus
// [x] Exports default named component (eventBus)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for event bus)

/* src/core/events.ts

   Typed EventBus for cross-cutting events. The bus is intentionally lightweight and synchronous by default but supports async handlers whose promises are awaited when emitAsync is used.

   Usage:
     import { eventBus } from '@/core/events'
     eventBus.on('toast', handler)
     eventBus.emit('analytics', { name: 'hero:cta_click' })
*/

import { ApiError, User, Testimonial } from '@/core/contracts'

// Map of well-known application events and their payload shapes
export interface AppEventMap {
  // UI & notifications
  'toast:open': { id: string; message: string; tone?: 'info' | 'success' | 'warning' | 'error'; timeoutMs?: number }
  'toast:close': { id: string }
  'toast:clear': {}
  'toast:dismiss': { id: string }
  'toast:error': { message: string; id?: string }
  'toast:info': { message: string; id?: string }
  'toast:show': { message: string; tone?: 'info' | 'success' | 'warning' | 'error'; id?: string }
  'toast:success': { message: string; id?: string }
  'toast:warning': { message: string; id?: string }

  // Auth
  'auth:login': { user: User }
  'auth:logout': { userId?: string }
  'auth:error': { error: Error | string; context?: string }
  'auth:profile_updated': { user: User }
  'auth:refresh': { user: User }
  'auth:login_success': { user: User }
  'auth:force_logout': { reason?: string }

  // API
  'api:request': { path: string; method: string; body?: unknown }
  'api:response': { path: string; status: number; error?: ApiError }
  'api:request_start': { path: string; method: string }
  'api:request_complete': { path: string; method: string; status: number; duration?: number }
  'api:request_error': { path: string; method: string; error: Error | string }

  // Analytics
  'analytics:event': { name: string; properties?: Record<string, unknown> }
  'analytics:track': { event?: string; properties?: Record<string, unknown> }
  'analytics:pageview': { page: string; properties?: Record<string, unknown> }
  'analytics:page-view': { page: string; properties?: Record<string, unknown> }
  'analytics:page_tracked': { page: string; properties?: Record<string, unknown> }
  'analytics:performance': { metric: string; value: number; properties?: Record<string, unknown> }
  'analytics:section-view': { section: string; properties?: Record<string, unknown> }
  'analytics:keyboard-navigation': { action: string; properties?: Record<string, unknown> }
  'analytics:identify': { userId: string; traits?: Record<string, unknown> }
  'analytics:user_identified': { userId: string; traits?: Record<string, unknown> }
  'analytics:event_tracked': { event: string; properties?: Record<string, unknown> }
  'analytics:batch_sent': { count: number; properties?: Record<string, unknown> }
  'analytics:batch_error': { error: Error | string; count?: number }
  'analytics:error': { error: Error | string; context?: string }
  'analytics:initialized': { provider?: string }
  'analytics:ready': {}

  // AB test exposure
  'abtest:exposure': { experimentId: string; variant: string; userId?: string }
  'abtest:initialized': { experiments: string[] }
  'abtest:variant-changed': { experimentId: string; variant: string; previousVariant?: string }

  // App lifecycle
  'app:error': { error?: Error | string; type?: string; context?: string }
  'app:initialized': { version?: string; environment?: string }
  'app:started': { version?: string; environment?: string }
  'app:mock-server-started': { enabled: boolean }

  // DI system
  'di:registered': { key: string; type?: string }
  'di:replaced': { key: string; oldType?: string; newType?: string }
  'di:reset': {}

  // Feature-specific
  'testimonials:updated': { items: Testimonial[] }
  'testimonial:displayed': { testimonialId: string }
  'testimonial:disappeared': { testimonialId: string }

  // Void interactions
  'void:interaction': { type: string; position?: { x: number; y: number }; properties?: Record<string, unknown> }

  // Modal events
  'modal:open': { id: string; component?: string; props?: Record<string, unknown> }
  'modal:close': { id: string }

  // Chat events
  'chat:message': { from: string; text: string; timestamp: string }
  'chat:typing': { from: string; isTyping: boolean }

  // Theme events
  'theme:changed': { theme: 'light' | 'dark' | 'system' }

  // Navigation
  'navigation:route-change': { from?: string; to: string }
  'nav:item-clicked': { item: string; section?: string }
  'nav:menu-closed': {}
  'nav:menu-toggled': { open: boolean }
  'nav:section-navigated': { section: string; from?: string }
  'route:changed': { from?: string; to: string }

  // Hero section
  'hero:primary-cta-clicked': { source?: string; properties?: Record<string, unknown> }
  'hero:secondary-cta-clicked': { source?: string; properties?: Record<string, unknown> }

  // Pricing
  'pricing:tier-selected': { tier: string; billingCycle?: string }

  // Affiliate
  'affiliate:signup-toggled': { open: boolean }
  'affiliate:referral-copied': { code: string }
  'affiliate:newsletter-signup': { email: string; context?: string }

  // Accordion
  'accordion:toggle': { id: string; open: boolean }

  // Counter
  'counter:animation-start': { target: number; duration?: number }
  'counter:animation-complete': { value: number; duration?: number }
  'counter:animation-error': { error: Error | string }
  'counter:reset': {}
  'counter:external-reset': {}
  'counter:debug-trigger': { source?: string }

  // Three.js
  'three:model-loaded': { path: string; model: any }
  'three:model-error': { path: string; error: Error | string }
  'three:model-progress': { path: string; progress: number }

  // Simulator
  'simulator:play': {}
  'simulator:pause': {}
  'simulator:stop': {}
  'simulator:reset': {}
  'simulator:fullscreen_toggle': { fullscreen: boolean }
  'simulator:preset_change': { preset: string }
  'simulator:settings_update': { settings: Record<string, any> }

  // Checkout
  'checkout:session_creating': { productId: string }
  'checkout:session_created': { sessionId: string; url?: string }
  'checkout:session_error': { error: Error | string; productId?: string }
  'checkout:session_cancelling': { sessionId: string }
  'checkout:session_cancelled': { sessionId: string }
  'checkout:cache_cleared': {}

  // WebSocket
  'websocket:connected': { url?: string }
  'websocket:closed': { code?: number; reason?: string }
  'websocket:error': { error: Error | string }
  'websocket:message': { data: any; type?: string }
  'websocket:sent': { data: any }
  'websocket:reconnecting': { attempt: number; maxAttempts?: number }
  'websocket:reconnect_failed': { attempt: number; error?: Error | string }
  'websocket:max_reconnects_exceeded': { attempts: number }
  'websocket:state_change': { from: string; to: string }
  'websocket:disabled': { reason?: string }
  'websocket:handler_error': { error: Error | string; event?: string }
  'websocket:parse_error': { error: Error | string; data?: any }
  'websocket:send_error': { error: Error | string; data?: any }
  'websocket:queue_flushed': { count: number }

  // Mock server
  'mock:server:started': { port?: number }
  'mock:server:stopped': {}
  'mock:server:error': { error: Error | string }
  'mock:server:stats:reset': {}

  // Error reporting
  'error:boundary': { error: Error; errorInfo?: any }
  'error:report': { error: Error | string; context?: string; user?: string }
  'error:max_retries_reached': { error: Error | string; retries: number }

  // Generic system events
  'system:heartbeat': { ts: number }
  'system:error': { error: Error; context?: string }
}

// Handler type helper
type Handler<T> = (payload: T) => void | Promise<void>

// EventBus implementation
export class EventBus<EM extends Record<string, any>> {
  private handlers = new Map<keyof EM, Set<Handler<any>>>()
  private debugMode = false

  constructor(options?: { debug?: boolean }) {
    this.debugMode = options?.debug ?? false
  }

  on<K extends keyof EM>(event: K, handler: Handler<EM[K]>): () => void {
    if (!handler || typeof handler !== 'function') {
      throw new Error(`[EventBus] Invalid handler for event '${String(event)}'`)
    }

    const set = this.handlers.get(event) ?? new Set<Handler<any>>()
    set.add(handler as Handler<any>)
    this.handlers.set(event, set)

    if (this.debugMode) {
      console.debug(`[EventBus] Registered handler for '${String(event)}' (total: ${set.size})`)
    }

    // return unsubscribe function
    return () => this.off(event, handler)
  }

  off<K extends keyof EM>(event: K, handler?: Handler<EM[K]>): void {
    const set = this.handlers.get(event)
    if (!set) return

    if (!handler) {
      // Remove all handlers for this event
      const count = set.size
      set.clear()
      this.handlers.delete(event)
      if (this.debugMode) {
        console.debug(`[EventBus] Cleared all ${count} handlers for '${String(event)}'`)
      }
      return
    }

    // Remove specific handler
    const removed = set.delete(handler as Handler<any>)
    if (set.size === 0) {
      this.handlers.delete(event)
    }

    if (this.debugMode && removed) {
      console.debug(`[EventBus] Removed handler for '${String(event)}' (remaining: ${set.size})`)
    }
  }

  emit<K extends keyof EM>(event: K, payload: EM[K]): void {
    const set = this.handlers.get(event)
    if (!set || set.size === 0) {
      if (this.debugMode) {
        console.debug(`[EventBus] No handlers for '${String(event)}'`)
      }
      return
    }

    if (this.debugMode) {
      console.debug(`[EventBus] Emitting '${String(event)}' to ${set.size} handlers`, payload)
    }

    // Create snapshot to avoid issues with handlers being added/removed during iteration
    const handlerArray = Array.from(set)
    
    for (const handler of handlerArray) {
      try {
        // Call handler - don't await promises for sync emit
        const result = (handler as Handler<EM[K]>)(payload)
        
        // Log unhandled promise rejections for debugging
        if (result instanceof Promise && this.debugMode) {
          result.catch(err => {
            console.error(`[EventBus] Async handler error for '${String(event)}':`, err)
          })
        }
      } catch (err) {
        // Swallow sync errors to avoid breaking other handlers
        console.error(`[EventBus] Handler error for '${String(event)}':`, err)
      }
    }
  }

  // Emit and await all handlers (useful for lifecycle hooks that must complete)
  async emitAsync<K extends keyof EM>(event: K, payload: EM[K]): Promise<void> {
    const set = this.handlers.get(event)
    if (!set || set.size === 0) {
      if (this.debugMode) {
        console.debug(`[EventBus] No handlers for async '${String(event)}'`)
      }
      return
    }

    if (this.debugMode) {
      console.debug(`[EventBus] Async emitting '${String(event)}' to ${set.size} handlers`, payload)
    }

    const handlerArray = Array.from(set)
    const promises: Promise<void>[] = []

    for (const handler of handlerArray) {
      try {
        const result = (handler as Handler<EM[K]>)(payload)
        if (result instanceof Promise) {
          promises.push(result)
        }
      } catch (err) {
        console.error(`[EventBus] Handler error for async '${String(event)}':`, err)
      }
    }

    if (promises.length > 0) {
      try {
        await Promise.all(promises)
        if (this.debugMode) {
          console.debug(`[EventBus] Completed ${promises.length} async handlers for '${String(event)}'`)
        }
      } catch (err) {
        console.error(`[EventBus] Error in async handlers for '${String(event)}':`, err)
        throw err // Re-throw for caller to handle
      }
    }
  }

  // Convenience helper: subscribe once
  once<K extends keyof EM>(event: K, handler: Handler<EM[K]>): void {
    const wrappedHandler = async (payload: EM[K]) => {
      try {
        await handler(payload)
      } finally {
        this.off(event, wrappedHandler)
      }
    }

    this.on(event, wrappedHandler)
  }

  // Get event statistics (useful for debugging)
  getStats(): Record<string, { handlerCount: number }> {
    const stats: Record<string, { handlerCount: number }> = {}
    
    for (const [event, handlers] of this.handlers.entries()) {
      stats[String(event)] = { handlerCount: handlers.size }
    }
    
    return stats
  }

  // Clear all handlers (useful for cleanup in tests)
  clearAll(): void {
    const totalHandlers = Array.from(this.handlers.values()).reduce((sum, set) => sum + set.size, 0)
    this.handlers.clear()
    
    if (this.debugMode) {
      console.debug(`[EventBus] Cleared all handlers (${totalHandlers} total)`)
    }
  }

  // Enable/disable debug logging
  setDebug(enabled: boolean): void {
    this.debugMode = enabled
  }
}

// Export singleton instance typed to our AppEventMap
export const eventBus = new EventBus<AppEventMap>()

// Enable debug mode in development
if (import.meta.env?.MODE === 'development') {
  eventBus.setDebug(true)
}

export default eventBus

// Type exports for consumers
export type { Handler }

// Example usage (commented):
// import { eventBus } from '@/core/events'
// 
// // Subscribe to events
// const unsubscribe = eventBus.on('toast:open', payload => {
//   showToast(payload.message, payload.tone)
// })
// 
// // Emit events
// eventBus.emit('analytics:event', { 
//   name: 'page:view', 
//   properties: { page: 'landing' } 
// })
//
// // One-time subscription
// eventBus.once('auth:login', ({ user }) => {
//   console.log('Welcome', user.displayName)
// })
//
// // Cleanup
// unsubscribe()
