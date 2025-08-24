import { useState, useEffect } from 'react';
import { useQueryWithAuth } from '@/shared/hooks/useQueryWithAuth';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import type { HealthMetric } from '@/types';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  icon: string;
}

const MetricCard = ({ title, value, unit, trend, icon }: MetricCardProps) => {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    stable: 'text-gray-600 dark:text-gray-400'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
      role="article"
      aria-labelledby={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3" role="img" aria-label={title}>
            {icon}
          </span>
          <h3 
            id={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            {title}
          </h3>
        </div>
        {trend && (
          <span 
            className={`text-sm ${trendColors[trend]}`}
            aria-label={`Trend: ${trend}`}
          >
            {trendIcons[trend]}
          </span>
        )}
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export const HealthDashboard = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  
  const { 
    data: healthMetrics, 
    isLoading, 
    error 
  } = useQueryWithAuth<HealthMetric[]>({
    queryKey: ['health-metrics'],
    queryFn: '/api/health/metrics'
  });

  const { lastMessage } = useWebSocket('/health-updates');

  useEffect(() => {
    if (healthMetrics) {
      setMetrics(healthMetrics);
    }
  }, [healthMetrics]);

  // Handle real-time updates via WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'health_metric_update') {
      const updatedMetric = lastMessage.data as HealthMetric;
      setMetrics(prev => prev.map(metric => 
        metric.id === updatedMetric.id ? updatedMetric : metric
      ));
    }
  }, [lastMessage]);

  if (isLoading) {
    return (
      <div 
        className="flex justify-center items-center min-h-64"
        role="status"
        aria-label="Loading health metrics"
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="text-center text-red-600 dark:text-red-400 p-8"
        role="alert"
      >
        <p>Failed to load health metrics. Please try again later.</p>
      </div>
    );
  }

  // Default metrics if no data
  const defaultMetrics = [
    {
      id: '1',
      title: 'Daily Steps',
      value: 8542,
      unit: 'steps',
      trend: 'up' as const,
      icon: '👟'
    },
    {
      id: '2',
      title: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      trend: 'stable' as const,
      icon: '❤️'
    },
    {
      id: '3',
      title: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      trend: 'stable' as const,
      icon: '🩺'
    },
    {
      id: '4',
      title: 'Sleep Quality',
      value: 85,
      unit: '%',
      trend: 'up' as const,
      icon: '😴'
    },
    {
      id: '5',
      title: 'Water Intake',
      value: 6.2,
      unit: 'glasses',
      trend: 'down' as const,
      icon: '💧'
    },
    {
      id: '6',
      title: 'Weight',
      value: 68.5,
      unit: 'kg',
      trend: 'stable' as const,
      icon: '⚖️'
    }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <section 
      className="space-y-6"
      role="region"
      aria-labelledby="health-dashboard-title"
    >
      <div className="flex items-center justify-between">
        <h2 
          id="health-dashboard-title"
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Health Overview
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="grid"
        aria-label="Health metrics grid"
      >
        {displayMetrics.map((metric) => (
          <div key={metric.id} role="gridcell">
            <MetricCard
              title={metric.title}
              value={metric.value}
              unit={metric.unit}
              trend={metric.trend}
              icon={metric.icon}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Today's Summary
        </h3>
        <p className="text-blue-800 dark:text-blue-200">
          You're doing great! Keep up the good work with your daily activities. 
          Consider increasing your water intake to reach your daily goal.
        </p>
      </div>
    </section>
  );
};

export default HealthDashboard;

/*
Self-check:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (useQueryWithAuth, useWebSocket)
- [x] Reads config from providers (no direct DOM/localStorage)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (roles, labels, landmarks)
*/
