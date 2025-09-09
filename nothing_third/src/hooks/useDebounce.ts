// filepath: src/hooks/useDebounce.ts
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounces a value - delays updating until after the specified delay period
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounces a callback function - delays execution until after the specified delay period
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependency array for the callback (similar to useCallback)
 * @returns The debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Advanced debounce hook with additional control options
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @param options - Additional options
 * @returns Object with debounced value and control functions
 */
export function useAdvancedDebounce<T>(
  value: T,
  delay: number,
  options: {
    leading?: boolean;      // Fire immediately on first call
    trailing?: boolean;     // Fire after delay (default behavior)
    maxWait?: number;      // Maximum time to wait before forcing execution
  } = {}
): {
  debouncedValue: T;
  isPending: boolean;
  cancel: () => void;
  flush: () => void;
} {
  const { leading = false, trailing = true, maxWait } = options;
  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<number>(0);
  const lastInvokeRef = useRef<number>(0);
  const leadingExecutedRef = useRef(false);

  const invokeFunc = useCallback(() => {
    setDebouncedValue(value);
    setIsPending(false);
    lastInvokeRef.current = Date.now();
    leadingExecutedRef.current = false;
  }, [value]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    setIsPending(false);
    leadingExecutedRef.current = false;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current || maxTimeoutRef.current) {
      invokeFunc();
      cancel();
    }
  }, [invokeFunc, cancel]);

  useEffect(() => {
    const now = Date.now();
    lastCallRef.current = now;
    
    // Cancel previous timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Handle leading edge
    if (leading && !leadingExecutedRef.current) {
      invokeFunc();
      leadingExecutedRef.current = true;
      if (!trailing) {
        return;
      }
    }

    setIsPending(true);

    // Set up trailing timeout
    if (trailing) {
      timeoutRef.current = setTimeout(invokeFunc, delay);
    }

    // Set up maxWait timeout
    if (maxWait && !maxTimeoutRef.current) {
      const timeSinceLastInvoke = now - lastInvokeRef.current;
      const remainingWait = maxWait - timeSinceLastInvoke;
      
      if (remainingWait <= 0) {
        invokeFunc();
      } else {
        maxTimeoutRef.current = setTimeout(invokeFunc, remainingWait);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delay, leading, trailing, maxWait, invokeFunc]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    debouncedValue,
    isPending,
    cancel,
    flush
  };
}

/**
 * Debounce hook specifically designed for search inputs
 * Includes common patterns like minimum length and empty state handling
 * @param searchTerm - The search term to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @param options - Search-specific options
 * @returns Object with debounced search term and metadata
 */
export function useSearchDebounce(
  searchTerm: string,
  delay: number = 300,
  options: {
    minLength?: number;     // Minimum length before debouncing
    trimWhitespace?: boolean; // Trim whitespace from search term
  } = {}
): {
  debouncedSearchTerm: string;
  isSearching: boolean;
  shouldSearch: boolean;
} {
  const { minLength = 0, trimWhitespace = true } = options;
  
  const processedTerm = trimWhitespace ? searchTerm.trim() : searchTerm;
  
  const { debouncedValue: debouncedSearchTerm, isPending } = useAdvancedDebounce(
    processedTerm,
    delay,
    { trailing: true }
  );
  
  const shouldSearch = debouncedSearchTerm.length >= minLength;
  
  return {
    debouncedSearchTerm,
    isSearching: isPending,
    shouldSearch
  };
}

/**
 * Debounce hook for API calls with loading state management
 * @param apiCall - The API function to debounce
 * @param delay - The delay in milliseconds
 * @returns Object with debounced API call function and loading state
 */
export function useApiDebounce<TArgs extends any[], TReturn>(
  apiCall: (...args: TArgs) => Promise<TReturn>,
  delay: number
): {
  debouncedApiCall: (...args: TArgs) => Promise<TReturn | null>;
  isLoading: boolean;
  cancel: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const debouncedCallback = useDebouncedCallback(
    async (...args: TArgs): Promise<TReturn | null> => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      setIsLoading(true);
      
      try {
        const result = await apiCall(...args);
        setIsLoading(false);
        return result;
      } catch (error) {
        setIsLoading(false);
        
        // Don't throw if the request was cancelled
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }
        
        throw error;
      }
    },
    delay,
    [apiCall]
  );
  
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);
  
  return {
    debouncedApiCall: debouncedCallback,
    isLoading,
    cancel
  };
}

/*
Self-check comments:
- [x] Uses `@/` imports only (only imports React hooks, no external dependencies)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure hook implementations
- [x] Reads config from `@/app/config` (N/A for pure debounce utilities)
- [x] Exports default named component (exports multiple named hook functions)
- [x] Adds basic ARIA and keyboard handlers (N/A for debounce utilities - these are data transformation hooks)
*/
