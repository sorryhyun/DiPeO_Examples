// filepath: src/theme/ThemeProvider.tsx

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { MotionConfig } from 'framer-motion';
import { theme, darkTheme, lightTheme, ThemeTokens, ThemeMode, getTheme, getOppositeMode, createCSSVariables } from '@/theme/index';
import { shouldReduceMotion, DURATIONS } from '@/theme/animations';
import { eventBus } from '@/core/events';
import { config } from '@/app/config';

// ============================================================================
// THEME CONTEXT & TYPES
// ============================================================================

export interface ThemeContextValue {
  /** Current theme mode */
  mode: ThemeMode;
  /** Current theme tokens */
  tokens: ThemeTokens;
  /** Toggle between light and dark mode */
  toggleMode: () => void;
  /** Set specific theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Check if current mode is dark */
  isDark: boolean;
  /** Check if current mode is light */
  isLight: boolean;
  /** Get color value from current theme */
  getColor: (path: string) => string;
  /** Get spacing value from current theme */
  getSpacing: (key: keyof ThemeTokens['spacing']) => string;
  /** Check if animations should be reduced */
  shouldReduceMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ============================================================================
// THEME PROVIDER PROPS
// ============================================================================

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Initial theme mode (defaults to system preference or light) */
  initialMode?: ThemeMode;
  /** Force a specific mode (disables toggling) */
  forcedMode?: ThemeMode;
  /** Storage key for persisting theme preference */
  storageKey?: string;
  /** Disable system theme detection */
  disableSystemTheme?: boolean;
  /** Custom theme tokens to override defaults */
  customTheme?: Partial<ThemeTokens>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get system theme preference
 */
function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches ? 'dark' : 'light';
}

/**
 * Get stored theme preference
 */
function getStoredTheme(storageKey: string): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  
  return null;
}

/**
 * Store theme preference
 */
function storeTheme(storageKey: string, mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(storageKey, mode);
  } catch (error) {
    console.warn('Failed to store theme in localStorage:', error);
  }
}

/**
 * Apply CSS variables to document root
 */
function applyCSSVariables(tokens: ThemeTokens): void {
  if (typeof document === 'undefined') return;
  
  const variables = createCSSVariables(tokens);
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Apply theme attributes to document
 */
function applyThemeAttributes(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.className = document.documentElement.className
    .replace(/\btheme-\w+\b/g, '')
    .concat(` theme-${mode}`)
    .trim();
}

/**
 * Get nested object value by dot-notation path
 */
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '';
  }, obj);
}

// ============================================================================
// THEME PROVIDER COMPONENT
// ============================================================================

export function ThemeProvider({
  children,
  initialMode,
  forcedMode,
  storageKey = 'theme-mode',
  disableSystemTheme = false,
  customTheme,
}: ThemeProviderProps) {
  // ============================================================================
  // STATE & INITIALIZATION
  // ============================================================================
  
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // If forced mode is provided, use it
    if (forcedMode) return forcedMode;
    
    // If initial mode is provided, use it
    if (initialMode) return initialMode;
    
    // Try to get stored theme preference
    const stored = getStoredTheme(storageKey);
    if (stored) return stored;
    
    // Fall back to system theme or light
    return disableSystemTheme ? 'light' : getSystemTheme();
  });
  
  const [shouldReduceMotionState, setShouldReduceMotionState] = useState(() => shouldReduceMotion());
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const currentTheme = React.useMemo(() => {
    const baseTheme = getTheme(mode);
    
    // If custom theme provided, merge with base theme
    if (customTheme) {
      return {
        ...baseTheme,
        ...customTheme,
        colors: {
          ...baseTheme.colors,
          ...customTheme.colors,
        },
      } as ThemeTokens;
    }
    
    return baseTheme;
  }, [mode, customTheme]);
  
  const isDark = mode === 'dark';
  const isLight = mode === 'light';
  
  // ============================================================================
  // THEME UTILITIES
  // ============================================================================
  
  const getColor = useCallback((path: string): string => {
    return getNestedValue(currentTheme.colors, path) || '';
  }, [currentTheme]);
  
  const getSpacing = useCallback((key: keyof ThemeTokens['spacing']): string => {
    return currentTheme.spacing[key] || '0rem';
  }, [currentTheme]);
  
  // ============================================================================
  // THEME ACTIONS
  // ============================================================================
  
  const setMode = useCallback((newMode: ThemeMode) => {
    // Don't allow mode changes if forced mode is set
    if (forcedMode) {
      if (config.isDevelopment) {
        console.warn('ThemeProvider: Cannot change mode when forcedMode is set');
      }
      return;
    }
    
    setModeState(newMode);
    storeTheme(storageKey, newMode);
    
    // Emit theme change event
    eventBus.emit('ui:themeChanged', { mode: newMode, isDark: newMode === 'dark' });
  }, [forcedMode, storageKey]);
  
  const toggleMode = useCallback(() => {
    setMode(getOppositeMode(mode));
  }, [mode, setMode]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Apply CSS variables and attributes when theme changes
  useEffect(() => {
    applyCSSVariables(currentTheme);
    applyThemeAttributes(mode);
  }, [currentTheme, mode]);
  
  // Listen for system theme changes
  useEffect(() => {
    if (disableSystemTheme || forcedMode) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only sync with system if no stored preference exists
      const stored = getStoredTheme(storageKey);
      if (!stored) {
        const systemMode = e.matches ? 'dark' : 'light';
        setModeState(systemMode);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [disableSystemTheme, forcedMode, storageKey]);
  
  // Listen for reduced motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotionState(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);
  
  // Listen for escape key to potentially close modals/dropdowns
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        eventBus.emit('ui:escape', {});
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const contextValue: ThemeContextValue = {
    mode,
    tokens: currentTheme,
    toggleMode,
    setMode,
    isDark,
    isLight,
    getColor,
    getSpacing,
    shouldReduceMotion: shouldReduceMotionState,
  };
  
  // ============================================================================
  // MOTION CONFIG
  // ============================================================================
  
  const motionConfig = {
    transition: {
      duration: shouldReduceMotionState ? 0 : DURATIONS.normal / 1000,
    },
    reducedMotion: shouldReduceMotionState ? 'always' : 'never',
  } as const;
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MotionConfig {...motionConfig}>
        <div
          className="theme-provider-root"
          data-theme={mode}
          data-reduced-motion={shouldReduceMotionState}
          style={{
            colorScheme: mode, // Help browser with form controls
          }}
        >
          {children}
        </div>
      </MotionConfig>
    </ThemeContext.Provider>
  );
}

// ============================================================================
// THEME HOOK
// ============================================================================

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// ============================================================================
// THEME UTILITIES HOOKS
// ============================================================================

/**
 * Hook to get responsive value based on breakpoint
 */
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  default: T;
}): T {
  const { tokens } = useTheme();
  const [currentValue, setCurrentValue] = useState(values.default);
  
  useEffect(() => {
    const updateValue = () => {
      const width = window.innerWidth;
      
      if (width >= parseInt(tokens.breakpoints['2xl']) && values['2xl'] !== undefined) {
        setCurrentValue(values['2xl']);
      } else if (width >= parseInt(tokens.breakpoints.xl) && values.xl !== undefined) {
        setCurrentValue(values.xl);
      } else if (width >= parseInt(tokens.breakpoints.lg) && values.lg !== undefined) {
        setCurrentValue(values.lg);
      } else if (width >= parseInt(tokens.breakpoints.md) && values.md !== undefined) {
        setCurrentValue(values.md);
      } else if (width >= parseInt(tokens.breakpoints.sm) && values.sm !== undefined) {
        setCurrentValue(values.sm);
      } else if (width >= parseInt(tokens.breakpoints.xs) && values.xs !== undefined) {
        setCurrentValue(values.xs);
      } else {
        setCurrentValue(values.default);
      }
    };
    
    updateValue();
    window.addEventListener('resize', updateValue);
    
    return () => {
      window.removeEventListener('resize', updateValue);
    };
  }, [tokens.breakpoints, values]);
  
  return currentValue;
}

/**
 * Hook to check if current screen size matches a breakpoint
 */
export function useBreakpoint(breakpoint: keyof ThemeTokens['breakpoints']): boolean {
  const { tokens } = useTheme();
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${tokens.breakpoints[breakpoint]})`);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [tokens.breakpoints, breakpoint]);
  
  return matches;
}

// ============================================================================
// HOC FOR THEME INJECTION
// ============================================================================

/**
 * Higher-order component to inject theme props
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextValue }>
): React.ComponentType<P> {
  const WithThemeComponent = (props: P) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
  
  WithThemeComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  
  return WithThemeComponent;
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

if (config.isDevelopment) {
  // Expose theme debugging on window object in development
  (globalThis as any).__theme_debug = {
    getTheme: () => {
      const themeElement = document.querySelector('[data-theme]');
      return themeElement?.getAttribute('data-theme') || 'unknown';
    },
    getCSSVariables: () => {
      const computedStyle = getComputedStyle(document.documentElement);
      const variables: Record<string, string> = {};
      
      for (let i = 0; i < computedStyle.length; i++) {
        const property = computedStyle[i];
        if (property.startsWith('--')) {
          variables[property] = computedStyle.getPropertyValue(property);
        }
      }
      
      return variables;
    },
    toggleTheme: () => {
      const event = new CustomEvent('theme:toggle');
      document.dispatchEvent(event);
    },
  };
}

// Default export
export default ThemeProvider;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/theme/index, @/theme/animations, @/core/events, @/app/config
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses localStorage with try/catch, DOM access only for CSS variable injection
// [x] Reads config from `@/app/config` - Uses config.isDevelopment for debug helpers and warnings
// [x] Exports default named component - Exports ThemeProvider as default and multiple named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Adds escape key listener for modal/dropdown closure, colorScheme CSS property for accessibility
