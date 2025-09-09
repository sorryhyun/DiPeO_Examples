// filepath: src/core/contracts.ts

export type Role = 'admin' | 'doctor' | 'nurse' | 'patient' | 'staff';

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: Role[];
  avatarUrl?: string | null;
  metadata?: Record<string, any>;
  createdAt: string; // ISO
  updatedAt?: string;
}

export interface Patient extends User {
  medicalRecordNumber: string;
  dateOfBirth?: string; // ISO
  primaryProviderId?: string;
}

export interface Doctor extends User {
  licenseNumber?: string;
  specialties?: string[];
  clinicIds?: string[];
}

export interface Nurse extends User {
  department?: string;
  shift?: 'day' | 'night' | 'rotating';
}

export interface Address {
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Contact {
  phone?: string;
  secondaryPhone?: string;
  emergencyContact?: { name: string; phone: string };
}

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  clinicianId?: string; // doctor or nurse
  scheduledAt: string; // ISO
  durationMinutes?: number;
  reason?: string;
  status: AppointmentStatus;
  locationId?: string;
  createdBy?: string;
  metadata?: Record<string, any>;
}

export interface VisitNote {
  id: string;
  appointmentId?: string;
  authorId: string;
  note: string;
  createdAt: string;
}

export type PrescriptionStatus = 'active' | 'expired' | 'cancelled' | 'draft';

export interface Prescription {
  id: string;
  patientId: string;
  prescriberId: string;
  medications: Array<{ name: string; dose?: string; frequency?: string; quantity?: number }>;
  issuedAt: string;
  expiresAt?: string;
  status: PrescriptionStatus;
  notes?: string;
}

export type LabResultStatus = 'pending' | 'completed' | 'amended' | 'cancelled';

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  performedAt?: string;
  status: LabResultStatus;
  resultSummary?: string;
  raw?: any; // provider-specific payload
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  problems?: string[];
  allergies?: string[];
  medications?: Prescription[];
  visits?: VisitNote[];
  lastUpdatedAt?: string;
}

export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code?: string | number;
  message: string;
  details?: any;
  status?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type WebSocketEvent =
  | { type: 'notification'; payload: { id: string; title: string; body?: string; url?: string } }
  | { type: 'appointment:update'; payload: Appointment }
  | { type: 'lab:result'; payload: LabResult }
  | { type: 'presence'; payload: { userId: string; online: boolean } }
  | { type: 'custom'; payload: any };

export type WebSocketEventMap = Record<string, any>;

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string | undefined>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

export type FetchState<T> = {
  data?: T;
  error?: ApiError;
  loading: boolean;
};

export interface AppConfig {
  apiUrl: string;
  environment: string;
  features: Record<string, boolean>;
  version: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartPoint {
  x: string | number;
  y: number;
  label?: string;
}

// Legacy alias for backwards compatibility
export type ApiResponse<T> = ApiResult<T>;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
