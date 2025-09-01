// filepath: src/theme/index.ts
import type { User, UserRole } from '@/core/contracts';

// =============================================================================
// Color System
// =============================================================================

export interface ColorTokens {
  // Brand colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Semantic colors
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  error: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  info: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Neutral grays
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Healthcare-specific colors
  medical: {
    emergency: string;
    critical: string;
    stable: string;
    discharged: string;
  };
  
  // Role-based colors
  roles: {
    admin: string;
    doctor: string;
    nurse: string;
    patient: string;
    receptionist: string;
    lab: string;
  };
}

export const colorTokens: ColorTokens = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  medical: {
    emergency: '#dc2626', // red-600
    critical: '#f59e0b',   // amber-500
    stable: '#22c55e',     // green-500
    discharged: '#6b7280', // gray-500
  },
  roles: {
    admin: '#7c3aed',      // violet-600
    doctor: '#0ea5e9',     // sky-500
    nurse: '#10b981',      // emerald-500
    patient: '#f59e0b',    // amber-500
    receptionist: '#ec4899', // pink-500
    lab: '#8b5cf6',        // violet-500
  },
};

// =============================================================================
// Typography System
// =============================================================================

export interface Typography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeight: {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeight: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export const typography: Typography = {
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'Noto Sans',
      'sans-serif',
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol',
      'Noto Color Emoji',
    ],
    serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
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
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// =============================================================================
// Spacing System
// =============================================================================

export interface Spacing {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export const spacing: Spacing = {
  0: '0px',
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
  72: '18rem',   // 288px
  80: '20rem',   // 320px
  96: '24rem',   // 384px
};

// =============================================================================
// Border Radius System
// =============================================================================

export interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export const borderRadius: BorderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// =============================================================================
// Shadow System
// =============================================================================

export interface Shadows {
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export const shadows: Shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '2xl': '0 50px 100px -20px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

// =============================================================================
// Z-Index System
// =============================================================================

export interface ZIndex {
  auto: string;
  0: number;
  10: number;
  20: number;
  30: number;
  40: number;
  50: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

export const zIndex: ZIndex = {
  auto: 'auto',
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  modal: 1000,
  popover: 1010,
  tooltip: 1020,
  toast: 1030,
};

// =============================================================================
// Breakpoints System
// =============================================================================

export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export const breakpoints: Breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// =============================================================================
// Theme Object
// =============================================================================

export interface ThemeTokens {
  colors: ColorTokens;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  zIndex: ZIndex;
  breakpoints: Breakpoints;
}

export const theme: ThemeTokens = {
  colors: colorTokens,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get color for a specific user role
 */
export const getRoleColor = (role: UserRole): string => {
  return theme.colors.roles[role] || theme.colors.gray[500];
};

/**
 * Get color for user based on their primary role
 */
export const getUserColor = (user: User): string => {
  if ('type' in user && user.type) {
    return getRoleColor(user.type as UserRole);
  }
  // Fallback to first role if no specific type
  return user.roles.length > 0 ? getRoleColor(user.roles[0]) : theme.colors.gray[500];
};

/**
 * Get medical status color
 */
export const getMedicalStatusColor = (status: 'emergency' | 'critical' | 'stable' | 'discharged'): string => {
  return theme.colors.medical[status];
};

/**
 * Create CSS custom properties for theme tokens
 */
export const createCSSVariables = (tokens: Partial<ThemeTokens>): Record<string, string> => {
  const variables: Record<string, string> = {};
  
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([colorName, colorValues]) => {
      if (typeof colorValues === 'object') {
        Object.entries(colorValues).forEach(([shade, value]) => {
          variables[`--color-${colorName}-${shade}`] = value;
        });
      }
    });
  }
  
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value;
    });
  }
  
  if (tokens.borderRadius) {
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      variables[`--radius-${key}`] = value;
    });
  }
  
  return variables;
};

/**
 * Create responsive breakpoint helpers
 */
export const mediaQuery = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};

/**
 * Get contrasting text color for a background
 */
export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - in a real app you might use a more sophisticated algorithm
  const isLight = backgroundColor.includes('50') || backgroundColor.includes('100') || backgroundColor.includes('200');
  return isLight ? theme.colors.gray[900] : theme.colors.gray[50];
};

/**
 * Create focus ring styles for accessibility
 */
export const focusRing = {
  default: `
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px ${theme.colors.primary[500]};
  `,
  error: `
    outline: 2px solid transparent;
outline-offset: 2px;
    box-shadow: 0 0 0 2px ${theme.colors.error[500]};
  `,
  success: `
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px ${theme.colors.success[500]};
  `,
};

// Default export for convenience
export default theme;

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (not applicable for theme tokens file)
- [x] Reads config from `@/app/config` (not needed for theme tokens)
- [x] Exports default named component (exports theme object and types)
- [x] Adds basic ARIA and keyboard handlers (provides focusRing utilities for accessibility)
- [x] Provides comprehensive design system with colors, typography, spacing
- [x] Includes healthcare-specific color tokens for medical status and user roles
- [x] Provides utility functions for role colors and medical status colors
- [x] Includes responsive breakpoint helpers
- [x] Provides CSS custom properties generation utility
- [x] Includes accessibility helpers like focus ring styles
*/
