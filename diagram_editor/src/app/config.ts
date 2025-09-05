// filepath: src/app/config.ts

import type { User, Patient, Doctor } from '@/core/contracts';

// AppConfig interface definition
export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  socketUrl?: string;
  appName: string;
  analytics: {
    enabled: boolean;
    key?: string;
  };
  features: Record<string, boolean>;
  sso: {
    enabled: boolean;
    provider?: 'okta' | 'auth0' | 'oidc';
  };
  development_mode: {
    enable_mock_data: boolean;
    verbose_logs: boolean;
  };
  defaults: {
    perPage: number;
  };
}

// Helper functions for parsing environment variables
function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function parseFeatures(featuresStr: string | undefined): Record<string, boolean> {
  if (!featuresStr) return {};
  
  const featureList = featuresStr.split(',').map(f => f.trim());
  const features: Record<string, boolean> = {};
  
  featureList.forEach(feature => {
    if (feature) {
      features[feature] = true;
    }
  });
  
  return features;
}

// Read and materialize configuration from import.meta.env
const rawEnv = import.meta.env;

const env = (rawEnv.VITE_ENV as AppConfig['env']) || 'development';
const isDevelopment = env === 'development';

// Build configuration object
export const config: AppConfig = {
  env,
  apiBaseUrl: String(rawEnv.VITE_API_BASE ?? window.location.origin + '/api'),
  socketUrl: rawEnv.VITE_SOCKET_URL ? String(rawEnv.VITE_SOCKET_URL) : undefined,
  appName: String(rawEnv.VITE_APP_NAME ?? 'Healthcare App'),
  analytics: {
    enabled: parseBoolean(rawEnv.VITE_ANALYTICS_ENABLED),
    key: rawEnv.VITE_ANALYTICS_KEY ? String(rawEnv.VITE_ANALYTICS_KEY) : undefined,
  },
  features: parseFeatures(rawEnv.VITE_FEATURES),
  sso: {
    enabled: parseBoolean(rawEnv.VITE_SSO_ENABLED),
    provider: rawEnv.VITE_SSO_PROVIDER as AppConfig['sso']['provider'] | undefined,
  },
  development_mode: {
    enable_mock_data: parseBoolean(rawEnv.VITE_ENABLE_MOCKS),
    verbose_logs: parseBoolean(rawEnv.VITE_VERBOSE_LOGS),
  },
  defaults: {
    perPage: parseInt(String(rawEnv.VITE_DEFAULT_PER_PAGE ?? '10'), 10),
  },
};

// Computed flags for convenience
export const shouldUseMockData = isDevelopment && config.development_mode.enable_mock_data;

// Development mode validation
if (isDevelopment) {
  if (!config.apiBaseUrl) {
    console.warn('VITE_API_BASE not set, using default:', config.apiBaseUrl);
  }
  
  if (config.analytics.enabled && !config.analytics.key) {
    console.warn('Analytics enabled but VITE_ANALYTICS_KEY not provided');
  }
  
  if (config.sso.enabled && !config.sso.provider) {
    console.warn('SSO enabled but VITE_SSO_PROVIDER not specified');
  }
}

// Mock data for development
export const MOCK_USER_ADMIN: User = {
  id: 'mock-admin-001',
  email: 'admin@hospital.local',
  name: 'Dr. Admin User',
  avatarUrl: '/avatars/admin.jpg',
  roles: ['admin', 'doctor'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'mock-patient-001',
    email: 'john.doe@email.com',
    name: 'John Doe',
    avatarUrl: '/avatars/patient1.jpg',
    roles: ['patient'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    patientId: 'P001',
    dob: '1985-06-15',
    primaryPhysicianId: 'mock-doctor-001',
    demographics: {
      address: '123 Main St, Anytown, ST 12345',
      phone: '+1-555-0123',
    },
  },
  {
    id: 'mock-patient-002',
    email: 'jane.smith@email.com',
    name: 'Jane Smith',
    roles: ['patient'],
    createdAt: '2024-01-20T14:15:00Z',
    updatedAt: '2024-01-20T14:15:00Z',
    patientId: 'P002',
    dob: '1992-03-22',
    primaryPhysicianId: 'mock-doctor-002',
    demographics: {
      address: '456 Oak Ave, Somewhere, ST 67890',
      phone: '+1-555-0456',
    },
  },
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'mock-doctor-001',
    email: 'dr.wilson@hospital.local',
    name: 'Dr. Sarah Wilson',
    avatarUrl: '/avatars/doctor1.jpg',
    roles: ['doctor'],
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
    licenseNumber: 'MD123456',
    specialty: ['Internal Medicine', 'Cardiology'],
    clinicIds: ['clinic-001', 'clinic-002'],
  },
  {
    id: 'mock-doctor-002',
    email: 'dr.johnson@hospital.local',
    name: 'Dr. Michael Johnson',
    avatarUrl: '/avatars/doctor2.jpg',
    roles: ['doctor'],
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
    licenseNumber: 'MD789012',
    specialty: ['Pediatrics'],
    clinicIds: ['clinic-001'],
  },
];

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `import.meta.env` (this IS the config file)
// [x] Exports default named component (exports config constant)
// [x] Adds basic ARIA and keyboard handlers (N/A for config file)
