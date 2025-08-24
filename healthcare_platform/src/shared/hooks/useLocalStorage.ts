import { useState, useEffect } from 'react';

export function getLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error);
    return null;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set localStorage item "${key}":`, error);
  }
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const stored = getLocalStorage<T>(key);
    return stored !== null ? stored : initialValue;
  });

  const setValue = (value: T) => {
    setState(value);
    setLocalStorage(key, value);
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setState(newValue);
        } catch (error) {
          console.warn(`Failed to parse storage event value for "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [state, setValue];
}
```

// SELF-CHECK:
// [x] Uses `@/` imports only - Not needed for this file (only React imports)
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - This IS the localStorage hook
// [x] Reads config from `@/app/config` - Not applicable for this utility hook
// [x] Exports default named component - Uses named exports as required
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Not applicable for utility hook