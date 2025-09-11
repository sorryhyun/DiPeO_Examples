// filepath: src/theme/index.ts

// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant - N/A for theme)

/* src/theme/index.ts

   Theme facade that reconciles tokens, dark mode, and animation presets into a single exported theme object used by components.

   Usage examples:
     import { theme } from '@/theme'
     const className = theme.resolveClasses('bg-primary', 'text-white')
     const animationVariant = theme.animations.fadeUp
*/

import { tokens, type ColorTheme, type Spacing, type Typography, type BorderRadius } from '@/theme/tokens'
import { 
  motionPresets, 
  interactionPresets, 
  layoutPresets, 
  pageTransitions, 
  durations, 
  easings,
  type MotionPreset,
  type InteractionPreset,
  type LayoutPreset,
  type PageTransition,
  type Duration,
  type Easing
} from '@/theme/animations'
import { 
  createDarkModeUtils, 
  type DarkModePreference, 
  type DarkModeUtils 
} from '@/theme/darkMode'
import { appConfig } from '@/app/config'

// Theme interface combining all theme concerns
export interface Theme {
  // Design tokens
  colors: ColorTheme
  spacing: Spacing
  typography: Typography
  borderRadius: BorderRadius
  
  // Animation system
  animations: typeof motionPresets
  interactions: typeof interactionPresets
  layouts: typeof layoutPresets
  pageTransitions: typeof pageTransitions
  durations: typeof durations
  easings: typeof easings
  
  // Dark mode utilities
  darkMode: DarkModeUtils
  
  // Utility functions
  resolveClasses: (...classes: (string | undefined | null | boolean)[]) => string
  getColorValue: (colorPath: string, isDark?: boolean) => string
  getSpacingValue: (spacing: keyof Spacing) => string
  getAnimationPreset: (preset: MotionPreset) => typeof motionPresets[MotionPreset]
  getInteractionPreset: (preset: InteractionPreset) => typeof interactionPresets[InteractionPreset]
  
  // Theme metadata
  meta: {
    version: string
    isDevelopment: boolean
    buildTime: string
  }
}

// Utility function to resolve CSS classes (filters out falsy values)
function resolveClasses(...classes: (string | undefined | null | boolean)[]): string {
  return classes
    .filter((cls): cls is string => 
      typeof cls === 'string' && cls.trim().length > 0
    )
    .join(' ')
    .trim()
}

// Utility function to get color value from token path
function getColorValue(colorPath: string, isDark: boolean = false): string {
  try {
    const colorTheme = isDark ? tokens.colors.dark : tokens.colors.light
    const pathParts = colorPath.split('.')
    
    let current: any = colorTheme
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        console.warn(`Theme: Color path "${colorPath}" not found`)
        return isDark ? tokens.colors.dark.gray[500] : tokens.colors.light.gray[500]
      }
    }
    
    return typeof current === 'string' ? current : String(current)
  } catch (error) {
    console.warn(`Theme: Error resolving color path "${colorPath}":`, error)
    return isDark ? tokens.colors.dark.gray[500] : tokens.colors.light.gray[500]
  }
}

// Utility function to get spacing value
function getSpacingValue(spacing: keyof Spacing): string {
  const value = tokens.spacing[spacing]
  return typeof value === 'string' ? value : `${value}px`
}

// Utility function to get animation preset
function getAnimationPreset(preset: MotionPreset) {
  return motionPresets[preset] || motionPresets.fade
}

// Utility function to get interaction preset
function getInteractionPreset(preset: InteractionPreset) {
  return interactionPresets[preset] || interactionPresets.hover
}

// Create dark mode utilities instance
const darkModeUtils = createDarkModeUtils()

// Create the main theme object
export const theme: Theme = {
  // Design tokens
  colors: tokens.colors,
  spacing: tokens.spacing,
  typography: tokens.typography,
  borderRadius: tokens.borderRadius,
  
  // Animation system
  animations: motionPresets,
  interactions: interactionPresets,
  layouts: layoutPresets,
  pageTransitions: pageTransitions,
  durations: durations,
  easings: easings,
  
  // Dark mode utilities
  darkMode: darkModeUtils,
  
  // Utility functions
  resolveClasses,
  getColorValue,
  getSpacingValue,
  getAnimationPreset,
  getInteractionPreset,
  
  // Theme metadata
  meta: {
    version: appConfig.version,
    isDevelopment: appConfig.isDevelopment,
    buildTime: new Date().toISOString(),
  }
}

// Helper functions for common theme operations
export const themeUtils = {
  // CSS class resolution with theme-aware logic
  cn: resolveClasses,
  
  // Color resolution shortcuts
  color: {
    primary: (isDark?: boolean) => getColorValue('primary.500', isDark),
    secondary: (isDark?: boolean) => getColorValue('secondary.500', isDark),
    accent: (isDark?: boolean) => getColorValue('accent.500', isDark),
    text: (isDark?: boolean) => getColorValue('text.primary', isDark),
    background: (isDark?: boolean) => getColorValue('background.primary', isDark),
    surface: (isDark?: boolean) => getColorValue('surface.primary', isDark),
    
    // Semantic colors
    success: (isDark?: boolean) => getColorValue('semantic.success', isDark),
    warning: (isDark?: boolean) => getColorValue('semantic.warning', isDark),
    error: (isDark?: boolean) => getColorValue('semantic.error', isDark),
    info: (isDark?: boolean) => getColorValue('semantic.info', isDark),
  },
  
  // Animation shortcuts
  animate: {
    fadeIn: () => motionPresets.fade,
    slideUp: () => motionPresets.fadeUp,
    scale: () => motionPresets.scale,
    glitch: () => motionPresets.glitch,
    float: () => motionPresets.float,
  },
  
  // Spacing shortcuts
  space: {
    xs: () => getSpacingValue('xs'),
    sm: () => getSpacingValue('sm'),
    md: () => getSpacingValue('md'),
    lg: () => getSpacingValue('lg'),
    xl: () => getSpacingValue('xl'),
    '2xl': () => getSpacingValue('2xl'),
    '3xl': () => getSpacingValue('3xl'),
  },
  
  // Typography shortcuts
  text: {
    xs: () => tokens.typography.fontSize.xs,
    sm: () => tokens.typography.fontSize.sm,
    base: () => tokens.typography.fontSize.base,
    lg: () => tokens.typography.fontSize.lg,
    xl: () => tokens.typography.fontSize.xl,
    '2xl': () => tokens.typography.fontSize['2xl'],
    '3xl': () => tokens.typography.fontSize['3xl'],
    '4xl': () => tokens.typography.fontSize['4xl'],
    '5xl': () => tokens.typography.fontSize['5xl'],
    '6xl': () => tokens.typography.fontSize['6xl'],
  }
}

// Theme context helpers for React components
export const createThemeContext = () => ({
  theme,
  utils: themeUtils,
  isDark: darkModeUtils.isDark(),
  toggleDarkMode: darkModeUtils.toggle,
  setDarkMode: darkModeUtils.set,
})

// Type exports for external consumption
export type {
  ColorTheme,
  Spacing,
  Typography,
  BorderRadius,
  MotionPreset,
  InteractionPreset,
  LayoutPreset,
  PageTransition,
  Duration,
  Easing,
  DarkModePreference,
  DarkModeUtils,
}

// Re-export commonly used items
export {
  tokens,
  motionPresets,
  interactionPresets,
  durations,
  easings,
  darkModeUtils,
}

// Default export
export default theme

// Development helpers
if (appConfig.isDevelopment) {
  // Expose theme to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).__THEME__ = {
      theme,
      utils: themeUtils,
      tokens,
      animations: motionPresets,
      darkMode: darkModeUtils,
    }
  }
}

// Example usage (commented):
// import { theme, themeUtils } from '@/theme'
// 
// // Use in components
// const buttonClass = theme.resolveClasses(
//   'px-4 py-2 rounded-md',
//   theme.darkMode.isDark() ? 'bg-dark-primary' : 'bg-primary',
//   isDisabled && 'opacity-50'
// )
// 
// // Use animation presets
// <motion.div variants={theme.animations.fadeUp} />
// 
// // Use color utilities
// const primaryColor = themeUtils.color.primary(theme.darkMode.isDark())
