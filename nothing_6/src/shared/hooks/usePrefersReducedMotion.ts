// filepath: src/shared/hooks/usePrefersReducedMotion.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config` (not needed for this hook)
// [x] Exports default named component (usePrefersReducedMotion hook)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for motion hook)

import { useState, useEffect } from 'react'

/**
 * Hook to detect user's preference for reduced motion.
 * 
 * Returns true if the user prefers reduced motion, which should be respected
 * by disabling or reducing animations, transitions, and other motion effects.
 * 
 * @returns boolean - true if user prefers reduced motion, false otherwise
 */
export function usePrefersReducedMotion(): boolean {
  // Initialize with safe default (assume reduced motion in SSR/no-window environments)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Server-side rendering safe check
    if (typeof window === 'undefined') return true
    
    // Check if matchMedia is available (older browsers might not support it)
    if (!window.matchMedia) return false
    
    // Get initial preference
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    // Skip effect in SSR or if matchMedia is not available
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Set initial value (in case it changed between render and effect)
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

// Default export for consistency with other hooks
export default usePrefersReducedMotion

/**
 * Higher-order hook that conditionally returns motion values based on user preference.
 * 
 * @param motionValue - The value to return when motion is enabled
 * @param reducedValue - The value to return when motion should be reduced
 * @returns The appropriate value based on user preference
 */
export function useMotionValue<T>(motionValue: T, reducedValue: T): T {
  const prefersReducedMotion = usePrefersReducedMotion()
  return prefersReducedMotion ? reducedValue : motionValue
}

/**
 * Hook that returns motion-safe animation duration values.
 * 
 * @param duration - Normal animation duration in milliseconds
 * @param reducedDuration - Reduced duration (defaults to 0 for instant)
 * @returns Duration value respecting user preference
 */
export function useMotionDuration(duration: number, reducedDuration: number = 0): number {
  return useMotionValue(duration, reducedDuration)
}

/**
 * Hook that returns motion-safe CSS transition values.
 * 
 * @param transition - Normal CSS transition string
 * @param reducedTransition - Reduced transition (defaults to 'none')
 * @returns CSS transition value respecting user preference
 */
export function useMotionTransition(transition: string, reducedTransition: string = 'none'): string {
  return useMotionValue(transition, reducedTransition)
}

/**
 * Hook for Framer Motion variants that respect reduced motion preference.
 * 
 * @param variants - Motion variants object
 * @param reducedVariants - Simplified variants for reduced motion
 * @returns Appropriate variants based on user preference
 */
export function useMotionVariants<T extends Record<string, any>>(
  variants: T, 
  reducedVariants?: Partial<T>
): T {
  const prefersReducedMotion = usePrefersReducedMotion()
  
  if (!prefersReducedMotion) {
    return variants
  }
  
  // If reduced variants provided, merge with original
  if (reducedVariants) {
    return { ...variants, ...reducedVariants } as T
  }
  
  // Otherwise, create reduced variants by removing motion properties
  const reduced = {} as T
  Object.keys(variants).forEach(key => {
    const variant = variants[key]
    if (typeof variant === 'object' && variant !== null) {
      // Remove common motion properties while preserving others
      const { 
        transition, 
        animate, 
        x, 
        y, 
        scale, 
        rotate, 
        opacity: _opacity, 
        ...staticProps 
      } = variant
      
      // Keep opacity changes but make them instant
      reduced[key as keyof T] = {
        ...staticProps,
        ...(variant.opacity !== undefined && { opacity: variant.opacity }),
        transition: { duration: 0 }
      } as T[keyof T]
    } else {
      reduced[key as keyof T] = variant
    }
  })
  
  return reduced
}

// Re-export main hook as default for common usage patterns
// import usePrefersReducedMotion from '@/shared/hooks/usePrefersReducedMotion'
// const prefersReducedMotion = usePrefersReducedMotion()
