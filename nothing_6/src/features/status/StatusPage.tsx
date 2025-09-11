// filepath: src/features/status/StatusPage.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useEffect, useState } from 'react';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import { SystemStatus, StatusMetric, IncidentReport } from '@/core/contracts';
import { nothingService } from '@/services/nothingService';
import GlassCard from '@/shared/components/GlassCard';

interface StatusPageProps {
  className?: string;
}

// Status indicator component
const StatusIndicator: React.FC<{ status: 'operational' | 'degraded' | 'outage'; label: string }> = ({ 
  status, 
  label 
}) => {
  const statusColors = {
    operational: 'bg-green-500 text-green-100',
    degraded: 'bg-yellow-500 text-yellow-100', 
    outage: 'bg-red-500 text-red-100'
  };

  const statusIcons = {
    operational: '✓',
    degraded: '⚠',
    outage: '✗'
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/50">
      <span className="text-gray-200 font-medium">{label}</span>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
        <span className="w-2 h-2 rounded-full bg-current"></span>
        <span>{statusIcons[status]} Operational</span>
      </div>
    </div>
  );
};

// Uptime chart component (simplified)
const UptimeChart: React.FC<{ data: StatusMetric[] }> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">90-day uptime</h3>
        <span className="text-green-400 font-bold text-xl">100.00%</span>
      </div>
      <div className="flex gap-1 h-8">
        {Array.from({ length: 90 }, (_, i) => (
          <div
            key={i}
            className="flex-1 bg-green-500 rounded-sm"
            title={`Day ${90 - i}: 100% uptime`}
            role="img"
            aria-label={`Day ${90 - i} status: operational`}
          />
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
};

// Incident timeline component
const IncidentTimeline: React.FC<{ incidents: IncidentReport[] }> = ({ incidents }) => {
  if (incidents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-white mb-2">No incidents to report!</h3>
        <p className="text-gray-400">
          Nothing has been running flawlessly. Zero incidents in the past 90 days.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {incidents.map((incident, index) => (
        <div key={incident.id || index} className="border-l-4 border-red-500 pl-6 pb-6 last:pb-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-500 text-red-100 px-2 py-1 rounded text-sm font-medium">
              {incident.severity || 'Minor'}
            </span>
            <span className="text-gray-400 text-sm">{incident.date}</span>
          </div>
          <h4 className="text-white font-medium mb-1">{incident.title}</h4>
          <p className="text-gray-300 text-sm">{incident.summary}</p>
          {incident.resolved && (
            <p className="text-green-400 text-sm mt-2">✓ Resolved</p>
          )}
        </div>
      ))}
    </div>
  );
};

const StatusPage: React.FC<StatusPageProps> = ({ className = '' }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch status data
  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const status = await nothingService.getSystemStatus();
        
        if (mounted) {
          setSystemStatus(status);
          eventBus.emit('analytics:track', { 
            event: 'status_page_viewed', 
            properties: { 
              overall_status: status.overall_status,
              services_count: status.services?.length || 0 
            } 
          });
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load status';
          setError(errorMessage);
          eventBus.emit('app:error', { type: 'status_fetch_failed', error: err });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className={`space-y-8 ${className}`} role="status" aria-live="polite">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`} role="alert">
        <GlassCard className="text-center py-12">
          <div className="text-red-400 text-6xl mb-4">⚠</div>
          <h2 className="text-xl font-semibold text-white mb-2">Status Unavailable</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  const services = systemStatus?.services || [];
  const incidents = systemStatus?.recent_incidents || [];
  const metrics = systemStatus?.metrics || [];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          System Status
        </h1>
        <p className="text-xl text-gray-300">
          Current status of Nothing™ services
        </p>
        {isDevelopment && (
          <div className="mt-2 text-sm text-yellow-400">
            Development Mode - Mock Status Data
          </div>
        )}
      </div>

      {/* Overall Status */}
      <GlassCard className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-white">All Systems Operational</h2>
        </div>
        <p className="text-gray-400">
          Nothing™ is operating at 100% capacity with zero incidents
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </GlassCard>

      {/* Service Status */}
      <GlassCard>
        <h2 className="text-2xl font-bold text-white mb-6">Service Status</h2>
        <div className="space-y-4">
          <StatusIndicator status="operational" label="Nothing™ Core API" />
          <StatusIndicator status="operational" label="Nothing™ Dashboard" />
          <StatusIndicator status="operational" label="Nothing™ Void Simulator" />
          <StatusIndicator status="operational" label="Nothing™ Chat Support" />
          <StatusIndicator status="operational" label="Nothing™ Analytics" />
          <StatusIndicator status="operational" label="Nothing™ Newsletter" />
        </div>
      </GlassCard>

      {/* Uptime Chart */}
      <GlassCard>
        <UptimeChart data={metrics} />
      </GlassCard>

      {/* Response Time Metrics */}
      <GlassCard>
        <h2 className="text-2xl font-bold text-white mb-6">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">0ms</div>
            <div className="text-gray-400">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
            <div className="text-gray-400">Uptime (30d)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">0</div>
            <div className="text-gray-400">Incidents</div>
          </div>
        </div>
      </GlassCard>

      {/* Incident History */}
      <GlassCard>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Incidents</h2>
        <IncidentTimeline incidents={incidents} />
      </GlassCard>

      {/* Subscribe to Updates */}
      <GlassCard className="text-center py-8">
        <h2 className="text-xl font-bold text-white mb-4">Stay Updated</h2>
        <p className="text-gray-400 mb-6">
          Get notified about status updates and maintenance windows
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Email address for status updates"
          />
          <button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => eventBus.emit('analytics:track', { event: 'status_subscription_clicked' })}
          >
            Subscribe
          </button>
        </div>
      </GlassCard>

      {/* Debug info in development */}
      {isDevelopment && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-400">Debug Info</summary>
          <pre className="mt-2 p-4 bg-gray-900 rounded overflow-auto">
            {JSON.stringify({ systemStatus, config: config.appName }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default StatusPage;
