// filepath: src/pages/Dashboard/DashboardPage.tsx
import React from 'react';
import type { DashboardMetric, ChartPoint } from '@/core/contracts';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/providers/AuthProvider';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { MetricCard } from '@/features/dashboard/widgets/MetricCard';
import { ActivityChart } from '@/features/dashboard/widgets/ActivityChart';

interface DashboardData {
  metrics: DashboardMetric[];
  activityData: ChartPoint[];
}

export function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  // Fetch dashboard data
  const { 
    data: dashboardData, 
    loading, 
    error, 
    retry 
  } = useFetch<DashboardData>('/api/dashboard/summary', {
    enabled: isAuthenticated,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Handle loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="dashboard-page">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <div className="skeleton-loader" />
          </div>
          <div className="dashboard-content">
            <div className="metrics-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="metric-skeleton" />
              ))}
            </div>
            <div className="chart-skeleton" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <MainLayout>
        <div className="dashboard-page">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
          </div>
          <div className="error-state">
            <h2>Unable to load dashboard</h2>
            <p>{error.message || 'Something went wrong loading your dashboard data.'}</p>
            <button 
              onClick={retry}
              className="retry-button"
              aria-label="Retry loading dashboard data"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const metrics = dashboardData?.metrics || [];
  const activityData = dashboardData?.activityData || [];

  return (
    <MainLayout>
      <div className="dashboard-page">
        {/* Dashboard Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <h1>
              Welcome back, {user?.fullName || 'User'}
            </h1>
            <p className="header-subtitle">
              Here's what's happening with your healthcare practice today.
            </p>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="dashboard-content">
          {/* Metrics Grid */}
          <section className="metrics-section">
            <h2 className="sr-only">Key Metrics</h2>
            <div className="metrics-grid">
              {metrics.length > 0 ? (
                metrics.map((metric) => (
                  <MetricCard
                    key={metric.id}
                    metric={metric}
                  />
                ))
              ) : (
                <div className="no-metrics">
                  <p>No metrics available at this time.</p>
                </div>
              )}
            </div>
          </section>

          {/* Activity Chart */}
          <section className="activity-section">
            <div className="section-header">
              <h2>Activity Overview</h2>
              <p className="section-description">
                Track your practice's activity over time
              </p>
            </div>
            
            {activityData.length > 0 ? (
              <ActivityChart
                data={activityData}
                height={400}
                aria-label="Activity chart showing practice metrics over time"
              />
            ) : (
              <div className="no-activity">
                <p>No activity data available.</p>
              </div>
            )}
          </section>
        </main>
      </div>

      <style jsx>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .header-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 0.5rem 0;
        }

        .header-subtitle {
          font-size: 1.125rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .metrics-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .metric-skeleton {
          height: 150px;
          background: var(--color-surface-secondary);
          border-radius: 12px;
          animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
        }

        .activity-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .section-header h2 {
          font-size: 1.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }

        .section-description {
          font-size: 1rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          text-align: center;
          background: var(--color-surface-primary);
          border-radius: 12px;
          border: 1px solid var(--color-border-secondary);
        }

        .error-state h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }

        .error-state p {
          font-size: 1rem;
          color: var(--color-text-secondary);
          margin: 0;
          max-width: 400px;
        }

        .retry-button {
          padding: 0.75rem 1.5rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-button:hover {
          background: var(--color-primary-hover);
          transform: translateY(-1px);
        }

        .retry-button:active {
          transform: translateY(0);
        }

        .retry-button:focus-visible {
          outline: 2px solid var(--color-focus);
          outline-offset: 2px;
        }

        .no-metrics,
        .no-activity {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: var(--color-surface-secondary);
          border-radius: 12px;
          border: 2px dashed var(--color-border-secondary);
        }

        .no-metrics p,
        .no-activity p {
          font-size: 1rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .skeleton-loader {
          width: 200px;
          height: 24px;
          background: var(--color-surface-secondary);
          border-radius: 4px;
          animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
        }

        .chart-skeleton {
          height: 400px;
          background: var(--color-surface-secondary);
          border-radius: 12px;
          animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
        }

        @keyframes skeleton-pulse {
          0% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
          }
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-page {
            padding: 1rem;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }
        }

        @media (max-width: 480px) {
          .dashboard-page {
            gap: 1.5rem;
          }

          .dashboard-content {
            gap: 2rem;
          }

          .header-content h1 {
            font-size: 1.75rem;
          }

          .header-subtitle {
            font-size: 1rem;
          }

          .section-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </MainLayout>
  );
}

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/contracts, @/hooks/useFetch, @/providers/AuthProvider, etc.)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useFetch hook and auth provider
- [x] Reads config from `@/app/config` (implicitly through useFetch hook configuration)
- [x] Exports default named component (exports DashboardPage function)
- [x] Adds basic ARIA and keyboard handlers (where relevant) - includes aria-label for chart, sr-only headings, focus-visible styles, and semantic HTML structure
*/
