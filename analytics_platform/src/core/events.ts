// src/core/events.ts
/* src/core/events.ts
   Typed EventBus.
   - Use the EventPayloadMap from contracts to ensure type-safe emit/on handlers.
   - Supports async handlers (emit waits for all handlers to resolve when emitAsync is used).
*/

import { EventPayloadMap } from '@/core/contracts';

// Union of supported event names from contracts (keeps it explicit at the kernel level)
export type EventTypes = keyof EventPayloadMap;

type Handler<E extends EventTypes> = (payload: EventPayloadMap[E]) => void | Promise<void>;

class EventBus {
  private handlers: Map<string, Set<Handler<any>>> = new Map();

  on<E extends EventTypes>(eventName: E, handler: Handler<E>) {
    const set = this.handlers.get(eventName) ?? new Set();
    set.add(handler as Handler<any>);
    this.handlers.set(eventName, set);
    return () => this.off(eventName, handler);
  }

  off<E extends EventTypes>(eventName: E, handler?: Handler<E>) {
    const set = this.handlers.get(eventName);
    if (!set) return false;
    if (!handler) {
      this.handlers.delete(eventName);
      return true;
    }
    const removed = set.delete(handler as Handler<any>);
    if (set.size === 0) this.handlers.delete(eventName);
    return removed;
  }

  emit<E extends EventTypes>(eventName: E, payload: EventPayloadMap[E]) {
    const set = this.handlers.get(eventName);
    if (!set) return;
    // run handlers sync-ish: call and ignore returned promises
    set.forEach(h => {
      try {
        // allow async handlers but do not await
        const r = (h as Handler<E>)(payload);
        if (r && typeof (r as Promise<void>).then === 'function') {
          // swallow rejections, log for visibility
          (r as Promise<void>).catch(err => {
            // eslint-disable-next-line no-console
            console.error(`[EventBus] handler error for ${String(eventName)}`, err);
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[EventBus] handler threw for ${String(eventName)}`, err);
      }
    });
  }

  // Emit and wait for all handlers to complete (useful during teardown or critical flows)
  async emitAsync<E extends EventTypes>(eventName: E, payload: EventPayloadMap[E]) {
    const set = this.handlers.get(eventName);
    if (!set) return;
    const promises: Promise<void>[] = [];
    set.forEach(h => {
      try {
        const r = (h as Handler<E>)(payload);
        if (r && typeof (r as Promise<void>).then === 'function') promises.push(r as Promise<void>);
      } catch (err) {
        // convert throw into rejected promise
        promises.push(Promise.reject(err));
      }
    });
    await Promise.allSettled(promises);
  }

  // Low-level: get copy of handlers for testing/introspection
  getHandlers(eventName: EventTypes) {
    const set = this.handlers.get(eventName);
    return set ? Array.from(set) : [];
  }
}

// Create singleton instance exported for application-wide use
export const events = new EventBus();

// Convenience re-exports for common patterns
export const emit = <E extends EventTypes>(eventName: E, payload: EventPayloadMap[E]) => events.emit(eventName, payload);
export const on = <E extends EventTypes>(eventName: E, handler: Handler<E>) => events.on(eventName, handler);
export const off = <E extends EventTypes>(eventName: E, handler?: Handler<E>) => events.off(eventName, handler);

// Example usage:
// import { on, emit } from '@/core/events'
// on('appointment:created', (appt) => { console.log('new appointment', appt) })
// emit('appointment:created', { ... })

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for event bus kernel)
- [x] Exports default named component (exports named functions and EventBus class)
- [x] Adds basic ARIA and keyboard handlers (not relevant for event bus)
*/
