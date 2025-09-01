import { useState, useEffect, useCallback, useRef } from 'react';
import { getItem, setItem, removeItem, LSKeys } from '@/utils/storage';
import { debugLog } from '@/utils/helpers';

// Serializer interface for custom value serialization
interface Serializer<T> {
  parse: (value: string) => T;
  stringify: (value: T) => string;
}

// Default JSON serializer
const defaultSerializer: Serializer<any> = {
  parse: JSON.parse,
  stringify: JSON.stringify,
};

// Options for useLocalStorage hook
interface UseLocalStorageOptions<T> {
  serializer?: Serializer<T>;
  syncAcrossTabs?: boolean;
  onError?: (error: Error) => void;
}

// Return type for useLocalStorage hook
type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void
];

/**
 * Custom React hook that synchronizes state with localStorage
 * Provides type-safe access to localStorage with automatic serialization
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    serializer = defaultSerializer,
    syncAcrossTabs = true,
    onError
  } = options;

  // Track if we're in SSR or initial render
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use ref to track the current key to handle key changes
  const keyRef = useRef(key);
  keyRef.current = key;

  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = getItem<string>(key);
      if (item !== null) {
        return serializer.parse(item);
      }
    } catch (error) {
      debugLog('warn', `Failed to parse localStorage value for key "${key}"`, error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Parse error'));
      }
    }

    return initialValue;
  });

  // Handle hydration and SSR
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Handle function updates
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        if (valueToStore === undefined) {
          removeItem(keyRef.current);
        } else {
          const serializedValue = serializer.stringify(valueToStore);
          setItem(keyRef.current, serializedValue);
        }
      }
    } catch (error) {
      debugLog('error', `Failed to set localStorage value for key "${keyRef.current}"`, error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Set error'));
      }
    }
  }, [storedValue, serializer, onError]);

  // Remove value from localStorage and reset to initial value
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        removeItem(keyRef.current);
      }
    } catch (error) {
      debugLog('error', `Failed to remove localStorage value for key "${keyRef.current}"`, error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Remove error'));
      }
    }
  }, [initialValue, onError]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === keyRef.current && e.newValue !== null) {
        try {
          const newValue = serializer.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          debugLog('warn', `Failed to sync localStorage change for key "${keyRef.current}"`, error);
          if (onError) {
            onError(error instanceof Error ? error : new Error('Sync error'));
          }
        }
      } else if (e.key === keyRef.current && e.newValue === null) {
        // Value was removed in another tab
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncAcrossTabs, serializer, initialValue, onError]);

  // Handle key changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      const item = getItem<string>(key);
      if (item !== null) {
        const parsedValue = serializer.parse(item);
        setStoredValue(parsedValue);
      } else {
        setStoredValue(initialValue);
      }
    } catch (error) {
      debugLog('warn', `Failed to load new localStorage value for key "${key}"`, error);
      setStoredValue(initialValue);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Key change error'));
      }
    }
  }, [key, initialValue, serializer, isInitialized, onError]);

  return [storedValue, setValue, removeValue];
}

// Specialized hooks for common use cases

/**
 * Hook for boolean values in localStorage
 */
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean = false,
  options: Omit<UseLocalStorageOptions<boolean>, 'serializer'> = {}
): UseLocalStorageReturn<boolean> {
  const serializer: Serializer<boolean> = {
    parse: (value: string) => value === 'true',
    stringify: (value: boolean) => String(value),
  };

  return useLocalStorage(key, initialValue, { ...options,serializer });
}

/**
 * Hook for number values in localStorage
 */
export function useLocalStorageNumber(
  key: string,
  initialValue: number = 0,
  options: Omit<UseLocalStorageOptions<number>, 'serializer'> = {}
): UseLocalStorageReturn<number> {
  const serializer: Serializer<number> = {
    parse: (value: string) => {
      const parsed = Number(value);
      if (isNaN(parsed)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return parsed;
    },
    stringify: (value: number) => String(value),
  };

  return useLocalStorage(key, initialValue, { ...options, serializer });
}

/**
 * Hook for string values in localStorage (no serialization needed)
 */
export function useLocalStorageString(
  key: string,
  initialValue: string = '',
  options: Omit<UseLocalStorageOptions<string>, 'serializer'> = {}
): UseLocalStorageReturn<string> {
  const serializer: Serializer<string> = {
    parse: (value: string) => value,
    stringify: (value: string) => value,
  };

  return useLocalStorage(key, initialValue, { ...options, serializer });
}

/**
 * Hook for array values in localStorage
 */
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = [],
  options: UseLocalStorageOptions<T[]> = {}
): UseLocalStorageReturn<T[]> {
  return useLocalStorage(key, initialValue, options);
}

/**
 * Hook for object values in localStorage
 */
export function useLocalStorageObject<T extends object>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  return useLocalStorage(key, initialValue, options);
}

// Export default as the main hook
export default useLocalStorage;
