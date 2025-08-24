import type { 
  User, 
  Appointment, 
  MedicalRecord, 
  Prescription, 
  LabResult, 
  InsuranceClaim, 
  Medication, 
  HealthMetric 
} from '@/types';

// Mock users for development authentication
export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'doctor@hospital.com',
    role: 'doctor',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'patient@email.com',
    role: 'patient',
    firstName: 'John',
    lastName: 'Smith',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    email: 'nurse@hospital.com',
    role: 'nurse',
    firstName: 'Maria',
    lastName: 'Garcia',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock appointments data
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    patientId: '2',
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    appointmentDate: new Date('2024-12-20T10:00:00Z'),
    duration: 30,
    status: 'scheduled',
    type: 'consultation',
    notes: 'Regular checkup',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '2',
    patientId: '2',
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    appointmentDate: new Date('2024-12-25T14:30:00Z'),
    duration: 45,
    status: 'scheduled',
    type: 'follow-up',
    notes: 'Blood pressure follow-up',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '3',
    patientId: '2',
    providerId: '3',
    providerName: 'Maria Garcia',
    appointmentDate: new Date('2024-11-15T09:00:00Z'),
    duration: 20,
    status: 'completed',
    type: 'vaccination',
    notes: 'Flu shot administered',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-15')
  }
];

// Mock medical records data
export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: '1',
    patientId: '2',
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    recordDate: new Date('2024-11-15'),
    recordType: 'visit-summary',
    diagnosis: 'Hypertension, Stage 1',
    treatment: 'Lifestyle modifications, medication prescribed',
    notes: 'Patient shows improvement in blood pressure readings. Continue current treatment plan.',
    attachments: [],
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15')
  },
  {
    id: '2',
    patientId: '2',
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    recordDate: new Date('2024-10-01'),
    recordType: 'lab-report',
    diagnosis: 'Annual physical exam',
    treatment: 'No treatment required',
    notes: 'All lab values within normal limits. Patient in good health.',
    attachments: ['lab-results-2024-10-01.pdf'],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01')
  }
];

// Mock prescriptions data
export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: '1',
    patientId: '2',
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    medicationName: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    quantity: 30,
    refillsRemaining: 2,
    prescribedDate: new Date('2024-11-15'),
    expirationDate: new Date('2025-11-15'),
    status: 'active',
    instructions: 'Take with food. Monitor blood pressure.',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15')
  },
  {
    id: '2',
    patientId: '2',
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    medicationName: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: 'Once daily',
    quantity: 90,
    refillsRemaining: 1,
    prescribedDate: new Date('2024-10-01'),
    expirationDate: new Date('2025-10-01'),
    status: 'active',
    instructions: 'Take with largest meal of the day.',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01')
  }
];

// Mock lab results data
export const MOCK_LAB_RESULTS: LabResult[] = [
  {
    id: '1',
    patientId: '2',
    testName: 'Complete Blood Count',
    testDate: new Date('2024-10-01'),
    resultValue: '12.5 g/dL',
    normalRange: '12.0-15.5 g/dL',
    status: 'normal',
    units: 'g/dL',
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    notes: 'Hemoglobin levels within normal range',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01')
  },
  {
    id: '2',
    patientId: '2',
    testName: 'Total Cholesterol',
    testDate: new Date('2024-10-01'),
    resultValue: '195 mg/dL',
    normalRange: '<200 mg/dL',
    status: 'normal',
    units: 'mg/dL',
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    notes: 'Good cholesterol levels maintained',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01')
  },
  {
    id: '3',
    patientId: '2',
    testName: 'Blood Glucose',
    testDate: new Date('2024-11-15'),
    resultValue: '110 mg/dL',
    normalRange: '70-99 mg/dL',
    status: 'high',
    units: 'mg/dL',
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    notes: 'Slightly elevated fasting glucose. Monitor with diet.',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15')
  }
];

// Mock insurance claims data
export const MOCK_INSURANCE_CLAIMS: InsuranceClaim[] = [
  {
    id: '1',
    claimNumber: 'CLM-2024-001',
    patientId: '2',
    serviceDate: new Date('2024-11-15'),
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    serviceDescription: 'Office visit - follow up',
    claimedAmount: 150.00,
    approvedAmount: 120.00,
    status: 'approved',
    insuranceProvider: 'Blue Cross Blue Shield',
    submissionDate: new Date('2024-11-16'),
    processedDate: new Date('2024-11-20'),
    createdAt: new Date('2024-11-16'),
    updatedAt: new Date('2024-11-20')
  },
  {
    id: '2',
    claimNumber: 'CLM-2024-002',
    patientId: '2',
    serviceDate: new Date('2024-10-01'),
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    serviceDescription: 'Annual physical exam with lab work',
    claimedAmount: 350.00,
    approvedAmount: 315.00,
    status: 'approved',
    insuranceProvider: 'Blue Cross Blue Shield',
    submissionDate: new Date('2024-10-02'),
    processedDate: new Date('2024-10-08'),
    createdAt: new Date('2024-10-02'),
    updatedAt: new Date('2024-10-08')
  },
  {
    id: '3',
    claimNumber: 'CLM-2024-003',
    patientId: '2',
    serviceDate: new Date('2024-12-01'),
    providerId: '1',
    providerName: 'Dr. Sarah Johnson',
    serviceDescription: 'Consultation - new symptoms',
    claimedAmount: 200.00,
    approvedAmount: 0,
    status: 'pending',
    insuranceProvider: 'Blue Cross Blue Shield',
    submissionDate: new Date('2024-12-02'),
    processedDate: undefined,
    createdAt: new Date('2024-12-02'),
    updatedAt: new Date('2024-12-02')
  }
];

// Mock medications data
export const MOCK_MEDICATIONS: Medication[] = [
  {
    id: '1',
    patientId: '2',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    timeOfDay: ['09:00'],
    startDate: new Date('2024-11-15'),
    endDate: undefined,
    prescriptionId: '1',
    reminderEnabled: true,
    instructions: 'Take with food',
    sideEffects: 'Possible dizziness, dry cough',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15')
  },
  {
    id: '2',
    patientId: '2',
    name: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: 'Once daily',
    timeOfDay: ['12:00'],
    startDate: new Date('2024-10-01'),
    endDate: undefined,
    prescriptionId: '2',
    reminderEnabled: true,
    instructions: 'Take with largest meal',
    sideEffects: 'Generally well tolerated',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01')
  },
  {
    id: '3',
    patientId: '2',
    name: 'Ibuprofen',
    dosage: '400mg',
    frequency: 'As needed',
    timeOfDay: [],
    startDate: new Date('2024-11-01'),
    endDate: new Date('2024-12-01'),
    prescriptionId: undefined,
    reminderEnabled: false,
    instructions: 'Take with food, maximum 3 times daily',
    sideEffects: 'Stomach upset, drowsiness',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01')
  }
];

// Mock health metrics data
export const MOCK_HEALTH_METRICS: HealthMetric[] = [
  {
    id: '1',
    patientId: '2',
    metricType: 'blood_pressure',
    value: '125/80',
    unit: 'mmHg',
    recordedDate: new Date('2024-12-15T08:30:00Z'),
    deviceId: 'bp-monitor-001',
    notes: 'Morning reading',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: '2',
    patientId: '2',
    metricType: 'heart_rate',
    value: '72',
    unit: 'bpm',
    recordedDate: new Date('2024-12-15T08:30:00Z'),
    deviceId: 'fitness-tracker-001',
    notes: 'Resting heart rate',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: '3',
    patientId: '2',
    metricType: 'weight',
    value: '175',
    unit: 'lbs',
    recordedDate: new Date('2024-12-15T07:00:00Z'),
    deviceId: 'smart-scale-001',
    notes: 'Morning weight',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: '4',
    patientId: '2',
    metricType: 'steps',
    value: '8245',
    unit: 'steps',
    recordedDate: new Date('2024-12-14T23:59:00Z'),
    deviceId: 'fitness-tracker-001',
    notes: 'Daily step count',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15')
  }
];

// Consolidated mock data object for easy import
export const MOCK_DATA = {
  users: MOCK_USERS,
  appointments: MOCK_APPOINTMENTS,
  medicalRecords: MOCK_MEDICAL_RECORDS,
  prescriptions: MOCK_PRESCRIPTIONS,
  labResults: MOCK_LAB_RESULTS,
  insuranceClaims: MOCK_INSURANCE_CLAIMS,
  medications: MOCK_MEDICATIONS,
  healthMetrics: MOCK_HEALTH_METRICS
} as const;

// Mock auth credentials for development
export const MOCK_AUTH_CREDENTIALS = [
  { email: 'doctor@hospital.com', password: 'doc123', role: 'doctor' },
  { email: 'patient@email.com', password: 'patient123', role: 'patient' },
  { email: 'nurse@hospital.com', password: 'nurse123', role: 'nurse' }
] as const;
