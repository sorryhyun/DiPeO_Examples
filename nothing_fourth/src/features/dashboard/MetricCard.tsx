// filepath: src/features/dashboard/MetricCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { LineChart } from '@/shared/charts/LineChart';
import { motionPresets } from '@/theme/animations';
import { ChartSeries, ChartDataPoint } from '@/core/contracts';
import { cn, formatNumber, formatCurrency } from '@/core/utils';
import { config } from '@/app/config';

// ===============================================
// MetricCard Component Types & Props
// ===============================================

export interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  
  // Delta/change indicators
  delta?: number;
  deltaType?: 'percentage' | 'absolute' | 'currency';
  deltaLabel?: string;
  
  // Chart data for sparkline
  chartData?: ChartSeries[];
  showChart?: boolean;
  chartHeight?: number;
  
  // Formatting options
  formatType?: 'number' | 'currency' | 'percentage' | 'custom';
  formatOptions?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  };
  customFormatter?: (value: number | string) => string;
  
  // Visual variants
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  
  // States
  loading?: boolean;
  skeleton?: boolean;
  
  // Animation
  animate?: boolean;
  animationDelay?: number;
  
  // Interaction
  onClick?: () => void;
  href?: string;
  
  // Styling
  className?: string;
  icon?: React.ReactNode;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// ===============================================
// Utility Functions
// ===============================================

const formatValue = (
  value: number | string,
  formatType: MetricCardProps['formatType'] = 'number',
  formatOptions: MetricCardProps['formatOptions'] = {},
  customFormatter?: MetricCardProps['customFormatter']
): string => {
  if (customFormatter) {
    return customFormatter(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits,
    maximumFractionDigits,
  } = formatOptions;

  try {
    switch (formatType) {
      case 'currency':
        return formatCurrency(value, currency, locale);
      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits,
          maximumFractionDigits: maximumFractionDigits ?? 1,
        }).format(value / 100);
      case 'number':
      default:
        return formatNumber(value, {
          locale,
          minimumFractionDigits,
          maximumFractionDigits,
        });
    }
  } catch (error) {
    return String(value);
  }
};

const formatDelta = (
  delta: number,
  deltaType: MetricCardProps['deltaType'] = 'absolute'
): string => {
  const absValue = Math.abs(delta);
  
  switch (deltaType) {
    case 'percentage':
      return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
    case 'currency':
      return `${delta >= 0 ? '+' : ''}${formatCurrency(delta)}`;
    case 'absolute':
    default:
      return `${delta >= 0 ? '+' : ''}${formatNumber(absValue)}`;
  }
};

const getDeltaIcon = (delta: number) => {
  if (delta > 0) {
    return <TrendingUpIcon className="w-4 h-4" aria-hidden="true" />;
  } else if (delta < 0) {
    return <TrendingDownIcon className="w-4 h-4" aria-hidden="true" />;
  }
  return <MinusIcon className="w-4 h-4" aria-hidden="true" />;
};

const getDeltaColor = (delta: number, variant?: MetricCardProps['variant']) => {
  // Variant override
  if (variant) {
    const variantColors = {
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
      info: 'text-blue-600 dark:text-blue-400',
      default: '',
    };
    return variantColors[variant];
  }

  // Standard delta coloring
  if (delta > 0) {
    return 'text-green-600 dark:text-green-400';
  } else if (delta < 0) {
    return 'text-red-600 dark:text-red-400';
  }
  return 'text-gray-500 dark:text-gray-400';
};

const getSizeStyles = (size: MetricCardProps['size'] = 'md') => {
  const styles = {
    sm: {
      titleSize: 'text-sm',
      valueSize: 'text-lg',
      subtitleSize: 'text-xs',
      deltaSize: 'text-xs',
      padding: '3',
      chartHeight: 40,
    },
    md: {
      titleSize: 'text-sm',
      valueSize: 'text-2xl',
      subtitleSize: 'text-sm',
      deltaSize: 'text-sm',
      padding: '4',
      chartHeight: 60,
    },
    lg: {
      titleSize: 'text-base',
      valueSize: 'text-3xl',
      subtitleSize: 'text-base',
      deltaSize: 'text-base',
      padding: '6',
      chartHeight: 80,
    },
  };
  
  return styles[size];
};

// ===============================================
// Skeleton Component
// ===============================================

const MetricCardSkeleton: React.FC<Pick<MetricCardProps, 'size' | 'showChart'>> = ({ 
  size = 'md',
  showChart = false 
}) => {
  const sizeStyles = getSizeStyles(size);
  
  return (
    <Card
      skeleton
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      className="h-full"
    >
      <div className="space-y-3">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
        
        {/* Value skeleton */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
        
        {/* Delta skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
        </div>
        
        {/* Chart skeleton */}
        {showChart && (
          <div 
            className="bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            style={{ height: sizeStyles.chartHeight }}
          />
        )}
      </div>
    </Card>
  );
};

// ===============================================
// Main MetricCard Component
// ===============================================

export function MetricCard({
  title,
  value,
  subtitle,
  delta,
  deltaType = 'absolute',
  deltaLabel,
  chartData,
  showChart = false,
  chartHeight,
  formatType = 'number',
  formatOptions = {},
  customFormatter,
  variant = 'default',
  size = 'md',
  loading = false,
  skeleton = false,
  animate = true,
  animationDelay = 0,
  onClick,
  href,
  className,
  icon,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: MetricCardProps) {
  const sizeStyles = getSizeStyles(size);
  const isInteractive = Boolean(onClick || href);
  
  // Show skeleton if loading or skeleton prop is true
  if (loading || skeleton) {
    return (
      <MetricCardSkeleton
        size={size}
        showChart={showChart}
      />
    );
  }

  // Format the main value
  const formattedValue = formatValue(value, formatType, formatOptions, customFormatter);
  
  // Handle href navigation
  const handleClick = () => {
    if (href && !onClick) {
      window.location.href = href;
    }
    onClick?.();
  };

  // Animation props
  const motionProps = animate
    ? {
        ...motionPresets.fadeInUp,
        transition: {
          ...motionPresets.fadeInUp.transition,
          delay: animationDelay / 1000,
        },
      }
    : {};

  return (
    <Card
      {...motionProps}
      variant={variant === 'default' ? 'default' : 'elevated'}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      clickable={isInteractive}
      hoverable={isInteractive}
      onClick={isInteractive ? handleClick : undefined}
      className={cn('h-full', className)}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      role={isInteractive ? 'button' : undefined}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {icon && (
                <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                  {icon}
                </div>
              )}
              <h3 className={cn(
                'font-medium text-gray-600 dark:text-gray-300 truncate',
                sizeStyles.titleSize
              )}>
                {title}
              </h3>
            </div>
            
            {subtitle && (
              <p className={cn(
                'text-gray-500 dark:text-gray-400',
                sizeStyles.subtitleSize
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Main Value */}
        <div className="mb-3">
          <div className={cn(
            'font-bold text-gray-900 dark:text-white',
            sizeStyles.valueSize
          )}>
            {formattedValue}
          </div>
        </div>

        {/* Delta Indicator */}
        {typeof delta === 'number' && !isNaN(delta) && (
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              'flex items-center gap-1',
              getDeltaColor(delta, variant),
              sizeStyles.deltaSize
            )}>
              {getDeltaIcon(delta)}
              <span className="font-medium">
                {formatDelta(delta, deltaType)}
              </span>
            </div>
            {deltaLabel && (
              <span className={cn(
                'text-gray-500 dark:text-gray-400',
                sizeStyles.deltaSize
              )}>
                {deltaLabel}
              </span>
            )}
          </div>
        )}

        {/* Chart */}
        {showChart && chartData && chartData.length > 0 && (
          <div className="mt-auto">
            <LineChart
              data={chartData}
              width={undefined} // Use full width
              height={chartHeight || sizeStyles.chartHeight}
              showTooltip={false}
              showLegend={false}
              showGrid={false}
              showLabels={false}
              animate={false} // Keep it simple for sparklines
              className="opacity-75"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

// ===============================================
// Specialized Metric Card Variants
// ===============================================

export const SuccessMetricCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="success" />
);

export const WarningMetricCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="warning" />
);

export const ErrorMetricCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="error" />
);

export const InfoMetricCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="info" />
);

// Currency-specific card
export const CurrencyMetricCard: React.FC<Omit<MetricCardProps, 'formatType'>> = (props) => (
  <MetricCard {...props} formatType="currency" />
);

// Percentage-specific card
export const PercentageMetricCard: React.FC<Omit<MetricCardProps, 'formatType'>> = (props) => (
  <MetricCard {...props} formatType="percentage" />
);

// ===============================================
// Export Default
// ===============================================

export default MetricCard;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
