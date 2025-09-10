// filepath: src/app/config.ts

import { Role } from '@/core/contracts';

// ============================================================================
// App Configuration
// ============================================================================

export interface AppConfig {
  appName: string;
  env: 'development' | 'staging' | 'production' | string;
  isDevelopment: boolean;
  apiBaseUrl: string;
  socketUrl?: string | null;
  featureFlags: Record<string, boolean>;
  features: string[];
  buildTimestamp?: string;
  dev: {
    enableMockData: boolean;
    mockUser?: {
      id: string;
      name: string;
      email: string;
      roles: readonly Role[];
      createdAt: string;
      updatedAt: string;
    } | null;
  };
}

// Environment variable reading with safe fallbacks
const env = (import.meta.env.MODE as string) || 'development';
const isDevelopment = env === 'development';

// Parse feature flags from comma-separated string
const rawFeatures = (import.meta.env.VITE_FEATURES as string) || '';
const features = rawFeatures
  .split(',')
  .map(f => f.trim())
  .filter(Boolean);

const featureFlags = features.reduce((acc, feature) => {
  acc[feature] = true;
  return acc;
}, {} as Record<string, boolean>);

// API configuration
const rawApiBase = import.meta.env.VITE_API_BASE as string | undefined;
const apiBaseUrl = rawApiBase || `${window.location.origin}/api`;

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
const socketUrl = rawSocketUrl || null;

// Development configuration
const enableMockData = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';
const shouldUseMockData = enableMockData && isDevelopment;

const mockUser = shouldUseMockData ? {
  id: 'mock-user-1',
  name: 'Dr. Jane Smith',
  email: 'jane.smith@example.com',
  roles: ['doctor' as Role],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
} : null;

// Main configuration object
export const config: AppConfig = {
  appName: (import.meta.env.VITE_APP_NAME as string) || 'Healthcare App',
  env,
  isDevelopment,
  apiBaseUrl,
  socketUrl,
  featureFlags,
  features,
  buildTimestamp: import.meta.env.VITE_BUILD_TS as string | undefined,
  dev: {
    enableMockData,
    mockUser
  }
};

// Re-export computed flags for convenience
export { isDevelopment, shouldUseMockData };

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(name: string): boolean {
  return config.featureFlags[name] === true;
}

/**
 * Get the mock user for development
 */
export function getMockUser() {
  return config.dev.mockUser;
}

/**
 * Get the full API URL for an endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = config.apiBaseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${cleanEndpoint}`;
}

// Default export for convenience
export default config;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - No external imports needed for config
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Only reads window.location.origin as fallback
// [x] Reads config from `@/app/config` - This IS the config file
// [x] Exports default named component - Exports config object and helper functions
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for config file
