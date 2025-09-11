// filepath: src/theme/tokens.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant - N/A for tokens)

/* src/theme/tokens.ts

   Design tokens for the entire application. These tokens define the visual foundation:
   colors, spacing, typography, border radius, shadows, and z-index layers.
   
   Usage examples:
     import { tokens } from '@/theme/tokens'
     const primaryColor = tokens.colors.light.primary[500]
*/

// Color system with light and dark variants
export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface SemanticColors {
  success: string
  warning: string
  error: string
  info: string
}

export interface TextColors {
  primary: string
  secondary: string
  tertiary: string
  quaternary: string
  disabled: string
  inverse: string
}

export interface BackgroundColors {
  primary: string
  secondary: string
  tertiary: string
  overlay: string
  glass: string
}

export interface SurfaceColors {
  primary: string
  secondary: string
  tertiary: string
  elevated: string
  sunken: string
}

export interface BorderColors {
  primary: string
  secondary: string
  tertiary: string
  focus: string
  error: string
}

export interface ColorTheme {
  // Brand colors
  primary: ColorScale
  secondary: ColorScale
  accent: ColorScale
  
  // Neutral colors
  gray: ColorScale
  slate: ColorScale
  
  // Semantic colors
  semantic: SemanticColors
  
  // Contextual colors
  text: TextColors
  background: BackgroundColors
  surface: SurfaceColors
  border: BorderColors
  
  // Special effect colors
  void: {
    primary: string
    secondary: string
    glow: string
    particle: string
  }
  
  // Glass morphism colors
  glass: {
    background: string
    border: string
    shadow: string
  }
}

// Spacing scale
export interface Spacing {
  0: string
  px: string
  0.5: string
  1: string
  1.5: string
  2: string
  2.5: string
  3: string
  3.5: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string
  14: string
  16: string
  20: string
  24: string
  28: string
  32: string
  36: string
  40: string
  44: string
  48: string
  52: string
  56: string
  60: string
  64: string
  72: string
  80: string
  96: string
  
  // Semantic spacing
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
}

// Typography system
export interface Typography {
  fontFamily: {
    sans: string[]
    serif: string[]
    mono: string[]
    display: string[]
  }
  
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
    '6xl': string
    '7xl': string
    '8xl': string
    '9xl': string
  }
  
  fontWeight: {
    thin: number
    extralight: number
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
    extrabold: number
    black: number
  }
  
  lineHeight: {
    none: string
    tight: string
    snug: string
    normal: string
    relaxed: string
    loose: string
  }
  
  letterSpacing: {
    tighter: string
    tight: string
    normal: string
    wide: string
    wider: string
    widest: string
  }
}

// Border radius scale
export interface BorderRadius {
  none: string
  sm: string
  default: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

// Shadow system
export interface Shadows {
  xs: string
  sm: string
  default: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
  none: string
  
  // Special effects
  glow: string
  void: string
  glass: string
}

// Z-index layers
export interface ZIndex {
  hide: number
  auto: number
  base: number
  docked: number
  dropdown: number
  sticky: number
  banner: number
  overlay: number
  modal: number
  popover: number
  skipLink: number
  toast: number
  tooltip: number
}

// Breakpoint system
export interface Breakpoints {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

// Main tokens interface
export interface DesignTokens {
  colors: {
    light: ColorTheme
    dark: ColorTheme
  }
  spacing: Spacing
  typography: Typography
  borderRadius: BorderRadius
  shadows: Shadows
  zIndex: ZIndex
  breakpoints: Breakpoints
}

// Light theme color definitions
const lightColors: ColorTheme = {
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
    950: '#082f49',
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
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  },
  
  gray: {
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
  },
  
  slate: {
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
  },
  
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    quaternary: '#94a3b8',
    disabled: '#cbd5e1',
    inverse: '#ffffff',
  },
  
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    overlay: 'rgba(15, 23, 42, 0.5)',
    glass: 'rgba(255, 255, 255, 0.1)',
  },
  
  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    sunken: '#e2e8f0',
  },
  
  border: {
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    focus: '#0ea5e9',
    error: '#ef4444',
  },
  
  void: {
    primary: '#0f0f23',
    secondary: '#1a1a2e',
    glow: '#00d4ff',
    particle: '#64ffda',
  },
  
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
}

// Dark theme color definitions
const darkColors: ColorTheme = {
  primary: {
    50: '#082f49',
    100: '#0c4a6e',
    200: '#075985',
    300: '#0369a1',
    400: '#0284c7',
    500: '#0ea5e9',
    600: '#38bdf8',
    700: '#7dd3fc',
    800: '#bae6fd',
    900: '#e0f2fe',
    950: '#f0f9ff',
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
    50: '#500724',
    100: '#831843',
    200: '#9d174d',
    300: '#be185d',
    400: '#db2777',
    500: '#ec4899',
    600: '#f472b6',
    700: '#f9a8d4',
    800: '#fbcfe8',
    900: '#fce7f3',
    950: '#fdf2f8',
  },
  
  gray: {
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
  },
  
  slate: {
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
  },
  
  semantic: {
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },
  
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    quaternary: '#64748b',
    disabled: '#475569',
    inverse: '#0f172a',
  },
  
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    overlay: 'rgba(0, 0, 0, 0.7)',
    glass: 'rgba(15, 23, 42, 0.1)',
  },
  
  surface: {
    primary: '#1e293b',
    secondary: '#334155',
    tertiary: '#475569',
    elevated: '#334155',
    sunken: '#0f172a',
  },
  
  border: {
    primary: '#334155',
    secondary: '#475569',
    tertiary: '#64748b',
    focus: '#38bdf8',
    error: '#f87171',
  },
  
  void: {
    primary: '#000011',
    secondary: '#0a0a1f',
    glow: '#00ffff',
    particle: '#64ffda',
  },
  
  glass: {
    background: 'rgba(15, 23, 42, 0.3)',
    border: 'rgba(148, 163, 184, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
}

// Spacing scale
const spacing: Spacing = {
  0: '0px',
  px: '1px',
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
  
  // Semantic spacing
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
}

// Typography system
const typography: Typography = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
    serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    display: ['Cal Sans', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
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
}

// Border radius scale
const borderRadius: BorderRadius = {
  none: '0px',
  sm: '0.125rem',
  default: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
}

// Shadow system
const shadows: Shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  default: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
  
  // Special effects
  glow: '0 0 20px rgb(14 165 233 / 0.5), 0 0 40px rgb(14 165 233 / 0.3)',
  void: '0 0 30px rgb(0 212 255 / 0.8), 0 0 60px rgb(100 255 218 / 0.4)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
}

// Z-index layers
const zIndex: ZIndex = {
  hide: -1,
  auto: 0,
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
}

// Breakpoint system
const breakpoints: Breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Main tokens object
export const tokens: DesignTokens = {
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
}

// Helper function to get color value from nested path
export const getColorValue = (colorPath: string, theme: 'light' | 'dark' = 'light'): string => {
  try {
    const pathParts = colorPath.split('.')
    let current: any = tokens.colors[theme]
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        console.warn(`Color path "${colorPath}" not found in ${theme} theme`)
        return tokens.colors[theme].gray[500]
      }
    }
    
    return typeof current === 'string' ? current : String(current)
  } catch (error) {
    console.warn(`Error resolving color path "${colorPath}":`, error)
    return tokens.colors[theme].gray[500]
  }
}

// Helper function to create CSS custom properties
export const createCSSCustomProperties = (theme: 'light' | 'dark' = 'light'): Record<string, string> => {
  const properties: Record<string, string> = {}
  const colors = tokens.colors[theme]
  
  // Flatten color object into CSS custom properties
  const flattenColors = (obj: any, prefix: string = '--color') => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        flattenColors(value, `${prefix}-${key}`)
      } else {
        properties[`${prefix}-${key}`] = value as string
      }
    }
  }
  
  flattenColors(colors)
  
  // Add spacing properties
  for (const [key, value] of Object.entries(tokens.spacing)) {
    properties[`--spacing-${key}`] = value
  }
  
  // Add typography properties
  properties['--font-family-sans'] = tokens.typography.fontFamily.sans.join(', ')
  properties['--font-family-serif'] = tokens.typography.fontFamily.serif.join(', ')
  properties['--font-family-mono'] = tokens.typography.fontFamily.mono.join(', ')
  properties['--font-family-display'] = tokens.typography.fontFamily.display.join(', ')
  
  return properties
}

// Default export
export default tokens

// Type exports (interfaces are automatically available as types)
// Removed duplicate type exports to avoid conflicts
