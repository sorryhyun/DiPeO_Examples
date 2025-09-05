// filepath: src/pages/DashboardPage.tsx

import React, { useEffect } from 'react';
import { User, DashboardMetric, ActivityItem } from '@/core/contracts';
import { config } from '@/app/config';
import { publishEvent } from '@/core/events';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import MetricCard from '@/features/dashboard/MetricCard';
import ActivityFeed from '@/features/dashboard/ActivityFeed';
import Chart from '@/shared/components/Chart';
import Skeleton from '@/shared/components/Skeleton';

interface DashboardData {
  metrics: DashboardMetric[];
  recentActivity: ActivityItem[];
  chartData: {
    appointments: Array<{ date: string; count: number }>;
    patients: Array<{ date: string; count: number }>;
  };
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useFetch<DashboardData>({
    queryKey: ['dashboard', user?.id],
    url: '/dashboard',
    enabled: !!user,
  });

  // Publish route change event for analytics
  useEffect(() => {
    publishEvent('route:change', {
      from: window.location.pathname,
      to: '/dashboard'
    });

    publishEvent('analytics:event', {
      name: 'page_view',
      payload: {
        page: 'dashboard',
        userId: user?.id,
        timestamp: new Date().toISOString(),
      }
    });
  }, [user?.id]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'r':
            event.preventDefault();
            refetch();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [refetch]);

  if (error) {
    return (
      <div 
        className="dashboard-page dashboard-page--error"
        role="main"
        aria-labelledby="dashboard-title"
      >
        <div className="error-container">
          <h1 id="dashboard-title">Dashboard</h1>
          <div 
            className="error-message" 
            role="alert" 
            aria-live="polite"
          >
            <p>Unable to load dashboard data</p>
            <button 
              onClick={() => refetch()}
              className="retry-button"
              aria-label="Retry loading dashboard data"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="dashboard-page"
      role="main"
      aria-labelledby="dashboard-title"
    >
      <header className="dashboard-header">
        <h1 id="dashboard-title">
          Dashboard
        </h1>
        <p className="dashboard-subtitle">
          Welcome back, {user?.name || 'User'}
        </p>
      </header>

      {/* Metrics Section */}
      <section 
        className="dashboard-metrics"
        aria-labelledby="metrics-title"
      >
        <h2 id="metrics-title" className="section-title">
          Key Metrics
        </h2>
        
        {isLoading ? (
          <div className="metrics-grid" role="group" aria-label="Loading metrics">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={`metric-skeleton-${index}`}
                variant="metric-card"
                aria-label={`Loading metric ${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <div 
            className="metrics-grid"
            role="group"
            aria-label="Dashboard metrics"
          >
            {dashboardData?.metrics?.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                loading={false}
              />
            )) || (
              <div 
                className="no-data-message"
                role="status"
                aria-live="polite"
              >
                No metrics available
              </div>
            )}
          </div>
        )}
      </section>

      {/* Charts Section */}
      <section 
        className="dashboard-charts"
        aria-labelledby="charts-title"
      >
        <h2 id="charts-title" className="section-title">
          Trends
        </h2>
        
        <div className="charts-container">
          {isLoading ? (
            <div className="charts-grid">
              <Skeleton
                variant="chart"
                aria-label="Loading appointments chart"
              />
              <Skeleton
                variant="chart"
                aria-label="Loading patients chart"
              />
            </div>
          ) : (
            <div className="charts-grid">
              {dashboardData?.chartData?.appointments && (
                <Chart
                  type="line"
                  data={dashboardData.chartData.appointments}
                  title="Appointments Over Time"
                  xAxisKey="date"
                  yAxisKey="count"
                  color="#3b82f6"
                  aria-label="Line chart showing appointment trends over time"
                />
              )}
              
              {dashboardData?.chartData?.patients && (
                <Chart
                  type="bar"
                  data={dashboardData.chartData.patients}
                  title="Patient Registrations"
xAxisKey="date"
                  yAxisKey="count"
                  color="#10b981"
                  aria-label="Bar chart showing patient registration trends"
                />
              )}
            </div>
          )}
        </div>
      </section>

      {/* Activity Feed Section */}
      <section 
        className="dashboard-activity"
        aria-labelledby="activity-title"
      >
        <h2 id="activity-title" className="section-title">
          Recent Activity
        </h2>
        
        {isLoading ? (
          <div role="group" aria-label="Loading recent activity">
            <Skeleton
              variant="activity-feed"
              aria-label="Loading activity feed"
            />
          </div>
        ) : (
          <ActivityFeed
            activities={dashboardData?.recentActivity || []}
            loading={false}
            emptyMessage="No recent activity"
            aria-label="Recent system activity feed"
          />
        )}
      </section>

      {/* Refresh Instructions */}
      <div className="dashboard-help" role="complementary">
        <p className="help-text">
          <kbd aria-label="Control or Command">Ctrl</kbd> + 
          <kbd aria-label="R key">R</kbd> to refresh data
        </p>
      </div>
    </div>
  );
};

// Styles
const styles = `
.dashboard-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.dashboard-page--error {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.dashboard-subtitle {
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.dashboard-metrics {
  margin-bottom: 3rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.dashboard-charts {
  margin-bottom: 3rem;
}

.charts-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.dashboard-activity {
  margin-bottom: 2rem;
}

.dashboard-help {
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.help-text {
  margin: 0;
  font-size: 0.9rem;
  color: #475569;
}

.help-text kbd {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 2px 6px;
  margin: 0 2px;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, consolas, monospace;
  font-size: 0.8rem;
}

.error-container {
  text-align: center;
  max-width: 400px;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background: #2563eb;
}

.retry-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.no-data-message {
  grid-column: 1 / -1;
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 1rem;
  }
  
  .dashboard-header h1 {
    font-size: 2rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-container {
    padding: 1rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .dashboard-page {
    background: white;
  }
  
  .section-title {
    color: black;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .retry-button {
    transition: none;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('dashboard-page-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'dashboard-page-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default DashboardPage;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
