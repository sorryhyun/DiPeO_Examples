// filepath: src/services/dataService.ts

import { apiClient } from '@/services/apiClient';
import { 
  ApiResult, 
  ChartSeries, 
  ChartDataPoint, 
  Patient, 
  Appointment, 
  User,
  Doctor,
  LabResult,
  Prescription,
  Paginated,
  SearchParams
} from '@/core/contracts';
import { config, shouldUseMockData } from '@/app/config';
import { debugLog, debugWarn, debugError } from '@/core/utils';
import { eventBus } from '@/core/events';

// ===============================================
// Data Service Types
// ===============================================

export interface DashboardMetrics {
  totalPatients: number;
  totalAppointments: number;
  totalDoctors: number;
  pendingResults: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  revenueThisMonth: number;
  growthPercentage: number;
}

export interface AppointmentStats {
  completed: number;
  scheduled: number;
  cancelled: number;
  noShow: number;
  total: number;
}

export interface PatientDemographics {
  ageGroups: Record<string, number>;
  genderDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
}

export interface RevenueData {
  daily: ChartDataPoint[];
  monthly: ChartDataPoint[];
  yearly: ChartDataPoint[];
}

export interface ActivityData {
  appointments: ChartDataPoint[];
  patients: ChartDataPoint[];
  revenue: ChartDataPoint[];
}

// ===============================================
// Mock Data Generators
// ===============================================

class MockDataGenerator {
  static generateDashboardMetrics(): DashboardMetrics {
    return {
      totalPatients: 2847,
      totalAppointments: 1245,
      totalDoctors: 18,
      pendingResults: 23,
      appointmentsToday: 12,
      appointmentsThisWeek: 67,
      revenueThisMonth: 145000,
      growthPercentage: 12.5,
    };
  }

  static generateAppointmentStats(): AppointmentStats {
    return {
      completed: 892,
      scheduled: 245,
      cancelled: 78,
      noShow: 30,
      total: 1245,
    };
  }

  static generatePatientDemographics(): PatientDemographics {
    return {
      ageGroups: {
        '0-18': 245,
        '19-35': 678,
        '36-50': 934,
        '51-65': 712,
        '65+': 278,
      },
      genderDistribution: {
        male: 1356,
        female: 1401,
        other: 90,
      },
      locationDistribution: {
        'New York': 756,
        'Los Angeles': 543,
        'Chicago': 432,
        'Houston': 298,
        'Other': 818,
      },
    };
  }

  static generateChartSeries(name: string, pointCount = 12): ChartSeries {
    const points: ChartDataPoint[] = [];
    const baseValue = Math.floor(Math.random() * 1000) + 100;
    
    for (let i = 0; i < pointCount; i++) {
      const variation = (Math.random() - 0.5) * 200;
      points.push({
        x: i + 1,
        y: Math.max(0, baseValue + variation),
        label: `Point ${i + 1}`,
      });
    }

    return {
      id: `mock-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      points,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      type: 'line',
    };
  }

  static generateRevenueData(): RevenueData {
    const generatePoints = (count: number, baseValue: number): ChartDataPoint[] => {
      return Array.from({ length: count }, (_, i) => ({
        x: i + 1,
        y: baseValue + Math.floor(Math.random() * baseValue * 0.5),
      }));
    };

    return {
      daily: generatePoints(30, 5000),
      monthly: generatePoints(12, 120000),
      yearly: generatePoints(5, 1200000),
    };
  }

  static generateActivityData(): ActivityData {
    return {
      appointments: this.generateChartSeries('Appointments', 30).points,
      patients: this.generateChartSeries('New Patients', 30).points,
      revenue: this.generateChartSeries('Daily Revenue', 30).points,
    };
  }
}

// ===============================================
// Data Service Implementation
// ===============================================

class DataService {
  constructor() {
    debugLog('DataService', 'Initialized');
  }

  // ===============================================
  // Dashboard Data
  // ===============================================

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      debugLog('DataService', 'Fetching dashboard metrics');

      if (shouldUseMockData) {
        const mockData = MockDataGenerator.generateDashboardMetrics();
        debugLog('DataService', 'Using mock dashboard metrics');
        return mockData;
      }

      const result: ApiResult<DashboardMetrics> = await apiClient.get<DashboardMetrics>('/dashboard/metrics');

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      await eventBus.emit('data:dashboard-metrics-fetched', { metrics: result.data! });

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch dashboard metrics:', error);
      throw error;
    }
  }

  async getAppointmentStats(): Promise<AppointmentStats> {
    try {
      debugLog('DataService', 'Fetching appointment statistics');

      if (shouldUseMockData) {
        const mockData = MockDataGenerator.generateAppointmentStats();
        debugLog('DataService', 'Using mock appointment stats');
        return mockData;
      }

      const result: ApiResult<AppointmentStats> = await apiClient.get<AppointmentStats>('/dashboard/appointment-stats');

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch appointment stats:', error);
      throw error;
    }
  }

  async getPatientDemographics(): Promise<PatientDemographics> {
    try {
      debugLog('DataService', 'Fetching patient demographics');

      if (shouldUseMockData) {
        const mockData = MockDataGenerator.generatePatientDemographics();
        debugLog('DataService', 'Using mock patient demographics');
        return mockData;
      }

      const result: ApiResult<PatientDemographics> = await apiClient.get<PatientDemographics>('/dashboard/patient-demographics');

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch patient demographics:', error);
      throw error;
    }
  }

  // ===============================================
  // Chart Data
  // ===============================================

  async getRevenueChartData(period: 'daily' | 'monthly' | 'yearly' = 'monthly'): Promise<ChartSeries> {
    try {
      debugLog('DataService', `Fetching revenue chart data for period: ${period}`);

      if (shouldUseMockData) {
        const mockSeries = MockDataGenerator.generateChartSeries(`Revenue (${period})`, 
          period === 'daily' ? 30 : period === 'monthly' ? 12 : 5);
        debugLog('DataService', 'Using mock revenue chart data');
        return mockSeries;
      }

      const result: ApiResult<ChartSeries> = await apiClient.get<ChartSeries>('/charts/revenue', {
        params: { period }
      });

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch revenue chart data:', error);
      throw error;
    }
  }

  async getAppointmentTrendsData(): Promise<ChartSeries[]> {
    try {
      debugLog('DataService', 'Fetching appointment trends data');

      if (shouldUseMockData) {
        const mockSeries = [
          MockDataGenerator.generateChartSeries('Scheduled Appointments'),
          MockDataGenerator.generateChartSeries('Completed Appointments'),
          MockDataGenerator.generateChartSeries('Cancelled Appointments'),
        ];
        debugLog('DataService', 'Using mock appointment trends data');
        return mockSeries;
      }

      const result: ApiResult<ChartSeries[]> = await apiClient.get<ChartSeries[]>('/charts/appointment-trends');

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch appointment trends data:', error);
      throw error;
    }
  }

  async getPatientGrowthData(): Promise<ChartSeries> {
    try {
      debugLog('DataService', 'Fetching patient growth data');

      if (shouldUseMockData) {
        const mockSeries = MockDataGenerator.generateChartSeries('Patient Growth', 24);
        debugLog('DataService', 'Using mock patient growth data');
        return mockSeries;
      }

      const result: ApiResult<ChartSeries> = await apiClient.get<ChartSeries>('/charts/patient-growth');

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch patient growth data:', error);
      throw error;
    }
  }

  // ===============================================
  // Entity Data (CRUD Operations)
  // ===============================================

  async getPatients(searchParams: SearchParams = {}): Promise<Paginated<Patient>> {
    try {
      debugLog('DataService', 'Fetching patients with params:', searchParams);

      const result: ApiResult<Paginated<Patient>> = await apiClient.get<Paginated<Patient>>('/patients', {
        params: searchParams as Record<string, string | number | boolean>
      });

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch patients:', error);
      throw error;
    }
  }

  async getPatientById(id: string): Promise<Patient> {
    try {
      debugLog('DataService', `Fetching patient with ID: ${id}`);

      const result: ApiResult<Patient> = await apiClient.get<Patient>(`/patients/${id}`);

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch patient:', error);
      throw error;
    }
  }

  async getAppointments(searchParams: SearchParams = {}): Promise<Paginated<Appointment>> {
    try {
      debugLog('DataService', 'Fetching appointments with params:', searchParams);

      const result: ApiResult<Paginated<Appointment>> = await apiClient.get<Paginated<Appointment>>('/appointments', {
        params: searchParams as Record<string, string | number | boolean>
      });

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch appointments:', error);
      throw error;
    }
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      debugLog('DataService', `Fetching appointment with ID: ${id}`);

      const result: ApiResult<Appointment> = await apiClient.get<Appointment>(`/appointments/${id}`);

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch appointment:', error);
      throw error;
    }
  }

  async getDoctors(searchParams: SearchParams = {}): Promise<Paginated<Doctor>> {
    try {
      debugLog('DataService', 'Fetching doctors with params:', searchParams);

      const result: ApiResult<Paginated<Doctor>> = await apiClient.get<Paginated<Doctor>>('/doctors', {
        params: searchParams as Record<string, string | number | boolean>
      });

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch doctors:', error);
      throw error;
    }
  }

  async getLabResults(patientId?: string): Promise<LabResult[]> {
    try {
      debugLog('DataService', `Fetching lab results${patientId ? ` for patient ${patientId}` : ''}`);

      const endpoint = patientId ? `/patients/${patientId}/lab-results` : '/lab-results';
      const result: ApiResult<LabResult[]> = await apiClient.get<LabResult[]>(endpoint);

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch lab results:', error);
      throw error;
    }
  }

  async getPrescriptions(patientId?: string): Promise<Prescription[]> {
    try {
      debugLog('DataService', `Fetching prescriptions${patientId ? ` for patient ${patientId}` : ''}`);

      const endpoint = patientId ? `/patients/${patientId}/prescriptions` : '/prescriptions';
      const result: ApiResult<Prescription[]> = await apiClient.get<Prescription[]>(endpoint);

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Failed to fetch prescriptions:', error);
      throw error;
    }
  }

  // ===============================================
  // Utility Methods
  // ===============================================

  async searchGlobal(query: string): Promise<{
    patients: Patient[];
    appointments: Appointment[];
    doctors: Doctor[];
  }> {
    try {
      debugLog('DataService', `Performing global search for: ${query}`);

      if (!query.trim()) {
        return { patients: [], appointments: [], doctors: [] };
      }

      const result = await apiClient.get<{
        patients: Patient[];
        appointments: Appointment[];
        doctors: Doctor[];
      }>('/search/global', {
        params: { q: query.trim() }
      });

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      return result.data!;
    } catch (error) {
      debugError('DataService', 'Global search failed:', error);
      throw error;
    }
  }

  // Transform raw API data to ChartSeries format
  transformToChartSeries(
    data: any[],
    config: {
      id: string;
      name: string;
      xField: string;
      yField: string;
      labelField?: string;
      color?: string;
      type?: 'line' | 'bar' | 'area' | 'scatter';
    }
  ): ChartSeries {
    const points: ChartDataPoint[] = data.map(item => ({
      x: item[config.xField],
      y: item[config.yField],
      label: config.labelField ? item[config.labelField] : undefined,
    }));

    return {
      id: config.id,
      name: config.name,
      points,
      color: config.color,
      type: config.type || 'line',
    };
  }

  // Batch data fetching for dashboard
  async getDashboardData(): Promise<{
    metrics: DashboardMetrics;
    appointmentStats: AppointmentStats;
    revenueData: ChartSeries;
    patientGrowth: ChartSeries;
  }> {
    try {
      debugLog('DataService', 'Fetching complete dashboard data');

      const [metrics, appointmentStats, revenueData, patientGrowth] = await Promise.all([
        this.getDashboardMetrics(),
        this.getAppointmentStats(),
        this.getRevenueChartData('monthly'),
        this.getPatientGrowthData(),
      ]);

      return {
        metrics,
        appointmentStats,
        revenueData,
        patientGrowth,
      };
    } catch (error) {
      debugError('DataService', 'Failed to fetch dashboard data:', error);
      throw error;
    }
  }
}

// ===============================================
// Export Singleton Instance
// ===============================================

export const dataService = new DataService();

// Default export for convenience
export default dataService;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component (dataService singleton)
- [x] Adds basic ARIA and keyboard handlers (N/A - this is a service layer)
*/
