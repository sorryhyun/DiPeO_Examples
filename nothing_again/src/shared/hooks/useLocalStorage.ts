import { useState, useEffect } from 'react';
import { DEFAULT_APP_CONFIG } from '@/constants/appConfig';

// In-memory storage for when localStorage is disabled
const memoryStorage: Record<string, any> = {};

/**
 * Type-safe hook to persist data in localStorage or in-memory storage
 * @param key Storage key
 * @param initialValue Initial value if no stored value exists
 * @returns [value, setValue] tuple similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Check if localStorage is available and enabled
  const isLocalStorageEnabled = 
    typeof window !== 'undefined' && 
    'localStorage' in window && 
    DEFAULT_APP_CONFIG.development_mode.use_localstorage_persistence;

  // Initialize state with stored value or initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (isLocalStorageEnabled) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } else {
        // Use in-memory storage
        return memoryStorage[key] !== undefined ? memoryStorage[key] : initialValue;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update stored value
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage or memory storage
      if (isLocalStorageEnabled) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } else {
        memoryStorage[key] = valueToStore;
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    if (!isLocalStorageEnabled) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, isLocalStorageEnabled]);

  return [storedValue, setValue];
}