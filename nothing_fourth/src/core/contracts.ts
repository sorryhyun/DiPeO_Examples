// filepath: src/core/contracts.ts

// ===============================================
// Core Domain Types & Enums
// ===============================================

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
  | 'note' 
  | 'diagnosis' 
  | 'treatment' 
  | 'vital-signs' 
  | 'allergy' 
  | 'medication';

// ===============================================
// User & Authentication Types
// ===============================================

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly roles: Role[];
  readonly avatarUrl?: string;
  readonly lastSeen?: string; // ISO 8601 timestamp
  readonly createdAt: string;
  readonly isActive: boolean;
}

export interface Patient extends User {
  readonly patientId: string;
  readonly dateOfBirth: string; // ISO 8601 date
  readonly gender: Gender;
  readonly primaryPhysicianId?: string;
  readonly medicalRecordSummary?: string;
  readonly emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Doctor extends User {
  readonly doctorId: string;
  readonly specialty: string;
  readonly licenseNumber: string;
  readonly clinicIds: string[];
  readonly yearsOfExperience?: number;
}

export interface Nurse extends User {
  readonly nurseId: string;
  readonly department: string;
  readonly shiftPattern: string;
  readonly certifications: string[];
}

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: string; // ISO 8601 timestamp
}

export interface AuthResponse {
  readonly user: User;
  readonly tokens: AuthTokens;
}

// ===============================================
// Healthcare Domain Models
// ===============================================

export interface Appointment {
  readonly id: string;
  readonly patientId: string;
  readonly practitionerId: string;
  readonly startAt: string; // ISO 8601 timestamp
  readonly endAt: string; // ISO 8601 timestamp
  readonly status: AppointmentStatus;
  readonly reason: string;
  readonly location: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MedicalRecordEntry {
  readonly id: string;
  readonly type: MedicalRecordEntryType;
  readonly data: Record<string, unknown>;
  readonly recordedBy: string; // User ID
  readonly recordedAt: string; // ISO 8601 timestamp
  readonly attachments?: string[]; // File URLs
}

export interface MedicalRecord {
  readonly id: string;
  readonly patientId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly entries: MedicalRecordEntry[];
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
  readonly medications: Medication[];
  readonly issuedAt: string; // ISO 8601 timestamp
  readonly validUntil?: string; // ISO 8601 timestamp
  readonly notes?: string;
  readonly status: 'active' | 'filled' | 'cancelled' | 'expired';
}

export interface LabResult {
  readonly id: string;
  readonly patientId: string;
  readonly type: string;
  readonly value: string | number;
  readonly unit: string;
  readonly referenceRange: string;
  readonly collectedAt: string; // ISO 8601 timestamp
  readonly reportedAt: string; // ISO 8601 timestamp
  readonly status: 'pending' | 'completed' | 'abnormal';
  readonly attachments?: string[]; // File URLs
  readonly orderedBy: string; // Practitioner ID
}

// ===============================================
// API Response Envelopes
// ===============================================

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
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

// Convenience type alias
export type Paginated<T> = PaginatedResponse<T>;

// ===============================================
// WebSocket Event Types
// ===============================================

export type WebSocketEventType = 
  | 'appointment:created'
  | 'appointment:updated' 
  | 'appointment:cancelled'
  | 'labresult:available'
  | 'prescription:issued'
  | 'chat:message'
  | 'notification:new'
  | 'user:online'
  | 'user:offline';

export interface WebSocketEventPayload {
  'appointment:created': Appointment;
  'appointment:updated': Appointment;
  'appointment:cancelled': { appointmentId: string; reason: string };
  'labresult:available': LabResult;
  'prescription:issued': Prescription;
  'chat:message': { from: string; to: string; message: string; timestamp: string };
  'notification:new': { id: string; type: string; message: string; userId: string };
  'user:online': { userId: string; timestamp: string };
  'user:offline': { userId: string; timestamp: string };
}

export type WebSocketEvent<T extends WebSocketEventType = WebSocketEventType> = {
  type: T;
  payload: WebSocketEventPayload[T];
  timestamp: string;
};

// ===============================================
// Chart & UI Data Shapes
// ===============================================

export interface ChartDataPoint {
  readonly x: string | number | Date;
  readonly y: number;
  readonly label?: string;
}

export interface ChartSeries {
  readonly id: string;
  readonly name?: string;
  readonly points: ChartDataPoint[];
  readonly color?: string;
  readonly type?: 'line' | 'bar' | 'area' | 'scatter';
}

export interface FormState<T> {
  readonly values: T;
  readonly errors: Partial<Record<keyof T, string>>;
  readonly dirty: boolean;
  readonly isValid: boolean;
  readonly isSubmitting?: boolean;
}

// ===============================================
// Utility Types
// ===============================================

export type EntityId = string;
export type Timestamp = string; // ISO 8601

export interface AuditableEntity {
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly createdBy?: EntityId;
  readonly updatedBy?: EntityId;
}

export interface SoftDeletableEntity {
  readonly deletedAt?: Timestamp;
  readonly deletedBy?: EntityId;
}

// Generic entity base
export interface BaseEntity extends AuditableEntity {
  readonly id: EntityId;
}

// Search and filter utilities
export interface SearchParams {
  readonly query?: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly filters?: Record<string, unknown>;
}

export interface SelectOption<T = string> {
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only (no external imports needed for type definitions)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects - this is pure types)
- [x] Reads config from `@/app/config` (not applicable for contracts file)
- [x] Exports default named component (not applicable - exports types/interfaces)
- [x] Adds basic ARIA and keyboard handlers (not applicable for type definitions)
*/
