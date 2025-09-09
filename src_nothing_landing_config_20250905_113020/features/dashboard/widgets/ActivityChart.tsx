// filepath: src/features/dashboard/widgets/ActivityChart.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart } from '@/shared/components/Chart/LineChart';
import { theme } from '@/theme';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import { debugLog } from '@/core/utils';
import type { ApiResult } from '@/core/contracts';

// Activity data types
export interface ActivityDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: 'primary' | 'secondary' | 'tertiary';
  metadata?: Record<string, any>;
}

export interface ActivityTrendData {
  points: ActivityDataPoint[];
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  timeframe: string;
  total: number;
}

export interface ActivityChartProps {
  /** Chart title */
  title?: string;
  
  /** Chart data */
  data: ActivityTrendData;
  
  /** Chart height in pixels */
  height?: number;
  
  /** Enable interactive tooltips */
  showTooltips?: boolean;
  
  /** Enable trend indicators */
  showTrend?: boolean;
  
  /** Enable animation */
  animated?: boolean;
  
  /** Time period selector options */
  periods?: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  
  /** Current selected period */
  selectedPeriod?: string;
  
  /** Period change handler */
  onPeriodChange?: (period: string) => void;
  
  /** Data point click handler */
  onDataPointClick?: (point: ActivityDataPoint) => void;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error state */
  error?: string | null;
  
  /** Custom chart colors */
  colors?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    grid?: string;
    text?: string;
  };
  
  /** Additional CSS class */
  className?: string;
  
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

// Default time period options
const DEFAULT_PERIODS = [
  { key: '7d', label: '7 Days', value: '7d' },
  { key: '30d', label: '30 Days', value: '30d' },
  { key: '90d', label: '90 Days', value: '90d' },
  { key: '1y', label: '1 Year', value: '1y' },
];

// Default chart colors using theme
const getDefaultColors = () => ({
  primary: theme.colors.primary[500],
  secondary: theme.colors.secondary[500],
  tertiary: theme.colors.accent[500],
  grid: theme.colors.gray[200],
  text: theme.colors.gray[700],
});

// Trend indicator component
interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  animated?: boolean;
}

function TrendIndicator({ trend, changePercent, animated = true }: TrendIndicatorProps) {
  const trendConfig = useMemo(() => {
    switch (trend) {
      case 'up':
        return {
          color: theme.colors.success[500],
          icon: '↗',
          bgColor: theme.colors.success[50],
          label: 'trending up',
        };
      case 'down':
        return {
          color: theme.colors.error[500],
          icon: '↘',
          bgColor: theme.colors.error[50],
          label: 'trending down',
        };
      default:
        return {
          color: theme.colors.gray[500],
          icon: '→',
          bgColor: theme.colors.gray[50],
          label: 'stable',
        };
    }
  }, [trend]);

  const MotionWrapper = animated ? motion.div : 'div';

  return (
    <MotionWrapper
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium"
      style={{
        color: trendConfig.color,
        backgroundColor: trendConfig.bgColor,
      }}
      {...(animated && {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.2, delay: 0.1 },
      })}
      aria-label={`Activity is ${trendConfig.label}, ${Math.abs(changePercent)}% change`}
    >
      <span aria-hidden="true" style={{ fontSize: '12px' }}>
        {trendConfig.icon}
      </span>
      <span>
        {Math.abs(changePercent).toFixed(1)}%
      </span>
    </MotionWrapper>
  );
}

// Period selector component
interface PeriodSelectorProps {
  periods: Array<{ key: string; label: string; value: string }>;
  selected: string;
  onChange: (period: string) => void;
  animated?: boolean;
}

function PeriodSelector({ periods, selected, onChange, animated = true }: PeriodSelectorProps) {
  const MotionWrapper = animated ? motion.div : 'div';

  return (
    <MotionWrapper
      className="flex bg-gray-100 rounded-lg p-1"
      role="tablist"
      aria-label="Time period selector"
      {...(animated && {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2 },
      })}
    >
      {periods.map((period) => {
        const isSelected = period.value === selected;
        
        return (
          <button
            key={period.key}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={`activity-chart-${period.key}`}
            className={`
              relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
              ${isSelected
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
            onClick={() => {
              onChange(period.value);
              
              // Emit analytics event
              eventBus.emit('analytics:track', {
                event: 'activity_chart_period_changed',
                properties: {
                  from_period: selected,
                  to_period: period.value,
                  component: 'ActivityChart',
                },
              });
            }}
            onKeyDown={(e) => {
              // Handle keyboard navigation
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const currentIndex = periods.findIndex(p => p.value === selected);
                const nextIndex = e.key === 'ArrowLeft' 
                  ? Math.max(0, currentIndex - 1)
                  : Math.min(periods.length - 1, currentIndex + 1);
                
                if (nextIndex !== currentIndex) {
                  onChange(periods[nextIndex].value);
                }
              }
            }}
          >
            {period.label}
          </button>
        );
      })}
    </MotionWrapper>
  );
}

// Chart header component
interface ChartHeaderProps {
  title?: string;
  data: ActivityTrendData;
  showTrend: boolean;
  periods?: Array<{ key: string; label: string; value: string }>;
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  animated?: boolean;
}

function ChartHeader({
  title,
  data,
  showTrend,
  periods,
  selectedPeriod,
  onPeriodChange,
  animated = true,
}: ChartHeaderProps) {
  const MotionWrapper = animated ? motion.div : 'div';

  return (
    <MotionWrapper
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      {...(animated && {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      })}
    >
      <div className="flex flex-col gap-2">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        )}
        
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-gray-900">
            {data.total.toLocaleString()}
          </div>
          
          {showTrend && (
            <TrendIndicator
              trend={data.trend}
              changePercent={data.changePercent}
              animated={animated}
            />
          )}
        </div>
        
        {data.timeframe && (
          <div className="text-sm text-gray-500">
            {data.timeframe}
          </div>
        )}
      </div>
      
      {periods && selectedPeriod && onPeriodChange && (
        <PeriodSelector
          periods={periods}
          selected={selectedPeriod}
          onChange={onPeriodChange}
          animated={animated}
        />
      )}
    </MotionWrapper>
  );
}

// Error state component
interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  animated?: boolean;
}

function ErrorState({ error, onRetry, animated = true }: ErrorStateProps) {
  const MotionWrapper = animated ? motion.div : 'div';

  return (
    <MotionWrapper
      className="flex flex-col items-center justify-center py-12 text-center"
      {...(animated && {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.2 },
      })}
    >
      <div className="text-error-500 text-4xl mb-4" aria-hidden="true">
        📊
      </div>
      
      <h4 className="text-lg font-medium text-gray-900 mb-2">
        Unable to load chart data
      </h4>
      
      <p className="text-gray-600 mb-4 max-w-sm">
        {error}
      </p>
      
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="
            px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors duration-200
          "
        >
          Try again
        </button>
      )}
    </MotionWrapper>
  );
}

// Loading skeleton component
function LoadingSkeleton({ height = 400, animated = true }: { height?: number; animated?: boolean }) {
  const MotionWrapper = animated ? motion.div : 'div';

  return (
    <MotionWrapper
      className="space-y-4"
      {...(animated && {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.2 },
      })}
    >
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse" />
      </div>
      
      {/* Chart skeleton */}
      <div 
        className="bg-gray-100 rounded-lg animate-pulse flex items-end justify-center gap-2 p-4"
        style={{ height: `${height}px` }}
        aria-label="Loading chart data"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-t"
            style={{
              height: `${Math.random() * 60 + 20}%`,
              width: '20px',
            }}
          />
        ))}
      </div>
    </MotionWrapper>
  );
}

/**
 * ActivityChart - A comprehensive dashboard widget for displaying activity trends
 * with interactive features, time period selection, and accessibility support.
 * 
 * Features:
 * - Interactive line chart with hover tooltips
 * - Trend indicators with percentage changes
 * - Time period selector with keyboard navigation
 * - Loading and error states with animations
 * - Full accessibility support
 * - Responsive design
 * - Analytics event tracking
 * 
 * @param props ActivityChart configuration
 */
export function ActivityChart({
  title = 'Activity Trends',
  data,
  height = 400,
  showTooltips = true,
  showTrend = true,
  animated = true,
  periods = DEFAULT_PERIODS,
  selectedPeriod = '30d',
  onPeriodChange,
  onDataPointClick,
  isLoading = false,
  error = null,
  colors,
  className = '',
  'aria-label': ariaLabel,
}: ActivityChartProps) {
  // Merge default colors with custom colors
  const chartColors = useMemo(() => ({
    ...getDefaultColors(),
    ...colors,
  }), [colors]);

  // Handle data point clicks with analytics
  const handleDataPointClick = useCallback((point: ActivityDataPoint) => {
    debugLog('ActivityChart: Data point clicked', point);
    
    // Emit analytics event
    eventBus.emit('analytics:track', {
      event: 'activity_chart_data_point_clicked',
      properties: {
        date: point.date,
        value: point.value,
        category: point.category,
        component: 'ActivityChart',
      },
    });

    // Call external handler
    onDataPointClick?.(point);
  }, [onDataPointClick]);

  // Handle retry for error state
  const handleRetry = useCallback(() => {
    debugLog('ActivityChart: Retrying data load');
    
    // Emit retry event
    eventBus.emit('dashboard:widget_retry', {
      widget: 'ActivityChart',
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Memoize chart configuration
  const chartConfig = useMemo(() => ({
    data: data.points.map(point => ({
      ...point,
      // Ensure proper date formatting
      date: new Date(point.date).toISOString(),
    })),
    colors: chartColors,
    height,
    showTooltips,
    animated,
    onDataPointClick: handleDataPointClick,
  }), [data.points, chartColors, height, showTooltips, animated, handleDataPointClick]);

  // Component classes
  const containerClasses = [
    'activity-chart',
    'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
    'transition-all duration-200',
    'hover:shadow-md',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      role="region"
      aria-label={ariaLabel || `${title} chart widget`}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LoadingSkeleton height={height} animated={animated} />
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ErrorState 
              error={error} 
              onRetry={handleRetry} 
              animated={animated} 
            />
          </motion.div>
        )}

        {!isLoading && !error && (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChartHeader
              title={title}
              data={data}
              showTrend={showTrend}
              periods={periods}
              selectedPeriod={selectedPeriod}
              onPeriodChange={onPeriodChange}
              animated={animated}
            />

            <div className="relative">
              <LineChart
                {...chartConfig}
                aria-label={`Activity data for ${data.timeframe || 'selected period'}`}
              />
              
              {/* Chart overlay for additional interactions */}
              <div 
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* Chart footer with additional info */}
            {config.isDevelopment && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700">
                    Debug Info
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify({
                      dataPoints: data.points.length,
                      trend: data.trend,
                      changePercent: data.changePercent,
                      total: data.total,
                      selectedPeriod,
                    }, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export additional types
export type { ActivityDataPoint, ActivityTrendData, ActivityChartProps };

// Development helpers
if (config.isDevelopment) {
  ActivityChart.displayName = 'ActivityChart';
  
  // Add component to global scope for debugging
  (globalThis as any).__ActivityChart = ActivityChart;
}

export default ActivityChart;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
