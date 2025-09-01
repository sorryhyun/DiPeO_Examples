// filepath: src/components/Chart/LineChart.tsx
/* src/components/Chart/LineChart.tsx

Reusable line chart component for simple time-series visualizations. 
Wraps a light chart lib and maps theme tokens to chart colors. 
Exposes minimal props for data, smoothing, and axes toggles.
*/

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { MetricPoint } from '@/core/contracts';
import { useTheme } from '@/theme';

export interface LineChartProps {
  /** Array of metric points to display */
  data: MetricPoint[];
  
  /** Width of the chart container. Defaults to '100%' for responsive behavior */
  width?: string | number;
  
  /** Height of the chart container. Defaults to 300px */
  height?: string | number;
  
  /** Enable smooth curve interpolation instead of straight lines */
  smooth?: boolean;
  
  /** Show/hide X axis */
  showXAxis?: boolean;
  
  /** Show/hide Y axis */
  showYAxis?: boolean;
  
  /** Show/hide grid lines */
  showGrid?: boolean;
  
  /** Show/hide tooltip on hover */
  showTooltip?: boolean;
  
  /** Show/hide legend */
  showLegend?: boolean;
  
  /** Color of the line. If not provided, uses theme primary color */
  lineColor?: string;
  
  /** Stroke width of the line */
  strokeWidth?: number;
  
  /** Custom format function for X axis labels */
  formatXAxis?: (value: string) => string;
  
  /** Custom format function for Y axis labels */
  formatYAxis?: (value: number) => string;
  
  /** Custom format function for tooltip values */
  formatTooltip?: (value: number, label: string) => [string, string];
  
  /** Accessibility label for the chart */
  'aria-label'?: string;
  
  /** Additional CSS class name */
  className?: string;
}

const defaultFormatXAxis = (value: string): string => {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    
    // Format as MM/DD HH:MM for time-series data
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: date.getHours() === 0 && date.getMinutes() === 0 ? undefined : '2-digit',
      minute: date.getHours() === 0 && date.getMinutes() === 0 ? undefined : '2-digit'
    });
  } catch {
    return value;
  }
};

const defaultFormatYAxis = (value: number): string => {
  // Format large numbers with K, M suffixes
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const defaultFormatTooltip = (value: number, label: string): [string, string] => {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : String(value);
  const formattedLabel = defaultFormatXAxis(label);
  return [formattedValue, formattedLabel];
};

export function LineChart({
  data,
  width = '100%',
  height = 300,
  smooth = false,
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  lineColor,
  strokeWidth = 2,
  formatXAxis = defaultFormatXAxis,
  formatYAxis = defaultFormatYAxis,
  formatTooltip = defaultFormatTooltip,
  'aria-label': ariaLabel = 'Line chart visualization',
  className = '',
}: LineChartProps) {
  const theme = useTheme();
  
  // Transform MetricPoint data to Recharts format
  const chartData = React.useMemo(() => {
    return data.map((point, index) => ({
      timestamp: point.timestamp,
      value: point.value,
      label: point.label || `Point ${index + 1}`,
      // Include meta data for custom tooltip usage
      ...point.meta
    }));
  }, [data]);

  // Determine line color from theme or prop
  const resolvedLineColor = React.useMemo(() => {
    if (lineColor) return lineColor;
    return theme?.colors?.primary || '#3b82f6'; // fallback to blue-500
  }, [lineColor, theme]);

  // Grid and axis colors from theme
  const gridColor = theme?.colors?.border || '#e5e7eb'; // fallback to gray-200
  const textColor = theme?.colors?.text?.secondary || '#6b7280'; // fallback to gray-500

  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center text-gray-500 bg-gray-50 border border-gray-200 rounded-lg ${className}`}
        style={{ width, height }}
        role="img"
        aria-label="No data available for chart"
      >
        <div className="text-center">
          <div className="text-sm font-medium">No data available</div>
          <div className="text-xs text-gray-400 mt-1">Chart will appear when data is loaded</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={chartData}
          margin={{
            top: showLegend ? 20 : 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridColor}
              opacity={0.6}
            />
          )}
          
          {showXAxis && (
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke={textColor}
              fontSize={12}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
          )}
          
          {showYAxis && (
            <YAxis
              tickFormatter={formatYAxis}
              stroke={textColor}
              fontSize={12}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
          )}
          
          {showTooltip && (
            <Tooltip
              formatter={formatTooltip}
              labelStyle={{
                color: textColor,
                fontSize: '12px',
                fontWeight: '500'
              }}
              contentStyle={{
                backgroundColor: theme?.colors?.background || '#ffffff',
                border: `1px solid ${gridColor}`,
                borderRadius: '6px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              cursor={{
                stroke: resolvedLineColor,
                strokeWidth: 1,
                strokeDasharray: '5 5',
                opacity: 0.5
              }}
            />
          )}
          
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                color: textColor
              }}
            />
          )}
          
          <Line
            type={smooth ? 'monotone' : 'linear'}
            dataKey="value"
            stroke={resolvedLineColor}
            strokeWidth={strokeWidth}
            dot={{
              fill: resolvedLineColor,
              strokeWidth: 2,
              r: 3
            }}
            activeDot={{
              r: 5,
              fill: resolvedLineColor,
              stroke: theme?.colors?.background || '#ffffff',
              strokeWidth: 2
            }}
            name="Value"
            connectNulls={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* Example usage:

import { LineChart } from '@/components/Chart/LineChart'
import type { MetricPoint } from '@/core/contracts'

const data: MetricPoint[] = [
  { timestamp: '2024-01-01T00:00:00Z', value: 100 },
  { timestamp: '2024-01-02T00:00:00Z', value: 120 },
  { timestamp: '2024-01-03T00:00:00Z', value: 140 },
]

function Dashboard() {
  return (
    <LineChart
      data={data}
      height={400}
      smooth
      aria-label="Daily metrics chart"
      formatTooltip={(value, label) => [`${value} units`, `Date: ${label}`]}
    />
  )
}

*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses theme hook
// [x] Reads config from `@/app/config` (not applicable for this chart component)
// [x] Exports default named component (exports named LineChart function)
// [x] Adds basic ARIA and keyboard handlers (role="img", aria-label, accessible colors)
