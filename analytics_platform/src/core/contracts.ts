// src/core/contracts.ts
/* src/core/contracts.ts
   Canonical domain and API contracts used across the app.
   - Healthcare domain models (User variants, Appointment, MedicalRecord, Prescription, LabResult)
   - API response shapes (ApiResult<T>, ApiError, PaginatedResponse<T>)
   - WebSocket event types and mapping
   - UI helper types (LoadingState, FormState)
   - Auth DTOs
*/

// App-level configuration shape (materialized in src/app/config.ts)
export type AppConfig = {
  env: 'development' | 'staging' | 'production';
  appName: string;
  apiBaseUrl: string;
  wsBaseUrl?: string;
  features: string[]; // feature toggle list
  development_mode: {
    enable_mock_data: boolean;
  };
  defaults: {
    pageSize: number;
    dateFormat: string;
  };
};

// Roles in the system
export type Role = 'admin' | 'doctor' | 'nurse' | 'patient' | 'staff';

// Base user
export interface UserBase {
  id: string;
  email: string;
  fullName: string;
  name: string; // Alias for fullName for compatibility
  role: Role;
  avatar?: string | null;
  avatarUrl?: string | null; // Legacy field for compatibility
  createdAt: string; // ISO date
}

export interface Patient extends UserBase {
  role: 'patient';
  dateOfBirth?: string;
  medicalRecordId?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface Doctor extends UserBase {
  role: 'doctor';
  specialty?: string;
  licenseNumber?: string;
  clinicIds?: string[];
}

export interface Nurse extends UserBase {
  role: 'nurse';
  assignedUnit?: string;
}

export type User = Patient | Doctor | Nurse | (UserBase & { role: Exclude<Role, 'patient' | 'doctor' | 'nurse'> });

// Auth DTOs
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string; // ISO timestamp when access token expires
}

// User profile and metrics interfaces for analytics platform
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
  bio?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
}

export interface UserMetrics {
  totalLogins: number;
  lastLoginAt: string; // ISO date
  accountAge: number; // days
  activityScore: number;
  completedTasks: number;
  pendingTasks: number;
  monthlyActiveHours: number;
  preferredWorkingHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string | null;
  bio?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
}

// Healthcare domain models
export interface Appointment {
  id: string;
  patientId: string;
  clinicianId: string; // doctor or nurse user id
  startAt: string; // ISO
  endAt?: string; // ISO
  status: 'scheduled' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  diagnoses: string[];
  allergies?: string[];
  medications?: Prescription[];
  notes?: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string; // e.g. "10mg"
  frequency?: string; // e.g. "twice daily"
  prescribedById?: string; // clinician id
  startDate?: string;
  endDate?: string;
  instructions?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  collectedAt?: string;
  reportedAt?: string;
}

// API response types used across services
export interface ApiError {
  code: string | number;
  message: string;
  details?: Record<string, unknown> | string;
}

export interface ApiResult<T = unknown> {
  data?: T;
  error?: ApiError | null;
  meta?: Record<string, unknown>;
}

// Legacy alias for backwards compatibility
export type ApiResponse<T> = ApiResult<T>;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// WebSocket event types (if WS is enabled in config we reuse these)
export type WebSocketEventName =
  | 'ws:connected'
  | 'ws:disconnected'
  | 'appointment:created'
  | 'appointment:updated'
  | 'labresult:created'
  | 'prescription:updated'
  | 'auth:session_expired'
  | 'custom:message';

export interface WebSocketEvent<T = any> {
  name: WebSocketEventName;
  payload: T;
  timestamp?: string;
}

// Mapping event name -> payload type for typed listeners
export interface EventPayloadMap {
  'ws:connected': { socketId: string };
  'ws:disconnected': { reason?: string };
  'appointment:created': Appointment;
  'appointment:updated': Appointment;
  'labresult:created': LabResult;
  'prescription:updated': Prescription;
  'auth:session_expired': { userId?: string };
  'custom:message': { topic: string; body: unknown };
}

// UI helper types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T = any> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

// Example export convenience for services
export type Maybe<T> = T | null | undefined;

// Helpful aggregate export for re-exports elsewhere
export const __CORE_CONTRACTS_VERSION = '1.0.0';

/*
- [x] Uses `@/` imports only (no imports needed - this is the base type definition file)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) (N/A - this is types only)
- [x] Reads config from `@/app/config` (N/A - this defines AppConfig type used by config)
- [x] Exports default named component (N/A - this is a types-only file with named exports)
- [x] Adds basic ARIA and keyboard handlers (N/A - this is types only)
*/
