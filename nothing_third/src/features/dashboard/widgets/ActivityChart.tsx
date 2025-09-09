// filepath: src/features/dashboard/widgets/ActivityChart.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { LineChart } from '@/shared/components/Chart/LineChart';
import { theme } from '@/theme';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';

export interface ActivityDataPoint {
  timestamp: number;
  date: string;
  value: number;
  label?: string;
  category?: string;
}

export interface ActivityChartProps {
  data: ActivityDataPoint[];
  title?: string;
  height?: number;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  showTooltips?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  onDataPointClick?: (point: ActivityDataPoint) => void;
  className?: string;
  isLoading?: boolean;
  error?: string;
}

const DEFAULT_HEIGHT = 300;
const ANIMATION_DURATION = 800;

export function ActivityChart({
  data,
  title = 'Activity Trends',
  height = DEFAULT_HEIGHT,
  timeRange = 'week',
  showTooltips = true,
  showGrid = true,
  animated = !isDevelopment, // Disable animations in dev for faster iteration
  onDataPointClick,
  className,
  isLoading = false,
  error
}: ActivityChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ActivityDataPoint | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Process and format data for chart consumption
  const chartData = useMemo(() => {
    if (!data.length) return [];

    // Sort by timestamp to ensure proper line rendering
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

    return sortedData.map((point, index) => ({
      ...point,
      x: point.timestamp,
      y: point.value,
      index,
      formattedDate: formatDateForTimeRange(point.date, timeRange),
      formattedValue: formatActivityValue(point.value)
    }));
  }, [data, timeRange]);

  // Calculate chart bounds and scaling
  const chartBounds = useMemo(() => {
    if (!chartData.length) {
      return { minY: 0, maxY: 100, minX: 0, maxX: 1 };
    }

    const values = chartData.map(d => d.y);
    const timestamps = chartData.map(d => d.x);

    const minY = Math.min(...values);
    const maxY = Math.max(...values);
    const minX = Math.min(...timestamps);
    const maxX = Math.max(...timestamps);

    // Add some padding to Y range for better visualization
    const yPadding = (maxY - minY) * 0.1 || 10;

    return {
      minY: Math.max(0, minY - yPadding),
      maxY: maxY + yPadding,
      minX,
      maxX
    };
  }, [chartData]);

  // Handle chart interactions
  const handleDataPointHover = useCallback((point: ActivityDataPoint | null, index: number) => {
    setHoveredPoint(point);
    setFocusedIndex(index);

    if (point && config.isFeatureEnabled('analytics')) {
      eventBus.emit('analytics:event', {
        name: 'chart_point_hover',
        properties: {
          chartType: 'activity',
          pointValue: point.value,
          pointDate: point.date,
          timeRange
        }
      });
    }
  }, [timeRange]);

  const handleDataPointClick = useCallback((point: ActivityDataPoint) => {
    onDataPointClick?.(point);

    eventBus.emit('analytics:event', {
      name: 'chart_point_click',
      properties: {
        chartType: 'activity',
        pointValue: point.value,
        pointDate: point.date,
        timeRange
      }
    });
  }, [onDataPointClick, timeRange]);

  // Keyboard navigation for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!chartData.length) return;

    let newIndex = focusedIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = Math.max(0, focusedIndex - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = Math.min(chartData.length - 1, focusedIndex + 1);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = chartData.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && chartData[focusedIndex]) {
          handleDataPointClick(chartData[focusedIndex]);
        }
        return;
      default:
        return;
    }

    if (newIndex !== focusedIndex && chartData[newIndex]) {
      setFocusedIndex(newIndex);
      handleDataPointHover(chartData[newIndex], newIndex);
    }
  }, [chartData, focusedIndex, handleDataPointClick, handleDataPointHover]);

  // Format date based on time range
  function formatDateForTimeRange(date: string, range: string): string {
    const d = new Date(date);
    
    switch (range) {
      case 'day':
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case 'week':
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      case 'month':
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'year':
        return d.toLocaleDateString('en-US', { month: 'short' });
      default:
        return d.toLocaleDateString('en-US');
    }
  }

  // Format activity values for display
  function formatActivityValue(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  // Render loading state
  if (isLoading) {
    return (
      <div
        className={`activity-chart-container ${className || ''}`}
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-primary)'
        }}
        role="img"
        aria-label="Activity chart loading"
      >
        <div
          style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid var(--color-border-primary)',
            borderTopColor: 'var(--color-primary-main)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
          aria-hidden="true"
        />
        <span className="sr-only">Loading activity chart...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        className={`activity-chart-container ${className || ''}`}
        style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-error-main)',
          color: 'var(--color-error-main)',
          padding: '1rem'
        }}
        role="alert"
        aria-live="polite"
      >
        <div
          style={{
            fontSize: '1.5rem',
            marginBottom: '0.5rem'
          }}
          aria-hidden="true"
        >
          ⚠️
        </div>
        <div style={{ fontSize: '0.875rem', textAlign: 'center' }}>
          {error}
        </div>
      </div>
    );
  }

  // Render empty state
  if (!chartData.length) {
    return (
      <div
        className={`activity-chart-container ${className || ''}`}
        style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-primary)',
          color: 'var(--color-text-secondary)',
          padding: '1rem'
        }}
        role="img"
        aria-label="No activity data available"
      >
        <div
          style={{
            fontSize: '2rem',
            marginBottom: '0.5rem',
            opacity: 0.5
          }}
          aria-hidden="true"
        >
          📊
        </div>
        <div style={{ fontSize: '0.875rem', textAlign: 'center' }}>
          No activity data available for the selected time range.
        </div>
      </div>
    );
  }

  // Calculate trend direction for accessibility
  const trendDirection = chartData.length >= 2 
    ? chartData[chartData.length - 1].y > chartData[0].y ? 'increasing' : 'decreasing'
    : 'stable';

  return (
    <div
      className={`activity-chart-container ${className || ''}`}
      style={{
        height,
        backgroundColor: 'var(--color-background-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-primary)',
        padding: '1rem',
        position: 'relative'
      }}
      role="img"
      aria-label={`${title} showing ${trendDirection} trend over ${timeRange}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Chart Title */}
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: '1rem'
        }}
      >
        {title}
      </div>

      {/* Chart Container */}
      <div
        style={{
          height: height - 60, // Account for title and padding
          position: 'relative'
        }}
      >
        <LineChart
          data={chartData}
          width="100%"
          height={height - 60}
          showGrid={showGrid}
          animated={animated}
          animationDuration={ANIMATION_DURATION}
          lineColor="var(--color-primary-main)"
          lineWidth={2}
          pointRadius={4}
          pointColor="var(--color-primary-main)"
          pointHoverRadius={6}
          gridColor="var(--color-border-secondary)"
          onPointHover={handleDataPointHover}
          onPointClick={handleDataPointClick}
          bounds={chartBounds}
          aria-label={`Interactive line chart with ${chartData.length} data points`}
        />

        {/* Interactive Tooltip */}
        {showTooltips && hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: 'var(--color-background-tertiary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-primary)',
              boxShadow: 'var(--shadow-md)',
              minWidth: '120px',
              zIndex: 10
            }}
            role="tooltip"
            aria-live="polite"
          >
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
              {hoveredPoint.formattedDate}
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              Activity: {hoveredPoint.formattedValue}
            </div>
            {hoveredPoint.label && (
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {hoveredPoint.label}
              </div>
            )}
          </div>
        )}

        {/* Accessibility Info */}
        <div className="sr-only" aria-live="polite">
          {focusedIndex >= 0 && chartData[focusedIndex] && (
            `Data point ${focusedIndex + 1} of ${chartData.length}: ${chartData[focusedIndex].formattedDate}, value ${chartData[focusedIndex].formattedValue}`
          )}
        </div>
      </div>

      {/* Chart Summary for Screen Readers */}
      <div className="sr-only">
        Chart summary: {chartData.length} data points showing activity from{' '}
        {chartData[0]?.formattedDate} to {chartData[chartData.length - 1]?.formattedDate}.{' '}
        Trend is {trendDirection}. Use arrow keys to navigate data points, Enter or Space to select.
      </div>
    </div>
  );
}

// Export additional types for external use
export type { ActivityDataPoint };

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/shared/components/Chart/LineChart, @/theme, @/app/config, @/core/events)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses React hooks and event bus
- [x] Reads config from `@/app/config` (uses config.isFeatureEnabled and isDevelopment)
- [x] Exports default named component (exports ActivityChart function)
- [x] Adds basic ARIA and keyboard handlers (role="img", aria-label, keyboard navigation, screen reader support)
*/
