// filepath: src/theme/index.ts

// ===============================================
// Design Tokens & Theme Configuration
// ===============================================

// Color palette with semantic color mappings
export const colorTokens = {
  // Primary brand colors
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
  
  // Secondary accent colors
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
  
  // Accent/highlight colors
  accent: {
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
  
  // Neutral grayscale
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
  
  // Status colors
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
    950: '#052e16',
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
} as const;

// Semantic color mappings for light and dark themes
export const semanticColors = {
  light: {
    background: colorTokens.neutral[50],
    foreground: colorTokens.neutral[900],
    muted: colorTokens.neutral[100],
    mutedForeground: colorTokens.neutral[500],
    popover: colorTokens.neutral[50],
    popoverForeground: colorTokens.neutral[900],
    card: colorTokens.neutral[50],
    cardForeground: colorTokens.neutral[900],
    border: colorTokens.neutral[200],
    input: colorTokens.neutral[50],
    primary: colorTokens.primary[600],
    primaryForeground: colorTokens.neutral[50],
    secondary: colorTokens.secondary[100],
    secondaryForeground: colorTokens.secondary[900],
    accent: colorTokens.accent[100],
    accentForeground: colorTokens.accent[900],
    destructive: colorTokens.error[500],
    destructiveForeground: colorTokens.neutral[50],
    ring: colorTokens.primary[500],
  },
  dark: {
    background: colorTokens.neutral[900],
    foreground: colorTokens.neutral[50],
    muted: colorTokens.neutral[800],
    mutedForeground: colorTokens.neutral[400],
    popover: colorTokens.neutral[800],
    popoverForeground: colorTokens.neutral[50],
    card: colorTokens.neutral[800],
    cardForeground: colorTokens.neutral[50],
    border: colorTokens.neutral[700],
    input: colorTokens.neutral[800],
    primary: colorTokens.primary[500],
    primaryForeground: colorTokens.neutral[50],
    secondary: colorTokens.secondary[800],
    secondaryForeground: colorTokens.secondary[100],
    accent: colorTokens.accent[800],
    accentForeground: colorTokens.accent[100],
    destructive: colorTokens.error[600],
    destructiveForeground: colorTokens.neutral[50],
    ring: colorTokens.primary[400],
  },
} as const;

// Spacing scale (rem units)
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
} as const;

// Typography scale
export const typography = {
  fontFamily: {
    sans: [
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      '"Noto Sans"',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"',
    ],
    serif: [
      'ui-serif',
      'Georgia',
      'Cambria',
      '"Times New Roman"',
      'Times',
      'serif',
    ],
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      '"SF Mono"',
      'Consolas',
      '"Liberation Mono"',
      'Menlo',
      'monospace',
    ],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },
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
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Border radius scale
export const borderRadius = {
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

// Box shadow scale
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

// Animation/transition tokens
export const transitions = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
    slowest: '750ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Glass morphism effect tokens
export const glassMorphism = {
  backdrop: 'blur(16px)',
  background: 'rgba(255, 255, 255, 0.1)',
  backgroundDark: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderDark: '1px solid rgba(255, 255, 255, 0.1)',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
} as const;

// Gradient presets
export const gradients = {
  primary: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(37 99 235) 100%)',
  secondary: 'linear-gradient(135deg, rgb(168 85 247) 0%, rgb(147 51 234) 100%)',
  accent: 'linear-gradient(135deg, rgb(239 68 68) 0%, rgb(220 38 38) 100%)',
  success: 'linear-gradient(135deg, rgb(34 197 94) 0%, rgb(22 163 74) 100%)',
  warning: 'linear-gradient(135deg, rgb(245 158 11) 0%, rgb(217 119 6) 100%)',
  mesh: 'linear-gradient(135deg, rgba(59 130 246 / 0.8) 0%, rgba(168 85 247 / 0.6) 50%, rgba(239 68 68 / 0.4) 100%)',
  sunset: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #ff6b6b 100%)',
  ocean: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  forest: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1010,
  banner: 1020,
  overlay: 1030,
  modal: 1040,
  popover: 1050,
  skipLink: 1060,
  toast: 1070,
  tooltip: 1080,
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ===============================================
// Theme Token Type Definitions
// ===============================================

export type ColorTokens = typeof colorTokens;
export type SemanticColors = typeof semanticColors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type BorderRadius = typeof borderRadius;
export type BoxShadow = typeof boxShadow;
export type Transitions = typeof transitions;
export type GlassMorphism = typeof glassMorphism;
export type Gradients = typeof gradients;
export type ZIndex = typeof zIndex;
export type Breakpoints = typeof breakpoints;

// Complete theme tokens interface
export interface ThemeTokens {
  colors: ColorTokens;
  semanticColors: SemanticColors;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  boxShadow: BoxShadow;
  transitions: Transitions;
  glassMorphism: GlassMorphism;
  gradients: Gradients;
  zIndex: ZIndex;
  breakpoints: Breakpoints;
}

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme context interface
export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  tokens: ThemeTokens;
}

// ===============================================
// Complete Theme Object
// ===============================================

export const tokens: ThemeTokens = {
  colors: colorTokens,
  semanticColors,
  spacing,
  typography,
  borderRadius,
  boxShadow,
  transitions,
  glassMorphism,
  gradients,
  zIndex,
  breakpoints,
} as const;

// Legacy theme export for backwards compatibility
export const theme = tokens;

// ===============================================
// Theme Utility Functions
// ===============================================

// Get semantic color based on current theme mode
export function getSemanticColor(
  colorName: keyof typeof semanticColors.light,
  mode: 'light' | 'dark' = 'light'
): string {
  return semanticColors[mode][colorName];
}

// Get color with opacity
export function withOpacity(color: string, opacity: number): string {
  // Handle CSS custom property format
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', `rgba(`).replace(')', `, ${opacity})`);
  }
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return color;
}

// Create responsive value object for different breakpoints
export function createResponsiveValue<T>(values: Partial<Record<keyof Breakpoints | 'base', T>>) {
  return values;
}

// Get media query string for breakpoint
export function getMediaQuery(breakpoint: keyof Breakpoints): string {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
}

// Create CSS custom properties from theme tokens
export function createCSSVariables(mode: 'light' | 'dark' = 'light') {
  const colors = semanticColors[mode];
  const variables: Record<string, string> = {};
  
  // Add semantic colors
  Object.entries(colors).forEach(([key, value]) => {
    variables[`--color-${key}`] = value;
  });
  
  // Add color palette
  Object.entries(colorTokens).forEach(([colorName, shades]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        variables[`--color-${colorName}-${shade}`] = value;
      });
    }
  });
  
  // Add other token categories
  Object.entries(spacing).forEach(([key, value]) => {
    variables[`--spacing-${key}`] = value;
  });
  
  Object.entries(borderRadius).forEach(([key, value]) => {
    variables[`--radius-${key}`] = value;
  });
  
  Object.entries(boxShadow).forEach(([key, value]) => {
    variables[`--shadow-${key}`] = value;
  });
  
  return variables;
}

// Export default theme tokens
export default tokens;

/*
Self-Check Comments:
- [x] Uses `@/` imports only (no external imports needed for token definitions)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects - pure token definitions)
- [x] Reads config from `@/app/config` (not applicable for static theme tokens)
- [x] Exports default named component (exports tokens object as default)
- [x] Adds basic ARIA and keyboard handlers (N/A for theme tokens - design tokens only)
*/
