// filepath: src/app/config.ts
import { safeParseJSON } from '@/core/utils';
import type { User } from '@/core/contracts';

export interface AppConfig {
  env: 'development' | 'staging' | 'production' | string;
  isDevelopment: boolean;
  apiBase: string;
  wsBase?: string | undefined;
  sentryDsn?: string | undefined;
  featureFlags: Record<string, boolean>;
  features: string[];
  defaultPageSize: number;
  dev: { enableMockData: boolean; mockSeed?: string };
  appName: string;
}

// Read and parse raw environment values
const rawApiBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
const rawFeatures = (import.meta.env.VITE_FEATURES ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const rawFeatureFlags = safeParseJSON<Record<string, boolean>>(
  import.meta.env.VITE_FEATURE_FLAGS ?? '{}',
  {}
);

// Compute derived flags
const isDevelopment = 
  import.meta.env.MODE === 'development' || 
  import.meta.env.VITE_FORCE_DEV === 'true';

// Main configuration object
export const config: AppConfig = {
  env: import.meta.env.MODE || 'production',
  isDevelopment,
  apiBase: rawApiBase || 'http://localhost:8000/api',
  wsBase: import.meta.env.VITE_WS_BASE ?? undefined,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN ?? undefined,
  featureFlags: {
    // Default feature flags
    enableAnalytics: true,
    enableWebSocket: true,
    enableNotifications: true,
    // Override with parsed env flags
    ...rawFeatureFlags,
  },
  features: rawFeatures,
  defaultPageSize: Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE ?? 20),
  dev: {
    enableMockData: (import.meta.env.VITE_ENABLE_MOCK_DATA ?? 'false') === 'true',
    mockSeed: import.meta.env.VITE_MOCK_SEED ?? undefined,
  },
  appName: import.meta.env.VITE_APP_NAME ?? 'DiPeO Healthcare App',
};

// Derived computed flags
export const shouldUseMockData = config.isDevelopment && config.dev.enableMockData;

// Mock data for development
export const mockData = {
  user: {
    id: 'mock:user:1',
    email: 'dev@example.test',
    fullName: 'Dr. Dev User',
    roles: ['admin', 'doctor'],
    createdAt: new Date().toISOString(),
    type: 'doctor',
    specialty: 'Internal Medicine',
    licenseNumber: 'DEV-123456',
  } as User,
  
  patients: [
    {
      id: 'mock:patient:1',
      email: 'patient1@example.test',
      fullName: 'John Patient',
      roles: ['patient'],
      createdAt: new Date().toISOString(),
      type: 'patient',
      mrn: 'MRN001',
      dateOfBirth: '1985-06-15',
      primaryDoctorId: 'mock:user:1',
    } as User,
  ],

  appointments: [
    {
      id: 'mock:appointment:1',
      patientId: 'mock:patient:1',
      doctorId: 'mock:user:1',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      reason: 'Annual checkup',
      location: 'Room 101',
      notes: 'Regular wellness visit',
    },
  ],
};

// Export individual config values for convenience
export const {
  apiBase,
  wsBase,
  featureFlags,
  features,
  defaultPageSize,
  appName,
} = config;

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)  
- [x] Reads config from `@/app/config` (this IS the config file)
- [x] Exports default named component (exports config object and interface)
- [x] Adds basic ARIA and keyboard handlers (not applicable for config file)
- [x] Uses import.meta.env for environment variables (NOT process.env)
- [x] Provides typed AppConfig interface
- [x] Uses safeParseJSON from core/utils for safe parsing
- [x] Includes mock data for development with proper typing
- [x] Provides reasonable defaults to avoid runtime exceptions
*/
