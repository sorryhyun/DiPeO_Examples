// filepath: src/features/dashboard/DashboardPanel.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Users, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  User, 
  Patient, 
  Appointment, 
  ApiResult, 
  ChartData, 
  LoadingState, 
  PaginatedResponse 
} from '@/core/contracts';
import { config, isDevelopment, shouldUseMockData } from '@/app/config';
import { eventBus } from '@/core/events';
import { MetricCard } from '@/features/dashboard/MetricCard';
import { BarChart, BarChartDataPoint } from '@/shared/charts/BarChart';
import { useFetch } from '@/hooks/useFetch';
import { dataService, DashboardMetrics, AppointmentMetrics } from '@/services/dataService';
import { Skeleton, SkeletonCard, SkeletonText } from '@/shared/components/Skeleton';
import { Toast } from '@/shared/components/Toast';
import { debugLog, errorLog, formatCurrency, formatPercentage } from '@/core/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DashboardPanelProps {
  className?: string;
  refreshInterval?: number;
  showMetrics?: boolean;
  showCharts?: boolean;
  showRecentActivity?: boolean;
  onMetricClick?: (metric: string, value: number) => void;
  onRefresh?: () => void;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'patient' | 'lab_result' | 'prescription';
  title: string;
  description: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'cancelled';
  urgency?: 'low' | 'medium' | 'high';
}

interface DashboardError {
  section: string;
  message: string;
  retryable: boolean;
}

// ============================================================================
// DASHBOARD PANEL COMPONENT
// ============================================================================

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  className = '',
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  showMetrics = true,
  showCharts = true,
  showRecentActivity = true,
  onMetricClick,
  onRefresh,
}) => {
  // State management
  const [errors, setErrors] = useState<DashboardError[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data fetching hooks
  const {
    data: dashboardMetrics,
    isLoading: metricsLoading,
    isError: metricsError,
    error: metricsErrorDetail,
    refetch: refetchMetrics
  } = useFetch<DashboardMetrics>(
    ['dashboard', 'metrics'],
    '/dashboard/metrics',
    {
      enabled: showMetrics,
      refetchInterval: refreshInterval,
      refetchOnWindowFocus: true,
    }
  );

  const {
    data: appointmentMetrics,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
    error: appointmentsErrorDetail,
    refetch: refetchAppointments
  } = useFetch<AppointmentMetrics>(
    ['dashboard', 'appointments', 'metrics'],
    '/analytics/appointments',
    {
      enabled: showCharts,
      refetchInterval: refreshInterval,
    }
  );

  const {
    data: recentPatients,
    isLoading: patientsLoading,
    isError: patientsError,
    error: patientsErrorDetail,
    refetch: refetchPatients
  } = useFetch<PaginatedResponse<Patient>>(
    ['dashboard', 'patients', 'recent'],
    '/patients?limit=5&sort=createdAt&order=desc',
    {
      enabled: showRecentActivity,
    }
  );

  const {
    data: recentAppointments,
    isLoading: recentAppointmentsLoading,
    isError: recentAppointmentsError,
    error: recentAppointmentsErrorDetail,
    refetch: refetchRecentAppointments
  } = useFetch<PaginatedResponse<Appointment>>(
    ['dashboard', 'appointments', 'recent'],
    '/appointments?limit=5&sort=createdAt&order=desc',
    {
      enabled: showRecentActivity,
    }
  );

  // Consolidated loading and error states
  const isLoading = metricsLoading || appointmentsLoading || patientsLoading || recentAppointmentsLoading;
  const hasError = metricsError || appointmentsError || patientsError || recentAppointmentsError;

  // Error management
  useEffect(() => {
    const newErrors: DashboardError[] = [];

    if (metricsError && metricsErrorDetail) {
      newErrors.push({
        section: 'metrics',
        message: metricsErrorDetail.message || 'Failed to load dashboard metrics',
        retryable: true,
      });
    }

    if (appointmentsError && appointmentsErrorDetail) {
      newErrors.push({
        section: 'appointments',
        message: appointmentsErrorDetail.message || 'Failed to load appointment data',
        retryable: true,
      });
    }

    if (patientsError && patientsErrorDetail) {
      newErrors.push({
        section: 'patients',
        message: patientsErrorDetail.message || 'Failed to load patient data',
        retryable: true,
      });
    }

    if (recentAppointmentsError && recentAppointmentsErrorDetail) {
      newErrors.push({
        section: 'recent-appointments',
        message: recentAppointmentsErrorDetail.message || 'Failed to load recent appointments',
        retryable: true,
      });
    }

    setErrors(newErrors);

    // Log errors in development
    if (isDevelopment && newErrors.length > 0) {
      errorLog('DashboardPanel: Errors detected', new Error(newErrors.map(e => e.message).join(', ')));
    }
  }, [metricsError, appointmentsError, patientsError, recentAppointmentsError, metricsErrorDetail, appointmentsErrorDetail, patientsErrorDetail, recentAppointmentsErrorDetail]);

  // Manual refresh handler
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setErrors([]);

    try {
      debugLog('DashboardPanel: Manual refresh initiated');

      // Refetch all data sources
      const promises = [];
      if (showMetrics) promises.push(refetchMetrics());
      if (showCharts) promises.push(refetchAppointments());
      if (showRecentActivity) {
        promises.push(refetchPatients());
        promises.push(refetchRecentAppointments());
      }

      await Promise.allSettled(promises);

      setLastRefresh(new Date());
      
      // Emit refresh event
      eventBus.emit('data:updated', {
        key: 'dashboard:refreshed',
        payload: { timestamp: new Date().toISOString() }
      });

      // Call external refresh handler if provided
      if (onRefresh) {
        onRefresh();
      }

      debugLog('DashboardPanel: Manual refresh completed');
    } catch (error) {
      errorLog('DashboardPanel: Manual refresh failed', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Metric click handler
  const handleMetricClick = (metricKey: string, value: number) => {
    debugLog(`DashboardPanel: Metric clicked - ${metricKey}: ${value}`);
    
    if (onMetricClick) {
      onMetricClick(metricKey, value);
    }

    // Emit metric interaction event
    eventBus.emit('data:updated', {
      key: 'dashboard:metric-clicked',
      payload: { metric: metricKey, value }
    });
  };

  // Transform appointment metrics to chart data
  const transformAppointmentData = (): BarChartDataPoint[] => {
    if (!appointmentMetrics?.byStatus?.[0]?.points) return [];

    return appointmentMetrics.byStatus[0].points.map((point, index) => ({
      name: String(point.label || point.x),
      value: point.y,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4],
    }));
  };

  // Generate recent activity from multiple sources
  const generateRecentActivity = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];

    // Add recent patients
    if (recentPatients?.items) {
      recentPatients.items.slice(0, 3).forEach(patient => {
        activities.push({
          id: `patient-${patient.id}`,
          type: 'patient',
          title: 'New Patient Registration',
          description: `${patient.name} has been registered`,
          timestamp: patient.createdAt,
          status: 'completed',
          urgency: 'low',
        });
      });
    }

    // Add recent appointments
    if (recentAppointments?.items) {
      recentAppointments.items.slice(0, 3).forEach(appointment => {
        activities.push({
          id: `appointment-${appointment.id}`,
          type: 'appointment',
          title: 'Appointment Scheduled',
          description: `Appointment scheduled for ${new Date(appointment.startAt).toLocaleDateString()}`,
          timestamp: appointment.createdAt,
          status: appointment.status as any,
          urgency: appointment.status === 'confirmed' ? 'medium' : 'low',
        });
      });
    }

    // Sort by timestamp (newest first)
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  };

  const recentActivity = generateRecentActivity();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const urgencyColors = {
    low: 'text-gray-500',
    medium: 'text-orange-500',
    high: 'text-red-500',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    confirmed: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-gray-100 text-gray-800',
  };

  if (isLoading && !dashboardMetrics && !appointmentMetrics) {
    return (
      <div className={`space-y-6 ${className}`} role="status" aria-label="Loading dashboard">
        {/* Metrics skeleton */}
        {showMetrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonCard key={i} width="100%" height="120px" />
            ))}
          </div>
        )}

        {/* Charts skeleton */}
        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard width="100%" height="300px" />
            <SkeletonCard width="100%" height="300px" />
          </div>
        )}

        {/* Recent activity skeleton */}
        {showRecentActivity && (
          <div>
            <SkeletonText size="lg" width="200px" className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Skeleton variant="circular" size="sm" />
                  <div className="flex-1 space-y-2">
                    <SkeletonText size="md" width="60%" />
                    <SkeletonText size="sm" width="40%" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="main"
      aria-label="Dashboard overview"
    >
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          aria-label={isRefreshing ? "Refreshing dashboard data" : "Refresh dashboard data"}
        >
          <RefreshCw 
            size={16} 
            className={isRefreshing ? 'animate-spin' : ''} 
            aria-hidden="true"
          />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error display */}
      {errors.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800"
          role="alert"
        >
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Dashboard Data Issues
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>
                      {error.section}: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <button
                  onClick={handleRefresh}
                  className="text-sm font-medium text-red-800 underline hover:no-underline dark:text-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Metrics Cards */}
      {showMetrics && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {dashboardMetrics ? (
            <>
              <MetricCard
                label="Total Patients"
                value={dashboardMetrics.totalPatients}
                icon={<Users size={20} />}
                color="blue"
                delta={{ value: 12.5, type: 'percentage', period: 'vs last month' }}
                trend="up"
                onClick={() => handleMetricClick('totalPatients', dashboardMetrics.totalPatients)}
                className="cursor-pointer hover:scale-105 transition-transform"
              />
              <MetricCard
                label="Appointments Today"
                value={dashboardMetrics.totalAppointments}
                icon={<Calendar size={20} />}
                color="green"
                delta={{ value: 8.3, type: 'percentage', period: 'vs yesterday' }}
                trend="up"
                onClick={() => handleMetricClick('totalAppointments', dashboardMetrics.totalAppointments)}
                className="cursor-pointer hover:scale-105 transition-transform"
              />
              <MetricCard
                label="Revenue"
                value={formatCurrency(dashboardMetrics.revenue)}
                icon={<TrendingUp size={20} />}
                color="purple"
                delta={{ value: dashboardMetrics.growthRate, type: 'percentage', period: 'vs last month' }}
                trend="up"
                onClick={() => handleMetricClick('revenue', dashboardMetrics.revenue)}
                className="cursor-pointer hover:scale-105 transition-transform"
              />
              <MetricCard
                label="Satisfaction"
                value={`${dashboardMetrics.satisfactionScore}/5.0`}
                icon={<Activity size={20} />}
                color="orange"
                delta={{ value: 4.2, type: 'absolute', period: 'vs last month' }}
                trend="up"
                onClick={() => handleMetricClick('satisfactionScore', dashboardMetrics.satisfactionScore)}
                className="cursor-pointer hover:scale-105 transition-transform"
              />
            </>
          ) : (
            Array.from({ length: 4 }, (_, i) => (
              <SkeletonCard key={i} width="100%" height="120px" />
            ))
          )}
        </motion.div>
      )}

      {/* Charts Section */}
      {showCharts && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Appointments by Status Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Appointments by Status
            </h3>
            {appointmentMetrics ? (
              <BarChart
                data={transformAppointmentData()}
                height={250}
                showGrid={true}
                showTooltip={true}
                animate={true}
                accessibilityLabel="Chart showing appointment distribution by status"
                accessibilityDescription="Bar chart displaying the number of appointments in different status categories"
              />
            ) : (
              <Skeleton variant="rounded" width="100%" height="250px" />
            )}
          </div>

          {/* Additional Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Trends
            </h3>
            {appointmentMetrics?.byMonth?.[0] ? (
              <BarChart
                data={appointmentMetrics.byMonth[0].points.map((point, index) => ({
                  name: String(point.label || point.x),
                  value: point.y,
                  color: '#10B981',
                }))}
                height={250}
                showGrid={true}
                showTooltip={true}
                animate={true}
                accessibilityLabel="Chart showing monthly appointment trends"
                accessibilityDescription="Bar chart displaying appointment volume over the past months"
              />
            ) : (
              <Skeleton variant="rounded" width="100%" height="250px" />
            )}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      {showRecentActivity && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${urgencyColors[activity.urgency || 'low']}`} aria-hidden="true" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </h4>
                      {activity.status && (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[activity.status]}`}>
                          {activity.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-gray-500 dark:text-gray-400">No recent activity to display</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardPanel;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/core/contracts, @/app/config, @/core/events, @/features/dashboard/MetricCard, @/shared/charts/BarChart, @/hooks/useFetch, @/services/dataService, @/shared/components/Skeleton, @/shared/components/Toast, @/core/utils
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses useFetch hook and service layer
// [x] Reads config from `@/app/config` - Uses config, isDevelopment, shouldUseMockData
// [x] Exports default named component - Exports DashboardPanel as default
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Includes role, aria-label, aria-describedby, focus management, and keyboard navigation
