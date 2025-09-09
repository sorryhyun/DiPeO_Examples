// filepath: src/app/config.ts
import type { 
  User, 
  Patient, 
  Doctor, 
  Nurse, 
  Appointment, 
  MedicalRecord,
  Prescription,
  LabResult 
} from '@/core/contracts';

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

// Helper function to parse CSV or JSON arrays
function parseCsvOrJson(raw?: string): string[] {
  if (!raw) return [];
  
  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Fallback to comma-separated parsing
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
}

// Safe feature parsing with fallback
function safeParseFeatures(raw?: string): string[] {
  if (!raw) return [];
  
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Handle comma-separated format
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
}

// Read environment variables
const rawEnv = import.meta.env;
const env = ((rawEnv.VITE_ENV as string) ?? 'development') as AppConfig['env'];
const isDevelopment = env === 'development';

// Parse API base URL with fallback to current host
const apiBaseUrl = (rawEnv.VITE_API_BASE as string) ?? 
  `${location.protocol}//${location.host}/api`;

// Parse timeout with fallback
const requestTimeoutMs = rawEnv.VITE_TIMEOUT_MS ? 
  parseInt(rawEnv.VITE_TIMEOUT_MS as string, 10) : 15000;

// Parse features
const featuresRaw = (rawEnv.VITE_FEATURES as string | undefined) ?? '[]';
const parsedFeatures = safeParseFeatures(featuresRaw);
const features = new Set(parsedFeatures);

// Parse analytics providers
const analyticsProviders = parseCsvOrJson(rawEnv.VITE_ANALYTICS_PROVIDERS as string);

// Boolean flags
const enableWebsockets = rawEnv.VITE_DISABLE_WEBSOCKETS !== 'true';
const shouldUseMockData = isDevelopment && (rawEnv.VITE_ENABLE_MOCK_DATA === 'true');

// Build timestamp (if available)
const buildTimestamp = rawEnv.VITE_BUILD_TIMESTAMP as string;

// Feature toggle helper
const isFeatureEnabled = (name: string): boolean => features.has(name);

// Create and freeze config object
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
  isFeatureEnabled,
});

// Export feature toggle helper as standalone function
export { isFeatureEnabled };

// Mock data for development
export const mock = shouldUseMockData ? Object.freeze({
  currentUser: {
    id: 'mock-user-1',
    email: 'dev@local',
    fullName: 'Dr. Developer Mock',
    roles: ['admin', 'doctor'],
    avatarUrl: null,
    metadata: { department: 'Emergency' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    licenseNumber: 'DEV123456',
    specialties: ['Emergency Medicine', 'Internal Medicine'],
    clinicIds: ['clinic-1', 'clinic-2']
  } as Doctor,

  patients: [
    {
      id: 'patient-1',
      email: 'patient1@example.com',
      fullName: 'Jane Smith',
      roles: ['patient'],
      avatarUrl: null,
      createdAt: '2024-01-10T09:00:00Z',
      medicalRecordNumber: 'MRN001',
      dateOfBirth: '1985-06-15',
      primaryProviderId: 'mock-user-1'
    } as Patient,
    {
      id: 'patient-2',
      email: 'patient2@example.com',
      fullName: 'John Doe',
      roles: ['patient'],
      avatarUrl: null,
      createdAt: '2024-01-12T14:30:00Z',
      medicalRecordNumber: 'MRN002',
      dateOfBirth: '1978-03-22',
      primaryProviderId: 'mock-user-1'
    } as Patient
  ],

  nurses: [
    {
      id: 'nurse-1',
      email: 'nurse1@hospital.com',
      fullName: 'Sarah Johnson',
      roles: ['nurse'],
      avatarUrl: null,
      createdAt: '2024-01-05T08:00:00Z',
      department: 'ICU',
      shift: 'day'
    } as Nurse
  ],

  appointments: [
    {
      id: 'apt-1',
      patientId: 'patient-1',
      clinicianId: 'mock-user-1',
      scheduledAt: '2024-01-20T10:00:00Z',
      durationMinutes: 30,
      reason: 'Annual checkup',
      status: 'scheduled',
      locationId: 'room-101',
      createdBy: 'mock-user-1',
      metadata: { type: 'routine' }
    } as Appointment,
    {
      id: 'apt-2',
      patientId: 'patient-2',
      clinicianId: 'mock-user-1',
      scheduledAt: '2024-01-22T14:00:00Z',
      durationMinutes: 45,
      reason: 'Follow-up consultation',
      status: 'scheduled',
      locationId: 'room-102',
      createdBy: 'mock-user-1',
      metadata: { type: 'followup' }
    } as Appointment
  ],

  medicalRecords: [
    {
      id: 'record-1',
      patientId: 'patient-1',
      problems: ['Hypertension', 'Type 2 Diabetes'],
      allergies: ['Penicillin', 'Shellfish'],
      medications: [],
      visits: [],
      lastUpdatedAt: '2024-01-15T16:45:00Z'
    } as MedicalRecord
  ],

  prescriptions: [
    {
      id: 'rx-1',
      patientId: 'patient-1',
      prescriberId: 'mock-user-1',
      medications: [
        { name: 'Metformin', dose: '500mg', frequency: 'twice daily', quantity: 60 },
        { name: 'Lisinopril', dose: '10mg', frequency: 'once daily', quantity: 30 }
      ],
      issuedAt: '2024-01-15T11:00:00Z',
      expiresAt: '2024-04-15T11:00:00Z',
      status: 'active',
      notes: 'Continue current regimen, monitor blood pressure'
    } as Prescription
  ],

  labResults: [
    {
      id: 'lab-1',
      patientId: 'patient-1',
      testName: 'Complete Blood Count',
      performedAt: '2024-01-18T08:30:00Z',
      status: 'completed',
      resultSummary: 'Normal values within expected range',
      raw: {
        wbc: 6.5,
        rbc: 4.2,
        hemoglobin: 13.8,
        hematocrit: 41.2
      }
    } as LabResult
  ]
}) : undefined;

// Export convenience functions
export function isDev(): boolean {
  return config.isDevelopment;
}

export function getApiUrl(path: string = ''): string {
  return `${config.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - config only
// [x] Reads config from `@/app/config` - this IS the config file
// [x] Exports default named component - exports config object and utilities
// [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for config
