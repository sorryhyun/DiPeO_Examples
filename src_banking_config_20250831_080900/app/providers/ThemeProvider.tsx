import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { shouldUseMockData } from '@/app/config'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  attribute = 'class',
  enableSystem = true
}) => {
  // State for current theme preference
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  // Local storage persistence
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme | null>(
    storageKey,
    null,
    { enabled: shouldUseMockData() }
  )

  // System theme detection
  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])

  // Resolve theme (system -> actual theme)
  const resolveTheme = useCallback((themeValue: Theme): ResolvedTheme => {
    if (themeValue === 'system') {
      return enableSystem ? getSystemTheme() : 'light'
    }
    return themeValue as ResolvedTheme
  }, [enableSystem, getSystemTheme])

  // Apply theme to DOM
  const applyTheme = useCallback((resolvedThemeValue: ResolvedTheme) => {
    if (typeof window === 'undefined') return

    const root = window.document.documentElement

    // Remove previous theme classes
    root.classList.remove('light', 'dark')

    // Add new theme class
    if (attribute === 'class') {
      root.classList.add(resolvedThemeValue)
    } else if (attribute === 'data-theme') {
      root.setAttribute('data-theme', resolvedThemeValue)
    }

    // Set CSS custom property for potential theme-aware styles
    root.style.setProperty('--theme', resolvedThemeValue)

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      const themeColors = {
        light: '#ffffff',
        dark: '#0f172a' // slate-900
      }
      metaThemeColor.setAttribute('content', themeColors[resolvedThemeValue])
    }
  }, [attribute])

  // Set theme function
  const setTheme = useCallback((newTheme: Theme) => {
    const resolved = resolveTheme(newTheme)
    
    setThemeState(newTheme)
    setResolvedTheme(resolved)
    applyTheme(resolved)

    // Persist to localStorage in dev mode
    if (shouldUseMockData()) {
      setStoredTheme(newTheme)
    }

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: newTheme, resolvedTheme: resolved }
    }))
  }, [resolveTheme, applyTheme, setStoredTheme])

  // Toggle between light and dark (ignoring system)
  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      // If currently system, toggle to opposite of current resolved theme
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else {
      // Toggle between light/dark
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }, [theme, resolvedTheme, setTheme])

  // Initialize theme on mount
  useEffect(() => {
    // Determine initial theme
    let initialTheme = defaultTheme

    // Check localStorage first (if enabled)
    if (shouldUseMockData() && storedTheme) {
      initialTheme = storedTheme
    }

    // Resolve and apply theme
    const resolved = resolveTheme(initialTheme)
    setThemeState(initialTheme)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [defaultTheme, storedTheme, resolveTheme, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      // Only update if current theme is 'system'
      if (theme === 'system') {
        const newResolved = getSystemTheme()
        setResolvedTheme(newResolved)
        applyTheme(newResolved)
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [theme, enableSystem, getSystemTheme, applyTheme])

  // Prevent flash of unstyled content by applying theme before render
  useEffect(() => {
    // This effect runs on every render to ensure theme is always applied
    // Useful for SSR or when theme state changes
    if (resolvedTheme) {
      applyTheme(resolvedTheme)
    }
  }, [resolvedTheme, applyTheme])

  // Context value
  const contextValue: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark'
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme context
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

// Utility function to get theme without context (for use in class components or utilities)
export const getThemeFromDOM = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light'
  
  const root = window.document.documentElement
  
  if (root.classList.contains('dark')) {
    return 'dark'
  }
  
  return 'light'
}

// Utility function to detect system theme preference
export const getSystemThemePreference = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
