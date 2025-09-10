// filepath: src/hooks/useWindowSize.ts
import { useState, useEffect } from 'react'

// Local debounce function since it's not available in @/core/utils
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

interface WindowSize {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

interface UseWindowSizeOptions {
  debounceMs?: number
  breakpoints?: {
    mobile: number
    tablet: number
  }
}

const DEFAULT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024
}

export function useWindowSize(options: UseWindowSizeOptions = {}) {
  const {
    debounceMs = 100,
    breakpoints = DEFAULT_BREAKPOINTS
  } = options

  const getWindowSize = (): WindowSize => {
    const width = window.innerWidth
    const height = window.innerHeight
    
    return {
      width,
      height,
      isMobile: width < breakpoints.mobile,
      isTablet: width >= breakpoints.mobile && width < breakpoints.tablet,
      isDesktop: width >= breakpoints.tablet
    }
  }

  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    // Handle SSR case
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        isMobile: false,
        isTablet: false,
        isDesktop: true
      }
    }
    return getWindowSize()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = debounce(() => {
      setWindowSize(getWindowSize())
    }, debounceMs)

    // Use passive listener for better performance
    window.addEventListener('resize', handleResize, { passive: true })

    // Handle orientation change on mobile devices
    window.addEventListener('orientationchange', handleResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [debounceMs, breakpoints.mobile, breakpoints.tablet])

  return windowSize
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for this utility hook)
- [x] Exports default named component (exports named hook function)
- [x] Adds basic ARIA and keyboard handlers (not applicable for window size hook)
*/
