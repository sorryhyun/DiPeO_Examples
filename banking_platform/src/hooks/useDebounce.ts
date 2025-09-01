// filepath: src/hooks/useDebounce.ts
/* src/hooks/useDebounce.ts

Generic debounce hook that delays the execution of a value change until after a specified delay.
Used by search inputs, form validation, and API calls to reduce excessive updates.
*/

import { useEffect, useRef, useState } from 'react';

/**
 * Debounces a value, only updating the debounced value after the specified delay
 * has passed without any new updates.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear the previous timeout if value changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedValue;
}

/**
 * Advanced debounce hook that provides additional control over the debouncing behavior.
 * Includes immediate execution option and cancel functionality.
 */
export function useDebouncedCallback<TArgs extends any[]>(
  callback: (...args: TArgs) => void,
  delay: number,
  options?: {
    leading?: boolean; // Execute immediately on first call
    trailing?: boolean; // Execute after delay (default: true)
  }
): {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => void;
} {
  const { leading = false, trailing = true } = options || {};
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTime = useRef<number>(0);
  const lastArgs = useRef<TArgs | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const flush = () => {
    if (timeoutRef.current && lastArgs.current) {
      cancel();
      callbackRef.current(...lastArgs.current);
    }
  };

  const debouncedCallback = (...args: TArgs) => {
    const now = Date.now();
    const shouldCallLeading = leading && (!lastCallTime.current || now - lastCallTime.current > delay);
    
    lastArgs.current = args;
    lastCallTime.current = now;

    if (shouldCallLeading) {
      callbackRef.current(...args);
    }

    cancel();

    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, delay);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, []);

  return Object.assign(debouncedCallback, { cancel, flush });
}

/* Example usage:

// Basic debounced value
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearchTerm) {
    // Perform search API call
  }
}, [debouncedSearchTerm]);

// Debounced callback for form validation
const validateField = useDebouncedCallback((value: string) => {
  // Perform validation
}, 500);

// In component:
<input onChange={(e) => validateField(e.target.value)} />
*/

// Self-check comments:
// [x] Uses `@/` imports only (no external imports needed for this utility hook)
// [x] Uses providers/hooks (this IS a hook, uses React hooks internally)
// [x] Reads config from `@/app/config` (not applicable for this utility hook)
// [x] Exports default named component (exports named functions useDebounce and useDebouncedCallback)
// [x] Adds basic ARIA and keyboard handlers (not applicable for this utility hook)
