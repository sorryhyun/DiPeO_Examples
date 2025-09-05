// filepath: src/core/contracts.ts

// =============================
// ROLE TYPES
// =============================

export type Role = 'admin' | 'doctor' | 'nurse' | 'patient' | 'staff';

// =============================
// USER BASE TYPES
// =============================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: Role[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface Patient extends User {
  patientId: string;
  dob?: string; // ISO 8601 date
  primaryPhysicianId?: string;
  demographics?: {
    address?: string;
    phone?: string;
  };
}

export interface Doctor extends User {
  licenseNumber: string;
  specialty: string[];
  clinicIds: string[];
}

export interface Nurse extends User {
  licenseNumber: string;
  assignedUnit?: string;
}

// =============================
// AUTH TYPES
// =============================

export interface AuthTokens {
  access: string;
  refresh?: string;
  expiresAt?: string; // ISO 8601
  tokenType?: string; // e.g., 'Bearer'
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// =============================
// HEALTHCARE DOMAIN MODELS
// =============================

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string; // doctor or nurse ID
  startAt: string; // ISO 8601
  endAt: string | null; // ISO 8601
  status: AppointmentStatus;
  reason?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export type MedicalRecordType = 'note' | 'diagnosis' | 'imaging' | 'lab';

export interface MedicalRecord {
  id: string;
  patientId: string;
  createdById: string; // provider ID
  createdAt: string; // ISO 8601
  type: MedicalRecordType;
  payload: Record<string, any>;
  tags?: string[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  prescriberId: string; // doctor ID
  medication: Medication;
  instructions?: string;
  startAt?: string; // ISO 8601
  endAt?: string; // ISO 8601
  refills?: number;
}

export type LabResultStatus = 'pending' | 'final' | 'amended';

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  resultValue: string | number;
  unit?: string;
  referenceRange?: string;
  collectedAt?: string; // ISO 8601
  reportedAt?: string; // ISO 8601
  status: LabResultStatus;
}

// =============================
// API RESULT SHAPES
// =============================

export interface ApiError {
  code?: string;
  status?: number;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
}

// Convenience type alias
export type Paginated<T> = PaginatedResponse<T>;

// =============================
// WEBSOCKET EVENT TYPES
// =============================

export type WsEventType = 
  | 'appointment.created'
  | 'appointment.updated' 
  | 'appointment.cancelled'
  | 'lab.result'
  | 'medical_record.created'
  | 'prescription.created'
  | 'message'
  | 'system.notify'
  | 'user.login'
  | 'user.logout';

export interface WsEvent<T = any> {
  type: WsEventType;
  payload: T;
  timestamp: string; // ISO 8601
  userId?: string;
}

// Type mapping for WebSocket payloads
export interface WsPayloadMap {
  'appointment.created': Appointment;
  'appointment.updated': Appointment;
  'appointment.cancelled': { id: string; reason?: string };
  'lab.result': LabResult;
  'medical_record.created': MedicalRecord;
  'prescription.created': Prescription;
  'message': { id: string; content: string; from: string; to: string };
  'system.notify': { message: string; level: 'info' | 'warning' | 'error' };
  'user.login': { userId: string; timestamp: string };
  'user.logout': { userId: string; timestamp: string };
}

export type WsPayload<T extends WsEventType> = WsPayloadMap[T];

// =============================
// UI HELPER TYPES
// =============================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T> {
  values: T;
  touched: Partial<Record<keyof T, boolean>>;
  errors: Partial<Record<keyof T, string>>;
}

export type LayoutType = 'main' | 'auth';

export interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
  rolesAllowed?: Role[];
  layout?: LayoutType;
}

// =============================
// DASHBOARD & METRICS
// =============================

export interface DashboardMetric {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  change?: {
    value: number;
    period: string; // e.g., "24h", "7d", "30d"
    direction: 'up' | 'down' | 'neutral';
  };
  trend?: Array<{
    timestamp: string; // ISO 8601
    value: number;
  }>;
}

export interface ActivityItem {
  id: string;
  type: 'appointment' | 'lab_result' | 'prescription' | 'medical_record';
  title: string;
  description?: string;
  timestamp: string; // ISO 8601
  userId?: string;
  patientId?: string;
  status?: string;
  metadata?: Record<string, any>;
}

// =============================
// SEARCH & FILTERING
// =============================

export interface SearchFilters {
  query?: string;
  roles?: Role[];
  status?: string[];
  dateFrom?: string; // ISO 8601
  dateTo?: string; // ISO 8601
  tags?: string[];
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface SearchParams extends SearchFilters {
  page?: number;
  perPage?: number;
  sort?: SortOptions;
}

// =============================
// NOTIFICATION TYPES
// =============================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO 8601
  read?: boolean;
  userId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// =============================
// FILE UPLOAD TYPES
// =============================

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string; // ISO 8601
  uploadedBy: string; // user ID
  metadata?: Record<string, any>;
}

// =============================
// VALIDATION TYPES
// =============================

export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'min' | 'max' | 'pattern';
  value?: any;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// =============================
// AUDIT LOG TYPES
// =============================

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string; // ISO 8601
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
}

// =============================
// EXPORT TYPE GUARDS
// =============================

export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeofobj.email === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.roles)
  );
}

export function isPatient(obj: any): obj is Patient {
  return isUser(obj) && typeof obj.patientId === 'string';
}

export function isDoctor(obj: any): obj is Doctor {
  return isUser(obj) && typeof obj.licenseNumber === 'string' && Array.isArray(obj.specialty);
}

export function isNurse(obj: any): obj is Nurse {
  return isUser(obj) && typeof obj.licenseNumber === 'string';
}

export function isApiError(obj: any): obj is ApiError {
  return obj && typeof obj.message === 'string';
}

export function isApiResult<T>(obj: any): obj is ApiResult<T> {
  return obj && typeof obj.success === 'boolean';
}

// =============================
// UTILITY TYPES
// =============================

// Make all properties of T optional
export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

// Extract ID type from entity
export type EntityId<T> = T extends { id: infer U } ? U : never;

// Create a type with only the ID field
export type EntityRef<T> = Pick<T, 'id'>;

// Create update payload (omit readonly fields)
export type UpdatePayload<T> = Omit<Partial<T>, 'id' | 'createdAt' | 'updatedAt'>;

// Create create payload (omit auto-generated fields)
export type CreatePayload<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

// Self-check comments:
// [x] Uses `@/` imports only (this is a base contracts file, no imports needed)
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - N/A, pure types
// [x] Reads config from `@/app/config` - N/A, pure types
// [x] Exports default named component - N/A, exports types and interfaces
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A, pure types
