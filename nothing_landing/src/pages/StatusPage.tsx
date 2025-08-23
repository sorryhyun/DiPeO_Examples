import React, { useState, useEffect } from 'react';
import { Layout } from '../shared/components/Layout';
import { Button } from '../shared/components/Button';
import { Icon } from '../shared/components/Icon';
import { NewsletterSignup } from '../features/newsletter/NewsletterSignup';
import { clsx } from '../utils/clsx';

interface StatusEvent {
  id: string;
  timestamp: Date;
  status: 'operational' | 'maintenance' | 'incident';
  title: string;
  description: string;
  duration?: string;
}

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: string;
}

const MOCK_STATUS_EVENTS: StatusEvent[] = [
  {
    id: '1',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    status: 'operational',
    title: 'Nothing Service Operating at Peak Void',
    description: 'All systems are delivering premium nothing with exceptional emptiness quality.',
  },
  {
    id: '2',
    timestamp: new Date('2024-01-14T14:22:00Z'),
    status: 'operational',
    title: 'Void Maintenance Completed',
    description: 'Successfully performed routine maintenance on our primary void infrastructure. No users affected as there was nothing to affect.',
    duration: '0 minutes',
  },
  {
    id: '3',
    timestamp: new Date('2024-01-13T09:15:00Z'),
    status: 'maintenance',
    title: 'Scheduled Nothing Optimization',
    description: 'Optimizing our nothing delivery algorithms for enhanced emptiness.',
    duration: '15 minutes',
  },
  {
    id: '4',
    timestamp: new Date('2024-01-12T16:45:00Z'),
    status: 'operational',
    title: 'Emergency Nothing Restoration',
    description: 'Quickly resolved a brief incident where users almost received something. Crisis averted.',
    duration: '2 minutes',
  },
  {
    id: '5',
    timestamp: new Date('2024-01-11T11:00:00Z'),
    status: 'operational',
    title: 'Nothing Delivery Systems Online',
    description: 'All nothing delivery systems are operating within normal void parameters.',
  },
];

const SYSTEM_COMPONENTS: SystemStatus[] = [
  { name: 'Nothing API', status: 'operational', uptime: '99.99%' },
  { name: 'Void Database', status: 'operational', uptime: '100.00%' },
  { name: 'Emptiness CDN', status: 'operational', uptime: '99.98%' },
  { name: 'Silence Streaming', status: 'operational', uptime: '99.97%' },
  { name: 'Nothing Analytics', status: 'operational', uptime: '100.00%' },
  { name: 'Support Portal', status: 'operational', uptime: '99.95%' },
];

export const StatusPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [showNewsletter, setShowNewsletter] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <Icon name="check-circle" className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <Icon name="exclamation-triangle" className="w-5 h-5 text-yellow-500" />;
      case 'outage':
        return <Icon name="x-circle" className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <Icon name="wrench" className="w-5 h-5 text-blue-500" />;
      default:
        return <Icon name="minus-circle" className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 dark:text-green-400';
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'outage':
        return 'text-red-600 dark:text-red-400';
      case 'maintenance':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  const filteredEvents = MOCK_STATUS_EVENTS.filter((event) => {
    const now = new Date();
    const eventDate = new Date(event.timestamp);
    const diffHours = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);

    switch (selectedTimeframe) {
      case '24h':
        return diffHours <= 24;
      case '7d':
        return diffHours <= 168; // 7 * 24
      case '30d':
        return diffHours <= 720; // 30 * 24
      default:
        return true;
    }
  });

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nothing Status
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Real-time status of our nothing delivery infrastructure
            </p>
            
            {/* Overall Status */}
            <div className="inline-flex items-center px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Icon name="check-circle" className="w-6 h-6 text-green-500 mr-3" />
              <span className="text-lg font-semibold text-green-800 dark:text-green-200">
                All Systems Operational - 100% Nothing Uptime
              </span>
            </div>
          </div>

          {/* System Components */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                System Components
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {SYSTEM_COMPONENTS.map((component) => (
                <div key={component.name} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(component.status)}
                    <span className="ml-3 font-medium text-gray-900 dark:text-white">
                      {component.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={clsx('capitalize font-medium', getStatusColor(component.status))}>
                      {component.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {component.uptime} uptime
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Status History
              </h2>
              
              {/* Timeframe Selector */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['24h', '7d', '30d'] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={clsx(
                      'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                      selectedTimeframe === timeframe
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div key={event.id} className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          <time className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(event.timestamp)}
                          </time>
                        </div>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">
                          {event.description}
                        </p>
                        {event.duration && (
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Duration: {event.duration}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <Icon name="inbox" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No status events in the selected timeframe
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subscribe Section */}
          <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-6 py-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Stay Updated on Nothing
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Subscribe to receive notifications about our nothing service status
            </p>
            
            <Button
              onClick={() => setShowNewsletter(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Subscribe to Status Updates
            </Button>
          </div>

          {/* Print-friendly version note */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 print:hidden">
            <p>This page is optimized for printing and accessibility.</p>
          </div>
        </div>
      </div>

      {/* Newsletter Modal */}
      {showNewsletter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Subscribe to Status Updates
                </h3>
                <button
                  onClick={() => setShowNewsletter(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>
              <NewsletterSignup 
                onSuccess={() => setShowNewsletter(false)}
                variant="status"
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
