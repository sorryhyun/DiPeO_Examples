import React, { useEffect, useState } from 'react';
import { trackEvent } from '@/utils/analytics';

interface StatusMetric {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
}

interface StatusIncident {
  id: string;
  title: string;
  status: 'resolved' | 'investigating' | 'identified' | 'monitoring';
  date: string;
  description: string;
}

export const StatusPage: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock status data - everything is perfect because we're absolutely nothing
  const statusMetrics: StatusMetric[] = [
    { name: 'Nothing API', status: 'operational', uptime: '100.000%' },
    { name: 'Void Database', status: 'operational', uptime: '100.000%' },
    { name: 'Emptiness Engine', status: 'operational', uptime: '100.000%' },
    { name: 'Nothing CDN', status: 'operational', uptime: '100.000%' },
    { name: 'Silent Notifications', status: 'operational', uptime: '100.000%' },
    { name: 'Zero Processing', status: 'operational', uptime: '100.000%' }
  ];

  // No incidents because nothing can go wrong with nothing
  const recentIncidents: StatusIncident[] = [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    trackEvent('status_refresh', { timestamp: new Date().toISOString() });
    
    // Simulate refresh delay
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    trackEvent('status_page_view', { timestamp: new Date().toISOString() });
  }, []);

  const getStatusColor = (status: StatusMetric['status']) => {
    switch (status) {
      case 'operational':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'degraded':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'down':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: StatusMetric['status']) => {
    switch (status) {
      case 'operational':
        return '●';
      case 'degraded':
        return '◐';
      case 'down':
        return '○';
      default:
        return '?';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          System Status
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Current status of Absolutely Nothing™ services
        </p>
        
        {/* Overall Status Badge */}
        <div className="inline-flex items-center px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-full">
          <span className="text-green-500 text-xl mr-2">●</span>
          <span className="text-green-800 dark:text-green-300 font-semibold">
            All Systems Operational
          </span>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-between items-center mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200"
          aria-label="Refresh status"
        >
          <span className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}>
            ↻
          </span>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Status Grid */}
      <div className="grid gap-4 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Service Status
        </h2>
        
        {statusMetrics.map((metric) => (
          <div
            key={metric.name}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metric.status)}`}
                role="status"
                aria-label={`${metric.name} is ${metric.status}`}
              >
                <span className="mr-2">{getStatusIcon(metric.status)}</span>
                {metric.status}
              </span>
              <span className="ml-4 font-medium text-gray-900 dark:text-gray-100">
                {metric.name}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                {metric.uptime} uptime
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Incidents Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Incidents
        </h2>
        
        {recentIncidents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No incidents to report!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Absolutely Nothing™ has been running flawlessly with zero incidents. 
              When you deliver nothing, there's nothing that can go wrong.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {incident.title}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {incident.date}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    incident.status === 'resolved' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {incident.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {incident.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Legend */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Status Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <span className="text-green-500 text-xl mr-3">●</span>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Operational</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Service is running normally</div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-500 text-xl mr-3">◐</span>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Degraded</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Service is partially impacted</div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-3">○</span>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Down</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Service is unavailable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
