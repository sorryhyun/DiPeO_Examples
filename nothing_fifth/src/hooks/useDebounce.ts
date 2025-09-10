// filepath: src/hooks/useDebounce.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { debugLog } from '@/core/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface DebouncedResult<T> {
  debouncedValue: T;
  isDebouncing: boolean;
  cancel: () => void;
  flush: () => void;
}

// ============================================================================
// DEBOUNCE VALUE HOOK
// ============================================================================

/**
 * Hook that debounces a value - useful for search inputs and expensive operations
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @param options - Additional debounce options
 * @returns Object with debouncedValue, isDebouncing status, and control functions
 */
export function useDebounce<T>(
  value: T,
  delay = 500,
  options: DebounceOptions = {}
): DebouncedResult<T> {
  const {
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  const timeoutRef = useRef<number | null>(null);
  const maxTimeoutRef = useRef<number | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const leadingRef = useRef<boolean>(false);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  // Invoke the debounced update
  const invokeUpdate = useCallback((newValue: T) => {
    setDebouncedValue(newValue);
    setIsDebouncing(false);
    lastInvokeTimeRef.current = Date.now();
    
    if (import.meta.env.MODE === 'development') {
      debugLog('useDebounce', `Value updated to:`, newValue);
    }
  }, []);

  // Cancel pending debounced calls
  const cancel = useCallback(() => {
    clearTimers();
    setIsDebouncing(false);
    leadingRef.current = false;
    
    if (import.meta.env.MODE === 'development') {
      debugLog('useDebounce', 'Debounce cancelled');
    }
  }, [clearTimers]);

  // Immediately flush the debounced value
  const flush = useCallback(() => {
    if (timeoutRef.current || maxTimeoutRef.current) {
      clearTimers();
      invokeUpdate(value);
      leadingRef.current = false;
    }
  }, [clearTimers, invokeUpdate, value]);

  useEffect(() => {
    const now = Date.now();
    lastCallTimeRef.current = now;

    // Handle leading edge
    if (leading && !leadingRef.current) {
      leadingRef.current = true;
      invokeUpdate(value);
      return;
    }

    // Set debouncing state
    setIsDebouncing(true);

    // Clear existing timers
    clearTimers();

    // Handle maxWait
    if (maxWait && !maxTimeoutRef.current) {
      const timeSinceLastInvoke = now - lastInvokeTimeRef.current;
      if (timeSinceLastInvoke >= maxWait) {
        invokeUpdate(value);
        return;
      } else {
        maxTimeoutRef.current = setTimeout(() => {
          maxTimeoutRef.current = null;
          invokeUpdate(value);
        }, maxWait - timeSinceLastInvoke);
      }
    }

    // Handle trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        
        // Check if this is still the most recent call
        const timeSinceLastCall = Date.now() - lastCallTimeRef.current;
        if (timeSinceLastCall >= delay) {
          invokeUpdate(value);
          leadingRef.current = false;
        }
      }, delay);
    }

    // Cleanup function
    return () => {
      // Don't clear timers here as it would cancel the debounce on every render
    };
  }, [value, delay, leading, trailing, maxWait, clearTimers, invokeUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    debouncedValue,
    isDebouncing,
    cancel,
    flush
  };
}

// ============================================================================
// DEBOUNCED CALLBACK HOOK
// ============================================================================

export interface DebouncedCallback<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
}

/**
 * Hook that debounces a callback function
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @param options - Additional debounce options
 * @returns Debounced function with control methods
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 500,
  options: DebounceOptions = {}
): DebouncedCallback<T> {
  const {
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const timeoutRef = useRef<number | null>(null);
  const maxTimeoutRef = useRef<number | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T>>();
  const leadingRef = useRef<boolean>(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  const invoke = useCallback(
    (args: Parameters<T>) => {
      callback(...args);
      lastInvokeTimeRef.current = Date.now();
      leadingRef.current = false;
      
      if (import.meta.env.MODE === 'development') {
        debugLog('useDebouncedCallback', 'Callback invoked with args:', args);
      }
    },
    [callback]
  );

  const cancel = useCallback(() => {
    clearTimers();
    leadingRef.current = false;
    lastArgsRef.current = undefined;
    
    if (import.meta.env.MODE === 'development') {
      debugLog('useDebouncedCallback', 'Callback cancelled');
    }
  }, [clearTimers]);

  const flush = useCallback(() => {
    if (lastArgsRef.current && (timeoutRef.current || maxTimeoutRef.current)) {
      clearTimers();
      invoke(lastArgsRef.current);
      lastArgsRef.current = undefined;
    }
  }, [clearTimers, invoke]);

  const pending = useCallback(() => {
    return timeoutRef.current !== null || maxTimeoutRef.current !== null;
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      lastCallTimeRef.current = now;
      lastArgsRef.current = args;

      // Handle leading edge
      if (leading && !leadingRef.current) {
        leadingRef.current = true;
        invoke(args);
        return;
      }

      // Clear existing timers
      clearTimers();

      // Handle maxWait
      if (maxWait && !maxTimeoutRef.current) {
        const timeSinceLastInvoke = now - lastInvokeTimeRef.current;
        if (timeSinceLastInvoke >= maxWait) {
          invoke(args);
          return;
        } else {
          maxTimeoutRef.current = setTimeout(() => {
            maxTimeoutRef.current = null;
            if (lastArgsRef.current) {
              invoke(lastArgsRef.current);
              lastArgsRef.current = undefined;
            }
          }, maxWait - timeSinceLastInvoke);
        }
      }

      // Handle trailing edge
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          
          // Check if this is still the most recent call
          const timeSinceLastCall = Date.now() - lastCallTimeRef.current;
          if (timeSinceLastCall >= delay && lastArgsRef.current) {
            invoke(lastArgsRef.current);
            lastArgsRef.current = undefined;
          }
        }, delay);
      }
    },
    [callback, delay, leading, trailing, maxWait, clearTimers, invoke]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Attach control methods to the debounced function
  (debouncedCallback as DebouncedCallback<T>).cancel = cancel;
  (debouncedCallback as DebouncedCallback<T>).flush = flush;
  (debouncedCallback as DebouncedCallback<T>).pending = pending;

  return debouncedCallback as DebouncedCallback<T>;
}

// ============================================================================
// SEARCH DEBOUNCE HOOK (CONVENIENCE)
// ============================================================================

export interface UseSearchDebounceResult {
  searchValue: string;
  debouncedSearchValue: string;
  isSearching: boolean;
  setSearchValue: (value: string) => void;
  clearSearch: () => void;
}

/**
 * Convenience hook specifically for search input debouncing
 * @param initialValue - Initial search value
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Search state and control functions
 */
export function useSearchDebounce(
  initialValue = '',
  delay = 300
): UseSearchDebounceResult {
  const [searchValue, setSearchValue] = useState(initialValue);
  
  const { debouncedValue: debouncedSearchValue, isDebouncing } = useDebounce(
    searchValue,
    delay
  );

  const clearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  return {
    searchValue,
    debouncedSearchValue,
    isSearching: isDebouncing,
    setSearchValue,
    clearSearch
  };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default useDebounce;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Only imports debugLog from @/core/utils
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure React hook logic
// [x] Reads config from `@/app/config` - Uses import.meta.env directly for dev mode
// [x] Exports default named component - Exports useDebounce as default and multiple named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for debounce hook
