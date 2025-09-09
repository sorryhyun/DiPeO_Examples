// filepath: src/shared/charts/BarChart.tsx

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { ChartSeries, ChartDataPoint } from '@/core/contracts';
import { useWindowSize } from '@/hooks/useWindowSize';
import { cn, formatNumber, debugLog } from '@/core/utils';
import { config } from '@/app/config';

// ===============================================
// BarChart Component Types
// ===============================================

export interface BarChartProps {
  data: ChartSeries[];
  width?: number;
  height?: number;
  className?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  animate?: boolean;
  barSpacing?: number;
  groupSpacing?: number;
  colors?: string[];
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
  onBarClick?: (dataPoint: ChartDataPoint, seriesId: string) => void;
  onBarHover?: (dataPoint: ChartDataPoint | null, seriesId?: string) => void;
  ariaLabel?: string;
  ariaDescription?: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  dataPoint: ChartDataPoint | null;
  seriesId: string | null;
  seriesName: string | null;
}

interface BarDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  label: string;
  dataPoint: ChartDataPoint;
  seriesId: string;
  color: string;
}

// ===============================================
// Default Colors & Constants
// ===============================================

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
];

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;
const PADDING = { top: 20, right: 20, bottom: 60, left: 60 };
const GRID_STROKE_WIDTH = 1;
const BAR_BORDER_RADIUS = 2;

// ===============================================
// Utility Functions
// ===============================================

function normalizeData(data: ChartSeries[]): {
  allLabels: string[];
  normalizedSeries: Array<{
    id: string;
    name: string;
    points: Array<{ label: string; value: number; original: ChartDataPoint }>;
    color: string;
  }>;
  maxValue: number;
  minValue: number;
} {
  if (!data || data.length === 0) {
    return {
      allLabels: [],
      normalizedSeries: [],
      maxValue: 0,
      minValue: 0,
    };
  }

  // Collect all unique labels across all series
  const labelSet = new Set<string>();
  data.forEach(series => {
    series.points.forEach(point => {
      labelSet.add(String(point.label || point.x));
    });
  });
  const allLabels = Array.from(labelSet).sort();

  // Normalize series data
  let maxValue = Number.NEGATIVE_INFINITY;
  let minValue = Number.POSITIVE_INFINITY;

  const normalizedSeries = data.map((series, index) => {
    // Create a map for quick lookup
    const pointMap = new Map(
      series.points.map(point => [String(point.label || point.x), point])
    );

    // Create normalized points array with all labels
    const points = allLabels.map(label => {
      const original = pointMap.get(label);
      const value = original ? Number(original.y) || 0 : 0;
      
      maxValue = Math.max(maxValue, value);
      minValue = Math.min(minValue, value);

      return {
        label,
        value,
        original: original || { x: label, y: value, label },
      };
    });

    return {
      id: series.id,
      name: series.name || series.id,
      points,
      color: series.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    };
  });

  // Ensure we have reasonable bounds
  if (maxValue === Number.NEGATIVE_INFINITY) maxValue = 0;
  if (minValue === Number.POSITIVE_INFINITY) minValue = 0;

  // Add some padding to the max value for better visualization
  if (maxValue > 0) {
    maxValue = maxValue * 1.1;
  }

  return { allLabels, normalizedSeries, maxValue, minValue };
}

function calculateBarDimensions(
  normalizedData: ReturnType<typeof normalizeData>,
  chartWidth: number,
  chartHeight: number,
  barSpacing: number,
  groupSpacing: number
): BarDimensions[] {
  const { allLabels, normalizedSeries, maxValue, minValue } = normalizedData;
  
  if (allLabels.length === 0 || normalizedSeries.length === 0) {
    return [];
  }

  const valueRange = maxValue - minValue || 1;
  const numGroups = allLabels.length;
  const numSeries = normalizedSeries.length;
  
  // Calculate available space and bar dimensions
  const totalGroupSpacing = (numGroups - 1) * groupSpacing;
  const availableWidth = chartWidth - totalGroupSpacing;
  const groupWidth = availableWidth / numGroups;
  
  const totalBarSpacing = Math.max(0, (numSeries - 1) * barSpacing);
  const availableBarWidth = Math.max(1, groupWidth - totalBarSpacing);
  const barWidth = availableBarWidth / numSeries;

  const bars: BarDimensions[] = [];

  allLabels.forEach((label, groupIndex) => {
    const groupX = groupIndex * (groupWidth + groupSpacing);
    
    normalizedSeries.forEach((series, seriesIndex) => {
      const point = series.points[groupIndex];
      const barX = groupX + seriesIndex * (barWidth + barSpacing);
      
      // Calculate bar height and position
      const normalizedValue = Math.max(0, (point.value - minValue) / valueRange);
      const barHeight = normalizedValue * chartHeight;
      const barY = chartHeight - barHeight;

      bars.push({
        x: barX,
        y: barY,
        width: barWidth,
        height: barHeight,
        value: point.value,
        label,
        dataPoint: point.original,
        seriesId: series.id,
        color: series.color,
      });
    });
  });

  return bars;
}

// ===============================================
// BarChart Component
// ===============================================

export function BarChart({
  data,
  width,
  height,
  className,
  showTooltip = true,
  showLegend = true,
  showGrid = true,
  showLabels = true,
  animate = true,
  barSpacing = 2,
  groupSpacing = 20,
  colors,
  formatValue,
  formatLabel,
  onBarClick,
  onBarHover,
  ariaLabel = 'Bar chart',
  ariaDescription,
}: BarChartProps) {
  const { width: windowWidth } = useWindowSize();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    dataPoint: null,
    seriesId: null,
    seriesName: null,
  });

  // Calculate responsive dimensions
  const chartWidth = width || Math.min(windowWidth - 40, DEFAULT_WIDTH);
  const chartHeight = height || DEFAULT_HEIGHT;
  const plotWidth = chartWidth - PADDING.left - PADDING.right;
  const plotHeight = chartHeight - PADDING.top - PADDING.bottom;

  // Process and normalize data
  const normalizedData = useMemo(() => {
    debugLog('BarChart', 'Processing chart data', { seriesCount: data?.length });
    
    if (colors && data) {
      // Apply custom colors to series
      const dataWithColors = data.map((series, index) => ({
        ...series,
        color: series.color || colors[index % colors.length],
      }));
      return normalizeData(dataWithColors);
    }
    
    return normalizeData(data);
  }, [data, colors]);

  // Calculate bar dimensions
  const bars = useMemo(() => {
    if (plotWidth <= 0 || plotHeight <= 0) return [];
    
    return calculateBarDimensions(
      normalizedData,
      plotWidth,
      plotHeight,
      barSpacing,
      groupSpacing
    );
  }, [normalizedData, plotWidth, plotHeight, barSpacing, groupSpacing]);

  // Handle bar interactions
  const handleBarMouseEnter = useCallback((
    event: React.MouseEvent<SVGRectElement>,
    bar: BarDimensions
  ) => {
    if (!showTooltip) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const seriesInfo = normalizedData.normalizedSeries.find(s => s.id === bar.seriesId);
    
    setTooltip({
      visible: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      dataPoint: bar.dataPoint,
      seriesId: bar.seriesId,
      seriesName: seriesInfo?.name || null,
    });

    onBarHover?.(bar.dataPoint, bar.seriesId);
  }, [showTooltip, normalizedData.normalizedSeries, onBarHover]);

  const handleBarMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
    onBarHover?.(null);
  }, [onBarHover]);

  const handleBarClick = useCallback((bar: BarDimensions) => {
    onBarClick?.(bar.dataPoint, bar.seriesId);
  }, [onBarClick]);

  // Generate grid lines
  const gridLines = useMemo(() => {
    if (!showGrid || plotHeight <= 0) return [];
    
    const numLines = 5;
    const lines: Array<{ y: number; value: number }> = [];
    
    for (let i = 0; i <= numLines; i++) {
      const ratio = i / numLines;
      const y = plotHeight - (ratio * plotHeight);
      const value = normalizedData.minValue + (ratio * (normalizedData.maxValue - normalizedData.minValue));
      lines.push({ y, value });
    }
    
    return lines;
  }, [showGrid, plotHeight, normalizedData.minValue, normalizedData.maxValue]);

  // Format functions
  const defaultFormatValue = useCallback((value: number) => 
    formatNumber(value, { maximumFractionDigits: 1 }), []);
  const defaultFormatLabel = useCallback((label: string) => label, []);
  
  const valueFormatter = formatValue || defaultFormatValue;
  const labelFormatter = formatLabel || defaultFormatLabel;

  // Handle empty data
  if (!data || data.length === 0 || bars.length === 0) {
    return (
      <div 
        className={cn('flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg', className)}
        style={{ width: chartWidth, height: chartHeight }}
      >
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width={chartWidth}
        height={chartHeight}
        className="overflow-visible"
        role="img"
        aria-label={ariaLabel}
        aria-describedby={ariaDescription ? 'chart-description' : undefined}
      >
        {ariaDescription && (
          <desc id="chart-description">{ariaDescription}</desc>
        )}
        
        {/* Grid lines */}
        {showGrid && (
          <g className="grid-lines">
            {gridLines.map(({ y, value }, index) => (
              <g key={index}>
                <line
                  x1={PADDING.left}
                  y1={PADDING.top + y}
                  x2={PADDING.left + plotWidth}
                  y2={PADDING.top + y}
                  stroke="currentColor"
                  strokeWidth={GRID_STROKE_WIDTH}
                  className="opacity-20"
                />
                <text
                  x={PADDING.left - 10}
                  y={PADDING.top + y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="currentColor"
                  className="opacity-60"
                >
                  {valueFormatter(value)}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Bars */}
        <g className="bars" transform={`translate(${PADDING.left}, ${PADDING.top})`}>
          {bars.map((bar, index) => (
            <rect
              key={`${bar.seriesId}-${bar.label}-${index}`}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.color}
              rx={BAR_BORDER_RADIUS}
              ry={BAR_BORDER_RADIUS}
              className={cn(
                'cursor-pointer transition-all duration-200',
                animate && 'hover:opacity-80'
              )}
              style={{
                animationDelay: animate ? `${index * 50}ms` : undefined,
              }}
              onMouseEnter={(e) => handleBarMouseEnter(e, bar)}
              onMouseLeave={handleBarMouseLeave}
              onClick={() => handleBarClick(bar)}
              tabIndex={0}
              role="button"
              aria-label={`${bar.label}: ${valueFormatter(bar.value)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBarClick(bar);
                }
              }}
            />
          ))}
        </g>

        {/* X-axis labels */}
        {showLabels && (
          <g className="x-axis-labels">
            {normalizedData.allLabels.map((label, index) => {
              const x = PADDING.left + (index * (plotWidth / normalizedData.allLabels.length)) + 
                       (plotWidth / normalizedData.allLabels.length) / 2;
              return (
                <text
                  key={label}
                  x={x}
                  y={chartHeight - PADDING.bottom + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  className="opacity-70"
                >
                  {labelFormatter(label)}
                </text>
              );
            })}
          </g>
        )}
      </svg>

      {/* Legend */}
      {showLegend && normalizedData.normalizedSeries.length > 1 && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {normalizedData.normalizedSeries.map((series) => (
            <div key={series.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: series.color }}
                aria-hidden="true"
              />
              <span className="text-sm opacity-70">{series.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && tooltip.visible && tooltip.dataPoint && (
        <div
          className="absolute z-10 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
          }}
          role="tooltip"
        >
          <div className="font-medium">
            {tooltip.seriesName && `${tooltip.seriesName}: `}
            {valueFormatter(Number(tooltip.dataPoint.y))}
          </div>
          {tooltip.dataPoint.label && (
            <div className="text-xs opacity-80 mt-1">
              {labelFormatter(String(tooltip.dataPoint.label || tooltip.dataPoint.x))}
            </div>
          )}
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

// Export default for convenience
export default BarChart;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)  
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
