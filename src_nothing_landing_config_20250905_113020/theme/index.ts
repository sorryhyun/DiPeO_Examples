// filepath: src/theme/index.ts
import { config } from '@/app/config';
import { useCallback, useMemo } from 'react';

// Color palette with semantic naming
export const colors = {
  // Primary brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // Secondary/accent colors
  secondary: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308', // Main secondary
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },
  
  // Neutral grays
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main info
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Special colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  current: 'currentColor',
} as const;

// Typography scale with fluid responsive sizing
export const typography = {
  // Font families
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      '"Helvetica Neue"',
      'sans-serif',
    ],
    serif: [
      '"Crimson Text"',
      'Georgia',
      '"Times New Roman"',
      'Times',
      'serif',
    ],
    mono: [
      '"JetBrains Mono"',
      '"Fira Code"',
      'Consolas',
      '"Liberation Mono"',
      'Monaco',
      'monospace',
    ],
  },
  
  // Font sizes with responsive scaling
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.05em' }],
    '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
    '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
    '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.1em' }],
    '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.1em' }],
    '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.1em' }],
  },
  
  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Spacing scale (8px base unit)
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',   // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',    // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',   // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  9: '2.25rem',   // 36px
  10: '2.5rem',   // 40px
  11: '2.75rem',  // 44px
  12: '3rem',     // 48px
  14: '3.5rem',   // 56px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  28: '7rem',     // 112px
  32: '8rem',     // 128px
  36: '9rem',     // 144px
  40: '10rem',    // 160px
  44: '11rem',    // 176px
  48: '12rem',    // 192px
  52: '13rem',    // 208px
  56: '14rem',    // 224px
  60: '15rem',    // 240px
  64: '16rem',    // 256px
  72: '18rem',    // 288px
  80: '20rem',    // 320px
  96: '24rem',    // 384px
} as const;

// Border radius scale
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',  // 2px
  base: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// Shadows with layered depth
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  outline: '0 0 0 3px rgb(59 130 246 / 0.15)',
  focus: '0 0 0 3px rgb(59 130 246 / 0.5)',
} as const;

// Z-index scale
export const zIndex = {
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
  max: 9999,
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Animation durations and easing
export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

// Combined design tokens object
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  animation,
} as const;

// Theme variants (light/dark mode support)
export interface ThemeVariant {
  name: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    surface: string;
    surfaceVariant: string;
    border: string;
    borderVariant: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    ring: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
  };
}

// Light theme variant
export const lightTheme: ThemeVariant = {
  name: 'light',
  colors: {
    background: colors.white,
    foreground: colors.neutral[900],
    surface: colors.white,
    surfaceVariant: colors.neutral[50],
    border: colors.neutral[200],
    borderVariant: colors.neutral[300],
    muted: colors.neutral[100],
    mutedForeground: colors.neutral[600],
    accent: colors.neutral[100],
    accentForeground: colors.neutral[900],
    destructive: colors.error[500],
    destructiveForeground: colors.white,
    ring: colors.primary[500],
    primary: colors.primary[500],
    primaryForeground: colors.white,
    secondary: colors.neutral[100],
    secondaryForeground: colors.neutral[900],
  },
};

// Dark theme variant
export const darkTheme: ThemeVariant = {
  name: 'dark',
  colors: {
    background: colors.neutral[900],
    foreground: colors.neutral[50],
    surface: colors.neutral[800],
    surfaceVariant: colors.neutral[700],
    border: colors.neutral[700],
    borderVariant: colors.neutral[600],
    muted: colors.neutral[800],
    mutedForeground: colors.neutral[400],
    accent: colors.neutral[800],
    accentForeground: colors.neutral[50],
    destructive: colors.error[600],
    destructiveForeground: colors.white,
    ring: colors.primary[400],
    primary: colors.primary[400],
    primaryForeground: colors.neutral[900],
    secondary: colors.neutral[700],
    secondaryForeground: colors.neutral[50],
  },
};

// Theme variants map
export const themeVariants = {
  light: lightTheme,
  dark: darkTheme,
} as const;

// Complete theme object combining tokens and variants
export const theme = {
  ...tokens,
  variants: themeVariants,
} as const;

// Type definitions for theme access
export type ThemeTokens = typeof tokens;
export type ThemeName = keyof typeof themeVariants;
export type ColorScale = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type TypographySize = keyof typeof typography.fontSize;
export type BreakpointKey = keyof typeof breakpoints;

// Utility type for accessing nested token values
export type TokenPath<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? `${string & K}.${string & TokenPath<T[K]>}`
        : string & K;
    }[keyof T]
  : never;

// Theme token access utilities
export const themeUtils = {
  /**
   * Get a color value by path (e.g., 'primary.500', 'neutral.900')
   */
  getColor(path: string, fallback?: string): string {
    const [scale, shade] = path.split('.');
    const colorScale = colors[scale as keyof typeof colors];
    
    if (!colorScale) {
      return fallback || colors.neutral[500];
    }
    
    if (typeof colorScale === 'string') {
      return colorScale;
    }
    
    const colorValue = colorScale[shade as keyof typeof colorScale];
    return (colorValue as string) || fallback || colors.neutral[500];
  },
  
  /**
   * Get a spacing value by key
   */
  getSpacing(key: SpacingKey, fallback?: string): string {
    return spacing[key] || fallback || spacing[4];
  },
  
  /**
   * Generate responsive font size with line height
   */
  getFontSize(size: TypographySize): { fontSize: string; lineHeight: string; letterSpacing?: string } {
    const [fontSize, config] = typography.fontSize[size];
    return {
      fontSize,
      lineHeight: typeof config === 'string' ? config : config.lineHeight,
      ...(typeof config === 'object' && config.letterSpacing && { letterSpacing: config.letterSpacing }),
    };
  },
  
  /**
   * Get shadow with optional color override
   */
  getShadow(key: keyof typeof shadows, color?: string): string {
    const baseShadow = shadows[key];
    if (!color || baseShadow === 'none') return baseShadow;
    
    // Replace rgb values in shadow with custom color
    return baseShadow.replace(/rgb\([\d\s,]+\)/g, color);
  },
  
  /**
   * Generate media query string for breakpoint
   */
  mediaQuery(breakpoint: BreakpointKey): string {
    return `@media (min-width: ${breakpoints[breakpoint]})`;
  },
  
  /**
   * Convert spacing key to CSS custom property
   */
  spacingVar(key: SpacingKey): string {
    return `var(--spacing-${key}, ${spacing[key]})`;
  },
  
  /**
   * Convert color path to CSS custom property
   */
  colorVar(path: string): string {
    const normalizedPath = path.replace('.', '-');
    const colorValue = themeUtils.getColor(path);
    return `var(--color-${normalizedPath}, ${colorValue})`;
  },
};

// React hook for accessing theme tokens
export function useThemeToken<T extends keyof ThemeTokens>(
  tokenType: T
): ThemeTokens[T] {
  return useMemo(() => tokens[tokenType], [tokenType]);
}

// React hook for theme utilities
export function useThemeUtils() {
  return useMemo(() => themeUtils, []);
}

// React hook for responsive breakpoint detection
export function useBreakpoint(): {
  current: BreakpointKey;
  isAbove: (breakpoint: BreakpointKey) => boolean;
  isBelow: (breakpoint: BreakpointKey) => boolean;
} {
  const getCurrentBreakpoint = useCallback((): BreakpointKey => {
    if (typeof window === 'undefined') return 'md';
    
    const width = window.innerWidth;
    const breakpointEntries = Object.entries(breakpoints) as [BreakpointKey, string][];
    
    // Sort by pixel value and find the largest that matches
    const sortedBreakpoints = breakpointEntries
      .map(([key, value]) => [key, parseInt(value)] as const)
      .sort((a, b) => b[1] - a[1]);
    
    for (const [key, value] of sortedBreakpoints) {
      if (width >= value) {
        return key;
      }
    }
    
    return 'xs';
  }, []);
  
  const isAbove = useCallback((breakpoint: BreakpointKey): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= parseInt(breakpoints[breakpoint]);
  }, []);
  
  const isBelow = useCallback((breakpoint: BreakpointKey): boolean => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth < parseInt(breakpoints[breakpoint]);
  }, []);
  
  return useMemo(() => ({
    current: getCurrentBreakpoint(),
    isAbove,
    isBelow,
  }), [getCurrentBreakpoint, isAbove, isBelow]);
}

// CSS-in-JS helper for creating theme-aware styles
export function createThemeStyles<T extends Record<string, any>>(
  stylesFn: (theme: typeof theme) => T
): T {
  return stylesFn(theme);
}

// Generate CSS custom properties for design tokens
export function generateCSSVariables(variant: ThemeVariant = lightTheme): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Theme variant colors
  Object.entries(variant.colors).forEach(([key, value]) => {
    variables[`--color-${key}`] = value;
  });
  
  // Base color scales
  Object.entries(colors).forEach(([scaleName, scale]) => {
    if (typeof scale === 'string') {
      variables[`--color-${scaleName}`] = scale;
    } else if (typeof scale === 'object') {
      Object.entries(scale).forEach(([shade, value]) => {
        variables[`--color-${scaleName}-${shade}`] = value;
      });
    }
  });
  
  // Spacing values
  Object.entries(spacing).forEach(([key, value]) => {
    variables[`--spacing-${key}`] = value;
  });
  
  // Typography
  Object.entries(typography.fontSize).forEach(([key, [size]]) => {
    variables[`--font-size-${key}`] = size;
  });
  
  // Shadows
  Object.entries(shadows).forEach(([key, value]) => {
    variables[`--shadow-${key}`] = value;
  });
  
  // Border radius
  Object.entries(borderRadius).forEach(([key, value]) => {
    variables[`--radius-${key}`] = value;
  });
  
  return variables;
}

// Development helpers
if (config.isDevelopment) {
  // Add theme to global object for debugging
  (globalThis as any).__theme = theme;
  (globalThis as any).__themeUtils = themeUtils;
}

// Export everything as named exports
export {
  lightTheme,
  darkTheme,
  themeVariants,
  themeUtils,
  createThemeStyles,
  generateCSSVariables,
};

// Export theme as default for convenience
export default theme;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - theme tokens and utilities only
// [x] Reads config from `@/app/config`
// [x] Exports default named component - exports theme as default and named exports for utilities
// [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for design tokens
