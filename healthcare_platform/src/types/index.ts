// User roles in the healthcare system
export type Role = 'patient' | 'doctor' | 'nurse' | 'admin';

// Core user entity
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication token structure
export interface AuthToken {
  token: string;
  refreshToken?: string;
  expiresAt: string;
}

// Appointment scheduling and management
export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: 'consultation' | 'follow-up' | 'procedure' | 'telemedicine';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

// Medical records and patient history
export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId: string;
  recordType: 'diagnosis' | 'treatment' | 'procedure' | 'note' | 'discharge';
  title: string;
  description: string;
  diagnosis?: string;
  treatmentPlan?: string;
  attachments?: string[];
  recordDate: string;
  createdAt: string;
  updatedAt: string;
}

// Prescription management
export interface Prescription {
  id: string;
  patientId: string;
  providerId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  refillsRemaining: number;
  maxRefills: number;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  prescribedDate: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Laboratory test results
export interface LabResult {
  id: string;
  patientId: string;
  providerId: string;
  testName: string;
  testCode: string;
  value: string | number;
  unit?: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  testDate: string;
  resultDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Insurance claims and coverage
export interface InsuranceClaim {
  id: string;
  patientId: string;
  claimNumber: string;
  providerId: string;
  serviceDate: string;
  description: string;
  amount: number;
  copay?: number;
  deductible?: number;
  status: 'submitted' | 'processing' | 'approved' | 'denied' | 'paid';
  submissionDate: string;
  processedDate?: string;
  denialReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Medication tracking and reminders
export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduleTime: string[];
  nextDoseTime?: string;
  isActive: boolean;
  reminderEnabled: boolean;
  prescriptionId?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Health metrics and vital signs
export interface HealthMetric {
  id: string;
  patientId: string;
  metricType: 'blood_pressure' | 'heart_rate' | 'weight' | 'temperature' | 'glucose' | 'steps' | 'sleep';
  value: number | string;
  unit: string;
  systolic?: number; // For blood pressure
  diastolic?: number; // For blood pressure
  recordedDate: string;
  source: 'manual' | 'device' | 'provider';
  deviceId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}

// WebSocket event structure for real-time updates
export interface WebSocketEvent {
  type: string;
  channel: string;
  payload: any;
  timestamp: string;
}

// Paginated response structure
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Error response structure
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Form validation error structure
export interface ValidationError {
  field: string;
  message: string;
}

// Self-check comments:
// [x] Uses `@/` imports only - No imports needed for type definitions
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Type definitions only
// [x] Reads config from `@/app/config` - Not applicable for types
// [x] Exports default named component - Using named exports for types
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Not applicable for types
