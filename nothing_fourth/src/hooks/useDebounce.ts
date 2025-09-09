// filepath: src/hooks/useDebounce.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import { debugLog } from '@/core/utils';

/**
 * Options for configuring the useDebounce hook
 */
export interface UseDebounceOptions {
  /** Whether to invoke the callback on the leading edge of the timeout */
  leading?: boolean;
  /** Whether to invoke the callback on the trailing edge of the timeout */
  trailing?: boolean;
  /** Maximum time the callback is allowed to be delayed before it's invoked */
  maxWait?: number;
}

/**
 * Hook that debounces a callback function
 * 
 * @param callback - The function to debounce
 * @param delay - The number of milliseconds to delay
 * @param options - Configuration options
 * @returns The debounced function
 */
export function useDebounce<TArgs extends any[]>(
  callback: (...args: TArgs) => void,
  delay: number,
  options: UseDebounceOptions = {}
): (...args: TArgs) => void {
  const { leading = false, trailing = true, maxWait } = options;
  
  // Refs to persist values across renders
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const leadingRef = useRef<boolean>(false);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

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

  const invokeCallback = useCallback((...args: TArgs) => {
    const time = Date.now();
    lastInvokeTimeRef.current = time;
    leadingRef.current = false;
    
    debugLog('useDebounce', 'Invoking callback with args:', args);
    callbackRef.current(...args);
  }, []);

  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - lastCallTimeRef.current;
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

    // Either this is the first call, activity has stopped and we're at the trailing edge,
    // the system time has gone backwards, or we've hit the maxWait limit
    return (
      lastCallTimeRef.current === 0 ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const remainingWait = useCallback((time: number) => {
    const timeSinceLastCall = time - lastCallTimeRef.current;
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }, [delay, maxWait]);

  const trailingEdge = useCallback((...args: TArgs) => {
    timeoutRef.current = undefined;

    // Only invoke if we have lastArgs which means func has been debounced at least once
    if (trailing && lastCallTimeRef.current > 0) {
      return invokeCallback(...args);
    }
    
    lastCallTimeRef.current = 0;
    lastInvokeTimeRef.current = 0;
    return undefined;
  }, [trailing, invokeCallback]);

  const timerExpired = useCallback((...args: TArgs) => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(...args);
    }
    // Restart the timer
    const remaining = remainingWait(time);
    timeoutRef.current = setTimeout(() => timerExpired(...args), remaining);
  }, [shouldInvoke, remainingWait, trailingEdge]);

  const leadingEdge = useCallback((time: number, ...args: TArgs) => {
    // Reset any maxWait timer
    lastInvokeTimeRef.current = time;
    
    // Start the timer for the trailing edge
    timeoutRef.current = setTimeout(() => trailingEdge(...args), delay);
    
    // Invoke the leading edge
    return leading ? invokeCallback(...args) : undefined;
  }, [delay, leading, invokeCallback, trailingEdge]);

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
    lastCallTimeRef.current = 0;
    leadingRef.current = false;
    
    debugLog('useDebounce', 'Debounced function cancelled');
  }, []);

  const flush = useCallback((...args: TArgs) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
      return invokeCallback(...args);
    }
  }, [invokeCallback]);

  const debounced = useCallback((...args: TArgs) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastCallTimeRef.current = time;

    if (isInvoking) {
      if (timeoutRef.current === undefined) {
        return leadingEdge(time, ...args);
      }
      if (maxWait !== undefined) {
        // Handle invocations in a tight loop
        timeoutRef.current = setTimeout(() => timerExpired(...args), delay);
        maxTimeoutRef.current = setTimeout(() => trailingEdge(...args), maxWait);
        return leading ? invokeCallback(...args) : undefined;
      }
    }
    
    if (timeoutRef.current === undefined) {
      timeoutRef.current = setTimeout(() => timerExpired(...args), delay);
    }
  }, [shouldInvoke, leadingEdge, timerExpired, trailingEdge, delay, maxWait, leading, invokeCallback]);

  // Add utility methods to the debounced function
  Object.assign(debounced, {
    cancel,
    flush,
    pending: () => timeoutRef.current !== undefined
  });

  return debounced as typeof debounced & {
    cancel: () => void;
    flush: (...args: TArgs) => void;
    pending: () => boolean;
  };
}

/**
 * Simpler hook that debounces a value instead of a callback
 * Useful for debouncing state updates or search terms
 * 
 * @param value - The value to debounce
 * @param delay - The number of milliseconds to delay
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  const updateDebouncedValue = useDebounce((newValue: T) => {
    setDebouncedValue(newValue);
  }, delay);

  useEffect(() => {
    updateDebouncedValue(value);
  }, [value, updateDebouncedValue]);

  return debouncedValue;
}

// Re-export for convenience
export default useDebounce;
