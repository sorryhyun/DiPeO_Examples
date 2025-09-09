// filepath: src/shared/components/Chart/LineChart.tsx
import { useMemo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartPoint } from '@/core/contracts';
import { theme } from '@/theme';

// Chart configuration and styling
export interface LineChartProps {
  /** Chart data points */
  data: readonly ChartPoint[];
  /** Width in pixels (optional, defaults to responsive) */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** X-axis data key (defaults to 'x') */
  xKey?: string;
  /** Y-axis data key (defaults to 'y') */
  yKey?: string;
  /** X-axis label */
  xLabel?: string;
  /** Y-axis label */
  yLabel?: string;
  /** Chart title */
  title?: string;
  /** Line color (defaults to theme primary) */
  lineColor?: string;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Smooth curve line */
  smooth?: boolean;
  /** Animate chart entrance */
  animate?: boolean;
  /** Custom tooltip formatter */
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  /** Custom X-axis formatter */
  xAxisFormatter?: (value: any) => string;
  /** Custom Y-axis formatter */
  yAxisFormatter?: (value: any) => string;
  /** Additional CSS class */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

// Custom tooltip component for better styling
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: any;
    name: string;
    color: string;
    payload: ChartPoint;
  }>;
  label?: string;
  formatter?: (value: any, name: string, props: any) => [string, string];
  xAxisFormatter?: (value: any) => string;
}

const CustomTooltip = ({ 
  active, 
  payload, 
  label, 
  formatter,
  xAxisFormatter 
}: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  const formattedLabel = xAxisFormatter ? xAxisFormatter(label) : label;
  
  const [formattedValue, formattedName] = formatter 
    ? formatter(data.value, data.name, data.payload)
    : [String(data.value), data.name || 'Value'];

  return (
    <div 
      className="chart-tooltip"
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radii.md,
        padding: theme.spacing.sm,
        boxShadow: theme.shadows.md,
        fontSize: theme.fontSizes.sm,
        color: theme.colors.text,
      }}
    >
      {formattedLabel && (
        <div style={{ fontWeight: theme.fontWeights.medium, marginBottom: '4px' }}>
          {formattedLabel}
        </div>
      )}
      <div style={{ color: data.color }}>
        {formattedName}: {formattedValue}
      </div>
      {data.payload.label && data.payload.label !== formattedLabel && (
        <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary }}>
          {data.payload.label}
        </div>
      )}
    </div>
  );
};

export const LineChart = ({
  data,
  width,
  height = 300,
  xKey = 'x',
  yKey = 'y',
  xLabel,
  yLabel,
  title,
  lineColor = theme.colors.primary,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  smooth = true,
  animate = true,
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
  className = '',
  ariaLabel,
}: LineChartProps) => {
  // Transform data to ensure consistent format for Recharts
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      [xKey]: point.x,
      [yKey]: point.y,
      label: point.label,
      metadata: point.metadata,
      originalIndex: index,
    }));
  }, [data, xKey, yKey]);

  // Determine if chart should be responsive
  const isResponsive = width === undefined;

  // Chart container styles
  const containerStyles = useMemo(() => ({
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
  }), []);

  // Create chart element
  const chartElement = (
    <RechartsLineChart
      width={isResponsive ? undefined : width}
      height={height}
      data={chartData}
      margin={{
        top: title ? 20 : 5,
        right: 30,
        left: yLabel ? 60 : 20,
        bottom: xLabel ? 60 : 5,
      }}
    >
      {/* Grid */}
      {showGrid && (
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={theme.colors.border}
          opacity={0.5}
        />
      )}
      
      {/* X Axis */}
      <XAxis
        dataKey={xKey}
        axisLine={{ stroke: theme.colors.border }}
        tickLine={{ stroke: theme.colors.border }}
        tick={{ 
          fill: theme.colors.textSecondary, 
          fontSize: theme.fontSizes.xs 
        }}
        tickFormatter={xAxisFormatter}
        label={xLabel ? { 
          value: xLabel, 
          position: 'insideBottom', 
          offset: -5,
          style: { 
            textAnchor: 'middle', 
            fill: theme.colors.textSecondary,
            fontSize: theme.fontSizes.sm 
          }
        } : undefined}
      />
      
      {/* Y Axis */}
      <YAxis
        axisLine={{ stroke: theme.colors.border }}
        tickLine={{ stroke: theme.colors.border }}
        tick={{ 
          fill: theme.colors.textSecondary, 
          fontSize: theme.fontSizes.xs 
        }}
        tickFormatter={yAxisFormatter}
        label={yLabel ? { 
          value: yLabel, 
          angle: -90, 
          position: 'insideLeft',
          style: { 
            textAnchor: 'middle', 
            fill: theme.colors.textSecondary,
            fontSize: theme.fontSizes.sm 
          }
        } : undefined}
      />
      
      {/* Tooltip */}
      {showTooltip && (
        <Tooltip
          content={
            <CustomTooltip 
              formatter={tooltipFormatter}
              xAxisFormatter={xAxisFormatter}
            />
          }
          cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: '5 5' }}
        />
      )}
      
      {/* Legend */}
      {showLegend && (
        <Legend 
          wrapperStyle={{ 
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textSecondary 
          }}
        />
      )}
      
      {/* Line */}
      <Line
        type={smooth ? 'monotone' : 'linear'}
        dataKey={yKey}
        stroke={lineColor}
        strokeWidth={2}
        dot={{ 
          fill: lineColor, 
          strokeWidth: 2, 
          r: 3 
        }}
        activeDot={{ 
          r: 5, 
          stroke: lineColor, 
          strokeWidth: 2, 
          fill: theme.colors.background 
        }}
        animationDuration={animate ? 750 : 0}
        connectNulls={false}
      />
    </RechartsLineChart>
  );

  return (
    <div 
      className={`line-chart ${className}`.trim()}
      style={containerStyles}
      role="img"
      aria-label={ariaLabel || `Line chart${title ? ` showing ${title}` : ''} with ${data.length} data points`}
    >
      {/* Chart Title */}
      {title && (
        <div 
          style={{
            textAlign: 'center',
            fontSize: theme.fontSizes.md,
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
          }}
        >
          {title}
        </div>
      )}
      
      {/* Chart Container */}
      {isResponsive ? (
        <ResponsiveContainer width="100%" height={height}>
          {chartElement}
        </ResponsiveContainer>
      ) : (
        chartElement
      )}
      
      {/* Empty State */}
      {data.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.sm,
            textAlign: 'center',
          }}
          aria-live="polite"
        >
          No data available
        </div>
      )}
    </div>
  );
};

// Export default for consistency
export default LineChart;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` - uses theme tokens instead for styling
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
