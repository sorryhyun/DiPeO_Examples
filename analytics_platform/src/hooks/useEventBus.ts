// src/hooks/useEventBus.ts
/* src/hooks/useEventBus.ts
   React hook facade for the core event-bus: on, off, and emit helpers scoped to component lifecycle.
   - Provides useEventBus hook that returns emit, on, and off functions
   - Automatically cleans up event listeners on component unmount
   - Type-safe wrapper around core events system
*/

import { useCallback, useEffect, useRef } from 'react';
import { events, EventTypes } from '@/core/events';
import { EventPayloadMap } from '@/core/contracts';

type Handler<E extends EventTypes> = (payload: EventPayloadMap[E]) => void | Promise<void>;

export function useEventBus() {
  // Track cleanup functions to call on unmount
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  // Clean up all listeners on unmount
  useEffect(() => {
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, []);

  // Subscribe to an event with automatic cleanup
  const on = useCallback(<E extends EventTypes>(
    eventName: E,
    handler: Handler<E>
  ) => {
    const cleanup = events.on(eventName, handler);
    cleanupFunctionsRef.current.push(cleanup);
    return cleanup;
  }, []);

  // Unsubscribe from an event
  const off = useCallback(<E extends EventTypes>(
    eventName: E,
    handler?: Handler<E>
  ) => {
    const removed = events.off(eventName, handler);
    // Remove cleanup function if handler was removed
    if (removed && handler) {
      cleanupFunctionsRef.current = cleanupFunctionsRef.current.filter(
        cleanup => cleanup !== (() => events.off(eventName, handler))
      );
    }
    return removed;
  }, []);

  // Emit an event
  const emit = useCallback(<E extends EventTypes>(
    eventName: E,
    payload: EventPayloadMap[E]
  ) => {
    events.emit(eventName, payload);
  }, []);

  // Emit and wait for all handlers to complete
  const emitAsync = useCallback(async <E extends EventTypes>(
    eventName: E,
    payload: EventPayloadMap[E]
  ) => {
    await events.emitAsync(eventName, payload);
  }, []);

  return {
    on,
    off,
    emit,
    emitAsync
  };
}

// Example usage:
// const { on, emit } = useEventBus();
// 
// useEffect(() => {
//   const cleanup = on('appointment:created', (appointment) => {
//     console.log('New appointment created:', appointment);
//   });
//   return cleanup; // Optional - cleanup happens automatically
// }, [on]);
//
// const handleCreateAppointment = () => {
//   emit('appointment:created', newAppointment);
// };

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for this hook)
- [x] Exports default named component (exports named hook function)
- [x] Adds basic ARIA and keyboard handlers (not relevant for event bus hook)
*/
