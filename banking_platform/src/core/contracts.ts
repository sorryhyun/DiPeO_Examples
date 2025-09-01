// filepath: src/core/contracts.ts
/* src/core/contracts.ts

This file defines canonical domain DTOs and UI helper types used across the app.
All endpoint clients and UI components should import these types from '@/core/contracts'.
*/

// Basic API envelope types
export type ApiResult<T> = {
  ok: true;
  data: T;
  meta?: Record<string, any>;
};

export type ApiError = {
  ok: false;
  status: number;
  code?: string;
  message: string;
  details?: Record<string, any>;
};

export type ApiResponse<T> = ApiResult<T> | ApiError;

export type PaginatedResponse<T> = ApiResult<{ items: T[]; total: number; page: number; pageSize: number }>;

// Roles and users
export type Role = 'admin' | 'doctor' | 'nurse' | 'patient' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: Role[];
  metadata?: Record<string, any>;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
}

export interface Patient extends User {
  dateOfBirth?: string; // ISO
  medicalRecordNumber?: string;
  primaryDoctorId?: string;
  emergencyContact?: { name: string; phone: string } | null;
}

export interface Doctor extends User {
  specialty?: string;
  licenseNumber?: string;
  clinicIds?: string[];
}

export interface Nurse extends User {
  department?: string;
  licenseNumber?: string;
}

// Healthcare domain models
export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  startAt: string; // ISO
  endAt?: string; // ISO
  type?: 'in_person' | 'telehealth' | string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | string;
  notes?: string;
  location?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  summary?: string;
  conditions?: string[];
  allergies?: string[];
  documents?: Array<{ id: string; name: string; url?: string }>;
}

export interface Prescription {
  id: string;
  patientId: string;
  prescribedById: string;
  medicationName: string;
  dose?: string;
  frequency?: string;
  instructions?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  resultValue: string;
  units?: string;
  referenceRange?: string;
  collectedAt?: string; // ISO
  reportedAt?: string; // ISO
  notes?: string;
}

// Lightweight metric point used by charts
export interface MetricPoint {
  timestamp: string; // ISO
  value: number;
  label?: string;
  meta?: Record<string, any>;
}

// WebSocket events (app may enable/disable websockets)
export type WebSocketEventType = 'patient:update' | 'appointment:created' | 'appointment:updated' | 'lab:result' | 'system:notice' | string;

export interface WebSocketEvent<Payload = any> {
  id: string;
  type: WebSocketEventType;
  payload: Payload;
  createdAt: string; // ISO
}

// UI helper types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T = any> {
  values: T;
  touched: Partial<Record<keyof T, boolean>>;
  errors: Partial<Record<keyof T, string | null>>;
  submitting: boolean;
}

/* Example usage:
import { User, ApiResponse } from '@/core/contracts'

function handleLoginResponse(res: ApiResponse<User>) {
  if (res.ok) {
    // res.data is typed User
  } else {
    // res is ApiError
  }
}
*/

// Self-check comments:
// [x] Uses `@/` imports only (no imports needed for this contracts file)
// [x] Uses providers/hooks (not applicable - this is a type-only file)
// [x] Reads config from `@/app/config` (not applicable - this is a contracts file)
// [x] Exports default named component (exports named types and interfaces)
// [x] Adds basic ARIA and keyboard handlers (not applicable - this is a type-only file)
