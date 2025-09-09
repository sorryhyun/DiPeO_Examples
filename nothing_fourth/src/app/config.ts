// filepath: src/app/config.ts

// AppConfig type definition
export interface AppConfig {
  appName: string;
  env: 'development' | 'staging' | 'production' | string;
  isDevelopment: boolean;
  apiBaseUrl: string;
  socketUrl?: string | null;
  featureFlags: Record<string, boolean>;
  features: string[]; // canonical list of feature toggles
  buildTimestamp?: string;
  dev: {
    enableMockData: boolean;
    mockUser?: {
      id: string;
      name: string;
      email: string;
      role: string;
    } | null;
  };
}

// Parse feature flags from comma-separated string
const parseFeatures = (featuresString?: string): string[] => {
  if (!featuresString) return [];
  return featuresString
    .split(',')
    .map(f => f.trim())
    .filter(Boolean);
};

// Create feature flags object from features array
const createFeatureFlags = (features: string[]): Record<string, boolean> => {
  return features.reduce((flags, feature) => {
    flags[feature] = true;
    return flags;
  }, {} as Record<string, boolean>);
};

// Materialize configuration from environment variables
const features = parseFeatures(import.meta.env.VITE_FEATURES as string);
const env = (import.meta.env.MODE || 'development') as string;
const isDevelopment = env === 'development';

export const config: AppConfig = {
  appName: (import.meta.env.VITE_APP_NAME as string) || 'DiPeO App',
  env,
  isDevelopment,
  apiBaseUrl: (import.meta.env.VITE_API_BASE as string) || `${window.location.origin}/api`,
  socketUrl: (import.meta.env.VITE_SOCKET_URL as string) || null,
  featureFlags: createFeatureFlags(features),
  features,
  buildTimestamp: import.meta.env.VITE_BUILD_TS as string,
  dev: {
    enableMockData: (import.meta.env.VITE_ENABLE_MOCK_DATA as string) === 'true',
    mockUser: isDevelopment && (import.meta.env.VITE_ENABLE_MOCK_DATA as string) === 'true' 
      ? {
          id: 'mock-user-1',
          name: 'Dr. John Smith',
          email: 'john.smith@example.com',
          role: 'doctor'
        }
      : null,
  },
};

// Computed flags and helper functions
export const isDevelopment = config.isDevelopment;
export const shouldUseMockData = config.dev.enableMockData && config.isDevelopment;

export const isFeatureEnabled = (name: string): boolean => {
  return config.featureFlags[name] === true;
};

// Default export for convenience
export default config;

// Self-Check Comments:
// [x] Uses `@/` imports only - N/A for this config file
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Only reads window.location.origin as fallback
// [x] Reads config from `@/app/config` - This IS the config file
// [x] Exports default named component - Exports config object and utility functions
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for config file
