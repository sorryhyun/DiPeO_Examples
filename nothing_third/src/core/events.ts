// filepath: src/core/events.ts

export type EventCallback<T = any> = (payload: T) => void | Promise<void>;

export interface DomainEventMap {
  'toast:show': { 
    id?: string; 
    type: 'success' | 'error' | 'info' | 'warning'; 
    title: string; 
    body?: string; 
    durationMs?: number; 
  };
  'analytics:event': { 
    name: string; 
    properties?: Record<string, any>; 
  };
  'auth:login': { 
    userId: string; 
  };
  'auth:logout': { 
    userId?: string; 
  };
  'error:global': { 
    error: Error | string; 
    context?: string; 
  };
  'ws:message': { 
    raw: any; 
  };
}

interface EventHandler<T> {
  handler: EventCallback<T>;
  priority: number;
}

export class EventBus<E extends Record<string, any>> {
  private listeners = new Map<keyof E, Array<EventHandler<any>>>();

  on<K extends keyof E>(
    event: K, 
    handler: EventCallback<E[K]>, 
    opts?: { priority?: number }
  ): () => void {
    const priority = opts?.priority ?? 0;
    const eventHandlers = this.listeners.get(event) || [];
    
    const eventHandler: EventHandler<E[K]> = { handler, priority };
    eventHandlers.push(eventHandler);
    
    // Sort by priority (highest first)
    eventHandlers.sort((a, b) => b.priority - a.priority);
    
    this.listeners.set(event, eventHandlers);
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off<K extends keyof E>(event: K, handler: EventCallback<E[K]>): void {
    const eventHandlers = this.listeners.get(event);
    if (!eventHandlers) return;
    
    const index = eventHandlers.findIndex(eh => eh.handler === handler);
    if (index >= 0) {
      eventHandlers.splice(index, 1);
      
      if (eventHandlers.length === 0) {
        this.listeners.delete(event);
      }
    }
  }

  once<K extends keyof E>(event: K, handler: EventCallback<E[K]>): () => void {
    const wrappedHandler = async (payload: E[K]) => {
      this.off(event, wrappedHandler);
      await handler(payload);
    };
    
    return this.on(event, wrappedHandler);
  }

  async emit<K extends keyof E>(event: K, payload: E[K]): Promise<void> {
    const eventHandlers = this.listeners.get(event);
    if (!eventHandlers || eventHandlers.length === 0) {
      return;
    }
    
    // Create snapshot to handle concurrent modifications during iteration
    const handlersSnapshot = [...eventHandlers];
    
    try {
      // Execute all handlers and collect promises
      const promises = handlersSnapshot.map(async ({ handler }) => {
        try {
          const result = handler(payload);
          if (result instanceof Promise) {
            await result;
          }
        } catch (error) {
          // Avoid infinite loops by not emitting error:global for error:global events
          if (event !== 'error:global') {
            // Schedule on next tick to avoid blocking current emit
            setTimeout(() => {
              this.emit('error:global' as K, {
                error: error instanceof Error ? error : new Error(String(error)),
                context: `EventBus handler for event: ${String(event)}`
              } as E[K]);
            }, 0);
          } else {
            // For error:global events, just log to console to avoid infinite recursion
            console.error('Error in error:global handler:', error);
          }
        }
      });
      
      // Wait for all handlers to complete
      await Promise.all(promises);
    } catch (error) {
      // This should not happen since we catch individual handler errors above
      console.error('Unexpected error in EventBus.emit:', error);
    }
  }

  clear(): void {
    this.listeners.clear();
  }

  hasListeners<K extends keyof E>(event: K): boolean {
    const handlers = this.listeners.get(event);
    return Boolean(handlers && handlers.length > 0);
  }

  getListenerCount<K extends keyof E>(event: K): number {
    const handlers = this.listeners.get(event);
    return handlers ? handlers.length : 0;
  }

  getAllEvents(): Array<keyof E> {
    return Array.from(this.listeners.keys());
  }
}

// Global singleton instance typed with domain events
export const eventBus = new EventBus<DomainEventMap>();

// Alias for backwards compatibility and cleaner imports
export const globalEventBus = eventBus;

// Type exports for convenience
export type { DomainEventMap };

/*
Self-check comments:
- [x] Uses `@/` imports only (no external imports needed for this core utility)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects - pure event system)
- [x] Reads config from `@/app/config` (N/A for event system)
- [x] Exports default named component (exports EventBus class and globalEventBus singleton)
- [x] Adds basic ARIA and keyboard handlers (N/A for event bus utility)
*/
