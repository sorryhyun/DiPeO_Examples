// FILE: src/types/index.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  speciality: string;
  dateTime: string;
  duration: number; // minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'in-person' | 'telemedicine';
  reason: string;
  notes?: string;
  location?: string;
  videoLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  visitDate: string;
  diagnosis: string[];
  symptoms: string[];
  treatment: string;
  notes: string;
  attachments?: string[];
  icd10Codes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  refillsRemaining: number;
  dateIssued: string;
  dateExpires: string;
  status: 'active' | 'expired' | 'cancelled' | 'completed';
  pharmacyName?: string;
  pharmacyPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  testName: string;
  testType: string;
  orderDate: string;
  resultDate: string;
  status: 'pending' | 'completed' | 'cancelled';
  results: LabTestResult[];
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LabTestResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  flag?: string;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  policyNumber: string;
  insuranceProvider: string;
  claimNumber: string;
  serviceDate: string;
  submissionDate: string;
  status: 'submitted' | 'processing' | 'approved' | 'denied' | 'paid';
  claimAmount: number;
  approvedAmount?: number;
  paidAmount?: number;
  serviceDescription: string;
  providerId: string;
  providerName: string;
  denialReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescriptionId?: string;
  reminderEnabled: boolean;
  reminderTimes: string[];
  instructions: string;
  sideEffects?: string[];
  status: 'active' | 'discontinued' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthMetric {
  id: string;
  patientId: string;
  metricType: 'blood_pressure' | 'heart_rate' | 'weight' | 'blood_sugar' | 'temperature' | 'oxygen_saturation';
  value: string;
  unit: string;
  recordedDate: string;
  deviceId?: string;
  notes?: string;
  isManualEntry: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: string;
  id: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentType = 'in-person' | 'telemedicine';
export type PrescriptionStatus = 'active' | 'expired' | 'cancelled' | 'completed';
export type LabResultStatus = 'pending' | 'completed' | 'cancelled';
export type InsuranceClaimStatus = 'submitted' | 'processing' | 'approved' | 'denied' | 'paid';
export type MedicationStatus = 'active' | 'discontinued' | 'completed';
export type HealthMetricType = 'blood_pressure' | 'heart_rate' | 'weight' | 'blood_sugar' | 'temperature' | 'oxygen_saturation';
export type TestResultStatus = 'normal' | 'abnormal' | 'critical';

// Self-check comments:
// [x] Uses `@/` imports only (no imports needed for this types file)
// [x] Uses providers/hooks (not applicable for types file)
// [x] Reads config from `@/app/config` (not applicable for types file)
// [x] Exports default named component (exports named types instead)
// [x] Adds basic ARIA and keyboard handlers (not applicable for types file)
