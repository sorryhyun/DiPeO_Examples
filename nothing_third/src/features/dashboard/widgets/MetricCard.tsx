// filepath: src/features/dashboard/widgets/MetricCard.tsx
import React from 'react';
import { Card } from '@/shared/components/Card/Card';
import { LineChart } from '@/shared/components/Chart/LineChart';

export interface MetricData {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: number;
    percentage: number;
    period: string;
  };
  sparklineData?: Array<{
    timestamp: string;
    value: number;
  }>;
  color?: string;
  icon?: string;
}

export interface MetricCardProps {
  metric: MetricData;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showSparkline?: boolean;
  onClick?: (metric: MetricData) => void;
}

export function MetricCard({
  metric,
  className = '',
  size = 'medium',
  showSparkline = true,
  onClick
}: MetricCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(metric);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(metric);
    }
  };

  const getDeltaColor = (delta?: MetricData['delta']): string => {
    if (!delta) return '#6b7280';
    
    if (delta.value > 0) return '#10b981'; // Green for positive
    if (delta.value < 0) return '#ef4444'; // Red for negative
    return '#6b7280'; // Gray for zero
  };

  const getDeltaIcon = (delta?: MetricData['delta']): string => {
    if (!delta) return '';
    
    if (delta.value > 0) return '↗';
    if (delta.value < 0) return '↘';
    return '→';
  };

  const formatValue = (value: string | number, unit?: string): string => {
    if (typeof value === 'number') {
      // Format large numbers
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M${unit ? ` ${unit}` : ''}`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k${unit ? ` ${unit}` : ''}`;
      }
      return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
    }
    
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
    const styles = {
      small: {
        padding: '1rem',
        minHeight: '120px'
      },
      medium: {
        padding: '1.25rem',
        minHeight: '160px'
      },
      large: {
        padding: '1.5rem',
        minHeight: '200px'
      }
    };
    return styles[size];
  };

  const sizeStyles = getSizeStyles(size);
  const deltaColor = getDeltaColor(metric.delta);
  const deltaIcon = getDeltaIcon(metric.delta);

  return (
    <Card
      className={`metric-card ${className}`}
      padding="none"
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View details for ${metric.title}` : undefined}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...sizeStyles,
        ...(onClick && {
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
          },
          ':focus': {
            outline: '2px solid #3b82f6',
            outlineOffset: '2px'
          }
        })
      }}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: sizeStyles.padding
        }}
      >
        {/* Header with icon and title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: size === 'small' ? '0.5rem' : '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {metric.icon && (
              <span
                style={{
                  fontSize: size === 'small' ? '1rem' : '1.25rem',
                  color: metric.color || '#6b7280'
                }}
                aria-hidden="true"
              >
                {metric.icon}
              </span>
            )}
            <h3
              style={{
                margin: 0,
                fontSize: size === 'small' ? '0.875rem' : '0.9375rem',
                fontWeight: '500',
                color: '#6b7280',
                lineHeight: '1.4'
              }}
            >
              {metric.title}
            </h3>
          </div>
        </div>

        {/* Main value */}
        <div
          style={{
            marginBottom: size === 'small' ? '0.5rem' : '0.75rem'
          }}
        >
          <div
            style={{
              fontSize: size === 'small' ? '1.75rem' : size === 'medium' ? '2.25rem' : '2.5rem',
              fontWeight: '700',
              color: '#111827',
              lineHeight: '1.1',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {formatValue(metric.value, metric.unit)}
          </div>
        </div>

        {/* Delta and sparkline container */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 0
          }}
        >
          {/* Delta indicator */}
          {metric.delta && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                marginBottom: showSparkline && metric.sparklineData ? '0.75rem' : 0
              }}
            >
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: deltaColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {deltaIcon}
                {Math.abs(metric.delta.percentage).toFixed(1)}%
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}
              >
                vs {metric.delta.period}
              </span>
            </div>
          )}

          {/* Sparkline chart */}
          {showSparkline && metric.sparklineData && metric.sparklineData.length > 1 && (
            <div
              style={{
                height: size === 'small' ? '40px' : size === 'medium' ? '50px' : '60px',
                marginTop: 'auto'
              }}
            >
              <LineChart
                data={metric.sparklineData.map(point => ({
                  x: point.timestamp,
                  y: point.value
                }))}
                height={size === 'small' ? 40 : size === 'medium' ? 50 : 60}
                color={metric.color || '#3b82f6'}
                showAxes={false}
                showGrid={false}
                showTooltip={false}
                strokeWidth={2}
                fill={false}
                gradient={false}
                responsive={true}
                aria-hidden="true" // Decorative chart, data already presented in value/delta
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Export default for convenience
export default MetricCard;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/shared/components/Card/Card and @/shared/components/Chart/LineChart)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure presentational component
- [x] Reads config from `@/app/config` (N/A - this is a presentational widget component)
- [x] Exports default named component (exports MetricCard as named export and default)
- [x] Adds basic ARIA and keyboard handlers (role="button", aria-label, tabIndex, onKeyDown for Enter/Space when clickable)
*/
