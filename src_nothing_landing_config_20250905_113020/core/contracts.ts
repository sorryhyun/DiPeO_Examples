// filepath: src/core/contracts.ts

// Domain types and role system
export type Role = 'admin' | 'doctor' | 'nurse' | 'patient' | 'staff';

// Base user interface
export interface User {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly roles: readonly Role[];
  readonly avatarUrl?: string | null;
  readonly metadata?: Record<string, any>;
  readonly createdAt: string; // ISO 8601
  readonly updatedAt?: string; // ISO 8601
}

// Role-specific user extensions
export interface Patient extends User {
  readonly medicalRecordNumber: string;
  readonly dateOfBirth?: string; // ISO 8601
  readonly primaryProviderId?: string;
}

export interface Doctor extends User {
  readonly licenseNumber?: string;
  readonly specialties?: readonly string[];
  readonly clinicIds?: readonly string[];
}

export interface Nurse extends User {
  readonly department?: string;
  readonly shift?: 'day' | 'night' | 'rotating';
}

// Contact and address helpers
export interface Address {
  readonly line1: string;
  readonly line2?: string;
  readonly city?: string;
  readonly state?: string;
  readonly postalCode?: string;
  readonly country?: string;
}

export interface Contact {
  readonly phone?: string;
  readonly secondaryPhone?: string;
  readonly emergencyContact?: {
    readonly name: string;
    readonly phone: string;
  };
}

// Healthcare domain models
export type AppointmentStatus = 
  | 'scheduled' 
  | 'checked_in' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface Appointment {
  readonly id: string;
  readonly patientId: string;
  readonly clinicianId?: string; // doctor or nurse ID
  readonly scheduledAt: string; // ISO 8601
  readonly durationMinutes?: number;
  readonly reason?: string;
  readonly status: AppointmentStatus;
  readonly locationId?: string;
  readonly createdBy?: string;
  readonly metadata?: Record<string, any>;
}

export interface VisitNote {
  readonly id: string;
  readonly appointmentId?: string;
  readonly authorId: string;
  readonly note: string;
  readonly createdAt: string; // ISO 8601
}

export type PrescriptionStatus = 'active' | 'expired' | 'cancelled' | 'draft';

export interface Medication {
  readonly name: string;
  readonly dose?: string;
  readonly frequency?: string;
  readonly quantity?: number;
}

export interface Prescription {
  readonly id: string;
  readonly patientId: string;
  readonly prescriberId: string;
  readonly medications: readonly Medication[];
  readonly issuedAt: string; // ISO 8601
  readonly expiresAt?: string; // ISO 8601
  readonly status: PrescriptionStatus;
  readonly notes?: string;
}

export type LabResultStatus = 'pending' | 'completed' | 'amended' | 'cancelled';

export interface LabResult {
  readonly id: string;
  readonly patientId: string;
  readonly testName: string;
  readonly performedAt?: string; // ISO 8601
  readonly status: LabResultStatus;
  readonly resultSummary?: string;
  readonly raw?: any; // Provider-specific payload - intentionally any for flexibility
}

export interface MedicalRecord {
  readonly id: string;
  readonly patientId: string;
  readonly problems?: readonly string[];
  readonly allergies?: readonly string[];
  readonly medications?: readonly Prescription[];
  readonly visits?: readonly VisitNote[];
  readonly lastUpdatedAt?: string; // ISO 8601
}

// API response types
export interface ApiError {
  readonly code?: string | number;
  readonly message: string;
  readonly details?: any;
  readonly status?: number;
}

export interface ApiResult<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
}

// Legacy alias for backwards compatibility
export type ApiResponse<T> = ApiResult<T>;

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

// Authentication types
export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt?: string; // ISO 8601
  readonly tokenType?: string; // e.g., "Bearer"
}

// WebSocket event types for real-time updates
export type WebSocketEvent =
  | { 
      type: 'notification'; 
      payload: { 
        readonly id: string; 
        readonly title: string; 
        readonly body?: string; 
        readonly url?: string; 
      }; 
    }
  | { type: 'appointment:update'; payload: Appointment }
  | { type: 'lab:result'; payload: LabResult }
  | { 
      type: 'presence'; 
      payload: { 
        readonly userId: string; 
        readonly online: boolean; 
      }; 
    }
  | { type: 'custom'; payload: any };

export type WebSocketEventMap = Record<string, any>;

// UI state management types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T = Record<string, any>> {
  readonly values: T;
  readonly errors: Partial<Record<keyof T, string | undefined>>;
  readonly touched: Partial<Record<keyof T, boolean>>;
  readonly isSubmitting: boolean;
}

export type FetchState<T> = {
  readonly data?: T;
  readonly error?: ApiError;
  readonly loading: boolean;
};

// Dashboard and analytics types
export interface DashboardMetric {
  readonly id: string;
  readonly label: string;
  readonly value: number | string;
  readonly change?: number; // percentage change
  readonly changeDirection?: 'up' | 'down' | 'neutral';
  readonly format?: 'number' | 'currency' | 'percentage';
  readonly icon?: string;
}

export interface ChartPoint {
  readonly x: string | number; // timestamp or category
  readonly y: number; // value
  readonly label?: string;
  readonly metadata?: Record<string, any>;
}

// Configuration type (used by app/config.ts)
export interface AppConfig {
  readonly env: 'development' | 'staging' | 'production';
  readonly isDevelopment: boolean;
  readonly apiBaseUrl: string;
  readonly requestTimeoutMs: number;
  readonly features: ReadonlySet<string>;
  readonly analyticsProviders: readonly string[];
  readonly enableWebsockets: boolean;
  readonly shouldUseMockData: boolean;
  readonly buildTimestamp?: string;
  readonly isFeatureEnabled: (name: string) => boolean;
}

// Type guards for role-based user types
export function isPatient(user: User): user is Patient {
  return user.roles.includes('patient');
}

export function isDoctor(user: User): user is Doctor {
  return user.roles.includes('doctor');
}

export function isNurse(user: User): user is Nurse {
  return user.roles.includes('nurse');
}

export function isAdmin(user: User): boolean {
  return user.roles.includes('admin');
}

// Type guards for API results
export function isApiSuccess<T>(result: ApiResult<T>): result is ApiResult<T> & { data: T } {
  return result.success && result.data !== undefined;
}

export function isApiError<T>(result: ApiResult<T>): result is ApiResult<T> & { error: ApiError } {
  return !result.success && result.error !== undefined;
}

// Utility type for creating partial updates
export type PartialUpdate<T> = Partial<Omit<T, 'id' | 'createdAt'>>;

// Common filter and sort types for data tables
export interface SortConfig {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

export interface FilterConfig {
  readonly field: string;
  readonly operator: 'equals' | 'contains' | 'startsWith' | 'gt' | 'lt' | 'between';
  readonly value: any;
}

export interface QueryOptions {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sort?: SortConfig;
  readonly filters?: readonly FilterConfig[];
  readonly search?: string;
}

// Self-check comments:
// [x] Uses `@/` imports only - no external imports needed, this is the base contracts file
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure type definitions
// [x] Reads config from `@/app/config` - exports AppConfig interface for config to implement
// [x] Exports default named component - exports all types and interfaces as named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for type definitions
