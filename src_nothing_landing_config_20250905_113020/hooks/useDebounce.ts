// filepath: src/hooks/useDebounce.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { config } from '@/app/config';
import { debugLog } from '@/core/utils';

// Debounce hook options interface
export interface UseDebounceOptions {
  delay?: number;
  leading?: boolean; // Fire on leading edge
  trailing?: boolean; // Fire on trailing edge (default)
  maxWait?: number; // Maximum time to wait before forcing execution
}

// Default debounce options
const DEFAULT_OPTIONS: Required<UseDebounceOptions> = {
  delay: 300,
  leading: false,
  trailing: true,
  maxWait: 1000,
};

/**
 * Hook that debounces a value, delaying updates until after the specified delay period
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      
      if (config.isDevelopment) {
        debugLog('useDebounce: Value updated', { value, delay });
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that provides a debounced callback function
 * @param callback - The function to debounce
 * @param options - Debounce options (delay, leading, trailing, maxWait)
 * @returns A debounced version of the callback function
 */
export function useDebouncedCallback<TArgs extends any[], TReturn>(
  callback: (...args: TArgs) => TReturn,
  options: UseDebounceOptions = {}
): {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
} {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { delay, leading, trailing, maxWait } = opts;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<TArgs | null>(null);
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    lastCallTimeRef.current = 0;
    lastArgsRef.current = null;
    
    if (config.isDevelopment) {
      debugLog('useDebouncedCallback: Cancelled');
    }
  }, []);

  const flush = useCallback(() => {
    if (lastArgsRef.current !== null) {
      const args = lastArgsRef.current;
      cancel();
      callbackRef.current(...args);
      
      if (config.isDevelopment) {
        debugLog('useDebouncedCallback: Flushed', { args });
      }
    }
  }, [cancel]);

  const pending = useCallback(() => {
    return timeoutRef.current !== null;
  }, []);

  const debouncedCallback = useCallback((...args: TArgs) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;
    lastArgsRef.current = args;
    
    const invokeCallback = () => {
      cancel();
      callbackRef.current(...args);
      
      if (config.isDevelopment) {
        debugLog('useDebouncedCallback: Executed', { args, delay });
      }
    };

    // Leading edge execution
    if (leading && (!lastCallTimeRef.current || timeSinceLastCall >= delay)) {
      lastCallTimeRef.current = now;
      invokeCallback();
      return;
    }

    // Cancel existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up max wait timeout if specified
    if (maxWait > 0 && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        maxTimeoutRef.current = null;
        invokeCallback();
      }, maxWait);
    }

    // Set up trailing edge timeout
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
          maxTimeoutRef.current = null;
        }
        lastCallTimeRef.current = now;
        callbackRef.current(...args);
        
        if (config.isDevelopment) {
          debugLog('useDebouncedCallback: Trailing execution', { args, delay });
        }
      }, delay);
    }
  }, [delay, leading, trailing, maxWait, cancel]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // Return debounced function with utility methods
  return Object.assign(debouncedCallback, {
    cancel,
    flush,
    pending,
  });
}

/**
 * Hook for debouncing search inputs with additional search-specific features
 * @param searchTerm - The search term to debounce
 * @param onSearch - Callback to execute when search term changes
 * @param options - Debounce options plus search-specific options
 */
export function useSearchDebounce(
  searchTerm: string,
  onSearch: (term: string) => void,
  options: UseDebounceOptions & {
    minLength?: number; // Minimum search term length
    trimWhitespace?: boolean; // Whether to trim whitespace
    ignoreEmpty?: boolean; // Whether to ignore empty search terms
  } = {}
) {
  const {
    minLength = 2,
    trimWhitespace = true,
    ignoreEmpty = true,
    ...debounceOptions
  } = options;

  const processedTerm = trimWhitespace ? searchTerm.trim() : searchTerm;
  
  const debouncedSearch = useDebouncedCallback(
    (term: string) => {
      // Apply search-specific filters
      if (ignoreEmpty && !term) {
        if (config.isDevelopment) {
          debugLog('useSearchDebounce: Ignoring empty search term');
        }
        return;
      }
      
      if (term.length < minLength) {
        if (config.isDevelopment) {
          debugLog('useSearchDebounce: Search term too short', { term, minLength });
        }
        return;
      }
      
      onSearch(term);
      
      if (config.isDevelopment) {
        debugLog('useSearchDebounce: Search executed', { term });
      }
    },
    debounceOptions
  );

  // Execute search when processed term changes
  useEffect(() => {
    debouncedSearch(processedTerm);
  }, [processedTerm, debouncedSearch]);

  return {
    debouncedTerm: processedTerm,
    isSearchPending: debouncedSearch.pending,
    cancelSearch: debouncedSearch.cancel,
    flushSearch: debouncedSearch.flush,
  };
}

/**
 * Hook for debouncing async operations with loading state management
 * @param asyncOperation - The async function to debounce
 * @param options - Debounce options
 */
export function useAsyncDebounce<TArgs extends any[], TReturn>(
  asyncOperation: (...args: TArgs) => Promise<TReturn>,
  options: UseDebounceOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TReturn | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedOperation = useDebouncedCallback(
    async (...args: TArgs) => {
      // Cancel any existing operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await asyncOperation(...args);
        
        // Only update state if not aborted
        if (!abortController.signal.aborted) {
          setData(result);
          setIsLoading(false);
          
          if (config.isDevelopment) {
            debugLog('useAsyncDebounce: Operation completed', { args, result });
          }
        }
      } catch (err) {
        // Only update state if not aborted
        if (!abortController.signal.aborted) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error);
          setIsLoading(false);
          
          if (config.isDevelopment) {
            debugLog('useAsyncDebounce: Operation failed', { args, error });
          }
        }
      }
    },
    options
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    debouncedOperation.cancel();
    setIsLoading(false);
  }, [debouncedOperation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    execute: debouncedOperation,
    cancel,
    flush: debouncedOperation.flush,
    pending: debouncedOperation.pending,
    isLoading,
    error,
    data,
  };
}

// Export default as the basic useDebounce hook
export default useDebounce;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses React hooks and utilities
// [x] Reads config from `@/app/config` 
// [x] Exports default named component - exports useDebounce as default and multiple named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for utility hooks
