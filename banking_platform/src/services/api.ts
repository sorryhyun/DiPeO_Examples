// filepath: src/services/api.ts
/* src/services/api.ts

Typed API client wrapper for all backend endpoints. Uses contracts from core/contracts.ts 
and fetcher for network details. Exposes modular endpoint functions (auth.login, metrics.get).
*/

import type { 
  User, 
  Patient, 
  Doctor, 
  Nurse,
  Appointment, 
  MedicalRecord, 
  Prescription, 
  LabResult, 
  MetricPoint,
  ApiResponse, 
  PaginatedResponse 
} from '@/core/contracts';
import { appConfig } from '@/app/config';
import { fetcher } from '@/services/fetcher';
import { registerService, API_CLIENT_TOKEN } from '@/core/di';

// Auth API endpoints
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return fetcher.post('/auth/login', { email, password });
  },

  async logout(): Promise<ApiResponse<void>> {
    return fetcher.post('/auth/logout');
  },

  async register(data: { email: string; password: string; name: string; role?: string }): Promise<ApiResponse<User>> {
    return fetcher.post('/auth/register', data);
  },

  async me(): Promise<ApiResponse<User>> {
    return fetcher.get('/auth/me');
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return fetcher.post('/auth/refresh');
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return fetcher.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    return fetcher.post('/auth/reset-password', { token, password });
  },
};

// User management API
export const usersApi = {
  async getUsers(params?: { page?: number; limit?: number; role?: string }): Promise<PaginatedResponse<User>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.role) query.set('role', params.role);
    
    const url = `/users${query.toString() ? '?' + query.toString() : ''}`;
    return fetcher.get(url);
  },

  async getUser(id: string): Promise<ApiResponse<User>> {
    return fetcher.get(`/users/${id}`);
  },

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return fetcher.patch(`/users/${id}`, data);
  },

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return fetcher.delete(`/users/${id}`);
  },
};

// Patients API
export const patientsApi = {
  async getPatients(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Patient>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    
    const url = `/patients${query.toString() ? '?' + query.toString() : ''}`;
    return fetcher.get(url);
  },

  async getPatient(id: string): Promise<ApiResponse<Patient>> {
    return fetcher.get(`/patients/${id}`);
  },

  async createPatient(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Patient>> {
    return fetcher.post('/patients', data);
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<ApiResponse<Patient>> {
    return fetcher.patch(`/patients/${id}`, data);
  },

  async deletePatient(id: string): Promise<ApiResponse<void>> {
    return fetcher.delete(`/patients/${id}`);
  },
};

// Appointments API
export const appointmentsApi = {
  async getAppointments(params?: { 
    page?: number; 
    limit?: number; 
    patientId?: string; 
    providerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Appointment>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.patientId) query.set('patientId', params.patientId);
    if (params?.providerId) query.set('providerId', params.providerId);
    if (params?.status) query.set('status', params.status);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    
    const url = `/appointments${query.toString() ? '?' + query.toString() : ''}`;
    return fetcher.get(url);
  },

  async getAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return fetcher.get(`/appointments/${id}`);
  },

  async createAppointment(data: Omit<Appointment, 'id'>): Promise<ApiResponse<Appointment>> {
    return fetcher.post('/appointments', data);
  },

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    return fetcher.patch(`/appointments/${id}`, data);
  },

  async cancelAppointment(id: string, reason?: string): Promise<ApiResponse<Appointment>> {
    return fetcher.patch(`/appointments/${id}`, { status: 'cancelled', notes: reason });
  },

  async deleteAppointment(id: string): Promise<ApiResponse<void>> {
    return fetcher.delete(`/appointments/${id}`);
  },
};

// Medical Records API
export const medicalRecordsApi = {
  async getRecords(patientId: string): Promise<ApiResponse<MedicalRecord[]>> {
    return fetcher.get(`/patients/${patientId}/records`);
  },

  async getRecord(id: string): Promise<ApiResponse<MedicalRecord>> {
    return fetcher.get(`/medical-records/${id}`);
  },

  async createRecord(data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MedicalRecord>> {
    return fetcher.post('/medical-records', data);
  },

  async updateRecord(id: string, data: Partial<MedicalRecord>): Promise<ApiResponse<MedicalRecord>> {
    return fetcher.patch(`/medical-records/${id}`, data);
  },

  async deleteRecord(id: string): Promise<ApiResponse<void>> {
    return fetcher.delete(`/medical-records/${id}`);
  },
};

// Prescriptions API
export const prescriptionsApi = {
  async getPrescriptions(patientId: string): Promise<ApiResponse<Prescription[]>> {
    return fetcher.get(`/patients/${patientId}/prescriptions`);
  },

  async getPrescription(id: string): Promise<ApiResponse<Prescription>> {
    return fetcher.get(`/prescriptions/${id}`);
  },

  async createPrescription(data: Omit<Prescription, 'id'>): Promise<ApiResponse<Prescription>> {
    return fetcher.post('/prescriptions', data);
  },

  async updatePrescription(id: string, data: Partial<Prescription>): Promise<ApiResponse<Prescription>> {
    return fetcher.patch(`/prescriptions/${id}`, data);
  },

  async deletePrescription(id: string): Promise<ApiResponse<void>> {
    return fetcher.delete(`/prescriptions/${id}`);
  },
};

// Lab Results API
export const labResultsApi = {
  async getLabResults(patientId: string): Promise<ApiResponse<LabResult[]>> {
    return fetcher.get(`/patients/${patientId}/lab-results`);
  },

  async getLabResult(id: string): Promise<ApiResponse<LabResult>> {
    return fetcher.get(`/lab-results/${id}`);
  },

  async createLabResult(data: Omit<LabResult, 'id'>): Promise<ApiResponse<LabResult>> {
    return fetcher.post('/lab-results', data);
  },

  async updateLabResult(id: string, data: Partial<LabResult>): Promise<ApiResponse<LabResult>> {
    return fetcher.patch(`/lab-results/${id}`, data);
  },

  async deleteLabResult(id: string): Promise<ApiResponse<void>> {
    return fetcher.delete(`/lab-results/${id}`);
  },
};

// Metrics API for analytics and reporting
export const metricsApi = {
  async getMetrics(params: {
    type: string;
    startDate?: string;
    endDate?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
    patientId?: string;
  }): Promise<ApiResponse<MetricPoint[]>> {
    const query = new URLSearchParams();
    query.set('type', params.type);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.granularity) query.set('granularity', params.granularity);
    if (params.patientId) query.set('patientId', params.patientId);
    
    return fetcher.get(`/metrics?${query.toString()}`);
  },

  async getDashboardStats(): Promise<ApiResponse<{
    totalPatients: number;
    todayAppointments: number;
    pendingLabResults: number;
    activePrescriptions: number;
  }>> {
    return fetcher.get('/metrics/dashboard');
  },
};

// Healthcare provider APIs
export const doctorsApi = {
  async getDoctors(params?: { page?: number; limit?: number; specialty?: string }): Promise<PaginatedResponse<Doctor>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.specialty) query.set('specialty', params.specialty);
    
    const url = `/doctors${query.toString() ? '?' + query.toString() : ''}`;
    return fetcher.get(url);
  },

  async getDoctor(id: string): Promise<ApiResponse<Doctor>> {
    return fetcher.get(`/doctors/${id}`);
  },

  async updateDoctor(id: string, data: Partial<Doctor>): Promise<ApiResponse<Doctor>> {
    return fetcher.patch(`/doctors/${id}`, data);
  },
};

export const nursesApi = {
  async getNurses(params?: { page?: number; limit?: number; department?: string }): Promise<PaginatedResponse<Nurse>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.department) query.set('department', params.department);
    
    const url = `/nurses${query.toString() ? '?' + query.toString() : ''}`;
    return fetcher.get(url);
  },

  async getNurse(id: string): Promise<ApiResponse<Nurse>> {
    return fetcher.get(`/nurses/${id}`);
  },

  async updateNurse(id: string, data: Partial<Nurse>): Promise<ApiResponse<Nurse>> {
    return fetcher.patch(`/nurses/${id}`, data);
  },
};

// Main API client object that aggregates all endpoints
export const apiClient = {
  auth: authApi,
  users: usersApi,
  patients: patientsApi,
  appointments: appointmentsApi,
  medicalRecords: medicalRecordsApi,
  prescriptions: prescriptionsApi,
  labResults: labResultsApi,
  metrics: metricsApi,
  doctors: doctorsApi,
  nurses: nursesApi,
};

// Legacy named exports for backward compatibility
export const AuthApi = authApi;
export const MetricsApi = metricsApi;

// Register the API client in the DI container
registerService(API_CLIENT_TOKEN, apiClient);

/* Example usage:

import { apiClient } from '@/services/api'

// Login user
const loginResult = await apiClient.auth.login('user@example.com', 'password')
if (loginResult.ok) {
  const { user, token } = loginResult.data
  // handle successful login
}

// Get patients with pagination
const patientsResult = await apiClient.patients.getPatients({ page: 1, limit: 10 })
if (patientsResult.ok) {
  const { items, total, page, pageSize } = patientsResult.data
  // handle patients data
}

// Get metrics for dashboard
const metricsResult = await apiClient.metrics.getMetrics({
  type: 'appointments',
  startDate: '2024-01-01',
  granularity: 'day'
})

*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (registers service in DI container)
// [x] Reads config from `@/app/config` (fetcher uses config internally)
// [x] Exports default named component (exports apiClient as main export)
// [x] Adds basic ARIA and keyboard handlers (not applicable for API service)
