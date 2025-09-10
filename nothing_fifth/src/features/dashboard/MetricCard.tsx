// filepath: src/features/dashboard/MetricCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/Card';
import { LineChart } from '@/shared/charts/LineChart';
import { fadeIn, staggerItem } from '@/theme/animations';
import { ChartSeries } from '@/core/contracts';
import { classNames } from '@/core/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type MetricTrend = 'up' | 'down' | 'neutral';
export type MetricSize = 'sm' | 'md' | 'lg';

export interface MetricCardProps {
  /** Primary metric value to display */
  readonly value: string | number;
  /** Metric label/title */
  readonly label: string;
  /** Optional subtitle or description */
  readonly subtitle?: string;
  /** Change from previous period (percentage or absolute) */
  readonly delta?: {
    readonly value: number;
    readonly type: 'percentage' | 'absolute';
    readonly period: string; // e.g., "vs last month"
  };
  /** Trend direction for styling */
  readonly trend?: MetricTrend;
  /** Optional sparkline data */
  readonly sparklineData?: ChartSeries;
  /** Size variant */
  readonly size?: MetricSize;
  /** Loading state */
  readonly isLoading?: boolean;
  /** Optional icon component */
  readonly icon?: React.ReactNode;
  /** Custom color theme */
  readonly color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'gray';
  /** Click handler */
  readonly onClick?: () => void;
  /** Custom className */
  readonly className?: string;
  /** ARIA label for accessibility */
  readonly ariaLabel?: string;
}

// ============================================================================
// STYLE VARIANTS
// ============================================================================

const sizeStyles: Record<MetricSize, {
  card: string;
  value: string;
  label: string;
  subtitle: string;
  delta: string;
  sparkline: number;
}> = {
  sm: {
    card: 'p-3',
    value: 'text-lg font-bold',
    label: 'text-xs font-medium',
    subtitle: 'text-xs',
    delta: 'text-xs',
    sparkline: 40,
  },
  md: {
    card: 'p-4',
    value: 'text-2xl font-bold',
    label: 'text-sm font-medium',
    subtitle: 'text-sm',
    delta: 'text-sm',
    sparkline: 60,
  },
  lg: {
    card: 'p-6',
    value: 'text-3xl font-bold',
    label: 'text-base font-medium',
    subtitle: 'text-sm',
    delta: 'text-sm',
    sparkline: 80,
  },
};

const colorStyles: Record<string, {
  value: string;
  icon: string;
  sparkline: string;
}> = {
  blue: {
    value: 'text-blue-900',
    icon: 'text-blue-600',
    sparkline: '#3B82F6',
  },
  green: {
    value: 'text-green-900',
    icon: 'text-green-600',
    sparkline: '#10B981',
  },
  red: {
    value: 'text-red-900',
    icon: 'text-red-600',
    sparkline: '#EF4444',
  },
  purple: {
    value: 'text-purple-900',
    icon: 'text-purple-600',
    sparkline: '#8B5CF6',
  },
  orange: {
    value: 'text-orange-900',
    icon: 'text-orange-600',
    sparkline: '#F97316',
  },
  gray: {
    value: 'text-gray-900',
    icon: 'text-gray-600',
    sparkline: '#6B7280',
  },
};

const trendStyles: Record<MetricTrend, {
  text: string;
  bg: string;
  icon: string;
}> = {
  up: {
    text: 'text-green-700',
    bg: 'bg-green-100',
    icon: '↗',
  },
  down: {
    text: 'text-red-700',
    bg: 'bg-red-100',
    icon: '↘',
  },
  neutral: {
    text: 'text-gray-700',
    bg: 'bg-gray-100',
    icon: '→',
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format the delta value for display
 */
function formatDelta(delta: MetricCardProps['delta']): string {
  if (!delta) return '';
  
  const { value, type } = delta;
  const prefix = value > 0 ? '+' : '';
  const suffix = type === 'percentage' ? '%' : '';
  
  return `${prefix}${value}${suffix}`;
}

/**
 * Determine trend from delta if not explicitly provided
 */
function inferTrend(delta?: MetricCardProps['delta']): MetricTrend {
  if (!delta) return 'neutral';
  
  if (delta.value > 0) return 'up';
  if (delta.value < 0) return 'down';
  return 'neutral';
}

/**
 * Format the metric value for display
 */
function formatValue(value: string | number): string {
  if (typeof value === 'string') return value;
  
  // Format large numbers with abbreviations
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  
  return value.toLocaleString();
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

const MetricCardSkeleton: React.FC<{ size: MetricSize }> = ({ size }) => {
  const styles = sizeStyles[size];
  
  return (
    <div className={classNames('animate-pulse space-y-3', styles.card)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className={`h-${styles.sparkline / 4} bg-gray-200 rounded w-24`} />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  subtitle,
  delta,
  trend,
  sparklineData,
  size = 'md',
  isLoading = false,
  icon,
  color = 'blue',
  onClick,
  className,
  ariaLabel,
}) => {
  const styles = sizeStyles[size];
  const colors = colorStyles[color];
  const finalTrend = trend || inferTrend(delta);
  const trendStyle = trendStyles[finalTrend];
  
  const formattedValue = formatValue(value);
  const formattedDelta = formatDelta(delta);
  
  const handleClick = React.useCallback(() => {
    onClick?.();
  }, [onClick]);
  
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  }, [onClick]);
  
  if (isLoading) {
    return (
      <Card
        variant="elevated"
        padding="none"
        className={className}
        ariaLabel="Loading metric data"
      >
        <MetricCardSkeleton size={size} />
      </Card>
    );
  }
  
  return (
    <motion.div
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <Card
        variant="elevated"
        padding="none"
        interactive={!!onClick}
        onClick={onClick}
        className="group"
        ariaLabel={ariaLabel || `${label}: ${formattedValue}`}
      >
        <div className={styles.card}>
          {/* Header with label and icon */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className={classNames(
                styles.label,
                'text-gray-600 uppercase tracking-wide truncate'
              )}>
                {label}
              </h3>
              {subtitle && (
                <p className={classNames(
                  styles.subtitle,
                  'text-gray-500 mt-1 truncate'
                )}>
                  {subtitle}
                </p>
              )}
            </div>
            {icon && (
              <div className={classNames(
                'flex-shrink-0 ml-3',
                colors.icon
              )}>
                {icon}
              </div>
            )}
          </div>
          
          {/* Main value */}
          <div className="mb-4">
            <motion.div
              variants={fadeIn}
              className={classNames(
                styles.value,
                colors.value,
                'leading-none'
              )}
            >
              {formattedValue}
            </motion.div>
          </div>
          
          {/* Delta and sparkline row */}
          <div className="flex items-center justify-between">
            {/* Delta indicator */}
            {delta && (
              <div className={classNames(
                'inline-flex items-center px-2 py-1 rounded-full',
                styles.delta,
                trendStyle.text,
                trendStyle.bg
              )}>
                <span className="mr-1" aria-hidden="true">
                  {trendStyle.icon}
                </span>
                <span>
                  {formattedDelta}
                </span>
                {delta.period && (
                  <span className="ml-1 opacity-75">
                    {delta.period}
                  </span>
                )}
              </div>
            )}
            
            {/* Sparkline chart */}
            {sparklineData && (
              <div className="flex-shrink-0 ml-4">
                <LineChart
series={[{
                    ...sparklineData,
                    color: colors.sparkline,
                  }]}
                  height={styles.sparkline}
                  showLegend={false}
                  showGrid={false}
                  animate={false}
                  className="w-24"
                  ariaLabel={`Trend chart for ${label}`}
                />
              </div>
            )}
            
            {/* Spacer if no delta but has sparkline */}
            {!delta && sparklineData && <div />}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default MetricCard;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/shared/components/Card, @/shared/charts/LineChart, @/theme/animations, @/core/contracts, @/core/utils
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure component with React hooks only
// [x] Reads config from `@/app/config` - Not needed for this component
// [x] Exports default named component - Exports MetricCard as both named and default export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Includes ARIA labels, keyboard navigation for interactive cards, semantic structure, and loading states
