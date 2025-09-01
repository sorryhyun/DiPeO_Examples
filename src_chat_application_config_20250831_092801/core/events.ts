import { AppEventMap, AppEventName } from '@/core/contracts';

// Event handler types - supports both sync and async handlers
export type EventHandler<K extends AppEventName> = (payload: AppEventMap[K]) => void;
export type AsyncEventHandler<K extends AppEventName> = (payload: AppEventMap[K]) => Promise<void>;

// Subscription interface for unsubscribing
export interface Subscription {
  unsubscribe(): void;
}

// Internal handler wrapper to track metadata
interface HandlerWrapper {
  handler: Function;
  once: boolean;
}

// Lightweight event bus implementation
class EventBus {
  private handlers = new Map<AppEventName, Set<HandlerWrapper>>();
  private logger = console; // Can be injected later via DI

  /**
   * Subscribe to an event with a handler
   */
  on<K extends AppEventName>(
    name: K,
    handler: EventHandler<K> | AsyncEventHandler<K>
  ): Subscription {
    if (!this.handlers.has(name)) {
      this.handlers.set(name, new Set());
    }

    const wrapper: HandlerWrapper = { handler, once: false };
    this.handlers.get(name)!.add(wrapper);

    return {
      unsubscribe: () => {
        const handlerSet = this.handlers.get(name);
        if (handlerSet) {
          handlerSet.delete(wrapper);
          // Clean up empty sets to prevent memory leaks
          if (handlerSet.size === 0) {
            this.handlers.delete(name);
          }
        }
      }
    };
  }

  /**
   * Remove a specific handler from an event
   */
  off<K extends AppEventName>(name: K, handler: Function): void {
    const handlerSet = this.handlers.get(name);
    if (!handlerSet) return;

    // Find and remove the wrapper containing this handler
    for (const wrapper of handlerSet) {
      if (wrapper.handler === handler) {
        handlerSet.delete(wrapper);
        break;
      }
    }

    // Clean up empty sets
    if (handlerSet.size === 0) {
      this.handlers.delete(name);
    }
  }

  /**
   * Subscribe to an event that auto-unsubscribes after first invocation
   */
  once<K extends AppEventName>(
    name: K,
    handler: EventHandler<K> | AsyncEventHandler<K>
  ): Subscription {
    if (!this.handlers.has(name)) {
      this.handlers.set(name, new Set());
    }

    const wrapper: HandlerWrapper = { handler, once: true };
    this.handlers.get(name)!.add(wrapper);

    return {
      unsubscribe: () => {
        const handlerSet = this.handlers.get(name);
        if (handlerSet) {
          handlerSet.delete(wrapper);
          if (handlerSet.size === 0) {
            this.handlers.delete(name);
          }
        }
      }
    };
  }

  /**
   * Emit an event to all registered handlers
   * Handles both sync and async handlers safely with error isolation
   */
  async emit<K extends AppEventName>(name: K, payload: AppEventMap[K]): Promise<void> {
    const handlerSet = this.handlers.get(name);
    if (!handlerSet || handlerSet.size === 0) {
      return;
    }

    // Convert to array to avoid modification during iteration
    const wrappers = Array.from(handlerSet);
    const toRemove: HandlerWrapper[] = [];

    // Process handlers in insertion order
    for (const wrapper of wrappers) {
      try {
        // Call handler and handle potential async result
        const result = wrapper.handler(payload);
        
        // If handler returns a Promise, await it but continue on rejection
        if (result && typeof result.then === 'function') {
          try {
            await result;
          } catch (asyncError) {
            this.logger.error(`Async event handler error for '${name}':`, asyncError);
          }
        }

        // Mark once handlers for removal
        if (wrapper.once) {
          toRemove.push(wrapper);
        }
      } catch (syncError) {
        this.logger.error(`Sync event handler error for '${name}':`, syncError);
        
        // Still mark once handlers for removal even if they threw
        if (wrapper.once) {
          toRemove.push(wrapper);
        }
      }
    }

    // Remove once handlers after all processing is complete
    if (toRemove.length > 0) {
      const currentSet = this.handlers.get(name);
      if (currentSet) {
        for (const wrapper of toRemove) {
          currentSet.delete(wrapper);
        }
        
        // Clean up empty sets
        if (currentSet.size === 0) {
          this.handlers.delete(name);
        }
      }
    }
  }

  /**
   * Get count of handlers for an event (useful for debugging)
   */
  getHandlerCount(name: AppEventName): number {
    const handlerSet = this.handlers.get(name);
    return handlerSet ? handlerSet.size : 0;
  }

  /**
   * Get all event names with active handlers (useful for debugging)
   */
  getActiveEvents(): AppEventName[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Set a custom logger (useful for testing or custom logging)
   */
  setLogger(logger: { error: (message: string, ...args: any[]) => void }): void {
    this.logger = logger;
  }
}

// Singleton instance
export const events = new EventBus();

// Convenience exports - bind to singleton instance
export const on = events.on.bind(events);
export const off = events.off.bind(events);
export const once = events.once.bind(events);
export const emit = events.emit.bind(events);

// Export the EventBus class for creating additional instances if needed
export { EventBus };

// Export types for external use
export type { EventHandler, AsyncEventHandler, Subscription };
