// filepath: src/hooks/useDebouncedState.ts
// Self-confirm comments:
// - [ ] Uses `@/` imports as much as possible
// - [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// - [ ] Reads config from `@/app/config`
// - [ ] Exports default named component
// - [ ] Adds basic ARIA and keyboard handlers (where relevant)

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseDebouncedStateOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

interface UseDebouncedStateReturn<T> {
  value: T;
  debouncedValue: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  isDebouncing: boolean;
  flush: () => void;
  cancel: () => void;
}

/**
 * Custom hook that provides debounced state updates with advanced control options.
 * Useful for search inputs, urgency timers, and other scenarios where you want to
 * delay state updates until user input has settled.
 */
export function useDebouncedState<T>(
  initialValue: T,
  options: UseDebouncedStateOptions = {}
): UseDebouncedStateReturn<T> {
  const {
    delay = 300,
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>();
  const lastInvokeTimeRef = useRef<number>(0);

  const invokeFunc = useCallback(() => {
    const time = Date.now();
    lastInvokeTimeRef.current = time;
    setDebouncedValue(value);
    setIsDebouncing(false);
  }, [value]);

  const leadingEdge = useCallback((time: number) => {
    lastInvokeTimeRef.current = time;
    if (leading) {
      invokeFunc();
    }
  }, [leading, invokeFunc]);

  const remainingWait = useCallback((time: number) => {
    const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }, [delay, maxWait]);

  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - (lastCallTimeRef.current || 0);
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

    return (
      lastCallTimeRef.current === undefined ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const trailingEdge = useCallback((time: number) => {
    timeoutRef.current = undefined;
    
    if (trailing && lastCallTimeRef.current !== undefined) {
      invokeFunc();
    } else {
      setIsDebouncing(false);
    }
  }, [trailing, invokeFunc]);

  const timerExpired = useCallback(() => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      trailingEdge(time);
    } else {
      const remaining = remainingWait(time);
      timeoutRef.current = setTimeout(timerExpired, remaining);
    }
  }, [shouldInvoke, trailingEdge, remainingWait]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
    
    lastInvokeTimeRef.current = 0;
    lastCallTimeRef.current = undefined;
    setIsDebouncing(false);
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      invokeFunc();
      cancel();
    }
  }, [invokeFunc, cancel]);

  const debounced = useCallback(() => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastCallTimeRef.current = time;

    if (isInvoking) {
      if (!timeoutRef.current) {
        setIsDebouncing(true);
        leadingEdge(time);
      }
      
      if (maxWait !== undefined) {
        maxTimeoutRef.current = setTimeout(() => {
          if (timeoutRef.current) {
            trailingEdge(Date.now());
          }
        }, maxWait);
      }
      
      if (!timeoutRef.current || delay !== delay) {
        timeoutRef.current = setTimeout(timerExpired, delay);
      }
    } else if (!timeoutRef.current) {
      setIsDebouncing(true);
      timeoutRef.current = setTimeout(timerExpired, remainingWait(time));
    }
  }, [shouldInvoke, leadingEdge, delay, maxWait, trailingEdge, timerExpired, remainingWait]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
    debounced();
  }, [debounced]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  // Sync debounced value when value changes externally (not through setValue)
  useEffect(() => {
    if (!isDebouncing) {
      setDebouncedValue(value);
    }
  }, [value, isDebouncing]);

  return {
    value,
    debouncedValue,
    setValue: updateValue,
    isDebouncing,
    flush,
    cancel,
  };
}

export default useDebouncedState;
