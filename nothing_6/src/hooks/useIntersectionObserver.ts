// filepath: src/hooks/useIntersectionObserver.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (useIntersectionObserver)
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { useCallback, useEffect, useRef, useState } from 'react'
import { config } from '@/app/config'
import { debugLog } from '@/core/utils'

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  // Freeze the observer after first intersection (useful for reveal animations)
  freezeOnceVisible?: boolean
  // Initial visibility state (useful for SSR)
  initialIsIntersecting?: boolean
  // Disable observer in reduced motion mode
  respectReducedMotion?: boolean
}

export interface UseIntersectionObserverResult {
  ref: (node: Element | null) => void
  entry: IntersectionObserverEntry | undefined
  isIntersecting: boolean
  isVisible: boolean
}

/**
 * Hook that wraps IntersectionObserver for reveal-on-scroll and lazy-loading features.
 * 
 * @param options - IntersectionObserver options plus additional configuration
 * @returns Object with ref callback, entry, and visibility states
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
    initialIsIntersecting = false,
    respectReducedMotion = true,
  } = options

  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>()
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting)
  const [isVisible, setIsVisible] = useState(initialIsIntersecting)
  
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementRef = useRef<Element | null>(null)
  const frozenRef = useRef(false)

  // Check if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  // Cleanup observer
  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  // Create and configure observer
  const createObserver = useCallback(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      debugLog('[useIntersectionObserver] IntersectionObserver not available')
      return
    }

    // Skip observer if user prefers reduced motion and we should respect it
    if (respectReducedMotion && prefersReducedMotion) {
      debugLog('[useIntersectionObserver] Skipping observer due to reduced motion preference')
      setIsIntersecting(true)
      setIsVisible(true)
      return
    }

    try {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [observerEntry] = entries
          if (!observerEntry) return

          const isCurrentlyIntersecting = observerEntry.isIntersecting
          
          setEntry(observerEntry)
          setIsIntersecting(isCurrentlyIntersecting)

          // Once visible, always visible (for reveal animations)
          if (isCurrentlyIntersecting) {
            setIsVisible(true)
            
            if (freezeOnceVisible && !frozenRef.current) {
              frozenRef.current = true
              cleanupObserver()
              debugLog('[useIntersectionObserver] Frozen after first visibility')
            }
          } else if (!freezeOnceVisible) {
            setIsVisible(isCurrentlyIntersecting)
          }

          debugLog('[useIntersectionObserver] Intersection change:', {
            isIntersecting: isCurrentlyIntersecting,
            intersectionRatio: observerEntry.intersectionRatio,
            target: observerEntry.target
          })
        },
        {
          threshold,
          root,
          rootMargin,
        }
      )
    } catch (error) {
      if (config.isDevelopment) {
        console.error('[useIntersectionObserver] Failed to create observer:', error)
      }
    }
  }, [threshold, root, rootMargin, freezeOnceVisible, respectReducedMotion, prefersReducedMotion, cleanupObserver])

  // Ref callback to attach/detach observer
  const ref = useCallback((node: Element | null) => {
    // Clean up previous observer
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current)
    }

    elementRef.current = node

    if (node && !frozenRef.current) {
      // Create observer if it doesn't exist
      if (!observerRef.current) {
        createObserver()
      }

      // Start observing the new element
      if (observerRef.current) {
        observerRef.current.observe(node)
        debugLog('[useIntersectionObserver] Started observing element')
      }
    }
  }, [createObserver])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupObserver()
    }
  }, [cleanupObserver])

  return {
    ref,
    entry,
    isIntersecting,
    isVisible,
  }
}

export default useIntersectionObserver
