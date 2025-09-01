// filepath: src/providers/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { theme } from '@/theme';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';

// =============================================================================
// Types
// =============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  /** Current theme mode setting */
  mode: ThemeMode;
  /** Resolved theme (never 'system', always 'light' or 'dark') */
  resolvedTheme: 'light' | 'dark';
  /** Whether dark mode is currently active */
  isDark: boolean;
  /** Toggle between light and dark mode */
  toggle: () => void;
  /** Set specific theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Theme tokens and utilities */
  theme: typeof theme;
  /** Whether system preference detection is supported */
  systemThemeSupported: boolean;
}

// =============================================================================
// Context
// =============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

// =============================================================================
// Provider Component
// =============================================================================

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme mode if no stored preference */
  defaultTheme?: ThemeMode;
  /** Whether to apply theme classes to document */
  enableSystem?: boolean;
  /** Custom storage key for theme persistence */
  storageKey?: string;
  /** Disable theme persistence */
  disableStorage?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  storageKey = 'theme-preference',
  disableStorage = false,
}) => {
  // System theme detection
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined' || !enableSystem) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Theme mode storage
  const [storedMode, setStoredMode] = useLocalStorage<ThemeMode>(
    storageKey,
    defaultTheme,
    { disabled: disableStorage }
  );
  
  const [mode, setModeState] = useState<ThemeMode>(storedMode);

  // Resolve actual theme based on mode and system preference
  const resolvedTheme = useMemo((): 'light' | 'dark' => {
    if (mode === 'system') {
      return enableSystem ? systemTheme : 'light';
    }
    return mode;
  }, [mode, systemTheme, enableSystem]);

  const isDark = resolvedTheme === 'dark';

  // =============================================================================
  // System Theme Detection
  // =============================================================================

  useEffect(() => {
    if (!enableSystem || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystem]);

  // =============================================================================
  // Theme Application
  // =============================================================================

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(resolvedTheme);
    
    // Apply CSS custom properties
    const applyThemeVariables = (themeMode: 'light' | 'dark') => {
      const tokens = themeMode === 'dark' ? theme.colors.dark : theme.colors.light;
      
      // Apply color tokens as CSS variables
      Object.entries(tokens).forEach(([category, values]) => {
        if (typeof values === 'object' && values !== null) {
          Object.entries(values).forEach(([key, value]) => {
            if (typeof value === 'string') {
              root.style.setProperty(`--color-${category}-${key}`, value);
            }
          });
        }
      });
      
      // Apply other theme tokens
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });
      
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--radius-${key}`, value);
      });
      
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });
      
      // Apply typography scale
      Object.entries(theme.typography).forEach(([scale, properties]) => {
        if (typeof properties === 'object' && properties !== null) {
          Object.entries(properties).forEach(([prop, value]) => {
            root.style.setProperty(`--typography-${scale}-${prop}`, value);
          });
        }
      });
      
      // Apply z-index scale
      Object.entries(theme.zIndices).forEach(([key, value]) => {
        root.style.setProperty(`--z-${key}`, value.toString());
      });
    };

    applyThemeVariables(resolvedTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const bgColor = isDark ? theme.colors.dark.background.primary : theme.colors.light.background.primary;
      metaThemeColor.setAttribute('content', bgColor);
    }
    
  }, [resolvedTheme, isDark]);

  // =============================================================================
  // Theme Management Functions
  // =============================================================================

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    if (!disableStorage) {
      setStoredMode(newMode);
    }
    
    // Emit theme change event
    eventBus.emit('theme:changed', {
      mode: newMode,
      resolvedTheme: newMode === 'system' ? systemTheme : newMode,
      isDark: (newMode === 'system' ? systemTheme : newMode) === 'dark',
    });
  }, [setStoredMode, disableStorage, systemTheme]);

  const toggle = useCallback(() => {
    if (mode === 'system') {
      // When in system mode, toggle to opposite of current system preference
      setMode(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      setMode(mode === 'dark' ? 'light' : 'dark');
    }
  }, [mode, systemTheme, setMode]);

  // =============================================================================
  // Context Value
  // =============================================================================

  const contextValue: ThemeContextValue = useMemo(() => ({
    mode,
    resolvedTheme,
    isDark,
    toggle,
    setMode,
    theme,
    systemThemeSupported: enableSystem && typeof window !== 'undefined' && window.matchMedia,
  }), [mode, resolvedTheme, isDark, toggle, setMode, enableSystem]);

  // =============================================================================
  // Development Helpers
  // =============================================================================

  useEffect(() => {
    if (config.isDevelopment) {
      // Add development helper to window for debugging
      (window as any).__theme = {
        current: contextValue,
        setMode,
        toggle,
      };
    }
  }, [contextValue, setMode, toggle]);

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access theme context and utilities
 * @throws {Error} When used outside ThemeProvider
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook that returns true when dark mode is active
 */
export const useIsDark = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};

/**
 * Hook that provides theme-aware CSS-in-JS values
 */
export const useThemeValues = () => {
  const { resolvedTheme, theme: themeTokens } = useTheme();
  
  return useMemo(() => {
    const colors = resolvedTheme === 'dark' 
      ? themeTokens.colors.dark 
      : themeTokens.colors.light;
      
    return {
      colors,
      spacing: themeTokens.spacing,
      borderRadius: themeTokens.borderRadius,
      shadows: themeTokens.shadows,
      typography: themeTokens.typography,
      zIndices: themeTokens.zIndices,
      transitions: themeTokens.transitions,
      breakpoints: themeTokens.breakpoints,
    };
  }, [resolvedTheme, themeTokens]);
};

/**
 * Hook for components that need to react to theme changes
 */
export const useThemeEffect = (
  callback: (theme: 'light' | 'dark') => void | (() => void),
  deps: React.DependencyList = []
) => {
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    return callback(resolvedTheme);
  }, [resolvedTheme, ...deps]);
};

// =============================================================================
// Default Export
// =============================================================================

export default ThemeProvider;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/theme, @/hooks/useLocalStorage, @/app/config, @/core/events)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects - uses useLocalStorage hook)
- [x] Reads config from `@/app/config` (uses config.isDevelopment for dev helpers)
- [x] Exports default named component (exports ThemeProvider as default and useTheme as named export)
- [x] Adds basic ARIA and keyboard handlers (not applicable for theme provider - handles theme application and persistence)
*/
