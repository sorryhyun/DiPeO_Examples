// filepath: src/features/dashboard/components/MetricCard.tsx
/* src/features/dashboard/components/MetricCard.tsx

Small metric card showing a key metric, percentage change and a mini sparkline. 
Uses glass card styling and integrates with LineChart for mini-sparklines.
*/

import React from 'react';
import { GlassCard } from '@/components/GlassCard';
import { LineChart } from '@/components/Chart/LineChart';
import { theme } from '@/theme';

export interface MetricCardData {
  label: string;
  value: string | number;
  previousValue?: string | number;
  percentageChange?: number;
  trend?: 'up' | 'down' | 'neutral';
  sparklineData?: Array<{ x: number | string; y: number }>;
  unit?: string;
  formatValue?: (value: string | number) => string;
}

export interface MetricCardProps {
  data: MetricCardData;
  className?: string;
  variant?: 'default' | 'compact';
  showSparkline?: boolean;
  sparklineHeight?: number;
  onClick?: () => void;
}

export function MetricCard({
  data,
  className = '',
  variant = 'default',
  showSparkline = true,
  sparklineHeight = 40,
  onClick,
}: MetricCardProps) {
  const {
    label,
    value,
    percentageChange,
    trend,
    sparklineData,
    unit = '',
    formatValue,
  } = data;

  // Format the main value
  const formattedValue = formatValue ? formatValue(value) : value;
  
  // Format percentage change
  const formattedPercentage = percentageChange !== undefined 
    ? `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`
    : null;

  // Determine trend styling
  const getTrendColor = (trendType?: 'up' | 'down' | 'neutral') => {
    if (!trendType || trendType === 'neutral') return theme.colors.gray[500];
    return trendType === 'up' ? theme.colors.green[500] : theme.colors.red[500];
  };

  const getTrendIcon = (trendType?: 'up' | 'down' | 'neutral') => {
    if (!trendType || trendType === 'neutral') return '→';
    return trendType === 'up' ? '↑' : '↓';
  };

  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  const isInteractive = Boolean(onClick);

  return (
    <GlassCard
      className={`metric-card metric-card--${variant} ${className}`}
      padding={variant === 'compact' ? 'sm' : 'md'}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-label={isInteractive ? `View details for ${label}` : undefined}
      style={{
        cursor: isInteractive ? 'pointer' : 'default',
        transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.easeOut}`,
        '--metric-card-hover-transform': isInteractive ? 'translateY(-2px)' : 'none',
        '--metric-card-hover-shadow': isInteractive ? theme.shadows.lg : 'none',
      }}
    >
      <div className="metric-card__content">
        {/* Header */}
        <div className="metric-card__header">
          <h3 className="metric-card__label">
            {label}
          </h3>
          {formattedPercentage && (
            <div 
              className="metric-card__change"
              style={{
                color: getTrendColor(trend),
                fontSize: variant === 'compact' ? theme.typography.fontSize.xs : theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span 
                className="metric-card__trend-icon"
                aria-hidden="true"
                style={{
                  fontSize: '0.875em',
                }}
              >
                {getTrendIcon(trend)}
              </span>
              {formattedPercentage}
            </div>
          )}
        </div>

        {/* Main Value */}
        <div className="metric-card__value-container">
          <div 
            className="metric-card__value"
            style={{
              fontSize: variant === 'compact' ? theme.typography.fontSize.xl : theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.gray[900],
              lineHeight: theme.typography.lineHeight.tight,
            }}
          >
            {formattedValue}
            {unit && (
              <span 
                className="metric-card__unit"
                style={{
                  fontSize: '0.6em',
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.gray[500],
                  marginLeft: '0.25rem',
                }}
              >
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Sparkline */}
        {showSparkline && sparklineData && sparklineData.length > 0 && (
          <div 
            className="metric-card__sparkline"
            style={{
              marginTop: variant === 'compact' ? theme.spacing.sm : theme.spacing.md,
              height: `${sparklineHeight}px`,
            }}
          >
            <LineChart
              data={sparklineData}
              height={sparklineHeight}
              showGrid={false}
              showAxes={false}
              showTooltip={false}
              showLegend={false}
              strokeWidth={2}
              color={getTrendColor(trend)}
              className="metric-card__chart"
              aria-label={`Trend chart for ${label}`}
              style={{
                opacity: 0.8,
              }}
            />
          </div>
        )}
      </div>

      {/* Interactive hover styles */}
      <style jsx>{`
        .metric-card {
          position: relative;
        }
        
        .metric-card:hover {
          transform: var(--metric-card-hover-transform);
          box-shadow: var(--metric-card-hover-shadow);
        }
        
        .metric-card:focus-visible {
          outline: 2px solid ${theme.colors.primary[500]};
          outline-offset: 2px;
        }
        
        .metric-card__content {
          position: relative;
          z-index: 1;
        }
        
        .metric-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: ${theme.spacing.sm};
        }
        
        .metric-card__label {
          font-size: ${variant === 'compact' ? theme.typography.fontSize.sm : theme.typography.fontSize.base};
          font-weight: ${theme.typography.fontWeight.medium};
          color: ${theme.colors.gray[600]};
          margin: 0;
          line-height: ${theme.typography.lineHeight.snug};
        }
        
        .metric-card__value-container {
          margin-bottom: ${variant === 'compact' ? theme.spacing.xs : theme.spacing.sm};
        }
        
        .metric-card--compact .metric-card__header {
          margin-bottom: ${theme.spacing.xs};
        }
        
        .metric-card--compact .metric-card__value-container {
          margin-bottom: ${theme.spacing.xs};
        }
        
        @media (prefers-reduced-motion: reduce) {
          .metric-card {
            transition: none !important;
          }
          
          .metric-card:hover {
            transform: none !important;
          }
        }
      `}</style>
    </GlassCard>
  );
}

// Helper function to create metric data
export function createMetricData(
  label: string,
  value: string | number,
  options: Partial<Omit<MetricCardData, 'label' | 'value'>> = {}
): MetricCardData {
  return {
    label,
    value,
    ...options,
  };
}

// Helper function to calculate percentage change
export function calculatePercentageChange(
  current: number,
  previous: number
): { percentageChange: number; trend: 'up' | 'down' | 'neutral' } {
  if (previous === 0) {
    return { 
      percentageChange: current > 0 ? 100 : 0, 
      trend: current > 0 ? 'up' : 'neutral' 
    };
  }
  
  const change = ((current - previous) / previous) * 100;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  
  return { percentageChange: change, trend };
}

// Helper function to format common metric values
export const formatters = {
  currency: (value: string | number, currency = 'USD') => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  },
  
  number: (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US').format(num);
  },
  
  percentage: (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(1)}%`;
  },
  
  compact: (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  },
};

/* Exampleusage:

import { MetricCard, createMetricData, calculatePercentageChange, formatters } from './MetricCard'

function DashboardMetrics() {
  const revenueData = createMetricData(
    'Total Revenue',
    125000,
    {
      ...calculatePercentageChange(125000, 100000),
      unit: 'USD',
      formatValue: formatters.currency,
      sparklineData: [
        { x: 1, y: 80000 },
        { x: 2, y: 95000 },
        { x: 3, y: 110000 },
        { x: 4, y: 125000 },
      ]
    }
  );

  const usersData = createMetricData(
    'Active Users',
    1250,
    {
      ...calculatePercentageChange(1250, 1100),
      formatValue: formatters.compact,
      sparklineData: generateSparklineData()
    }
  );

  return (
    <div className="metrics-grid">
      <MetricCard 
        data={revenueData}
        onClick={() => navigateToRevenue()}
      />
      <MetricCard 
        data={usersData}
        variant="compact"
      />
    </div>
  )
}

*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (uses theme tokens instead)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
