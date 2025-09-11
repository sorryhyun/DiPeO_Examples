// filepath: src/shared/hooks/useLocalStorage.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config` (not needed for this utility hook)
// [x] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for storage hook)

import { useState, useCallback, useEffect, useRef } from 'react'
import { parseJSON, safeStringify } from '@/core/utils'

// Storage event detail for cross-tab synchronization
export interface StorageChangeEvent<T = unknown> {
  key: string
  oldValue: T | null
  newValue: T | null
  source: 'local' | 'external'
}

// Hook options
export interface UseLocalStorageOptions<T> {
  /** Serializer function for complex types */
  serializer?: {
    parse: (value: string) => T
    stringify: (value: T) => string
  }
  /** Enable cross-tab synchronization */
  syncAcrossTabs?: boolean
  /** Custom error handler for storage failures */
  onError?: (error: Error, operation: 'read' | 'write' | 'remove') => void
}

// Storage hook return type
export interface UseLocalStorageReturn<T> {
  /** Current value */
  value: T
  /** Set new value */
  setValue: (value: T | ((prev: T) => T)) => void
  /** Remove value from storage */
  removeValue: () => void
  /** Check if value exists in storage */
  hasValue: boolean
  /** Loading state (true during SSR or initial hydration) */
  isLoading: boolean
  /** Error state if storage operations fail */
  error: Error | null
}

// Default serializer using core utils
const defaultSerializer = {
  parse: (value: string) => parseJSON(value),
  stringify: (value: unknown) => safeStringify(value),
}

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }
    // Test actual functionality
    const testKey = '__localStorage_test__'
    window.localStorage.setItem(testKey, 'test')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Typed localStorage hook with SSR safety and cross-tab sync
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    serializer = defaultSerializer,
    syncAcrossTabs = true,
    onError,
  } = options

  // Internal state
  const [storedValue, setStoredValue] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasValue, setHasValue] = useState(false)
  
  // Track if we're on the client
  const isClient = typeof window !== 'undefined'
  const isStorageAvailable = isClient && isLocalStorageAvailable()
  
  // Ref to track if this instance initiated the change
  const changeSourceRef = useRef<'local' | 'external'>('local')

  // Read value from localStorage
  const readValue = useCallback((): T => {
    if (!isStorageAvailable) {
      return defaultValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        setHasValue(false)
        return defaultValue
      }
      
      setHasValue(true)
      const parsed = serializer.parse(item)
      return parsed !== null ? parsed : defaultValue
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error, 'read')
      setHasValue(false)
      return defaultValue
    }
  }, [key, defaultValue, serializer, isStorageAvailable, onError])

  // Write value to localStorage
  const writeValue = useCallback((value: T): boolean => {
    if (!isStorageAvailable) {
      return false
    }

    try {
      const serializedValue = serializer.stringify(value)
      window.localStorage.setItem(key, serializedValue)
      setHasValue(true)
      setError(null)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error, 'write')
      return false
    }
  }, [key, serializer, isStorageAvailable, onError])

  // Remove value from localStorage
  const removeValue = useCallback((): void => {
    if (!isStorageAvailable) {
      return
    }

    try {
      window.localStorage.removeItem(key)
      setHasValue(false)
      setError(null)
      changeSourceRef.current = 'local'
      setStoredValue(defaultValue)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error, 'remove')
    }
  }, [key, defaultValue, isStorageAvailable, onError])

  // Set value with functional updates support
  const setValue = useCallback((value: T | ((prev: T) => T)): void => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value
      
      if (writeValue(newValue)) {
        changeSourceRef.current = 'local'
        setStoredValue(newValue)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error, 'write')
    }
  }, [storedValue, writeValue, onError])

  // Initialize value on mount
  useEffect(() => {
    const initialValue = readValue()
    setStoredValue(initialValue)
    setIsLoading(false)
  }, [readValue])

  // Handle cross-tab synchronization
  useEffect(() => {
    if (!isStorageAvailable || !syncAcrossTabs) {
      return
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return

      try {
        let newValue: T
        
        if (e.newValue === null) {
          // Value was removed
          newValue = defaultValue
          setHasValue(false)
        } else {
          // Value was changed
          newValue = serializer.parse(e.newValue) ?? defaultValue
          setHasValue(true)
        }

        // Only update if the change came from another tab
        if (changeSourceRef.current !== 'local') {
          changeSourceRef.current = 'external'
          setStoredValue(newValue)
        }
        
        // Reset change source for next update
        changeSourceRef.current = 'external'
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        onError?.(error, 'read')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, defaultValue, serializer, syncAcrossTabs, isStorageAvailable, onError])

  return {
    value: storedValue,
    setValue,
    removeValue,
    hasValue,
    isLoading,
    error,
  }
}

// Convenience hook for boolean flags
export function useLocalStorageBoolean(
  key: string,
  defaultValue = false,
  options?: Omit<UseLocalStorageOptions<boolean>, 'serializer'>
): UseLocalStorageReturn<boolean> {
  return useLocalStorage(key, defaultValue, {
    ...options,
    serializer: {
      parse: (value: string) => {
        if (value === 'true') return true
        if (value === 'false') return false
        return parseJSON(value, defaultValue)
      },
      stringify: (value: boolean) => String(value),
    },
  })
}

// Convenience hook for number values
export function useLocalStorageNumber(
  key: string,
  defaultValue = 0,
  options?: Omit<UseLocalStorageOptions<number>, 'serializer'>
): UseLocalStorageReturn<number> {
  return useLocalStorage(key, defaultValue, {
    ...options,
    serializer: {
      parse: (value: string) => {
        const num = Number(value)
        return Number.isNaN(num) ? parseJSON(value, defaultValue) : num
      },
      stringify: (value: number) => String(value),
    },
  })
}

// Convenience hook for string arrays
export function useLocalStorageStringArray(
  key: string,
  defaultValue: string[] = [],
  options?: Omit<UseLocalStorageOptions<string[]>, 'serializer'>
): UseLocalStorageReturn<string[]> {
  return useLocalStorage(key, defaultValue, {
    ...options,
    serializer: {
      parse: (value: string) => {
        const parsed = parseJSON<string[]>(value, defaultValue)
        return Array.isArray(parsed) ? parsed : defaultValue
      },
      stringify: (value: string[]) => safeStringify(value),
    },
  })
}

// Default export is the main hook
export default useLocalStorage
