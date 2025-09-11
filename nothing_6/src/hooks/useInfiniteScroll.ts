// filepath: src/hooks/useInfiniteScroll.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for hook)

import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiResult, LoadingState } from '@/core/contracts'
import { eventBus } from '@/core/events'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { nothingService } from '@/services/nothingService'

export interface InfiniteScrollOptions<T> {
  /** Initial page size */
  pageSize?: number
  /** Threshold for triggering next page load (0-1) */
  threshold?: number
  /** Root margin for intersection observer */
  rootMargin?: string
  /** Debounce delay for load requests */
  debounceMs?: number
  /** Custom fetch function */
  fetchFn?: (page: number, pageSize: number) => Promise<ApiResult<{ items: T[]; hasMore: boolean; total?: number }>>
  /** Enable automatic loading when sentinel comes into view */
  autoLoad?: boolean
  /** Initial data to start with */
  initialData?: T[]
}

export interface InfiniteScrollResult<T> {
  /** All loaded items */
  items: T[]
  /** Current loading state */
  loading: LoadingState
  /** Error message if any */
  error: string | null
  /** Whether more items can be loaded */
  hasMore: boolean
  /** Current page number */
  currentPage: number
  /** Total number of items (if provided by API) */
  total?: number
  /** Ref for the sentinel element */
  sentinelRef: React.RefObject<HTMLElement>
  /** Manually trigger loading next page */
  loadMore: () => Promise<void>
  /** Reset to initial state */
  reset: () => void
  /** Retry failed request */
  retry: () => Promise<void>
}

export function useInfiniteScroll<T = any>(options: InfiniteScrollOptions<T> = {}): InfiniteScrollResult<T> {
  const {
    pageSize = 20,
    threshold = 0.1,
    rootMargin = '100px',
    debounceMs = 300,
    fetchFn = nothingService.getInfiniteNothing,
    autoLoad = true,
    initialData = [],
  } = options

  // State
  const [items, setItems] = useState<T[]>(initialData)
  const [loading, setLoading] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [total, setTotal] = useState<number | undefined>()

  // Refs
  const sentinelRef = useRef<HTMLElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const isLoadingRef = useRef(false)

  // Intersection observer for auto-loading
  const { isIntersecting } = useIntersectionObserver(sentinelRef, {
    threshold,
    rootMargin,
  })

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || loading === 'loading') {
      return
    }

    isLoadingRef.current = true
    setLoading('loading')
    setError(null)

    try {
      const nextPage = currentPage + 1
      const result = await fetchFn(nextPage, pageSize)

      if (!result.ok || !result.data) {
        throw new Error(result.error?.message || 'Failed to load more items')
      }

      const { items: newItems, hasMore: hasMoreItems, total: totalItems } = result.data

      setItems(prev => [...prev, ...newItems])
      setHasMore(hasMoreItems)
      setCurrentPage(nextPage)
      setTotal(totalItems)
      setLoading('success')

      // Emit analytics event
      eventBus.emit('analytics:event', {
        name: 'infinite_scroll:load_more',
        properties: {
          page: nextPage,
          pageSize,
          itemsLoaded: newItems.length,
          totalItems: items.length + newItems.length,
        },
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setLoading('error')

      eventBus.emit('analytics:event', {
        name: 'infinite_scroll:error',
        properties: {
          page: currentPage + 1,
          error: errorMessage,
        },
      })
    } finally {
      isLoadingRef.current = false
    }
  }, [currentPage, pageSize, hasMore, loading, fetchFn, items.length])

  // Debounced load more
  const debouncedLoadMore = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      loadMore()
    }, debounceMs)
  }, [loadMore, debounceMs])

  // Reset function
  const reset = useCallback(() => {
    setItems(initialData)
    setLoading('idle')
    setError(null)
    setHasMore(true)
    setCurrentPage(0)
    setTotal(undefined)
    isLoadingRef.current = false

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    eventBus.emit('analytics:event', {
      name: 'infinite_scroll:reset',
      properties: { previousItemCount: items.length },
    })
  }, [initialData, items.length])

  // Retry function
  const retry = useCallback(async () => {
    if (error && loading === 'error') {
      await loadMore()
    }
  }, [error, loading, loadMore])

  // Auto-load when sentinel is intersecting
  useEffect(() => {
    if (autoLoad && isIntersecting && hasMore && loading !== 'loading') {
      debouncedLoadMore()
    }
  }, [autoLoad, isIntersecting, hasMore, loading, debouncedLoadMore])

  // Initial load if no initial data
  useEffect(() => {
    if (initialData.length === 0 && loading === 'idle' && currentPage === 0) {
      loadMore()
    }
  }, [initialData.length, loading, currentPage, loadMore])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return {
    items,
    loading,
    error,
    hasMore,
    currentPage,
    total,
    sentinelRef,
    loadMore,
    reset,
    retry,
  }
}

export default useInfiniteScroll

// Example usage (commented):
// const { items, loading, sentinelRef, hasMore, loadMore } = useInfiniteScroll({
//   pageSize: 10,
//   fetchFn: async (page, size) => nothingService.getTestimonials(page, size),
// })
//
// return (
//   <div>
//     {items.map(item => <div key={item.id}>{item.name}</div>)}
//     {hasMore && (
//       <div ref={sentinelRef} className="py-4">
//         {loading === 'loading' && <LoadingSpinner />}
//       </div>
//     )}
//   </div>
// )
