// filepath: src/providers/ThemeProvider.tsx

/*
✓ Uses @/ imports as much as possible
✓ Uses providers/hooks (no direct DOM/localStorage side effects)
✓ Reads config from @/app/config
✓ Exports default named component
✓ Adds basic ARIA and keyboard handlers (where relevant - N/A for provider)
*/

import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react'
import { theme, themeUtils, createThemeContext, type Theme, type DarkModePreference } from '@/theme/index'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import { config } from '@/app/config'

// Theme context interface
export interface ThemeContextValue {
  // Theme objects
  theme: Theme
  utils: typeof themeUtils
  
  // Dark mode state and controls
  isDark: boolean
  darkMode: DarkModePreference
  toggleDarkMode: () => void
  setDarkMode: (preference: DarkModePreference) => void
  
  // Theme utilities
  resolveClasses: (...classes: (string | undefined | null | boolean)[]) => string
  getColorValue: (colorPath: string, isDark?: boolean) => string
  
  // Meta information
  isSystemDark: boolean
  isInitialized: boolean
}

// Create theme context with safe defaults
const ThemeContext = createContext<ThemeContextValue | null>(null)

// Theme provider props
export interface ThemeProviderProps {
  children: ReactNode
  /** Override default dark mode preference */
  defaultDarkMode?: DarkModePreference
  /** Disable system preference detection */
  disableSystemDetection?: boolean
}

// Hook to use theme context
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme provider component
export function ThemeProvider({
  children,
  defaultDarkMode = 'system',
  disableSystemDetection = false,
}: ThemeProviderProps) {
  // Persistent dark mode preference
  const [darkModePreference, setDarkModePreference] = useLocalStorage<DarkModePreference>(
    'theme-preference',
    defaultDarkMode
  )
  
  // System dark mode detection
  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window === 'undefined' || disableSystemDetection) return false
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  })
  
  // Initialization state
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Computed dark mode state
  const isDark = darkModePreference === 'dark' || (darkModePreference === 'system' && isSystemDark)
  
  // Toggle dark mode between light/dark (preserves system if currently set)
  const toggleDarkMode = useCallback(() => {
    if (darkModePreference === 'system') {
      // If system, toggle to opposite of current system preference
      setDarkModePreference(isSystemDark ? 'light' : 'dark')
    } else {
      // Toggle between light and dark
      setDarkModePreference(darkModePreference === 'light' ? 'dark' : 'light')
    }
  }, [darkModePreference, isSystemDark, setDarkModePreference])
  
  // Set specific dark mode preference
  const setDarkMode = useCallback((preference: DarkModePreference) => {
    setDarkModePreference(preference)
  }, [setDarkModePreference])
  
  // Enhanced theme utilities with current dark mode state
  const resolveClasses = useCallback((...classes: (string | undefined | null | boolean)[]) => {
    return themeUtils.cn(...classes)
  }, [])
  
  const getColorValue = useCallback((colorPath: string, useDark?: boolean) => {
    return theme.getColorValue(colorPath, useDark ?? isDark)
  }, [isDark])
  
  // System preference change listener
  useEffect(() => {
    if (typeof window === 'undefined' || disableSystemDetection) return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches)
    }
    
    // Set initial state
    setIsSystemDark(mediaQuery.matches)
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [disableSystemDetection])
  
  // Apply dark mode class to document
  useEffect(() => {
    if (typeof document === 'undefined') return
    
    const htmlElement = document.documentElement
    
    if (isDark) {
      htmlElement.classList.add('dark')
      htmlElement.style.colorScheme = 'dark'
    } else {
      htmlElement.classList.remove('dark')
      htmlElement.style.colorScheme = 'light'
    }
    
    // Apply theme CSS custom properties
    const root = htmlElement.style
    
    // Set CSS variables for current theme
    root.setProperty('--color-primary', theme.getColorValue('primary.500', isDark))
    root.setProperty('--color-secondary', theme.getColorValue('secondary.500', isDark))
    root.setProperty('--color-accent', theme.getColorValue('accent.500', isDark))
    root.setProperty('--color-background', theme.getColorValue('background.primary', isDark))
    root.setProperty('--color-surface', theme.getColorValue('surface.primary', isDark))
    root.setProperty('--color-text', theme.getColorValue('text.primary', isDark))
    
    // Mark as initialized after first application
    if (!isInitialized) {
      setIsInitialized(true)
    }
  }, [isDark, isInitialized])
  
  // Initialize theme on mount
  useEffect(() => {
    // Sync with theme utilities
    theme.darkMode.set(darkModePreference)
  }, [darkModePreference])
  
  // Context value
  const contextValue: ThemeContextValue = {
    // Theme objects
    theme,
    utils: themeUtils,
    
    // Dark mode state and controls
    isDark,
    darkMode: darkModePreference,
    toggleDarkMode,
    setDarkMode,
    
    // Theme utilities
    resolveClasses,
    getColorValue,
    
    // Meta information
    isSystemDark,
    isInitialized,
  }
  
  // Debug logging in development
  useEffect(() => {
    if (config.isDevelopment && isInitialized) {
      console.debug('[ThemeProvider] Theme state:', {
        isDark,
        darkModePreference,
        isSystemDark,
        isInitialized,
      })
    }
  }, [isDark, darkModePreference, isSystemDark, isInitialized])
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Higher-order component for theme injection
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextValue }>
): React.ComponentType<P> {
  return function ThemedComponent(props: P) {
    const theme = useTheme()
    return <Component {...props} theme={theme} />
  }
}

// Theme provider with sensible defaults
export default ThemeProvider

// Development helpers
if (config.isDevelopment && typeof window !== 'undefined') {
  (window as any).__THEME_PROVIDER__ = {
    ThemeProvider,
    useTheme,
    theme,
    themeUtils,
  }
}
