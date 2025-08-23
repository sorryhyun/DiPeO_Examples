import { useState, useEffect, useCallback } from 'react';

// Storage key prefix for the memory game app
const STORAGE_PREFIX = 'memorygame:v1:';

// Type for storage items with optional expiration
interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Set an item in localStorage with JSON serialization
 * @param key - Storage key (will be prefixed)
 * @param value - Value to store
 * @param expirationMs - Optional expiration time in milliseconds
 */
export function setItem<T>(key: string, value: T, expirationMs?: number): void {
  if (typeof window === 'undefined') return;

  try {
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: expirationMs ? Date.now() + expirationMs : undefined,
    };
    
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

/**
 * Get an item from localStorage with JSON deserialization
 * @param key - Storage key (will be prefixed)
 * @param defaultValue - Default value if item doesn't exist or is invalid
 * @returns The stored value or default value
 */
export function getItem<T>(key: string, defaultValue?: T): T | undefined {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return defaultValue;

    const parsed: StorageItem<T> = JSON.parse(item);
    
    // Check if item has expired
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return defaultValue;
    }

    return parsed.value;
  } catch (error) {
    console.warn('Failed to retrieve from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Remove an item from localStorage
 * @param key - Storage key (will be prefixed)
 */
export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}

/**
 * React hook for localStorage with state synchronization
 * @param key - Storage key (will be prefixed)
 * @param initialValue - Initial value if nothing is stored
 * @returns [value, setValue, removeValue] tuple
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [value, setValue] = useState<T>(() => {
    const stored = getItem<T>(key);
    return stored !== undefined ? stored : initialValue;
  });

  // Update localStorage whenever value changes
  useEffect(() => {
    setItem(key, value);
  }, [key, value]);

  // Wrapper to handle function updates
  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      return valueToStore;
    });
  }, []);

  // Function to remove the item
  const removeStoredValue = useCallback(() => {
    removeItem(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setStoredValue, removeStoredValue];
}

/**
 * Hook for localStorage with expiration support
 * @param key - Storage key (will be prefixed)
 * @param initialValue - Initial value if nothing is stored
 * @param expirationMs - Expiration time in milliseconds
 * @returns [value, setValue, removeValue] tuple
 */
export function useLocalStorageWithExpiration<T>(
  key: string,
  initialValue: T,
  expirationMs: number
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = getItem<T>(key);
    return stored !== undefined ? stored : initialValue;
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      setItem(key, valueToStore, expirationMs);
      return valueToStore;
    });
  }, [key, expirationMs]);

  const removeStoredValue = useCallback(() => {
    removeItem(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setStoredValue, removeStoredValue];
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all memory game related items from localStorage
 */
export function clearAllGameData(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    keys
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear game data:', error);
  }
}
