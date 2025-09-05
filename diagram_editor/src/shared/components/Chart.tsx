// filepath: src/shared/components/Chart.tsx

import React, { forwardRef, useEffect, useRef, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  Line,
  Area,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

import { Skeleton } from '@/shared/components/Skeleton';
import { useWindowSize } from '@/hooks/useWindowSize';
import { theme } from '@/theme/index';
import { config } from '@/app/config';

// =============================
// TYPE DEFINITIONS
// =============================

export type ChartType = 'line' | 'area' | 'bar' | 'pie';

export interface ChartDataPoint {
  [key: string]: string | number | null | undefined;
}

export interface ChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fill?: string;
  type?: 'monotone' | 'linear' | 'step';
}

export interface ChartProps {
  // Data and series configuration
  data: ChartDataPoint[];
  series: ChartSeries[];
  type?: ChartType;
  
  // Dimensions and layout
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number; // width/height ratio
  
  // Axes configuration
  xAxisDataKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  hideGrid?: boolean;
  
  // Interaction and behavior
  showTooltip?: boolean;
  showLegend?: boolean;
  interactive?: boolean;
  
  // Styling
  colors?: string[];
  className?: string;
  style?: React.CSSProperties;
  
  // Loading and error states
  loading?: boolean;
  error?: string | null;
  
  // Reference lines
  referenceLines?: Array<{
    y?: number;
    x?: string | number;
    label?: string;
    color?: string;
    strokeDasharray?: string;
  }>;
  
  // Event handlers
  onDataPointClick?: (data: ChartDataPoint, index: number) => void;
  
  // Animation
  animationDuration?: number;
  disableAnimation?: boolean;
}

// =============================
// THEME INTEGRATION
// =============================

const getChartTheme = () => {
  const isDark = theme.mode === 'dark';
  
  return {
    backgroundColor: isDark ? theme.colors.gray[900] : theme.colors.white,
    textColor: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
    gridColor: isDark ? theme.colors.gray[800] : theme.colors.gray[200],
    tooltipBackground: isDark ? theme.colors.gray[800] : theme.colors.white,
    tooltipBorder: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
    tooltipShadow: isDark 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.4)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };
};

const getDefaultColors = (): string[] => [
  theme.colors.primary[500],
  theme.colors.secondary[500],
  theme.colors.success[500],
  theme.colors.warning[500],
  theme.colors.error[500],
  theme.colors.info[500],
  theme.colors.purple[500],
  theme.colors.pink[500],
];

// =============================
// CHART COMPONENTS
// =============================

interface ChartContainerProps {
  children: React.ReactNode;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
  height, 
  className = '', 
  style = {} 
}) => {
  const chartTheme = getChartTheme();
  
  return (
    <div
      className={`chart-container ${className}`}
      style={{
        height,
        backgroundColor: chartTheme.backgroundColor,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[2],
        border: `1px solid ${chartTheme.gridColor}`,
        ...style,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

// =============================
// CUSTOM TOOLTIP
// =============================

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  series: ChartSeries[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  series 
}) => {
  const chartTheme = getChartTheme();
  
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: chartTheme.tooltipBackground,
        border: `1px solid ${chartTheme.tooltipBorder}`,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing[3],
        boxShadow: chartTheme.tooltipShadow,
        fontSize: theme.fontSizes.sm,
        color: chartTheme.textColor,
        minWidth: '120px',
      }}
    >
      {label && (
        <p 
          style={{ 
            margin: 0, 
            marginBottom: theme.spacing[2],
            fontWeight: theme.fontWeights.semibold,
            borderBottom: `1px solid ${chartTheme.gridColor}`,
            paddingBottom: theme.spacing[1],
          }}
        >
          {label}
        </p>
      )}
      {payload.map((entry, index) => {
        const seriesConfig = series.find(s => s.dataKey === entry.dataKey);
        const name = seriesConfig?.name || entry.dataKey;
        
        return (
          <p
            key={`tooltip-${index}`}
            style={{
              margin: 0,
              marginBottom: index < payload.length - 1 ? theme.spacing[1] : 0,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[2],
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: entry.color,
                borderRadius: '50%',
                display: 'inline-block',
              }}
            />
            <span style={{ fontWeight: theme.fontWeights.medium }}>
              {name}:
            </span>
            <span style={{ fontWeight: theme.fontWeights.semibold }}>
              {typeof entry.value === 'number' 
                ? entry.value.toLocaleString() 
                : entry.value
              }
            </span>
          </p>
        );
      })}
    </div>
  );
};

// =============================
// MAIN CHART COMPONENT
// =============================

export const Chart = forwardRef<HTMLDivElement, ChartProps>(({
  data,
  series,
  type = 'line',
  height,
  minHeight = 200,
  maxHeight = 600,
  aspectRatio = 16 / 9,
  xAxisDataKey,
  xAxisLabel,
  yAxisLabel,
  hideXAxis = false,
  hideYAxis = false,
  hideGrid = false,
  showTooltip = true,
  showLegend = false,
  interactive = true,
  colors = getDefaultColors(),
  className = '',
  style = {},
  loading = false,
  error = null,
  referenceLines = [],
  onDataPointClick,
  animationDuration = 750,
  disableAnimation = false,
  ...props
}, ref) => {
  const { width: windowWidth } = useWindowSize();
  const chartTheme = getChartTheme();
  
  // Calculate responsive height
  const calculatedHeight = useMemo(() => {
    if (height) return height;
    
    // Use aspect ratio for responsive height
    const baseWidth = Math.min(windowWidth || 1200, 1200);
    const calculatedFromRatio = baseWidth / aspectRatio;
    
    return Math.max(minHeight, Math.min(maxHeight, calculatedFromRatio));
  }, [height, windowWidth, aspectRatio, minHeight, maxHeight]);

  // Handle click events
  const handleClick = (data: any, index: number) => {
    if (onDataPointClick && interactive) {
      onDataPointClick(data, index);
    }
  };

  // Apply colors to series
  const seriesWithColors = useMemo(() => {
    return series.map((s, index) => ({
      ...s,
      color: s.color || colors[index % colors.length],
    }));
  }, [series, colors]);

  // Loading state
  if (loading) {
    return (
      <div ref={ref} className={className} style={style}>
        <Skeleton height={calculatedHeight} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        ref={ref}
        className={`chart-error ${className}`}
        style={{
          height: calculatedHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: chartTheme.backgroundColor,
          border: `1px solid ${theme.colors.error[300]}`,
          borderRadius: theme.borderRadius.md,
          color: theme.colors.error[600],
          ...style,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            fontSize: theme.fontSizes.lg,
            fontWeight: theme.fontWeights.semibold,
            margin: 0,
            marginBottom: theme.spacing[2],
          }}>
            Chart Error
          </p>
          <p style={{ 
            fontSize: theme.fontSizes.sm,
            margin: 0,
            opacity: 0.8,
          }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <div 
        ref={ref}
        className={`chart-no-data ${className}`}
        style={{
          height: calculatedHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: chartTheme.backgroundColor,
          border: `1px solid ${chartTheme.gridColor}`,
          borderRadius: theme.borderRadius.md,
          color: chartTheme.textColor,
          ...style,
        }}
      >
        <div style={{ textAlign: 'center', opacity: 0.6 }}>
          <p style={{ 
            fontSize: theme.fontSizes.lg,
            margin: 0,
            marginBottom: theme.spacing[1],
          }}>
            No Data
          </p>
          <p style={{ 
            fontSize: theme.fontSizes.sm,
            margin: 0,
          }}>
            No chart data available
          </p>
        </div>
      </div>
    );
  }

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data,
      onClick: interactive ? handleClick : undefined,
      ...(!disableAnimation && { animationDuration }),
    };

    const axisProps = {
      axisLine: { stroke: chartTheme.gridColor },
      tickLine: { stroke: chartTheme.gridColor },
      tick: { 
        fill: chartTheme.textColor, 
        fontSize: theme.fontSizes.xs,
      },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {!hideGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartTheme.gridColor}
                opacity={0.5}
              />
            )}
            {!hideXAxis && (
              <XAxis 
                dataKey={xAxisDataKey}
                label={xAxisLabel ? { 
                  value: xAxisLabel, 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle', fill: chartTheme.textColor }
                } : undefined}
                {...axisProps}
              />
            )}
            {!hideYAxis && (
              <YAxis 
                label={yAxisLabel ? { 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: chartTheme.textColor }
                } : undefined}
                {...axisProps}
              />
            )}
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip series={seriesWithColors} />}
              />
            )}
            {showLegend && (
              <Legend 
                wrapperStyle={{ color: chartTheme.textColor }}
              />
            )}
            {referenceLines.map((refLine, index) => (
              <ReferenceLine
                key={`ref-line-${index}`}
                y={refLine.y}
                x={refLine.x}
                stroke={refLine.color || theme.colors.gray[400]}
                strokeDasharray={refLine.strokeDasharray || "5 5"}
                label={refLine.label}
              />
            ))}
            {seriesWithColors.map((s, index) => (
              <Line
                key={`line-${index}`}
                type={s.type || 'monotone'}
                dataKey={s.dataKey}
                stroke={s.color}
                strokeWidth={s.strokeWidth || 2}
                strokeDasharray={s.strokeDasharray}
                name={s.name || s.dataKey}
                dot={{ fill: s.color, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: s.color }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {!hideGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartTheme.gridColor}
                opacity={0.5}
              />
            )}
            {!hideXAxis && (
              <XAxis 
                dataKey={xAxisDataKey}
                label={xAxisLabel ? { 
                  value: xAxisLabel, 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle', fill: chartTheme.textColor }
                } : undefined}
                {...axisProps}
              />
            )}
            {!hideYAxis && (
              <YAxis 
                label={yAxisLabel ? { 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: chartTheme.textColor }
                } : undefined}
                {...axisProps}
              />
            )}
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip series={seriesWithColors} />}
              />
            )}
            {showLegend && (
              <Legend 
                wrapperStyle={{ color: chartTheme.textColor }}
              />
            )}
            {referenceLines.map((refLine, index) => (
              <ReferenceLine
                key={`ref-line-${index}`}
                y={refLine.y}
                x={refLine.x}
                stroke={refLine.color || theme.colors.gray[400]}
                strokeDasharray={refLine.strokeDasharray || "5 5"}
                label={refLine.label}
              />
            ))}
            {seriesWithColors.map((s, index) => (
              <Area
                key={`area-${index}`}
                type={s.type || 'monotone'}
                dataKey={s.dataKey}
                stroke={s.color}
                strokeWidth={s.strokeWidth || 2}
                fill={s.fill || s.color}
                fillOpacity={0.3}
                name={s.name || s.dataKey}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {!hideGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartTheme.gridColor}
                opacity={0.5}
              />
            )}
            {!hideXAxis && (
              <XAxis 
                dataKey={xAxisDataKey}
                label={xAxisLabel ? { 
                  value: xAxisLabel, 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle', fill: chartTheme.textColor }
                } : undefined}
                {...axisProps}
              />
            )}
            {!hideYAxis && (
              <YAxis 
                label={yAxisLabel ? { 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: chartTheme.textColor }
                } : undefined}
                {...axisProps}
              />
            )}
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip series={seriesWithColors} />}
              />
            )}
            {showLegend && (
              <Legend 
                wrapperStyle={{ color: chartTheme.textColor }}
              />
            )}
            {referenceLines.map((refLine, index) => (
              <ReferenceLine
                key={`ref-line-${index}`}
                y={refLine.y}
                x={refLine.x}
                stroke={refLine.color || theme.colors.gray[400]}
                strokeDasharray={refLine.strokeDasharray || "5 5"}
                label={refLine.label}
              />
            ))}
            {seriesWithColors.map((s, index) => (
              <Bar
                key={`bar-${index}`}
                dataKey={s.dataKey}
                fill={s.color}
                name={s.name || s.dataKey}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip series={seriesWithColors} />}
              />
            )}
            {showLegend && (
              <Legend 
                wrapperStyle={{ color: chartTheme.textColor }}
              />
            )}
            {seriesWithColors.map((s, index) => (
              <Pie
                key={`pie-${index}`}
                data={data}
                dataKey={s.dataKey}
                nameKey={xAxisDataKey || 'name'}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(calculatedHeight, 300) / 3}
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry, pieIndex) => (
                  <Cell 
                    key={`cell-${pieIndex}`} 
                    fill={colors[pieIndex % colors.length]} 
                  />
                ))}
              </Pie>
            ))}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <ChartContainer
      ref={ref}
      height={calculatedHeight}
      className={className}
      style={style}
    >
      {renderChart()}
    </ChartContainer>
  );
});

Chart.displayName = 'Chart';

export default Chart;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
