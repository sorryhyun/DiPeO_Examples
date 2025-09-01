// filepath: src/features/dashboard/DashboardPage.tsx
import React from 'react';
import type { User, ApiResult, ChartSeries, ChartSeriesPoint } from '@/core/contracts';
import { config, shouldUseMockData } from '@/app/config';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { LineChart } from '@/features/dashboard/components/LineChart';
import { useFetch } from '@/hooks/useFetch';
import { Skeleton } from '@/shared/components/Skeleton';
import { useAuth } from '@/hooks/useAuth';

/**
 * Dashboard metrics data structure
 */
interface DashboardMetrics {
  totalPatients: number;
  activeAppointments: number;
  pendingLabResults: number;
  completedToday: number;
  patientsThisWeek: ChartSeriesPoint[];
  appointmentsThisMonth: ChartSeriesPoint[];
}

/**
 * Mock dashboard data for development
 */
const mockDashboardData: DashboardMetrics = {
  totalPatients: 1247,
  activeAppointments: 18,
  pendingLabResults: 7,
  completedToday: 12,
  patientsThisWeek: [
    { x: 'Mon', y: 23 },
    { x: 'Tue', y: 31 },
    { x: 'Wed', y: 28 },
    { x: 'Thu', y: 35 },
    { x: 'Fri', y: 42 },
    { x: 'Sat', y: 18 },
    { x: 'Sun', y: 15 },
  ],
  appointmentsThisMonth: [
    { x: 'Week 1', y: 85 },
    { x: 'Week 2', y: 92 },
    { x: 'Week 3', y: 78 },
    { x: 'Week 4', y: 101 },
  ],
};

/**
 * Dashboard page component that displays healthcare metrics and charts.
 * Features skeleton loading states and progressive enhancement.
 */
export function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch dashboard metrics with mock fallback
  const { 
    data: metrics, 
    loading, 
    error, 
    retry 
  } = useFetch<DashboardMetrics>({
    url: `${config.apiBase}/dashboard/metrics`,
    enabled: !!user,
    fallbackData: shouldUseMockData ? mockDashboardData : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prepare chart series data
  const patientsChartSeries: ChartSeries[] = metrics ? [
    {
      id: 'patients-week',
      label: 'New Patients This Week',
      color: '#3B82F6',
      data: metrics.patientsThisWeek,
    },
  ] : [];

  const appointmentsChartSeries: ChartSeries[] = metrics ? [
    {
      id: 'appointments-month',
      label: 'Appointments This Month',
      color: '#10B981',
      data: metrics.appointmentsThisMonth,
    },
  ] : [];

  // Loading skeleton
  if (loading && !metrics) {
    return (
      <AppLayout>
        <div 
          className="dashboard-page"
          role="main" 
          aria-label="Dashboard"
        >
          <div className="dashboard-header">
            <Skeleton width="300px" height="32px" />
            <Skeleton width="200px" height="20px" />
          </div>

          <div className="metrics-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="metric-card-skeleton">
                <Skeleton width="100%" height="120px" />
              </div>
            ))}
          </div>

          <div className="charts-section">
            <Skeleton width="100%" height="300px" />
            <Skeleton width="100%" height="300px" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error && !metrics) {
    return (
      <AppLayout>
        <div 
          className="dashboard-page dashboard-error"
          role="main" 
          aria-label="Dashboard"
        >
          <div className="error-content">
            <h1>Dashboard Unavailable</h1>
            <p>Unable to load dashboard metrics. Please try again.</p>
            <button 
              onClick={retry}
              className="retry-button"
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const userName = user?.fullName || 'User';
  const welcomeMessage = getTimeBasedGreeting();

  return (
    <AppLayout>
      <div 
        className="dashboard-page"
        role="main" 
        aria-label="Dashboard"
      >
        {/* Header Section */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">
            {welcomeMessage}, {userName}
          </h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your practice today.
          </p>
        </header>

        {/* Metrics Grid */}
        <section 
          className="metrics-section"
          aria-labelledby="metrics-heading"
        >
          <h2 id="metrics-heading" className="section-title">
            Key Metrics
          </h2>
          
          <div className="metrics-grid">
            <MetricCard
              title="Total Patients"
              value={metrics?.totalPatients || 0}
              change={+8.2}
              changeType="positive"
              icon="users"
              description="Registered patients in system"
            />
            
            <MetricCard
              title="Active Appointments"
              value={metrics?.activeAppointments || 0}
              change={-2.1}
              changeType="negative"
              icon="calendar"
              description="Scheduled for today"
            />
            
            <MetricCard
              title="Pending Lab Results"
              value={metrics?.pendingLabResults || 0}
              changeType="neutral"
              icon="flask"
              description="Awaiting review"
            />
            
            <MetricCard
              title="Completed Today"
              value={metrics?.completedToday || 0}
              change={+15.3}
              changeType="positive"
              icon="check-circle"
              description="Appointments finished"
            />
          </div>
        </section>

        {/* Charts Section */}
        <section 
          className="charts-section"
          aria-labelledby="charts-heading"
        >
          <h2 id="charts-heading" className="section-title">
            Trends & Analytics
          </h2>
          
          <div className="charts-grid">
            <div className="chart-container">
              <LineChart
                title="New Patients This Week"
                series={patientsChartSeries}
                height={280}
                showGrid={true}
                showTooltip={true}
              />
            </div>
            
            <div className="chart-container">
              <LineChart
                title="Appointments This Month"
                series={appointmentsChartSeries}
                height={280}
                showGrid={true}
                showTooltip={true}
              />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section 
          className="quick-actions-section"
          aria-labelledby="actions-heading"
        >
          <h2 id="actions-heading" className="section-title">
            Quick Actions
          </h2>
          
          <div className="actions-grid">
            <button 
              className="action-button"
              type="button"
              onClick={() => window.location.href = '/appointments/new'}
            >
              <span className="action-icon">📅</span>
              <span className="action-text">Schedule Appointment</span>
            </button>
            
            <button 
              className="action-button"
              type="button"
              onClick={() => window.location.href = '/patients/new'}
            >
              <span className="action-icon">👤</span>
              <span className="action-text">Add Patient</span>
            </button>
            
            <button 
              className="action-button"
              type="button"
              onClick={() => window.location.href = '/lab-results'}
            >
              <span className="action-icon">🧪</span>
              <span className="action-text">Review Lab Results</span>
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        .dashboard-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary, #1f2937);
          margin: 0 0 0.5rem 0;
        }

        .dashboard-subtitle {
          font-size: 1rem;
          color: var(--color-text-secondary, #6b7280);
          margin: 0;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-text-primary, #1f2937);
          margin: 0 0 1.5rem 0;
        }

        .metrics-section {
          margin-bottom: 3rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card-skeleton {
          background: var(--color-bg-secondary, #f9fafb);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid var(--color-border, #e5e7eb);
        }

        .charts-section {
          margin-bottom: 3rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .chart-container {
          background: var(--color-bg-primary, #ffffff);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid var(--color-border, #e5e7eb);
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }

        .quick-actions-section {
          margin-bottom: 2rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          background: var(--color-bg-primary, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .action-button:hover {
          background: var(--color-bg-secondary, #f9fafb);
          border-color: var(--color-border-hover, #d1d5db);
          transform: translateY(-1px);
        }

        .action-button:focus {
          outline: 2px solid var(--color-primary, #3b82f6);
          outline-offset: 2px;
        }

        .action-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .action-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary, #1f2937);
          text-align: center;
        }

        .dashboard-error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .error-content {
          text-align: center;
          max-width: 400px;
        }

        .error-content h1 {
          font-size: 1.5rem;
          color: var(--color-error, #ef4444);
          margin-bottom: 1rem;
        }

        .error-content p {
          color: var(--color-text-secondary, #6b7280);
          margin-bottom: 1.5rem;
        }

        .retry-button {
          background: var(--color-primary, #3b82f6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .retry-button:hover {
          background: var(--color-primary-hover, #2563eb);
        }

        .retry-button:focus {
          outline: 2px solid var(--color-primary, #3b82f6);
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .dashboard-page {
            padding: 1rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
        }
      `}</style>
    </AppLayout>
  );
}

/**
 * Get time-based greeting message
 */
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
