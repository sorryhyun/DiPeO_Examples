/**
 * App Constants
 * 
 * Central location for application-wide constants including API configuration,
 * development mode flags, and endpoint definitions used throughout the app.
 */

// Environment and development configuration
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// API Configuration
export const API_BASE = '/api';

// Development mode flags for feature toggles
export const DEVELOPMENT_MODE = {
  // Enable mock API responses instead of real endpoints
  USE_MOCK_API: IS_DEVELOPMENT,
  
  // Enable debug logging and console outputs
  DEBUG_MODE: IS_DEVELOPMENT,
  
  // Show development tools and debugging info
  SHOW_DEV_TOOLS: IS_DEVELOPMENT,
  
  // Enable experimental features
  EXPERIMENTAL_FEATURES: IS_DEVELOPMENT,
  
  // Skip authentication in development
  SKIP_AUTH: IS_DEVELOPMENT,
} as const;

// Mock API endpoints used by MSW handlers
export const MOCK_ENDPOINTS = [
  '/api/nothing',
  '/api/testimonials',
  '/api/pricing',
  '/api/team',
  '/api/case-studies',
  '/api/newsletter/subscribe',
  '/api/support/chat',
  '/api/analytics/nothing',
  '/api/void/status',
  '/api/user/auth',
  '/api/user/profile',
  '/api/affiliate/stats',
  '/api/roadmap/timeline',
] as const;

// Feature flags for conditional rendering
export const FEATURE_FLAGS = {
  // Enable 3D showcase (heavy dependency)
  ENABLE_3D_SHOWCASE: true,
  
  // Enable sound effects
  ENABLE_SOUND: true,
  
  // Enable animations
  ENABLE_ANIMATIONS: true,
  
  // Enable chat widget
  ENABLE_CHAT_WIDGET: true,
  
  // Enable affiliate program
  ENABLE_AFFILIATE: true,
  
  // Enable A/B testing
  ENABLE_AB_TESTING: IS_PRODUCTION,
} as const;

// Application metadata
export const APP_CONFIG = {
  NAME: 'Absolutely Nothing™',
  VERSION: '1.0.0',
  DESCRIPTION: 'Ultra-Premium Landing Page for Absolutely Nothing™',
  
  // Social media and external links
  SOCIAL_LINKS: {
    TWITTER: 'https://twitter.com/absolutelynothing',
    GITHUB: 'https://github.com/nothing/absolutely-nothing',
    LINKEDIN: 'https://linkedin.com/company/nothing-co',
  },
  
  // Contact information
  CONTACT: {
    EMAIL: 'hello@absolutelynothing.com',
    SUPPORT: 'support@absolutelynothing.com',
  },
} as const;

// Animation and UI constants
export const UI_CONFIG = {
  // Animation durations (in milliseconds)
  ANIMATION_DURATION: {
    FAST: 150,
    MEDIUM: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
  },
  
  // Breakpoints (should match Tailwind config)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  },
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
} as const;

// API timeout and retry configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'absolutelynothing_auth_token',
  USER_PREFERENCES: 'absolutelynothing_user_prefs',
  THEME: 'absolutelynothing_theme',
  ONBOARDING_COMPLETE: 'absolutelynothing_onboarding',
  ANALYTICS_ID: 'absolutelynothing_analytics_id',
} as const;

// Error messages and status codes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Type exports for better TypeScript support
export type MockEndpoint = typeof MOCK_ENDPOINTS[number];
export type FeatureFlag = keyof typeof FEATURE_FLAGS;
export type StorageKey = keyof typeof STORAGE_KEYS;
export type ErrorMessage = keyof typeof ERROR_MESSAGES;
