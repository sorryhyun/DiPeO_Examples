import { useState, useEffect } from 'react';

/**
 * Hook for persisting state to localStorage with cross-tab synchronization
 * @param key - localStorage key
 * @param initialValue - initial value if no stored value exists
 * @returns tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with lazy initializer to avoid reading localStorage on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if window is undefined (SSR guard)
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage and state
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);

      // Save to localStorage if available
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch custom storage event for same-tab updates
        // (native storage event only fires for other tabs)
        window.dispatchEvent(
          new CustomEvent('local-storage-change', {
            detail: { key, value: valueToStore }
          })
        );
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for storage changes from other tabs and custom events from same tab
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Handle storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    // Handle custom events from same tab
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleCustomStorageChange as EventListener);
    };
  }, [key]);

  return [storedValue, setValue];
}
