// filepath: src/services/dataService.ts

import { apiClient } from '@/services/apiClient';
import { 
  User, 
  Patient, 
  Doctor, 
  Appointment, 
  MedicalRecord,
  LabResult,
  Prescription,
  ChartSeries,
  ChartPoint,
  PaginatedResponse,
  SearchFilters,
  ApiResult 
} from '@/core/contracts';
import { config, isDevelopment, shouldUseMockData } from '@/app/config';
import { eventBus } from '@/core/events';
import { debugLog, errorLog, safeAsync } from '@/core/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DashboardMetrics {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingLabResults: number;
  activePrescriptions: number;
  revenue: number;
  growthRate: number;
  satisfactionScore: number;
}

export interface AppointmentMetrics {
  byStatus: ChartSeries[];
  byMonth: ChartSeries[];
  bySpecialty: ChartSeries[];
  byHour: ChartSeries[];
}

export interface PatientMetrics {
  byAge: ChartSeries[];
  byGender: ChartSeries[];
  newPatients: ChartSeries[];
  returnPatients: ChartSeries[];
}

export interface RevenueMetrics {
  monthly: ChartSeries[];
  byService: ChartSeries[];
  byInsurance: ChartSeries[];
  trends: ChartSeries[];
}

export interface DataServiceInterface {
  // Dashboard data
  getDashboardMetrics: () => Promise<DashboardMetrics>;
  getAppointmentMetrics: (dateRange?: { start: string; end: string }) => Promise<AppointmentMetrics>;
  getPatientMetrics: (dateRange?: { start: string; end: string }) => Promise<PatientMetrics>;
  getRevenueMetrics: (dateRange?: { start: string; end: string }) => Promise<RevenueMetrics>;

  // Entity lists
  getPatients: (filters?: SearchFilters) => Promise<PaginatedResponse<Patient>>;
  getDoctors: (filters?: SearchFilters) => Promise<PaginatedResponse<Doctor>>;
  getAppointments: (filters?: SearchFilters) => Promise<PaginatedResponse<Appointment>>;
  getLabResults: (patientId?: string, filters?: SearchFilters) => Promise<PaginatedResponse<LabResult>>;
  getPrescriptions: (patientId?: string, filters?: SearchFilters) => Promise<PaginatedResponse<Prescription>>;

  // Individual entities
  getPatient: (id: string) => Promise<Patient>;
  getDoctor: (id: string) => Promise<Doctor>;
  getAppointment: (id: string) => Promise<Appointment>;
  getMedicalRecord: (patientId: string) => Promise<MedicalRecord>;
  getLabResult: (id: string) => Promise<LabResult>;
  getPrescription: (id: string) => Promise<Prescription>;

  // Search and filtering
  searchPatients: (query: string) => Promise<Patient[]>;
  searchDoctors: (query: string) => Promise<Doctor[]>;
  searchAppointments: (query: string) => Promise<Appointment[]>;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

function generateMockDashboardMetrics(): DashboardMetrics {
  return {
    totalPatients: 1247,
    totalAppointments: 89,
    completedAppointments: 73,
    pendingLabResults: 12,
    activePrescriptions: 156,
    revenue: 87420,
    growthRate: 12.5,
    satisfactionScore: 4.7,
  };
}

function generateMockChartSeries(name: string, points: number): ChartSeries {
  const data: ChartPoint[] = [];
  for (let i = 0; i < points; i++) {
    data.push({
      x: `Month ${i + 1}`,
      y: Math.floor(Math.random() * 100) + 50,
      label: `${name} - Month ${i + 1}`,
    });
  }

  return {
    id: `mock-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    points: data,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
    type: 'line',
  };
}

function generateMockAppointmentMetrics(): AppointmentMetrics {
  return {
    byStatus: [
      generateMockChartSeries('Scheduled', 5),
      generateMockChartSeries('Completed', 5),
      generateMockChartSeries('Cancelled', 5),
    ],
    byMonth: [generateMockChartSeries('Appointments', 12)],
    bySpecialty: [
      generateMockChartSeries('Cardiology', 6),
      generateMockChartSeries('Dermatology', 6),
      generateMockChartSeries('Pediatrics', 6),
    ],
    byHour: [generateMockChartSeries('Hourly Distribution', 24)],
  };
}

function generateMockPatientMetrics(): PatientMetrics {
  return {
    byAge: [
      generateMockChartSeries('0-18', 5),
      generateMockChartSeries('19-35', 5),
      generateMockChartSeries('36-65', 5),
      generateMockChartSeries('65+', 5),
    ],
    byGender: [
      generateMockChartSeries('Male', 2),
      generateMockChartSeries('Female', 2),
      generateMockChartSeries('Other', 2),
    ],
    newPatients: [generateMockChartSeries('New Patients', 12)],
    returnPatients: [generateMockChartSeries('Return Patients', 12)],
  };
}

function generateMockRevenueMetrics(): RevenueMetrics {
  return {
    monthly: [generateMockChartSeries('Revenue', 12)],
    byService: [
      generateMockChartSeries('Consultations', 6),
      generateMockChartSeries('Procedures', 6),
      generateMockChartSeries('Lab Tests', 6),
    ],
    byInsurance: [
      generateMockChartSeries('Insurance A', 4),
      generateMockChartSeries('Insurance B', 4),
      generateMockChartSeries('Self Pay', 4),
    ],
    trends: [generateMockChartSeries('Growth Trend', 12)],
  };
}

function generateMockPatient(id: string): Patient {
  return {
    id,
    email: `patient${id}@example.com`,
    name: `Patient ${id}`,
    roles: ['patient'],
    avatarUrl: undefined,
    lastSeen: new Date().toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    patientId: `P${id.padStart(6, '0')}`,
    dob: new Date(Date.now() - (20 + Math.random() * 60) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)] as any,
    primaryPhysicianId: `doc-${Math.floor(Math.random() * 10) + 1}`,
    medicalRecordSummary: 'Routine checkups, no major health concerns.',
    emergencyContact: {
      name: `Emergency Contact ${id}`,
      phone: `555-${Math.floor(Math.random() * 9000) + 1000}`,
      relationship: 'Spouse',
    },
  };
}

function generateMockPaginatedPatients(page = 1, pageSize = 20): PaginatedResponse<Patient> {
  const total = 1247;
  const items: Patient[] = [];
  
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  
  for (let i = start; i < end; i++) {
    items.push(generateMockPatient((i + 1).toString()));
  }

  return {
    items,
    total,
    page,
    pageSize,
    hasNext: end < total,
    hasPrev: page > 1,
  };
}

// ============================================================================
// DATA SERVICE IMPLEMENTATION
// ============================================================================

class DataService implements DataServiceInterface {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    debugLog('DataService initialized', { mockData: shouldUseMockData });
  }

  /**
   * Generic cache management
   */
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      debugLog(`DataService: Cache hit for ${key}`);
      return cached.data as T;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache<T>(key: string, data: T, ttl = this.cacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    debugLog(`DataService: Cached ${key} for ${ttl}ms`);
  }

  /**
   * Build query string from filters
   */
  private buildQueryString(filters?: SearchFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();
    
    if (filters.query) params.append('q', filters.query);
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.start);
      params.append('endDate', filters.dateRange.end);
    }
    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters.type?.length) {
      filters.type.forEach(type => params.append('type', type));
    }
    if (filters.assignedTo?.length) {
      filters.assignedTo.forEach(assignee => params.append('assignedTo', assignee));
    }

    return params.toString() ? `?${params.toString()}` : '';
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const cacheKey = 'dashboard:metrics';
    const cached = this.getCached<DashboardMetrics>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData = generateMockDashboardMetrics();
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      const metrics = await apiClient.fetchJson<DashboardMetrics>('/dashboard/metrics');
      this.setCache(cacheKey, metrics);
      eventBus.emit('data:updated', { key: 'dashboard:metrics', payload: metrics });
      return metrics;
    } catch (error) {
      errorLog('DataService: Failed to fetch dashboard metrics', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get appointment metrics
   */
  async getAppointmentMetrics(dateRange?: { start: string; end: string }): Promise<AppointmentMetrics> {
    const cacheKey = `appointment:metrics:${dateRange ? `${dateRange.start}-${dateRange.end}` : 'all'}`;
    const cached = this.getCached<AppointmentMetrics>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData = generateMockAppointmentMetrics();
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      let url = '/analytics/appointments';
      if (dateRange) {
        url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      }

      const metrics = await apiClient.fetchJson<AppointmentMetrics>(url);
      this.setCache(cacheKey, metrics);
      eventBus.emit('data:updated', { key: 'appointment:metrics', payload: metrics });
      return metrics;
    } catch (error) {
      errorLog('DataService: Failed to fetch appointment metrics', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get patient metrics
   */
  async getPatientMetrics(dateRange?: { start: string; end: string }): Promise<PatientMetrics> {
    const cacheKey = `patient:metrics:${dateRange ? `${dateRange.start}-${dateRange.end}` : 'all'}`;
    const cached = this.getCached<PatientMetrics>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData = generateMockPatientMetrics();
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      let url = '/analytics/patients';
      if (dateRange) {
        url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      }

      const metrics = await apiClient.fetchJson<PatientMetrics>(url);
      this.setCache(cacheKey, metrics);
      eventBus.emit('data:updated', { key: 'patient:metrics', payload: metrics });
      return metrics;
    } catch (error) {
      errorLog('DataService: Failed to fetch patient metrics', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(dateRange?: { start: string; end: string }): Promise<RevenueMetrics> {
    const cacheKey = `revenue:metrics:${dateRange ? `${dateRange.start}-${dateRange.end}` : 'all'}`;
    const cached = this.getCached<RevenueMetrics>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData = generateMockRevenueMetrics();
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      let url = '/analytics/revenue';
      if (dateRange) {
        url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      }

      const metrics = await apiClient.fetchJson<RevenueMetrics>(url);
      this.setCache(cacheKey, metrics);
      eventBus.emit('data:updated', { key: 'revenue:metrics', payload: metrics });
      return metrics;
    } catch (error) {
      errorLog('DataService: Failed to fetch revenue metrics', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get paginated patients list
   */
  async getPatients(filters?: SearchFilters): Promise<PaginatedResponse<Patient>> {
    const queryString = this.buildQueryString(filters);
    const cacheKey = `patients:list${queryString}`;
    const cached = this.getCached<PaginatedResponse<Patient>>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData = generateMockPaginatedPatients();
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      const patients = await apiClient.fetchJson<PaginatedResponse<Patient>>(`/patients${queryString}`);
      this.setCache(cacheKey, patients, 2 * 60 * 1000); // 2 minutes for lists
      return patients;
    } catch (error) {
      errorLog('DataService: Failed to fetch patients', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get paginated doctors list
   */
  async getDoctors(filters?: SearchFilters): Promise<PaginatedResponse<Doctor>> {
    const queryString = this.buildQueryString(filters);
    const cacheKey = `doctors:list${queryString}`;
    const cached = this.getCached<PaginatedResponse<Doctor>>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      // Generate mock doctors data
      const mockData: PaginatedResponse<Doctor> = {
        items: [],
        total: 25,
        page: 1,
        pageSize: 20,
        hasNext: true,
        hasPrev: false,
      };
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      const doctors = await apiClient.fetchJson<PaginatedResponse<Doctor>>(`/doctors${queryString}`);
      this.setCache(cacheKey, doctors, 2 * 60 * 1000);
      return doctors;
    } catch (error) {
      errorLog('DataService: Failed to fetch doctors', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get paginated appointments list
   */
  async getAppointments(filters?: SearchFilters): Promise<PaginatedResponse<Appointment>> {
    const queryString = this.buildQueryString(filters);
    const cacheKey = `appointments:list${queryString}`;
    const cached = this.getCached<PaginatedResponse<Appointment>>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      // Generate mock appointments data
      const mockData: PaginatedResponse<Appointment> = {
        items: [],
        total: 89,
        page: 1,
        pageSize: 20,
        hasNext: true,
        hasPrev: false,
      };
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      const appointments = await apiClient.fetchJson<PaginatedResponse<Appointment>>(`/appointments${queryString}`);
      this.setCache(cacheKey, appointments, 1 * 60 * 1000);// 1 minute for appointments
      return appointments;
    } catch (error) {
      errorLog('DataService: Failed to fetch appointments', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get paginated lab results
   */
  async getLabResults(patientId?: string, filters?: SearchFilters): Promise<PaginatedResponse<LabResult>> {
    const queryString = this.buildQueryString(filters);
    const url = patientId ? `/patients/${patientId}/lab-results${queryString}` : `/lab-results${queryString}`;
    const cacheKey = `lab-results:${patientId || 'all'}${queryString}`;
    const cached = this.getCached<PaginatedResponse<LabResult>>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData: PaginatedResponse<LabResult> = {
        items: [],
        total: 12,
        page: 1,
        pageSize: 20,
        hasNext: false,
        hasPrev: false,
      };
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      const labResults = await apiClient.fetchJson<PaginatedResponse<LabResult>>(url);
      this.setCache(cacheKey, labResults, 2 * 60 * 1000);
      return labResults;
    } catch (error) {
      errorLog('DataService: Failed to fetch lab results', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get paginated prescriptions
   */
  async getPrescriptions(patientId?: string, filters?: SearchFilters): Promise<PaginatedResponse<Prescription>> {
    const queryString = this.buildQueryString(filters);
    const url = patientId ? `/patients/${patientId}/prescriptions${queryString}` : `/prescriptions${queryString}`;
    const cacheKey = `prescriptions:${patientId || 'all'}${queryString}`;
    const cached = this.getCached<PaginatedResponse<Prescription>>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData: PaginatedResponse<Prescription> = {
        items: [],
        total: 156,
        page: 1,
        pageSize: 20,
        hasNext: true,
        hasPrev: false,
      };
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      const prescriptions = await apiClient.fetchJson<PaginatedResponse<Prescription>>(url);
      this.setCache(cacheKey, prescriptions, 2 * 60 * 1000);
      return prescriptions;
    } catch (error) {
      errorLog('DataService: Failed to fetch prescriptions', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get individual patient
   */
  async getPatient(id: string): Promise<Patient> {
    const cacheKey = `patient:${id}`;
    const cached = this.getCached<Patient>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData = generateMockPatient(id);
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      const patient = await apiClient.fetchJson<Patient>(`/patients/${id}`);
      this.setCache(cacheKey, patient);
      return patient;
    } catch (error) {
      errorLog(`DataService: Failed to fetch patient ${id}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get individual doctor
   */
  async getDoctor(id: string): Promise<Doctor> {
    const cacheKey = `doctor:${id}`;
    const cached = this.getCached<Doctor>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData: Doctor = {
        id,
        email: `doctor${id}@example.com`,
        name: `Dr. ${id}`,
        roles: ['doctor'],
        avatarUrl: undefined,
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        doctorId: `D${id.padStart(6, '0')}`,
        specialty: ['Cardiology', 'Dermatology', 'Pediatrics'][Math.floor(Math.random() * 3)],
        licenseNumber: `LIC${Math.floor(Math.random() * 100000)}`,
        clinicIds: [`clinic-${Math.floor(Math.random() * 5) + 1}`],
        yearsOfExperience: Math.floor(Math.random() * 20) + 5,
      };
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      const doctor = await apiClient.fetchJson<Doctor>(`/doctors/${id}`);
      this.setCache(cacheKey, doctor);
      return doctor;
    } catch (error) {
      errorLog(`DataService: Failed to fetch doctor ${id}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get individual appointment
   */
  async getAppointment(id: string): Promise<Appointment> {
    const cacheKey = `appointment:${id}`;
    const cached = this.getCached<Appointment>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData: Appointment = {
        id,
        patientId: `patient-${Math.floor(Math.random() * 100) + 1}`,
        practitionerId: `doctor-${Math.floor(Math.random() * 25) + 1}`,
        startAt: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        status: ['scheduled', 'confirmed', 'completed'][Math.floor(Math.random() * 3)] as any,
        reason: 'Routine checkup',
        location: 'Room 101',
        notes: 'Patient is feeling well',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      const appointment = await apiClient.fetchJson<Appointment>(`/appointments/${id}`);
      this.setCache(cacheKey, appointment);
      return appointment;
    } catch (error) {
      errorLog(`DataService: Failed to fetch appointment ${id}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get medical record for patient
   */
  async getMedicalRecord(patientId: string): Promise<MedicalRecord> {
    const cacheKey = `medical-record:${patientId}`;
    const cached = this.getCached<MedicalRecord>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData: MedicalRecord = {
        id: `record-${patientId}`,
        patientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entries: [],
      };
      this.setCache(cacheKey, mockData);
      return mockData;
    }

    try {
      const record = await apiClient.fetchJson<MedicalRecord>(`/patients/${patientId}/medical-record`);
      this.setCache(cacheKey, record);
      return record;
    } catch (error) {
      errorLog(`DataService: Failed to fetch medical record for patient ${patientId}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get individual lab result
   */
  async getLabResult(id: string): Promise<LabResult> {
    const cacheKey = `lab-result:${id}`;
    const cached = this.getCached<LabResult>(cacheKey);
    if (cached) return cached;

    try {
      const labResult = await apiClient.fetchJson<LabResult>(`/lab-results/${id}`);
      this.setCache(cacheKey, labResult);
      return labResult;
    } catch (error) {
      errorLog(`DataService: Failed to fetch lab result ${id}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get individual prescription
   */
  async getPrescription(id: string): Promise<Prescription> {
    const cacheKey = `prescription:${id}`;
    const cached = this.getCached<Prescription>(cacheKey);
    if (cached) return cached;

    try {
      const prescription = await apiClient.fetchJson<Prescription>(`/prescriptions/${id}`);
      this.setCache(cacheKey, prescription);
      return prescription;
    } catch (error) {
      errorLog(`DataService: Failed to fetch prescription ${id}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Search patients
   */
  async searchPatients(query: string): Promise<Patient[]> {
    if (!query.trim()) return [];

    const cacheKey = `search:patients:${query}`;
    const cached = this.getCached<Patient[]>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData = [generateMockPatient('1'), generateMockPatient('2')];
      this.setCache(cacheKey, mockData, 1 * 60 * 1000); // 1 minute for search
      return mockData;
    }

    try {
      const results = await apiClient.fetchJson<Patient[]>(`/search/patients?q=${encodeURIComponent(query)}`);
      this.setCache(cacheKey, results, 1 * 60 * 1000);
      return results;
    } catch (error) {
      errorLog(`DataService: Failed to search patients with query "${query}"`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Search doctors
   */
  async searchDoctors(query: string): Promise<Doctor[]> {
    if (!query.trim()) return [];

    const cacheKey = `search:doctors:${query}`;
    const cached = this.getCached<Doctor[]>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData: Doctor[] = [];
      this.setCache(cacheKey, mockData, 1 * 60 * 1000);
      return mockData;
    }

    try {
      const results = await apiClient.fetchJson<Doctor[]>(`/search/doctors?q=${encodeURIComponent(query)}`);
      this.setCache(cacheKey, results, 1 * 60 * 1000);
      return results;
    } catch (error) {
      errorLog(`DataService: Failed to search doctors with query "${query}"`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Search appointments
   */
  async searchAppointments(query: string): Promise<Appointment[]> {
    if (!query.trim()) return [];

    const cacheKey = `search:appointments:${query}`;
    const cached = this.getCached<Appointment[]>(cacheKey);
    if (cached) return cached;

    if (shouldUseMockData) {
      const mockData: Appointment[] = [];
      this.setCache(cacheKey, mockData, 1 * 60 * 1000);
      return mockData;
    }

    try {
      const results = await apiClient.fetchJson<Appointment[]>(`/search/appointments?q=${encodeURIComponent(query)}`);
      this.setCache(cacheKey, results, 1 * 60 * 1000);
      return results;
    } catch (error) {
      errorLog(`DataService: Failed to search appointments with query "${query}"`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    debugLog('DataService: Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE & SAFE WRAPPERS
// ============================================================================

/**
 * Default data service instance
 */
export const dataService = new DataService();

/**
 * Safe wrapper functions for all data service methods
 */
export const safeDashboardMetrics = safeAsync(dataService.getDashboardMetrics.bind(dataService));
export const safeAppointmentMetrics = safeAsync(dataService.getAppointmentMetrics.bind(dataService));
export const safePatientMetrics = safeAsync(dataService.getPatientMetrics.bind(dataService));
export const safeRevenueMetrics = safeAsync(dataService.getRevenueMetrics.bind(dataService));

export const safeGetPatients = safeAsync(dataService.getPatients.bind(dataService));
export const safeGetDoctors = safeAsync(dataService.getDoctors.bind(dataService));
export const safeGetAppointments = safeAsync(dataService.getAppointments.bind(dataService));

export const safeGetPatient = safeAsync(dataService.getPatient.bind(dataService));
export const safeGetDoctor = safeAsync(dataService.getDoctor.bind(dataService));
export const safeGetAppointment = safeAsync(dataService.getAppointment.bind(dataService));

export const safeSearchPatients = safeAsync(dataService.searchPatients.bind(dataService));
export const safeSearchDoctors = safeAsync(dataService.searchDoctors.bind(dataService));
export const safeSearchAppointments = safeAsync(dataService.searchAppointments.bind(dataService));

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

if (isDevelopment) {
  // Expose data service debugging on window object in development
  (globalThis as any).__data_service_debug = {
    dataService,
    getCacheStats: () => dataService.getCacheStats(),
    clearCache: () => dataService.clearCache(),
    safeDashboardMetrics,
    safeGetPatients,
    safeSearchPatients,
  };

  debugLog('DataService initialized with debug helpers');
}

// Default export
export default dataService;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/services/apiClient, @/core/contracts, @/app/config, @/core/events, @/core/utils
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure service layer with caching
// [x] Reads config from `@/app/config` - Uses config, isDevelopment, shouldUseMockData
// [x] Exports default named component - Exports dataService as default and multiple named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for data service
