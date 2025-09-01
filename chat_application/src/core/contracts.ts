// filepath: src/core/contracts.ts

/**
 * Core domain types, API contracts, and shared interfaces.
 * This is the single source of truth for all typed data structures across the app.
 */

// =============================================================================
// API Response Types
// =============================================================================

export type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Legacy alias for backward compatibility
export type ApiResponse<T> = ApiResult<T>;

// =============================================================================
// Authentication & User Types
// =============================================================================

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient' | 'receptionist' | 'lab';

export interface UserBase {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt?: string;
  avatarUrl?: string;
}

export interface Patient extends UserBase {
  mrn?: string;
  dateOfBirth?: string;
  primaryDoctorId?: string;
  type: 'patient';
}

export interface Doctor extends UserBase {
  specialty?: string;
  licenseNumber?: string;
  type: 'doctor';
}

export interface Nurse extends UserBase {
  ward?: string;
  type: 'nurse';
}

export type User = Patient | Doctor | Nurse | UserBase;

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
}

export interface HealthcareEntity {
  id: string;
  name: string;
  kind: 'clinic' | 'hospital' | 'lab';
  address?: string;
}

// =============================================================================
// Healthcare Domain Models
// =============================================================================

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  status: 'scheduled' | 'cancelled' | 'completed' | 'no_show';
  reason?: string;
  location?: string;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  createdAt: string;
  summary: string;
  entries?: Array<{
    id: string;
    type: string;
    recordedAt: string;
    data: any;
  }>;
}

export interface Prescription {
  id: string;
  patientId: string;
  prescriberId: string;
  medication: string;
  dose: string;
  directions?: string;
  startDate?: string;
  endDate?: string;
  refills?: number;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  resultValue: string | number;
  unit?: string;
  referenceRange?: string;
  collectedAt?: string;
  releasedAt?: string;
  notes?: string;
}

// =============================================================================
// Chart and UI Data Types
// =============================================================================

export interface ChartSeriesPoint {
  x: string | number | Date;
  y: number;
  meta?: Record<string, unknown>;
}

export interface ChartSeries {
  id: string;
  label?: string;
  color?: string;
  data: ChartSeriesPoint[];
}

// =============================================================================
// WebSocket Event Types
// =============================================================================

export type WSIncomingEvent = 
  | { type: 'appointment.updated'; payload: Appointment }
  | { type: 'labresult.created'; payload: LabResult }
  | { type: 'prescription.updated'; payload: Prescription }
  | { type: 'presence.changed'; payload: { userId: string; online: boolean } }
  | { type: 'notification'; payload: { id: string; title: string; message: string; level: 'info' | 'warning' | 'error' } }
  | { type: string; payload?: any };

export type WSOutgoingEvent = 
  | { type: 'subscribe'; payload: { channel: string } }
  | { type: 'unsubscribe'; payload: { channel: string } }
  | { type: 'ping' }
  | { type: string; payload?: any };

// =============================================================================
// UI Helper Types
// =============================================================================

export type LoadingState = 'idle' | 'pending' | 'success' | 'error';

export interface FormState<T = any> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched?: Partial<Record<keyof T, boolean>>;
  isValid?: boolean;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    handler: () => void;
  }>;
}

// =============================================================================
// Route Definitions
// =============================================================================

export type RouteDefinitions = Record<string, {
  path: string;
  requiresAuth?: boolean;
  roles?: UserRole[];
}>;

// =============================================================================
// Filter and Search Types
// =============================================================================

export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  tags?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ListRequest {
  page?: number;
  pageSize?: number;
  filters?: SearchFilters;
  sort?: SortOptions;
}

// =============================================================================
// Type Guards and Utilities
// =============================================================================

export const isApiSuccess = <T>(result: ApiResult<T>): result is { success: true; data: T } => {
  return result.success === true;
};

export const isApiError = <T>(result: ApiResult<T>): result is { success: false; error: ApiError } => {
  return result.success === false;
};

export const isPatient = (user: User): user is Patient => {
  return 'type' in user && user.type === 'patient';
};

export const isDoctor = (user: User): user is Doctor => {
  return 'type' in user && user.type === 'doctor';
};

export const isNurse = (user: User): user is Nurse => {
  return 'type' in user && user.type === 'nurse';
};

export const hasRole = (user: User, role: UserRole): boolean => {
  return user.roles.includes(role);
};

export const hasAnyRole = (user: User, roles: UserRole[]): boolean => {
  return roles.some(role => user.roles.includes(role));
};

/*
Self-check comments:
- [x] Uses `@/` imports only (no external imports needed for type definitions)
- [x] Uses providers/hooks (not applicable for type definitions file)
- [x] Reads config from `@/app/config` (not applicable for contracts file)
- [x] Exports default named component (exports named types and interfaces)
- [x] Adds basic ARIA and keyboard handlers (not applicable for type definitions)
- [x] Provides comprehensive type definitions for domain models
- [x] Uses discriminated unions for User types with type guards
- [x] Includes WebSocket event types with flexible extension
- [x] Provides API result types with type guards for safe usage
- [x] Keeps timestamps as ISO strings for consistency
- [x] Includes utility types for forms, loading states, and UI helpers
*/
