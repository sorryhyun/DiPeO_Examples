// filepath: src/theme/index.ts

// ============================================================================
// THEME TOKENS & DESIGN SYSTEM
// ============================================================================

/**
 * Color palette with semantic naming and dark/light mode support
 */
export interface ColorTokens {
  // Primary brand colors
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
    950: string;
  };
  
  // Secondary colors
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
    950: string;
  };
  
  // Accent colors
  accent: {
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
    950: string;
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
    950: string;
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
    950: string;
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
    950: string;
  };
  
  // Neutral colors (grayscale)
  neutral: {
    0: string;
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
    1000: string;
  };
  
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
    glass: string;
    inverse: string;
  };
  
  // Surface colors
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    sunken: string;
    overlay: string;
    glass: string;
    inverse: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    inverse: string;
    disabled: string;
    placeholder: string;
    accent: string;
  };
  
  // Border colors
  border: {
    primary: string;
    secondary: string;
    tertiary: string;
    focus: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    glass: string;
  };
}

/**
 * Spacing scale for consistent layout
 */
export interface SpacingTokens {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

/**
 * Typography scale and font families
 */
export interface TypographyTokens {
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
    '7xl': string;
    '8xl': string;
    '9xl': string;
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

/**
 * Border radius tokens
 */
export interface RadiusTokens {
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

/**
 * Shadow tokens for depth
 */
export interface ShadowTokens {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  glass: string;
  'glass-lg': string;
  'glass-xl': string;
}

/**
 * Z-index tokens for layering
 */
export interface ZIndexTokens {
  auto: string;
  0: number;
  10: number;
  20: number;
  30: number;
  40: number;
  50: number;
  dropdown: number;
  sticky: number;
  fixed: number;
  modalBackdrop: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
  max: number;
}

/**
 * Transition and animation tokens
 */
export interface TransitionTokens {
  duration: {
    instant: string;
    fast: string;
    normal: string;
    slow: string;
    slower: string;
    slowest: string;
  };
  
  timing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    smooth: string;
    snappy: string;
    gentle: string;
    sharp: string;
    bounce: string;
    elastic: string;
  };
}

/**
 * Breakpoint tokens for responsive design
 */
export interface BreakpointTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * Complete theme tokens interface
 */
export interface ThemeTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  zIndex: ZIndexTokens;
  transitions: TransitionTokens;
  breakpoints: BreakpointTokens;
}

// ============================================================================
// THEME IMPLEMENTATIONS
// ============================================================================

/**
 * Light theme color palette
 */
const lightColors: ColorTokens = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  
  accent: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900:'#064e3b',
    950: '#022c22',
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
    950: '#451a03',
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
    950: '#450a0a',
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
    1000: '#000000',
  },
  
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    overlay: 'rgba(255, 255, 255, 0.95)',
    glass: 'rgba(255, 255, 255, 0.1)',
    inverse: '#0f172a',
  },
  
  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    sunken: '#e2e8f0',
    overlay: 'rgba(255, 255, 255, 0.95)',
    glass: 'rgba(255, 255, 255, 0.2)',
    inverse: '#1e293b',
  },
  
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    quaternary: '#94a3b8',
    inverse: '#ffffff',
    disabled: '#cbd5e1',
    placeholder: '#94a3b8',
    accent: '#3b82f6',
  },
  
  border: {
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    focus: '#3b82f6',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    glass: 'rgba(255, 255, 255, 0.2)',
  },
};

/**
 * Dark theme color palette
 */
const darkColors: ColorTokens = {
  primary: {
    50: '#172554',
    100: '#1e3a8a',
    200: '#1e40af',
    300: '#1d4ed8',
    400: '#2563eb',
    500: '#3b82f6',
    600: '#60a5fa',
    700: '#93c5fd',
    800: '#bfdbfe',
    900: '#dbeafe',
    950: '#eff6ff',
  },
  
  secondary: {
    50: '#3b0764',
    100: '#581c87',
    200: '#6b21a8',
    300: '#7c3aed',
    400: '#9333ea',
    500: '#a855f7',
    600: '#c084fc',
    700: '#d8b4fe',
    800: '#e9d5ff',
    900: '#f3e8ff',
    950: '#faf5ff',
  },
  
  accent: {
    50: '#083344',
    100: '#164e63',
    200: '#155e75',
    300: '#0e7490',
    400: '#0891b2',
    500: '#06b6d4',
    600: '#22d3ee',
    700: '#67e8f9',
    800: '#a5f3fc',
    900: '#cffafe',
    950: '#ecfeff',
  },
  
  success: {
    50: '#022c22',
    100: '#064e3b',
    200: '#065f46',
    300: '#047857',
    400: '#059669',
    500: '#10b981',
    600: '#34d399',
    700: '#6ee7b7',
    800: '#a7f3d0',
    900: '#d1fae5',
    950: '#ecfdf5',
  },
  
  warning: {
    50: '#451a03',
    100: '#78350f',
    200: '#92400e',
    300: '#b45309',
    400: '#d97706',
    500: '#f59e0b',
    600: '#fbbf24',
    700: '#fcd34d',
    800: '#fde68a',
    900: '#fef3c7',
    950: '#fffbeb',
  },
  
  error: {
    50: '#450a0a',
    100: '#7f1d1d',
    200: '#991b1b',
    300: '#b91c1c',
    400: '#dc2626',
    500: '#ef4444',
    600: '#f87171',
    700: '#fca5a5',
    800: '#fecaca',
    900: '#fee2e2',
    950: '#fef2f2',
  },
  
  info: {
    50: '#172554',
    100: '#1e3a8a',
    200: '#1e40af',
    300: '#1d4ed8',
    400: '#2563eb',
    500: '#3b82f6',
    600: '#60a5fa',
    700: '#93c5fd',
    800: '#bfdbfe',
    900: '#dbeafe',
    950: '#eff6ff',
  },
  
  neutral: {
    0: '#000000',
    50: '#020617',
    100: '#0f172a',
    200: '#1e293b',
    300: '#334155',
    400: '#475569',
    500: '#64748b',
    600: '#94a3b8',
    700: '#cbd5e1',
    800: '#e2e8f0',
    900: '#f1f5f9',
    950: '#f8fafc',
    1000: '#ffffff',
  },
  
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    elevated: '#1e293b',
    overlay: 'rgba(15, 23, 42, 0.95)',
    glass: 'rgba(30, 41, 59, 0.3)',
    inverse: '#ffffff',
  },
  
  surface: {
    primary: '#1e293b',
    secondary: '#334155',
    tertiary: '#475569',
    elevated: '#334155',
    sunken: '#0f172a',
    overlay: 'rgba(30, 41, 59, 0.95)',
    glass: 'rgba(148, 163, 184, 0.1)',
    inverse: '#f8fafc',
  },
  
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    quaternary: '#64748b',
    inverse: '#0f172a',
    disabled: '#475569',
    placeholder: '#64748b',
    accent: '#60a5fa',
  },
  
  border: {
    primary: '#334155',
    secondary: '#475569',
    tertiary: '#64748b',
    focus: '#60a5fa',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    info: '#60a5fa',
    glass: 'rgba(148, 163, 184, 0.2)',
  },
};

/**
 * Spacing scale (rem-based)
 */
const spacing: SpacingTokens = {
  0: '0rem',
  px: '0.0625rem',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

/**
 * Typography tokens
 */
const typography: TypographyTokens = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    serif: ['Georgia', 'Times New Roman', 'serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', 'monospace'],
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
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

/**
 * Border radius tokens
 */
const radius: RadiusTokens = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

/**
 * Shadow tokens
 */
const shadows: ShadowTokens = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  'glass-lg': '0 15px 35px rgba(31, 38, 135, 0.2)',
  'glass-xl': '0 25px 50px rgba(31, 38, 135, 0.15)',
};

/**
 * Z-index tokens
 */
const zIndex: ZIndexTokens = {
  auto: 'auto',
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  max: 2147483647,
};

/**
 * Transition tokens
 */
const transitions: TransitionTokens = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
    slowest: '1000ms',
  },
  
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    snappy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

/**
 * Breakpoint tokens
 */
const breakpoints: BreakpointTokens = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// THEME OBJECTS
// ============================================================================

/**
 * Light theme tokens
 */
export const lightTheme: ThemeTokens = {
  colors: lightColors,
  spacing,
  typography,
  radius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
};

/**
 * Dark theme tokens
 */
export const darkTheme: ThemeTokens = {
  colors: darkColors,
  spacing,
  typography,
  radius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
};

/**
 * Default theme (light)
 */
export const theme = lightTheme;

/**
 * All available themes
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

/**
 * Theme mode type
 */
export type ThemeMode = keyof typeof themes;

/**
 * Tokens alias for backward compatibility
 */
export const tokens = theme;

// ============================================================================
// THEME UTILITIES
// ============================================================================

/**
 * Get theme by mode
 */
export function getTheme(mode: ThemeMode): ThemeTokens {
  return themes[mode] || lightTheme;
}

/**
 * Get the opposite theme mode
 */
export function getOppositeMode(mode: ThemeMode): ThemeMode {
  return mode === 'light' ? 'dark' : 'light';
}

/**
 * Check if a color value is light or dark
 */
export function isLightColor(color: string): boolean {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate brightness using YIQ formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128;
}

/**
 * Get contrast color (white or black) for a given background color
 */
export function getContrastColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#ffffff';
}

/**
 * Create CSS custom properties from theme tokens
 */
export function createCSSVariables(tokens: ThemeTokens): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Flatten color tokens
  Object.entries(tokens.colors).forEach(([category, colors]) => {
    if (typeof colors === 'string') {
      variables[`--color-${category}`] = colors;
    } else if (typeof colors === 'object' && colors !== null) {
      Object.entries(colors).forEach(([shade, value]) => {
        if (typeof value === 'string') {
          variables[`--color-${category}-${shade}`] = value;
        }
      });
    }
  });
  
  // Flatten spacing tokens
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    variables[`--spacing-${key}`] = value;
  });
  
  // Flatten typography tokens
  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    variables[`--text-${key}`] = value;
  });
  
  Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
    variables[`--font-weight-${key}`] = value.toString();
  });
  
  Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
    variables[`--leading-${key}`] = value.toString();
  });
  
  // Flatten radius tokens
  Object.entries(tokens.radius).forEach(([key, value]) => {
    variables[`--radius-${key}`] = value;
  });
  
  // Flatten shadow tokens
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    variables[`--shadow-${key}`] = value;
  });
  
  // Flatten z-index tokens
  Object.entries(tokens.zIndex).forEach(([key, value]) => {
    variables[`--z-${key}`] = value.toString();
  });
  
  // Flatten transition tokens
  Object.entries(tokens.transitions.duration).forEach(([key, value]) => {
    variables[`--duration-${key}`] = value;
  });
  
  Object.entries(tokens.transitions.timing).forEach(([key, value]) => {
    variables[`--timing-${key}`] = value;
  });
  
  return variables;
}

// Default exports
export default theme;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - No external imports needed for theme tokens
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure theme token definitions
// [x] Reads config from `@/app/config` - Not applicable for theme tokens
// [x] Exports default named component - Exports theme as default and comprehensive named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for theme tokens, but includes accessibility considerations in color contrast utilities
