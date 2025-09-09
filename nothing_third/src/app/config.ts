// filepath: src/app/config.ts
import type { User, Patient, Doctor, Appointment } from '@/core/contracts';

export type FeatureName = 'analytics' | 'beta_dashboard' | 'websockets' | 'mock_data' | 'experimental_ui';

export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  apiBaseUrl: string;
  requestTimeoutMs: number;
  features: Set<string>;
  analyticsProviders: string[];
  enableWebsockets: boolean;
  shouldUseMockData: boolean;
  buildTimestamp?: string;
  isFeatureEnabled: (name: string) => boolean;
}

// Helper to safely parse CSV or JSON array strings
function parseCsvOrJson(raw?: string): string[] {
  if (!raw) return [];
  
  const trimmed = raw.trim();
  
  // Try JSON parse first
  if (trimmed.startsWith('[') || trimmed.startsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Fall through to CSV parsing
    }
  }
  
  // CSV fallback
  return trimmed.split(',').map(s => s.trim()).filter(Boolean);
}

// Build configuration from environment
const rawEnv = import.meta.env;

const env = ((rawEnv.VITE_ENV as string) ?? 'development') as AppConfig['env'];
const isDevelopment = env === 'development';

const apiBaseUrl = (rawEnv.VITE_API_BASE as string) ?? 
  `${window.location.protocol}//${window.location.host}/api`;

const requestTimeoutMs = parseInt((rawEnv.VITE_TIMEOUT_MS as string) ?? '15000', 10);

const featuresRaw = (rawEnv.VITE_FEATURES as string) ?? '[]';
const parsedFeatures = parseCsvOrJson(featuresRaw);
const features = new Set(parsedFeatures);

const analyticsProviders = parseCsvOrJson(rawEnv.VITE_ANALYTICS_PROVIDERS as string);

const enableWebsockets = (rawEnv.VITE_DISABLE_WEBSOCKETS as string) !== 'true';
const shouldUseMockData = isDevelopment && (rawEnv.VITE_ENABLE_MOCK_DATA as string) === 'true';

const buildTimestamp = rawEnv.VITE_BUILD_TIMESTAMP as string;

// Create frozen config object
export const config: AppConfig = Object.freeze({
  env,
  isDevelopment,
  apiBaseUrl,
  requestTimeoutMs,
  features,
  analyticsProviders,
  enableWebsockets,
  shouldUseMockData,
  buildTimestamp,
  isFeatureEnabled: (name: string): boolean => features.has(name)
});

// Computed flags for convenient imports
export const { isDevelopment, shouldUseMockData, isFeatureEnabled } = config;

// Mock data for development
export const mock = shouldUseMockData ? {
  currentUser: {
    id: 'mock-user-1',
    email: 'dev@local',
    fullName: 'Developer Mock',
    roles: ['admin', 'doctor'],
    createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-01T00:00:00Z').toISOString()
  } as User,
  
  patients: [
    {
      id: 'mock-patient-1',
      email: 'patient1@example.com',
      fullName: 'Alice Johnson',
      dateOfBirth: '1985-03-15',
      phone: '+1-555-0101',
      address: '123 Main St, Anytown, ST 12345',
      emergencyContact: {
        name: 'Bob Johnson',
        phone: '+1-555-0102',
        relationship: 'spouse'
      },
      insuranceInfo: {
        provider: 'Health Plus',
        policyNumber: 'HP123456789',
        groupNumber: 'GRP001'
      },
      medicalHistory: ['Hypertension', 'Diabetes Type 2'],
      createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
      updatedAt: new Date('2024-01-15T09:00:00Z').toISOString()
    },
    {
      id: 'mock-patient-2',
      email: 'patient2@example.com',
      fullName: 'Charlie Brown',
      dateOfBirth: '1992-07-22',
      phone: '+1-555-0201',
      address: '456 Oak Ave, Somewhere, ST 54321',
      emergencyContact: {
        name: 'Lucy Brown',
        phone: '+1-555-0202',
        relationship: 'mother'
      },
      createdAt: new Date('2024-01-20T14:30:00Z').toISOString(),
      updatedAt: new Date('2024-01-20T14:30:00Z').toISOString()
    }
  ] as Patient[],
  
  doctors: [
    {
      id: 'mock-doctor-1',
      email: 'dr.smith@clinic.com',
      fullName: 'Dr. Sarah Smith',
      specialties: ['Internal Medicine', 'Cardiology'],
      licenseNumber: 'MD123456',
      phone: '+1-555-1001',
      department: 'Internal Medicine',
      yearsExperience: 15,
      createdAt: new Date('2023-06-01T08:00:00Z').toISOString(),
      updatedAt: new Date('2023-06-01T08:00:00Z').toISOString()
    }
  ] as Doctor[],
  
  appointments: [
    {
      id: 'mock-appt-1',
      patientId: 'mock-patient-1',
      doctorId: 'mock-doctor-1',
      dateTime: new Date('2024-02-15T10:00:00Z').toISOString(),
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      reason: 'Annual checkup',
      notes: 'Regular follow-up for diabetes management',
      createdAt: new Date('2024-01-30T16:00:00Z').toISOString(),
      updatedAt: new Date('2024-01-30T16:00:00Z').toISOString()
    },
    {
      id: 'mock-appt-2',
      patientId: 'mock-patient-2',
      doctorId: 'mock-doctor-1',
      dateTime: new Date('2024-02-16T14:30:00Z').toISOString(),
      duration: 45,
      type: 'follow-up',
      status: 'confirmed',
      reason: 'Blood pressure check',
      createdAt: new Date('2024-02-01T10:15:00Z').toISOString(),
      updatedAt: new Date('2024-02-01T10:15:00Z').toISOString()
    }
  ] as Appointment[]
} : null;

// Convenience exports for common checks
export const enabledFeatures = Array.from(features);
export const hasAnalytics = isFeatureEnabled('analytics');
export const hasBetaDashboard = isFeatureEnabled('beta_dashboard');
export const hasWebsockets = enableWebsockets && isFeatureEnabled('websockets');

// Development utilities
export const devInfo = isDevelopment ? {
configSnapshot: {
    env,
    apiBaseUrl,
    features: enabledFeatures,
    mockDataEnabled: shouldUseMockData
  }
} : null;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/contracts)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - only reads location for API base fallback
- [x] Reads config from `@/app/config` (this IS the config file)
- [x] Exports default named component (exports config object and utilities)
- [x] Adds basic ARIA and keyboard handlers (N/A for config file)
*/
