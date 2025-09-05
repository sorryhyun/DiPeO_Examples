// filepath: src/features/dashboard/widgets/MetricCard.tsx
import React from 'react';
import { Card } from '@/shared/components/Card/Card';
import { LineChart } from '@/shared/components/Chart/LineChart';
import { config } from '@/app/config';

// Metric data type
export interface MetricData {
  id: string;
  title: string;
  value: number;
  previousValue?: number;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage';
  sparklineData?: Array<{ x: number; y: number }>;
  trend?: 'up' | 'down' | 'neutral';
  target?: number;
  description?: string;
}

// Props interface
export interface MetricCardProps {
  metric: MetricData;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSparkline?: boolean;
  showTrend?: boolean;
  onClick?: (metric: MetricData) => void;
}

// Format value based on type
function formatValue(value: number, format: MetricData['format'] = 'number', unit?: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    
    case 'number':
    default:
      const formatted = new Intl.NumberFormat('en-US').format(value);
      return unit ? `${formatted} ${unit}` : formatted;
  }
}

// Calculate percentage change
function calculateChange(current: number, previous: number): {
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
} {
  if (previous === 0) {
    return { percentage: 0, direction: 'neutral' };
  }
  
  const change = ((current - previous) / Math.abs(previous)) * 100;
  
  return {
    percentage: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
  };
}

// Trend icon component
function TrendIcon({ direction, size = 16 }: { direction: 'up' | 'down' | 'neutral'; size?: number }) {
  const colors = {
    up: '#22c55e',
    down: '#ef4444',
    neutral: '#6b7280',
  };

  const paths = {
    up: 'M7 14l5-5 5 5',
    down: 'M17 10l-5 5-5-5',
    neutral: 'M5 12h14',
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors[direction]}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[direction]} />
    </svg>
  );
}

// Main MetricCard component
export function MetricCard({
  metric,
  className = '',
  size = 'md',
  showSparkline = true,
  showTrend = true,
  onClick,
}: MetricCardProps) {
  const {
    id,
    title,
    value,
    previousValue,
    unit,
    format,
    sparklineData,
    trend,
    target,
    description,
  } = metric;

  // Calculate change if previous value exists
  const change = previousValue !== undefined 
    ? calculateChange(value, previousValue)
    : null;

  // Size-based styling
  const sizeStyles = {
    sm: {
      padding: 12,
      titleSize: '12px',
      valueSize: '20px',
      chartHeight: 40,
    },
    md: {
      padding: 16,
      titleSize: '14px',
      valueSize: '28px',
      chartHeight: 60,
    },
    lg: {
      padding: 20,
      titleSize: '16px',
      valueSize: '36px',
      chartHeight: 80,
    },
  };

  const styles = sizeStyles[size];

  // Handle click interaction
  const handleClick = () => {
    if (onClick) {
      onClick(metric);
    }
  };

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(metric);
    }
  };

  // Determine if card should be interactive
  const isInteractive = !!onClick;

  return (
    <Card
      className={`metric-card ${className}`}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-label={isInteractive ? `View details for ${title}` : undefined}
      style={{
        padding: `${styles.padding}px`,
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
        ...(isInteractive && {
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          },
          ':focus': {
            outline: '2px solid var(--color-primary)',
            outlineOffset: '2px',
          },
        }),
      }}
    >
      {/* Header section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: size === 'sm' ? '8px' : '12px',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: styles.titleSize,
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: '1.2',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            title={title}
          >
            {title}
          </h3>
        </div>

        {/* Trend indicator */}
        {showTrend && (trend || change) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            <TrendIcon direction={trend || change!.direction} size={size === 'sm' ? 12 : 16} />
            {change && (
              <span
                style={{
                  fontSize: size === 'sm' ? '10px' : '12px',
                  fontWeight: '500',
                  color: {
                    up: '#22c55e',
                    down: '#ef4444',
                    neutral: '#6b7280',
                  }[trend || change.direction],
                }}
                aria-label={`${change.direction === 'up' ? 'Increased' : change.direction === 'down' ? 'Decreased' : 'No change'} by ${change.percentage.toFixed(1)}%`}
              >
                {change.percentage.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Value section */}
      <div
        style={{
          marginBottom: size === 'sm' ? '8px' : '16px',
        }}
      >
        <div
          style={{
            fontSize: styles.valueSize,
            fontWeight: '700',
            color: 'var(--color-text)',
            lineHeight: '1.1',
            wordBreak: 'break-all',
          }}
          aria-label={`Current value: ${formatValue(value, format, unit)}`}
        >
          {formatValue(value, format, unit)}
        </div>

        {/* Target indicator */}
        {target !== undefined && (
          <div
            style={{
              fontSize: size === 'sm' ? '10px' : '12px',
              color: 'var(--color-text-tertiary)',
              marginTop: '4px',
            }}
            aria-label={`Target: ${formatValue(target, format, unit)}`}
          >
            Target: {formatValue(target, format, unit)}
          </div>
        )}
      </div>

      {/* Sparkline chart */}
      {showSparkline && sparklineData && sparklineData.length > 0 && (
        <div
          style={{
            height: `${styles.chartHeight}px`,
            marginTop: 'auto',
          }}
        >
          <LineChart
            data={sparklineData}
            height={styles.chartHeight}
            showGrid={false}
            showTooltip={false}
            lineColor={
              trend === 'up' || (change && change.direction === 'up')
                ? '#22c55e'
                : trend === 'down' || (change && change.direction === 'down')
                ? '#ef4444'
                : 'var(--color-primary)'
            }
            ariaLabel={`Trend chart for ${title}`}
          />
        </div>
      )}

      {/* Description tooltip */}
      {description && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'var(--color-background-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'var(--color-text-tertiary)',
            cursor: 'help',
          }}
          title={description}
          aria-label={description}
        >
          ?
        </div>
      )}

      {/* Loading overlay for development */}
      {config.isDevelopment && !sparklineData && showSparkline && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            height: `${styles.chartHeight}px`,
            background: 'var(--color-background-secondary)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'var(--color-text-tertiary)',
          }}
        >
          No chart data
        </div>
      )}
    </Card>
  );
}

// Default export
export default MetricCard;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses Card and LineChart components
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - includes ARIA labels, keyboard navigation, focus management
