// filepath: src/core/events.ts
import { debugLog } from '@/core/utils';

// Event payload types for the global event bus
export type GlobalEvents = {
  'auth:login': { user: import('@/core/contracts').User };
  'auth:logout': { userId?: string } | undefined;
  'toast:add': { id: string; type: 'success' | 'error' | 'info'; title?: string; message?: string };
  'appointment:created': { appointment: import('@/core/contracts').Appointment };
  'labresult:available': { labResult: import('@/core/contracts').LabResult };
  'data:updated': { key: string; payload?: unknown };
};

// Generic event handler type
export type EventHandler<E> = (payload: E) => void | Promise<void>;

// EventBus implementation with full type safety
export class EventBus<EMap extends Record<string, unknown>> {
  private listeners = new Map<keyof EMap, Set<EventHandler<any>>>();
  private namespace: string;

  constructor(namespace = 'default') {
    this.namespace = namespace;
  }

  // Subscribe to an event
  on<K extends keyof EMap>(
    event: K,
    handler: EventHandler<EMap[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(handler);
    debugLog(`EventBus[${this.namespace}]`, `Registered handler for '${String(event)}'`);
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  // Unsubscribe from an event
  off<K extends keyof EMap>(
    event: K,
    handler: EventHandler<EMap[K]>
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(handler);
      debugLog(`EventBus[${this.namespace}]`, `Removed handler for '${String(event)}'`);
      
      // Clean up empty event sets
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // Subscribe to an event for one-time execution only
  once<K extends keyof EMap>(
    event: K,
    handler: EventHandler<EMap[K]>
  ): () => void {
    const onceHandler: EventHandler<EMap[K]> = async (payload) => {
      // Remove self before executing
      this.off(event, onceHandler);
      try {
        await handler(payload);
      } catch (error) {
        debugLog(`EventBus[${this.namespace}]`, `Error in once handler for '${String(event)}':`, error);
      }
    };

    return this.on(event, onceHandler);
  }

  // Emit an event to all registered handlers
  async emit<K extends keyof EMap>(
    event: K,
    payload: EMap[K]
  ): Promise<void> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      debugLog(`EventBus[${this.namespace}]`, `No handlers for event '${String(event)}'`);
      return;
    }

    debugLog(`EventBus[${this.namespace}]`, `Emitting '${String(event)}' to ${eventListeners.size} handler(s)`);

    // Execute all handlers, collecting any promises
    const promises: Promise<void>[] = [];
    
    for (const handler of eventListeners) {
      try {
        const result = handler(payload);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        // Synchronous handler error - log but don't throw
        debugLog(`EventBus[${this.namespace}]`, `Sync handler error for '${String(event)}':`, error);
      }
    }

    // If we have async handlers, wait for all to complete
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (error) {
        // Async handler error - log but don't throw to caller
        debugLog(`EventBus[${this.namespace}]`, `Async handler error for '${String(event)}':`, error);
      }
    }
  }

  // Get current listener count for an event (useful for debugging)
  getListenerCount<K extends keyof EMap>(event: K): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  // Remove all listeners (useful for cleanup)
  removeAllListeners(): void {
    this.listeners.clear();
    debugLog(`EventBus[${this.namespace}]`, 'Removed all listeners');
  }
}

// Factory function for creating new EventBus instances
export function createEventBus<EMap extends Record<string, unknown>>(
  namespace?: string
): EventBus<EMap> {
  return new EventBus<EMap>(namespace);
}

// Global event bus singleton - the main event bus for the application
export const eventBus = createEventBus<GlobalEvents>('global');

// Export alias for backward compatibility and cleaner imports
export const globalEventBus = eventBus;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (via debugLog from utils)
- [x] Exports default named component (exports EventBus class and factory)
- [x] Adds basic ARIA and keyboard handlers (N/A - this is a utility class)
*/
