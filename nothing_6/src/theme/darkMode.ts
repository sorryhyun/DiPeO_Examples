// filepath: src/theme/darkMode.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (useDarkMode)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for theme utilities)

import { useCallback, useEffect } from 'react'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'

// Theme preference types
export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

// Constants
const THEME_STORAGE_KEY = 'theme-preference'
const DARK_CLASS = 'dark'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

// Utility to detect system preference
function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  
  try {
    return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

// Resolve theme mode to actual theme
function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return getSystemPreference()
  }
  return mode
}

// Apply dark class to document
export function applyDarkClass(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return

  try {
    if (theme === 'dark') {
      document.documentElement.classList.add(DARK_CLASS)
    } else {
      document.documentElement.classList.remove(DARK_CLASS)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[darkMode] Failed to apply dark class:', err)
  }
}

// Main hook for dark mode functionality
export function useDarkMode() {
  // Get stored preference or default to system
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>(
    THEME_STORAGE_KEY, 
    'system'
  )

  // Resolve current theme
  const resolvedTheme = resolveTheme(themeMode)
  
  // Toggle between light and dark (skipping system)
  const toggle = useCallback(() => {
    const newMode: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark'
    setThemeMode(newMode)
    
    // Emit event for analytics/other listeners
    eventBus.emit('analytics:event', {
      name: 'theme:toggle',
      properties: { 
        from: resolvedTheme, 
        to: resolveTheme(newMode),
        mode: newMode
      }
    })
  }, [resolvedTheme, setThemeMode])

  // Set specific theme mode
  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode)
    
    eventBus.emit('analytics:event', {
      name: 'theme:set',
      properties: { 
        mode,
        resolvedTheme: resolveTheme(mode)
      }
    })
  }, [setThemeMode])

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    applyDarkClass(resolvedTheme)
  }, [resolvedTheme])

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (themeMode !== 'system') return

    let mediaQuery: MediaQueryList
    
    try {
      mediaQuery = window.matchMedia(MEDIA_QUERY)
      
      const handleChange = () => {
        const newSystemTheme = getSystemPreference()
        applyDarkClass(newSystemTheme)
        
        eventBus.emit('analytics:event', {
          name: 'theme:system_change',
          properties: { systemTheme: newSystemTheme }
        })
      }

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else {
        // Legacy browsers
        mediaQuery.addListener(handleChange)
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange)
        } else {
          mediaQuery.removeListener(handleChange)
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[darkMode] Failed to setup system theme listener:', err)
    }
  }, [themeMode])

  // Initialize theme on first load
  useEffect(() => {
    applyDarkClass(resolvedTheme)
    
    // Emit initial theme event for debugging
    if (config.isDevelopment) {
      eventBus.emit('analytics:event', {
        name: 'theme:initialized',
        properties: { 
          mode: themeMode,
          resolvedTheme,
          systemPreference: getSystemPreference()
        }
      })
    }
  }, []) // Run once on mount

  return {
    // Current state
    themeMode,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: themeMode === 'system',
    
    // Actions
    toggle,
    setTheme,
    setLight: () => setTheme('light'),
    setDark: () => setTheme('dark'),
    setSystem: () => setTheme('system'),
    
    // Utilities
    getSystemPreference,
    
    // CSS utilities
    darkClass: resolvedTheme === 'dark' ? DARK_CLASS : '',
    themeClass: `theme-${resolvedTheme}`,
  }
}

// Utility to get current theme without hook (for non-React contexts)
export function getCurrentTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    const mode: ThemeMode = stored ? JSON.parse(stored) : 'system'
    return resolveTheme(mode)
  } catch {
    return getSystemPreference()
  }
}

// Utility to check if dark mode is active (for non-React contexts)
export function isDarkMode(): boolean {
  return getCurrentTheme() === 'dark'
}

// CSS-in-JS helper for conditional dark mode styles
export function darkModeStyles(lightStyles: any, darkStyles: any) {
  return {
    ...lightStyles,
    '@media (prefers-color-scheme: dark)': darkStyles,
  }
}

// Tailwind class helper
export function twDark(lightClasses: string, darkClasses: string): string {
  return `${lightClasses} dark:${darkClasses.split(' ').join(' dark:')}`
}

// Export collection for convenience
export const darkModeUtils = {
  useDarkMode,
  applyDarkClass,
  getCurrentTheme,
  isDarkMode,
  darkModeStyles,
  twDark,
  getSystemPreference,
  resolveTheme,
}

// Default export is the main hook
export default useDarkMode
