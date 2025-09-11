// filepath: src/hooks/useFetch.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (useFetch hook)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for data hook)

import { useState, useEffect, useRef, useCallback } from 'react'
import { ApiResult } from '@/core/contracts'
import { eventBus } from '@/core/events'
import { hooks } from '@/core/hooks'
import { config } from '@/app/config'
import { apiClient } from '@/services/apiClient'

export interface UseFetchOptions<T = unknown> {
  // Control when the fetch runs
  enabled?: boolean
  // Retry configuration
  retry?: number
  retryDelay?: number
  // Cache settings
  cacheTime?: number
  staleTime?: number
  // Suspense mode (throws promise for React Suspense)
  suspense?: boolean
  // Transform response data
  transform?: (data: any) => T
  // Dependencies to refetch when changed
  deps?: any[]
}

export interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  invalidate: () => void
}

// Simple in-memory cache with timestamps
interface CacheEntry<T> {
  data: T
  timestamp: number
  promise?: Promise<any>
}

const cache = new Map<string, CacheEntry<any>>()

// Cache invalidation helper
const invalidateCache = (pattern?: string) => {
  if (!pattern) {
    cache.clear()
    eventBus.emit('analytics:event', { name: 'cache:cleared', properties: { entries: cache.size } })
    return
  }
  
  const keysToDelete: string[] = []
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => cache.delete(key))
  eventBus.emit('analytics:event', { 
    name: 'cache:invalidated', 
    properties: { pattern, deletedKeys: keysToDelete.length } 
  })
}

// Serialize fetch options to create cache key
const createCacheKey = (url: string, options?: any): string => {
  const key = `${url}${options ? JSON.stringify(options) : ''}`
  return key
}

export function useFetch<T = unknown>(
  url: string | null,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const {
    enabled = true,
    retry = 3,
    retryDelay = 1000,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000, // 30 seconds
    suspense = false,
    transform,
    deps = []
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  
  const retryCountRef = useRef<number>(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const cacheKey = url ? createCacheKey(url) : null

  // Check cache for data
  const getCachedData = useCallback((): T | null => {
    if (!cacheKey) return null
    
    const entry = cache.get(cacheKey)
    if (!entry) return null
    
    const now = Date.now()
    const isStale = now - entry.timestamp > staleTime
    const isExpired = now - entry.timestamp > cacheTime
    
    if (isExpired) {
      cache.delete(cacheKey)
      return null
    }
    
    if (isStale) {
      // Return stale data but trigger background refetch
      return entry.data
    }
    
    return entry.data
  }, [cacheKey, staleTime, cacheTime])

  // Main fetch function
  const fetchData = useCallback(async (): Promise<void> => {
    if (!url || !enabled) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setLoading(true)
      setError(null)

      // Check if there's already a pending promise for this cache key
      const existingEntry = cacheKey ? cache.get(cacheKey) : null
      if (existingEntry?.promise && suspense) {
        throw existingEntry.promise
      }

      // Run beforeApiRequest hook
      await hooks.run('beforeApiRequest', { 
        path: url, 
        method: 'GET',
        meta: { retryCount: retryCountRef.current }
      })

      const fetchPromise = apiClient.get(url)
      
      // Cache the promise for suspense mode
      if (cacheKey && suspense) {
        cache.set(cacheKey, { 
          data: null as any, 
          timestamp: Date.now(), 
          promise: fetchPromise 
        })
      }

      const result: ApiResult<any> = await fetchPromise

      if (controller.signal.aborted) return

      // Run afterApiResponse hook  
      await hooks.run('afterApiResponse', { path: url, method: 'GET', response: result })

      if (result.success && result.data !== undefined) {
        const processedData = transform ? transform(result.data) : result.data

        // Update cache
        if (cacheKey) {
          cache.set(cacheKey, {
            data: processedData,
            timestamp: Date.now(),
            promise: undefined
          })
        }

        setData(processedData)
        retryCountRef.current = 0

        eventBus.emit('analytics:event', { 
          name: 'fetch:success', 
          properties: { url, cached: false } 
        })
      } else {
        throw new Error(result.error || 'Unknown API error')
      }

    } catch (err) {
      if (controller.signal.aborted) return

      const error = err instanceof Error ? err : new Error(String(err))
      
      // Retry logic
      if (retryCountRef.current < retry && !controller.signal.aborted) {
        retryCountRef.current++
        
        eventBus.emit('analytics:event', { 
          name: 'fetch:retry', 
          properties: { url, retryCount: retryCountRef.current, error: error.message } 
        })

        setTimeout(() => {
          if (!controller.signal.aborted) {
            fetchData()
          }
        }, retryDelay * Math.pow(2, retryCountRef.current - 1)) // Exponential backoff
        
        return
      }

      setError(error)
      eventBus.emit('analytics:event', { 
        name: 'fetch:error', 
        properties: { url, error: error.message, finalRetryCount: retryCountRef.current } 
      })

      // Remove failed promise from cache
      if (cacheKey) {
        cache.delete(cacheKey)
      }

      if (suspense) {
        throw error
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [url, enabled, retry, retryDelay, transform, cacheKey, suspense])

  // Refetch function
  const refetch = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0
    if (cacheKey) {
      cache.delete(cacheKey)
    }
    await fetchData()
  }, [fetchData, cacheKey])

  // Cache invalidation function
  const invalidate = useCallback((): void => {
    if (cacheKey) {
      cache.delete(cacheKey)
    }
  }, [cacheKey])

  // Effect to handle initial load and dependency changes
  useEffect(() => {
    if (!url || !enabled) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    // Check cache first
    const cachedData = getCachedData()
    if (cachedData !== null) {
      setData(cachedData)
      setLoading(false)
      setError(null)
      
      eventBus.emit('analytics:event', { 
        name: 'fetch:cache_hit', 
        properties: { url } 
      })
      
      // Don't return early if data is stale - let fetchData run in background
      const entry = cacheKey ? cache.get(cacheKey) : null
      const isStale = entry && Date.now() - entry.timestamp > staleTime
      if (!isStale) return
    }

    fetchData()

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [url, enabled, fetchData, getCachedData, cacheKey, staleTime, ...deps])

  // Dev mode logging
  useEffect(() => {
    if (config.isDevelopment && error) {
      console.error('[useFetch] Error fetching:', url, error)
    }
  }, [error, url])

  // Suspense mode: throw promise or error
  if (suspense && url && enabled) {
    if (error) throw error
    if (loading && data === null) {
      const entry = cacheKey ? cache.get(cacheKey) : null
      if (entry?.promise) throw entry.promise
    }
  }

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  }
}

// Export cache utilities
export const fetchCache = {
  invalidate: invalidateCache,
  clear: () => invalidateCache(),
  size: () => cache.size,
  keys: () => Array.from(cache.keys())
}

export default useFetch
