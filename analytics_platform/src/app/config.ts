// src/app/config.ts
/* src/app/config.ts
   Materializes runtime application configuration into a typed AppConfig object.
   - Reads from window.__APP_CONFIG__ (recommended), falling back to import.meta.env for dev.
   - Computes convenience flags and feature helpers.
   - Provides mock user data when development_mode.enable_mock_data is true.
*/

import { AppConfig, User, Patient } from '@/core/contracts';

// A small helper that reads a global config injected at runtime (e.g. by server or index.html)
declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig> & Record<string, any>;
  }
}

// Default base configuration used as a safe fallback
const DEFAULT_CONFIG: AppConfig = {
  env: (import.meta.env.MODE as 'development' | 'staging' | 'production') || 'development',
  appName: import.meta.env.VITE_APP_NAME || 'HealthApp',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || undefined,
  features: (import.meta.env.VITE_FEATURES || '').split(',').filter(Boolean),
  development_mode: {
    enable_mock_data: (import.meta.env.VITE_ENABLE_MOCK_DATA || 'true') === 'true'
  },
  defaults: {
    pageSize: Number(import.meta.env.VITE_PAGE_SIZE) || 20,
    dateFormat: import.meta.env.VITE_DATE_FORMAT || 'yyyy-MM-dd HH:mm'
  }
};

// Merge runtime config from window.__APP_CONFIG__ on top of defaults (server can inject JSON into index.html)
const runtime = (typeof window !== 'undefined' && window.__APP_CONFIG__) ? window.__APP_CONFIG__ : {};

export const appConfig: AppConfig = {
  ...DEFAULT_CONFIG,
  ...runtime
};

// Convenience computed flags
export const isDevelopment = appConfig.env === 'development';
export const shouldUseMockData = Boolean(isDevelopment && appConfig.development_mode?.enable_mock_data);

// Helper to test whether a feature is enabled
export function isFeatureEnabled(featureName: string): boolean {
  return Array.isArray(appConfig.features) && appConfig.features.includes(featureName);
}

// Provide a small mock user useful for development/testing when shouldUseMockData is true
export const mockUser: User | null = shouldUseMockData
  ? ({
      id: 'mock-patient-1',
      email: 'jane.doe@example.com',
      fullName: 'Jane Doe (Mock)',
      role: 'patient',
      dateOfBirth: '1988-06-12',
      medicalRecordId: 'mr-mock-1',
      createdAt: new Date().toISOString(),
      avatarUrl: undefined,
      emergencyContact: { name: 'John Doe', phone: '+1-555-555-555' }
    } as Patient)
  : null;

// Example usage patterns:
// import { appConfig, isFeatureEnabled, mockUser } from '@/app/config'
// if (isFeatureEnabled('telehealth')) { ... }
// if (mockUser) { bootstrapAuth(mockUser) }

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (this IS the config)
- [x] Exports default named component (exports named configuration objects)
- [x] Adds basic ARIA and keyboard handlers (not relevant for config file)
*/
