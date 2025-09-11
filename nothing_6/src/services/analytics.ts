// filepath: src/services/analytics.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (analytics service)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for analytics service)

import { config, isDevelopment, shouldUseMockData } from '@/app/config'
import { eventBus } from '@/core/events'

/* src/services/analytics.ts

   Analytics adapter that records events, supports batching and exposes a debug-mode console sink when running with mocks.

   Usage:
     import { analytics } from '@/services/analytics'
     analytics.track('button_clicked', { section: 'hero', label: 'get_started' })
     analytics.page('pricing', { source: 'header_nav' })

*/

// Event tracking contracts
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  timestamp?: number
  userId?: string
  sessionId?: string
}

export interface PageViewEvent {
  name?: string
  path?: string
  referrer?: string
  properties?: Record<string, unknown>
  timestamp?: number
  userId?: string
  sessionId?: string
}

export interface IdentifyEvent {
  userId: string
  traits?: Record<string, unknown>
  timestamp?: number
}

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean
  batchSize: number
  flushInterval: number // ms
  debug: boolean
  endpoint?: string
  writeKey?: string
}

// Batch queue for efficient event sending
interface EventBatch {
  events: AnalyticsEvent[]
  pageViews: PageViewEvent[]
  identifies: IdentifyEvent[]
}

export class AnalyticsService {
  private config: AnalyticsConfig
  private batch: EventBatch = { events: [], pageViews: [], identifies: [] }
  private flushTimer?: number
  private sessionId: string
  private userId?: string

  constructor() {
    // Generate session ID once per app lifecycle
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    this.config = {
      enabled: !isDevelopment || shouldUseMockData,
      batchSize: parseInt((import.meta as any).env?.VITE_ANALYTICS_BATCH_SIZE) || 10,
      flushInterval: parseInt((import.meta as any).env?.VITE_ANALYTICS_FLUSH_INTERVAL) || 5000,
      debug: isDevelopment || ((import.meta as any).env?.VITE_ANALYTICS_DEBUG === 'true'),
      endpoint: (import.meta as any).env?.VITE_ANALYTICS_ENDPOINT || '/api/analytics',
      writeKey: (import.meta as any).env?.VITE_ANALYTICS_WRITE_KEY,
    }

    // Start batch flushing if enabled
    if (this.config.enabled) {
      this.startBatchFlushing()
    }

    // Emit analytics ready event
    eventBus.emit('analytics:ready', { sessionId: this.sessionId, config: this.config })
  }

  // Track custom events
  track(eventName: string, properties: Record<string, unknown> = {}): void {
    if (!this.config.enabled && !this.config.debug) return

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        // Add default context
        app_name: config.appName,
        app_version: config.version,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    }

    // Debug mode: log to console
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log('[Analytics] Track:', eventName, event.properties)
    }

    // Add to batch
    this.batch.events.push(event)

    // Emit to event bus for other parts of app to listen
    eventBus.emit('analytics:event', { name: eventName, properties })

    // Check if we should flush immediately
    if (this.shouldFlushBatch()) {
      this.flushBatch()
    }
  }

  // Track page views
  page(pageName?: string, properties: Record<string, unknown> = {}): void {
    if (!this.config.enabled && !this.config.debug) return

    const pageView: PageViewEvent = {
      name: pageName,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      properties: {
        ...properties,
        // Add default page context
        app_name: config.appName,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    }

    // Debug mode: log to console
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log('[Analytics] Page:', pageName, pageView)
    }

    // Add to batch
    this.batch.pageViews.push(pageView)

    // Emit to event bus
    eventBus.emit('analytics:pageview', { name: pageName, properties })

    // Check if we should flush immediately
    if (this.shouldFlushBatch()) {
      this.flushBatch()
    }
  }

  // Identify user
  identify(userId: string, traits: Record<string, unknown> = {}): void {
    if (!this.config.enabled && !this.config.debug) return

    this.userId = userId

    const identifyEvent: IdentifyEvent = {
      userId,
      traits: {
        ...traits,
        app_name: config.appName,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    }

    // Debug mode: log to console
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log('[Analytics] Identify:', userId, traits)
    }

    // Add to batch
    this.batch.identifies.push(identifyEvent)

    // Emit to event bus
    eventBus.emit('analytics:identify', { userId, traits })

    // Check if we should flush immediately
    if (this.shouldFlushBatch()) {
      this.flushBatch()
    }
  }

  // Force flush current batch
  async flush(): Promise<void> {
    return this.flushBatch()
  }

  // Get current session info
  getSession(): { sessionId: string; userId?: string } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
    }
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
    if (enabled) {
      this.startBatchFlushing()
    } else {
      this.stopBatchFlushing()
    }
  }

  // Private: check if we should flush the batch
  private shouldFlushBatch(): boolean {
    const totalEvents = this.batch.events.length + this.batch.pageViews.length + this.batch.identifies.length
    return totalEvents >= this.config.batchSize
  }

  // Private: flush current batch to the server
  private async flushBatch(): Promise<void> {
    const currentBatch = { ...this.batch }
    const totalEvents = currentBatch.events.length + currentBatch.pageViews.length + currentBatch.identifies.length

    // Nothing to flush
    if (totalEvents === 0) return

    // Clear current batch
    this.batch = { events: [], pageViews: [], identifies: [] }

    // In mock/debug mode, just log the batch
    if (shouldUseMockData || this.config.debug) {
      // eslint-disable-next-line no-console
      console.log('[Analytics] Mock flush batch:', currentBatch)
      eventBus.emit('analytics:batch_sent', { count: totalEvents, mock: true })
      return
    }

    // Send to real endpoint
    try {
      const payload = {
        ...currentBatch,
        metadata: {
          app_name: config.appName,
          app_version: config.version,
          session_id: this.sessionId,
          user_id: this.userId,
          flushed_at: Date.now(),
        },
      }

      const response = await fetch(this.config.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.writeKey && { 'Authorization': `Bearer ${this.config.writeKey}` }),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`)
      }

      // Emit success event
      eventBus.emit('analytics:batch_sent', { count: totalEvents, success: true })
    } catch (error) {
      // Emit error event
      eventBus.emit('analytics:batch_error', { error: String(error), count: totalEvents })

      // Re-add events to batch on error (simple retry logic)
      this.batch.events.unshift(...currentBatch.events)
      this.batch.pageViews.unshift(...currentBatch.pageViews)
      this.batch.identifies.unshift(...currentBatch.identifies)

      // eslint-disable-next-line no-console
      console.error('[Analytics] Batch flush failed:', error)
    }
  }

  // Private: start periodic batch flushing
  private startBatchFlushing(): void {
    this.stopBatchFlushing()
    this.flushTimer = window.setInterval(() => {
      this.flushBatch()
    }, this.config.flushInterval)
  }

  // Private: stop periodic batch flushing
  private stopBatchFlushing(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = undefined
    }
  }

  // Cleanup on app shutdown
  destroy(): void {
    this.stopBatchFlushing()
    this.flushBatch() // Final flush
  }
}

// Singleton instance
export const analytics = new AnalyticsService()

// Convenience functions
export const track = (event: string, properties?: Record<string, unknown>) => analytics.track(event, properties)
export const page = (name?: string, properties?: Record<string, unknown>) => analytics.page(name, properties)
export const identify = (userId: string, traits?: Record<string, unknown>) => analytics.identify(userId, traits)

// Development helpers
export const debugAnalytics = () => ({
  session: analytics.getSession(),
  flush: () => analytics.flush(),
  setEnabled: (enabled: boolean) => analytics.setEnabled(enabled),
})

// Default export is the analytics service
export default analytics

// Auto-track initial page load
if (typeof window !== 'undefined') {
  // Wait for next tick to ensure app is initialized
  setTimeout(() => {
    analytics.page('app_loaded', {
      initial_load: true,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    })
  }, 100)
}
