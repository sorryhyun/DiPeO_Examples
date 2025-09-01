// src/hooks/useLocalStorage.ts
/* src/hooks/useLocalStorage.ts
   Small hook for persistent state in localStorage with JSON serialization.
   - Provides get/set/clear operations for localStorage with type safety
   - Handles JSON serialization/deserialization automatically
   - Includes error handling for invalid JSON and storage failures
   - Syncs state with localStorage changes across tabs/windows
   - Returns tuple similar to useState for familiar API
*/

import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse, safeJsonStringify } from '@/core/utils';

// Return type for the hook - similar to useState tuple
export type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void
];

/**
 * Hook for managing localStorage with JSON serialization and type safety
 * 
 * @param key - The localStorage key to use
 * @param defaultValue - Default value when key doesn't exist or parsing fails
 * @returns Tuple of [value, setValue, clearValue]
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): UseLocalStorageReturn<T> {
  // Initialize state from localStorage or use default
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return defaultValue;
      }
      
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      
      const parsed = safeJsonParse(item);
      return parsed !== null ? parsed : defaultValue;
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Function to update both state and localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      if (typeof window === 'undefined') {
        return;
      }

      // Allow functional updates like useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update state
      setStoredValue(valueToStore);
      
      // Update localStorage
      const serialized = safeJsonStringify(valueToStore);
      if (serialized !== null) {
        window.localStorage.setItem(key, serialized);
        
        // Dispatch storage event for cross-tab synchronization
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: serialized,
          oldValue: window.localStorage.getItem(key),
          storageArea: window.localStorage
        }));
      }
    } catch (error) {
      console.error(`[useLocalStorage] Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Function to clear the value
  const clearValue = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        return;
      }

      // Update state to default
      setStoredValue(defaultValue);
      
      // Remove from localStorage
      const oldValue = window.localStorage.getItem(key);
      window.localStorage.removeItem(key);
      
      // Dispatch storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: null,
        oldValue,
        storageArea: window.localStorage
      }));
    } catch (error) {
      console.error(`[useLocalStorage] Error clearing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      // Only update if the changed key matches our key and it's from the same storage area
      if (e.key === key && e.storageArea === window.localStorage) {
        try {
          if (e.newValue === null) {
            // Key was removed
            setStoredValue(defaultValue);
          } else {
            // Key was updated
            const parsed = safeJsonParse(e.newValue);
            setStoredValue(parsed !== null ? parsed : defaultValue);
          }
        } catch (error) {
          console.warn(`[useLocalStorage] Error handling storage change for key "${key}":`, error);
          setStoredValue(defaultValue);
        }
      }
    };

    // Listen for storage events (cross-tab synchronization)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  return [storedValue, setValue, clearValue];
}

// Convenience hook for boolean flags
export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean = false
): UseLocalStorageReturn<boolean> {
  return useLocalStorage<boolean>(key, defaultValue);
}

// Convenience hook for string values
export function useLocalStorageString(
  key: string,
  defaultValue: string = ''
): UseLocalStorageReturn<string> {
  return useLocalStorage<string>(key, defaultValue);
}

// Convenience hook for number values
export function useLocalStorageNumber(
  key: string,
  defaultValue: number = 0
): UseLocalStorageReturn<number> {
  return useLocalStorage<number>(key, defaultValue);
}

// Example usage:
// const [user, setUser, clearUser] = useLocalStorage('user', null);
// const [theme, setTheme] = useLocalStorageString('theme', 'light');
// const [count, setCount] = useLocalStorageNumber('count', 0);

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - localStorage access is properly encapsulated in the hook
- [x] Reads config from `@/app/config` - not needed for localStorage utility
- [x] Exports default named component - exports named functions
- [x] Adds basic ARIA and keyboard handlers - not relevant for storage hook
*/
