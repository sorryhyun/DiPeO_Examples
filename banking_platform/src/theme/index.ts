// filepath: src/theme/index.ts
/* src/theme/index.ts

Design tokens: color palette, semantic tokens, typography scale, spacing, radii and shadow tokens.
Exposes JS representations and CSS variable helpers for consistent theming across the app.
*/

import { clamp } from '@/core/utils';

// Base color palette - HSL values for easy manipulation
const baseColors = {
  // Grays
  slate: {
    50: 'hsl(210, 40%, 98%)',
    100: 'hsl(210, 40%, 96%)',
    200: 'hsl(214, 32%, 91%)',
    300: 'hsl(213, 27%, 84%)',
    400: 'hsl(215, 20%, 65%)',
    500: 'hsl(215, 16%, 47%)',
    600: 'hsl(215, 19%, 35%)',
    700: 'hsl(215, 25%, 27%)',
    800: 'hsl(217, 33%, 17%)',
    900: 'hsl(222, 84%, 5%)',
  },
  // Primary brand colors
  blue: {
    50: 'hsl(214, 100%, 97%)',
    100: 'hsl(214, 95%, 93%)',
    200: 'hsl(213, 97%, 87%)',
    300: 'hsl(212, 96%, 78%)',
    400: 'hsl(213, 94%, 68%)',
    500: 'hsl(217, 91%, 60%)',
    600: 'hsl(221, 83%, 53%)',
    700: 'hsl(224, 76%, 48%)',
    800: 'hsl(226, 71%, 40%)',
    900: 'hsl(224, 64%, 33%)',
  },
  // Success/positive
  green: {
    50: 'hsl(138, 76%, 97%)',
    100: 'hsl(141, 84%, 93%)',
    200: 'hsl(141, 79%, 85%)',
    300: 'hsl(142, 77%, 73%)',
    400: 'hsl(142, 69%, 58%)',
    500: 'hsl(142, 71%, 45%)',
    600: 'hsl(142, 76%, 36%)',
    700: 'hsl(142, 72%, 29%)',
    800: 'hsl(143, 64%, 24%)',
    900: 'hsl(144, 61%, 20%)',
  },
  // Warning/attention
  amber: {
    50: 'hsl(48, 100%, 96%)',
    100: 'hsl(48, 96%, 89%)',
    200: 'hsl(48, 97%, 77%)',
    300: 'hsl(46, 97%, 65%)',
    400: 'hsl(43, 96%, 56%)',
    500: 'hsl(38, 92%, 50%)',
    600: 'hsl(32, 95%, 44%)',
    700: 'hsl(26, 90%, 37%)',
    800: 'hsl(23, 83%, 31%)',
    900: 'hsl(22, 78%, 26%)',
  },
  // Error/danger
  red: {
    50: 'hsl(0, 86%, 97%)',
    100: 'hsl(0, 93%, 94%)',
    200: 'hsl(0, 96%, 89%)',
    300: 'hsl(0, 94%, 82%)',
    400: 'hsl(0, 91%, 71%)',
    500: 'hsl(0, 84%, 60%)',
    600: 'hsl(0, 72%, 51%)',
    700: 'hsl(0, 74%, 42%)',
    800: 'hsl(0, 70%, 35%)',
    900: 'hsl(0, 63%, 31%)',
  },
} as const;

// Semantic color mappings
export const semanticColors = {
  // Surface colors
  background: baseColors.slate[50],
  surface: 'hsl(0, 0%, 100%)',
  surfaceSecondary: baseColors.slate[100],
  surfaceTertiary: baseColors.slate[200],
  
  // Text colors
  textPrimary: baseColors.slate[900],
  textSecondary: baseColors.slate[600],
  textTertiary: baseColors.slate[400],
  textInverse: 'hsl(0, 0%, 100%)',
  
  // Border colors
  border: baseColors.slate[200],
  borderSecondary: baseColors.slate[300],
  borderFocus: baseColors.blue[500],
  
  // Interactive colors
  primary: baseColors.blue[600],
  primaryHover: baseColors.blue[700],
  primaryActive: baseColors.blue[800],
  primaryDisabled: baseColors.slate[300],
  
  // Status colors
  success: baseColors.green[600],
  successLight: baseColors.green[100],
  warning: baseColors.amber[500],
  warningLight: baseColors.amber[100],
  error: baseColors.red[600],
  errorLight: baseColors.red[100],
  info: baseColors.blue[600],
  infoLight: baseColors.blue[100],
  
  // Glass/overlay effects
  glassBackground: 'hsla(0, 0%, 100%, 0.8)',
  glassBorder: 'hsla(0, 0%, 100%, 0.2)',
  backdrop: 'hsla(0, 0%, 0%, 0.5)',
} as const;

// Typography scale
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
  },
} as const;

// Spacing scale (based on 4px grid)
const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
  40: '10rem',   // 160px
  48: '12rem',   // 192px
  56: '14rem',   // 224px
  64: '16rem',   // 256px
} as const;

// Border radius scale
const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// Shadow tokens
const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
} as const;

// Z-index scale
const zIndex = {
  hide: -1,
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
} as const;

// Animation durations and easing
const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Main tokens export
export const tokens = {
  colors: {
    ...baseColors,
    semantic: semanticColors,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  animation,
} as const;

// CSS variable helpers
export function createCssVars(theme: Record<string, any>, prefix = '--'): Record<string, string> {
  const vars: Record<string, string> = {};
  
  function flatten(obj: any, path = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}-${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flatten(value, newPath);
      } else {
        vars[`${prefix}${newPath}`] = String(value);
      }
    }
  }
  
  flatten(theme);
  return vars;
}

// Helper to get a CSS variable with fallback
export function cssVar(name: string, fallback?: string): string {
  const varName = name.startsWith('--') ? name : `--${name}`;
  return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
}

// Utility to create responsive values
export function responsive<T>(values: { base: T; sm?: T; md?: T; lg?: T; xl?: T }): Record<string, T> {
  return {
    base: values.base,
    ...(values.sm && { sm: values.sm }),
    ...(values.md && { md: values.md }),
    ...(values.lg && { lg: values.lg }),
    ...(values.xl && { xl: values.xl }),
  };
}

// Color utility functions
export function alpha(color: string, opacity: number): string {
  const clampedOpacity = clamp(opacity, 0, 1);
  
  // If it's an HSL color, convert to HSLA
  if (color.startsWith('hsl(')) {
    return color.replace('hsl(', 'hsla(').replace(')', `, ${clampedOpacity})`);
  }
  
  // If it's already HSLA, replace the alpha value
  if (color.startsWith('hsla(')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${clampedOpacity})`);
  }
  
  // Default: assume it's a CSS color and wrap with rgba
  return `rgba(${color}, ${clampedOpacity})`;
}

// Type exports for TypeScript users
export type ColorScale = typeof baseColors.blue;
export type SemanticColor = keyof typeof semanticColors;
export type SpacingKey = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
export type ZIndex = keyof typeof zIndex;

/* Example usage:

import { tokens, createCssVars, semanticColors, alpha } from '@/theme'

// Use tokens directly
const buttonStyles = {
  backgroundColor: tokens.colors.semantic.primary,
  padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
  borderRadius: tokens.borderRadius.md,
  boxShadow: tokens.shadows.sm,
}

// Create CSS variables for the root element
const cssVars = createCssVars(tokens.colors.semantic)

// Use alpha utility
const overlayColor = alpha(semanticColors.primary, 0.1)
*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not needed for theme tokens)
// [x] Exports default named component (exports named constants and functions)
// [x] Adds basic ARIA and keyboard handlers (not applicable for theme tokens)
