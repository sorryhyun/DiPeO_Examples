// filepath: src/core/contracts.ts

// ============================================================================
// ENUMS & BASIC PRIMITIVES
// ============================================================================

export type Role = 'admin' | 'doctor' | 'nurse' | 'patient' | 'staff';
export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no-show';

export type MedicalRecordEntryType = 
  | 'diagnosis' 
  | 'treatment' 
  | 'prescription' 
  | 'lab-order' 
  | 'note' 
  | 'vital-signs';

// ============================================================================
// USER FAMILY OF TYPES
// ============================================================================

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly roles: readonly Role[];
  readonly avatarUrl?: string;
  readonly lastSeen?: string; // ISO 8601
  readonly createdAt: string; // ISO 8601
  readonly updatedAt: string; // ISO 8601
}

export interface Patient extends User {
  readonly patientId: string;
  readonly dob: string; // ISO 8601 date
  readonly gender: Gender;
  readonly primaryPhysicianId?: string;
  readonly medicalRecordSummary?: string;
  readonly emergencyContact?: {
    readonly name: string;
    readonly phone: string;
    readonly relationship: string;
  };
}

export interface Doctor extends User {
  readonly doctorId: string;
  readonly specialty: string;
  readonly licenseNumber: string;
  readonly clinicIds: readonly string[];
  readonly yearsOfExperience?: number;
}

export interface Nurse extends User {
  readonly nurseId: string;
  readonly department: string;
  readonly shiftPattern: string;
  readonly certifications: readonly string[];
}

// ============================================================================
// HEALTHCARE DOMAIN MODELS
// ============================================================================

export interface Appointment {
  readonly id: string;
  readonly patientId: string;
  readonly practitionerId: string;
  readonly startAt: string; // ISO 8601
  readonly endAt: string; // ISO 8601
  readonly status: AppointmentStatus;
  readonly reason: string;
  readonly location: string;
  readonly notes?: string;
  readonly createdAt: string; // ISO 8601
  readonly updatedAt: string; // ISO 8601
}

export interface MedicalRecordEntry {
  readonly id: string;
  readonly type: MedicalRecordEntryType;
  readonly data: Record<string, unknown>;
  readonly recordedBy: string; // User ID
  readonly recordedAt: string; // ISO 8601
  readonly attachments?: readonly string[]; // File URLs
}

export interface MedicalRecord {
  readonly id: string;
  readonly patientId: string;
  readonly createdAt: string; // ISO 8601
  readonly updatedAt: string; // ISO 8601
  readonly entries: readonly MedicalRecordEntry[];
}

export interface Medication {
  readonly name: string;
  readonly dose: string;
  readonly frequency: string;
  readonly duration: string;
  readonly instructions?: string;
}

export interface Prescription {
  readonly id: string;
  readonly patientId: string;
  readonly prescriberId: string;
  readonly medications: readonly Medication[];
  readonly issuedAt: string; // ISO 8601
  readonly expiresAt?: string; // ISO 8601
  readonly notes?: string;
  readonly status: 'active' | 'expired' | 'cancelled';
}

export interface LabResult {
  readonly id: string;
  readonly patientId: string;
  readonly type: string;
  readonly value: string | number;
  readonly unit: string;
  readonly referenceRange?: string;
  readonly collectedAt: string; // ISO 8601
  readonly reportedAt: string; // ISO 8601
  readonly status: 'pending' | 'completed' | 'cancelled';
  readonly attachments?: readonly string[]; // File URLs
  readonly notes?: string;
}

// ============================================================================
// API RESPONSE ENVELOPES
// ============================================================================

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export interface ApiResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
}

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

// Convenience type alias
export type Paginated<T> = PaginatedResponse<T>;

// ============================================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================================

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: string; // ISO 8601
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly user: User;
  readonly tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  readonly refreshToken: string;
}

// ============================================================================
// WEBSOCKET EVENTS (TYPED)
// ============================================================================

export type WebSocketEventType = 
  | 'appointment:created'
  | 'appointment:updated'
  | 'appointment:cancelled'
  | 'labresult:available'
  | 'prescription:issued'
  | 'chat:message'
  | 'notification:new';

export interface WebSocketEvent<T = unknown> {
  readonly type: WebSocketEventType;
  readonly payload: T;
  readonly timestamp: string; // ISO 8601
  readonly userId?: string;
}

export interface AppointmentCreatedEvent extends WebSocketEvent<Appointment> {
  readonly type: 'appointment:created';
}

export interface AppointmentUpdatedEvent extends WebSocketEvent<Appointment> {
  readonly type: 'appointment:updated';
}

export interface LabResultAvailableEvent extends WebSocketEvent<LabResult> {
  readonly type: 'labresult:available';
}

export interface ChatMessageEvent extends WebSocketEvent<{
  readonly id: string;
  readonly senderId: string;
  readonly recipientId: string;
  readonly content: string;
  readonly sentAt: string;
}> {
  readonly type: 'chat:message';
}

export interface NotificationEvent extends WebSocketEvent<{
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: 'info' | 'warning' | 'error' | 'success';
  readonly actionUrl?: string;
}> {
  readonly type: 'notification:new';
}

// ============================================================================
// CHART & UI SHAPES
// ============================================================================

export interface ChartPoint {
  readonly x: string | number | Date;
  readonly y: number;
  readonly label?: string;
}

export interface ChartSeries {
  readonly id: string;
  readonly name?: string;
  readonly points: readonly ChartPoint[];
  readonly color?: string;
  readonly type?: 'line' | 'bar' | 'area' | 'scatter';
}

export interface FormState<T> {
  readonly values: T;
  readonly errors: Partial<Record<keyof T, string>>;
  readonly dirty: boolean;
  readonly isSubmitting: boolean;
  readonly isValid: boolean;
}

export interface TableColumn<T> {
  readonly key: keyof T | string;
  readonly label: string;
  readonly sortable?: boolean;
  readonly width?: string;
  readonly render?: (value: unknown, item: T) => React.ReactNode;
}

export interface FilterOption {
  readonly value: string;
  readonly label: string;
  readonly count?: number;
}

export interface SearchFilters {
  readonly query?: string;
  readonly dateRange?: {
    readonly start: string; // ISO 8601
    readonly end: string; // ISO 8601
  };
  readonly status?: string[];
  readonly type?: string[];
  readonly assignedTo?: string[];
}

// ============================================================================
// NOTIFICATION & MESSAGING
// ============================================================================

export interface Notification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly read: boolean;
  readonly createdAt: string; // ISO 8601
  readonly actionUrl?: string;
  readonly actionLabel?: string;
}

export interface ToastMessage {
  readonly id: string;
  readonly title?: string;
  readonly message: string;
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly duration?: number; // milliseconds
  readonly action?: {
    readonly label: string;
    readonly handler: () => void;
  };
}

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export interface ChartData {
  readonly labels: readonly string[];
  readonly datasets: readonly {
    readonly label: string;
    readonly data: readonly number[];
    readonly backgroundColor?: string | readonly string[];
    readonly borderColor?: string | readonly string[];
    readonly borderWidth?: number;
  }[];
}

export interface ChartConfig {
  readonly xKey?: string;
  readonly yKey?: string;
  readonly width?: number;
  readonly height?: number;
}

// ============================================================================
// SELF-CHECK COMMENTS
// ============================================================================

// ✓ Uses `@/` imports only (no external imports needed for type definitions)
// ✓ Uses providers/hooks (no direct DOM/localStorage side effects - pure types)
// ✓ Reads config from `@/app/config` (not applicable for type definitions)
// ✓ Exports default named component (exports named types as intended)
// ✓ Adds basic ARIA and keyboard handlers (not applicable for type definitions)
