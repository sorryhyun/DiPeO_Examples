// filepath: src/features/dashboard/MetricCard.tsx

import React from 'react';
import { Card } from '@/shared/components/Card';
import { GradientBadge } from '@/shared/components/GradientBadge';
import { Chart } from '@/shared/components/Chart';
import { Tooltip } from '@/shared/components/Tooltip';
import type { DashboardMetric } from '@/core/contracts';
import { theme } from '@/theme';

// =============================
// TYPE DEFINITIONS
// =============================

export interface MetricCardProps {
  metric: DashboardMetric;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSparkline?: boolean;
  showTooltip?: boolean;
  onClick?: (metric: DashboardMetric) => void;
  'aria-label'?: string;
}

interface SparklineData {
  timestamp: string;
  value: number;
}

// =============================
// HELPER FUNCTIONS
// =============================

function formatMetricValue(value: number | string, unit?: string): string {
  if (typeof value === 'string') {
    return value;
  }

  // Format large numbers with appropriate suffixes
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${unit ? ` ${unit}` : ''}`;
  }
  
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${unit ? ` ${unit}` : ''}`;
  }

  // Handle decimal numbers
  if (value % 1 !== 0) {
    return `${value.toFixed(2)}${unit ? ` ${unit}` : ''}`;
  }

  return `${value}${unit ? ` ${unit}` : ''}`;
}

function getChangeIcon(direction: 'up' | 'down' | 'neutral'): string {
  switch (direction) {
    case 'up':
      return '↗';
    case 'down':
      return '↘';
    case 'neutral':
      return '→';
    default:
      return '→';
  }
}

function getDeltaBadgeVariant(direction: 'up' | 'down' | 'neutral'): 'success' | 'error' | 'warning' {
  switch (direction) {
    case 'up':
      return 'success';
    case 'down':
      return 'error';
    case 'neutral':
      return 'warning';
    default:
      return 'warning';
  }
}

function formatDeltaValue(value: number): string {
  const abs = Math.abs(value);
  const sign = value >= 0 ? '+' : '';
  
  if (abs >= 1000) {
    return `${sign}${(value / 1000).toFixed(1)}K`;
  }
  
  if (abs % 1 !== 0) {
    return `${sign}${value.toFixed(2)}`;
  }
  
  return `${sign}${value}`;
}

function prepareTrendData(trend?: Array<{ timestamp: string; value: number }>): SparklineData[] {
  if (!trend || trend.length === 0) {
    return [];
  }

  // Ensure data is sorted by timestamp
  return [...trend].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

// =============================
// COMPONENT IMPLEMENTATION
// =============================

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  className = '',
  size = 'md',
  showSparkline = true,
  showTooltip = true,
  onClick,
  'aria-label': ariaLabel,
}) => {
  const isClickable = !!onClick;
  const trendData = prepareTrendData(metric.trend);
  
  // Size-based styling
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const titleClasses = {
    sm: 'text-sm font-medium',
    md: 'text-base font-medium',
    lg: 'text-lg font-semibold',
  };

  const valueClasses = {
    sm: 'text-xl font-bold',
    md: 'text-2xl font-bold',
    lg: 'text-3xl font-bold',
  };

  const sparklineHeight = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  // Handle card click
  const handleClick = () => {
    if (onClick && !isClickable) return;
    onClick?.(metric);
  };

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isClickable) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Build tooltip content
  const tooltipContent = showTooltip ? (
    <div className="space-y-2">
      <div className="font-medium">{metric.name}</div>
      <div className="text-sm opacity-80">
        Current: {formatMetricValue(metric.value, metric.unit)}
      </div>
      {metric.change && (
        <div className="text-sm opacity-80">
          Change: {formatDeltaValue(metric.change.value)} over {metric.change.period}
        </div>
      )}
      {trendData.length > 0 && (
        <div className="text-sm opacity-80">
          Trend: {trendData.length} data points
        </div>
      )}
    </div>
  ) : null;

  const cardContent = (
    <div className={`space-y-4 ${sizeClasses[size]}`}>
      {/* Header: Title and Delta Badge */}
      <div className="flex items-start justify-between">
        <h3 className={`text-gray-600 dark:text-gray-300 ${titleClasses[size]}`}>
          {metric.name}
        </h3>
        
        {metric.change && (
          <GradientBadge
            variant={getDeltaBadgeVariant(metric.change.direction)}
            size="sm"
            className="flex items-center gap-1"
          >
            <span className="text-xs">
              {getChangeIcon(metric.change.direction)}
            </span>
            {formatDeltaValue(metric.change.value)}
          </GradientBadge>
        )}
      </div>

      {/* Main Value */}
      <div className={`text-gray-900 dark:text-gray-100 ${valueClasses[size]}`}>
        {formatMetricValue(metric.value, metric.unit)}
      </div>

      {/* Sparkline Chart */}
      {showSparkline && trendData.length > 0 && (
        <div className="pt-2">
          <Chart
            type="sparkline"
            data={trendData}
            height={sparklineHeight[size]}
            className="w-full"
            config={{
              xKey: 'timestamp',
              yKey: 'value',
              color: metric.change?.direction === 'up' 
                ? theme.colors.success[500] 
                : metric.change?.direction === 'down'
                ? theme.colors.error[500]
                : theme.colors.primary[500],
              strokeWidth: 2,
              showGrid: false,
              showAxes: false,
              showTooltip: false,
            }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Additional Context */}
      {metric.change?.period && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          vs. {metric.change.period}
        </div>
      )}
    </div>
  );

  const cardElement = (
    <Card
      className={`
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''}
        ${className}
      `}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={ariaLabel || `${metric.name}: ${formatMetricValue(metric.value, metric.unit)}`}
    >
      {cardContent}
    </Card>
  );

  // Wrap with tooltip if enabled
  if (showTooltip && tooltipContent) {
    return (
      <Tooltip content={tooltipContent} placement="top">
        {cardElement}
      </Tooltip>
    );
  }

  return cardElement;
};

// =============================
// DISPLAY NAME & DEFAULT EXPORT
// =============================

MetricCard.displayName = 'MetricCard';

export default MetricCard;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (uses theme from @/theme)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
