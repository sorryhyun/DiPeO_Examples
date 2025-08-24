import { Suspense } from 'react';
import { useFetch } from '@/shared/hooks/useFetch';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { analyticsService } from '@/services/analyticsService';

interface AnalyticsMetrics {
  totalEvents: number;
  signups: number;
  purchases: number;
  uptime: number;
  conversionRate: number;
  nothingDelivered: number;
  existentialCrises: number;
  voidInteractions: number;
}

interface ChartData {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

const MetricCard = ({ title, value, suffix = '', trend = 'stable' }: {
  title: string;
  value: number | string;
  suffix?: string;
  trend?: 'up' | 'down' | 'stable';
}) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    stable: 'text-gray-500'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <span className={`text-sm ${trendColors[trend]}`}>
          {trendIcons[trend]}
        </span>
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
          {suffix}
        </span>
      </div>
    </div>
  );
};

const SimpleChart = ({ data, title }: { data: ChartData[], title: string }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
              {item.label}
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-sm font-medium text-gray-900 dark:text-white text-right">
              {item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsDashboardContent = () => {
  const { data: analytics, error } = useFetch<AnalyticsMetrics>(() => 
    analyticsService.getDashboardData()
  );

  if (error) {
    throw error;
  }

  if (!analytics) {
    return <LoadingSpinner />;
  }

  const chartData: ChartData[] = [
    { label: 'Events', value: analytics.totalEvents, trend: 'up' },
    { label: 'Signups', value: analytics.signups, trend: 'stable' },
    { label: 'Purchases', value: analytics.purchases, trend: 'up' },
    { label: 'Void Interactions', value: analytics.voidInteractions, trend: 'down' }
  ];

  const timelineData: ChartData[] = [
    { label: 'Jan', value: 0, trend: 'stable' },
    { label: 'Feb', value: 0, trend: 'stable' },
    { label: 'Mar', value: 0, trend: 'stable' },
    { label: 'Apr', value: 0, trend: 'stable' },
    { label: 'May', value: 0, trend: 'stable' },
    { label: 'Jun', value: 0, trend: 'stable' }
  ];

  return (
    <div 
      className="max-w-7xl mx-auto p-6 space-y-8"
      role="main"
      aria-label="Analytics Dashboard"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard for Absolutely Nothing™
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Events" 
            value={analytics.totalEvents.toLocaleString()} 
            trend="up"
          />
          <MetricCard 
            title="Signups" 
            value={analytics.signups.toLocaleString()} 
            trend="stable"
          />
          <MetricCard 
            title="Purchases" 
            value={analytics.purchases.toLocaleString()} 
            suffix="∞"
            trend="up"
          />
          <MetricCard 
            title="Uptime" 
            value={analytics.uptime} 
            suffix="%" 
            trend="stable"
          />
        </div>
      </section>

      {/* Additional Metrics */}
      <section aria-labelledby="additional-metrics-heading">
        <h2 id="additional-metrics-heading" className="sr-only">Additional Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            title="Conversion Rate" 
            value={analytics.conversionRate} 
            suffix="%" 
            trend="up"
          />
          <MetricCard 
            title="Nothing Delivered" 
            value="∞" 
            trend="stable"
/>
          <MetricCard 
            title="Existential Crises Resolved" 
            value={analytics.existentialCrises.toLocaleString()} 
            trend="down"
          />
        </div>
      </section>

      {/* Charts */}
      <section aria-labelledby="charts-heading">
        <h2 id="charts-heading" className="sr-only">Analytics Charts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleChart 
            data={chartData} 
            title="Current Metrics Overview" 
          />
          <SimpleChart 
            data={timelineData} 
            title="Monthly Nothing Delivery Timeline" 
          />
        </div>
      </section>

      {/* Insights */}
      <section 
        className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6"
        aria-labelledby="insights-heading"
      >
        <h2 id="insights-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Insights
        </h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            Nothing continues to be delivered with 100% consistency
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            Void interactions are trending down, indicating successful nothingness
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            Existential crises resolution rate remains optimal at infinite efficiency
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            Customer satisfaction with receiving nothing exceeds all expectations
          </li>
        </ul>
      </section>
    </div>
  );
};

export const AnalyticsDashboard = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnalyticsDashboardContent />
    </Suspense>
  );
};

export default AnalyticsDashboard;
