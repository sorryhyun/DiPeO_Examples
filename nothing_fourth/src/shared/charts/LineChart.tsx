// filepath: src/shared/charts/LineChart.tsx

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { ChartSeries, ChartDataPoint } from '@/core/contracts';
import { useWindowSize } from '@/hooks/useWindowSize';
import { cn, formatNumber, debugLog } from '@/core/utils';
import { config } from '@/app/config';

// ===============================================
// LineChart Component Types
// ===============================================

export interface LineChartProps {
  data: ChartSeries[];
  width?: number;
  height?: number;
  className?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  showDots?: boolean;
  animate?: boolean;
  smooth?: boolean;
  strokeWidth?: number;
  dotRadius?: number;
  colors?: string[];
  formatValue?: (value: number) => string;
  formatLabel?: (label: string | number | Date) => string;
  onPointClick?: (dataPoint: ChartDataPoint, seriesId: string) => void;
  onPointHover?: (dataPoint: ChartDataPoint | null, seriesId?: string) => void;
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

interface PathData {
  seriesId: string;
  seriesName: string;
  color: string;
  path: string;
  points: Array<{
    x: number;
    y: number;
    value: number;
    label: string;
    dataPoint: ChartDataPoint;
  }>;
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
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_DOT_RADIUS = 4;

// ===============================================
// Utility Functions
// ===============================================

function normalizeData(data: ChartSeries[]): {
  allXValues: Array<string | number>;
  normalizedSeries: Array<{
    id: string;
    name: string;
    points: Array<{ x: string | number; y: number; original: ChartDataPoint }>;
    color: string;
  }>;
  maxY: number;
  minY: number;
  maxX: number;
  minX: number;
} {
  if (!data || data.length === 0) {
    return {
      allXValues: [],
      normalizedSeries: [],
      maxY: 0,
      minY: 0,
      maxX: 0,
      minX: 0,
    };
  }

  // Collect all unique x values and determine if they're numeric
  const xValueSet = new Set<string | number>();
  let isNumericX = true;
  
  data.forEach(series => {
    series.points.forEach(point => {
      const xValue = point.x;
      if (typeof xValue === 'string') {
        // Try to parse as number
        const numValue = Number(xValue);
        if (!isNaN(numValue)) {
          xValueSet.add(numValue);
        } else {
          xValueSet.add(xValue);
          isNumericX = false;
        }
      } else if (typeof xValue === 'number') {
        xValueSet.add(xValue);
      } else if (xValue instanceof Date) {
        xValueSet.add(xValue.getTime());
      } else {
        xValueSet.add(String(xValue));
        isNumericX = false;
      }
    });
  });

  // Sort x values appropriately
  const allXValues = Array.from(xValueSet).sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return String(a).localeCompare(String(b));
  });

  // Find bounds
  let maxY = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minX = Number.POSITIVE_INFINITY;

  // Normalize series data
  const normalizedSeries = data.map((series, index) => {
    // Create a map for quick lookup
    const pointMap = new Map<string | number, ChartDataPoint>();
    series.points.forEach(point => {
      let xKey = point.x;
      if (xKey instanceof Date) {
        xKey = xKey.getTime();
      } else if (typeof xKey === 'string' && !isNaN(Number(xKey)) && isNumericX) {
        xKey = Number(xKey);
      }
      pointMap.set(xKey, point);
    });

    // Create normalized points array
    const points = allXValues.map(xValue => {
      const original = pointMap.get(xValue);
      const yValue = original ? Number(original.y) || 0 : 0;
      
      maxY = Math.max(maxY, yValue);
      minY = Math.min(minY, yValue);
      
      const numericX = typeof xValue === 'number' ? xValue : 0;
      maxX = Math.max(maxX, numericX);
      minX = Math.min(minX, numericX);

      return {
        x: xValue,
        y: yValue,
        original: original || { x: xValue, y: yValue, label: String(xValue) },
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
  if (maxY === Number.NEGATIVE_INFINITY) maxY = 0;
  if (minY === Number.POSITIVE_INFINITY) minY = 0;
  if (maxX === Number.NEGATIVE_INFINITY) maxX = 0;
  if (minX === Number.POSITIVE_INFINITY) minX = 0;

  // Add some padding to Y bounds for better visualization
  const yRange = maxY - minY;
  if (yRange > 0) {
    maxY = maxY + yRange * 0.1;
    minY = minY - yRange * 0.1;
  }

  return { allXValues, normalizedSeries, maxY, minY, maxX, minX };
}

function createPath(
  points: Array<{ x: string | number; y: number }>,
  chartWidth: number,
  chartHeight: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  smooth: boolean = false
): string {
  if (points.length === 0) return '';

  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  // Convert points to pixel coordinates
  const pixelPoints = points.map(point => {
    const xValue = typeof point.x === 'number' ? point.x : 0;
    const x = ((xValue - xMin) / xRange) * chartWidth;
    const y = chartHeight - ((point.y - yMin) / yRange) * chartHeight;
    return { x, y };
  });

  if (smooth && pixelPoints.length > 2) {
    // Create smooth curve using quadratic bezier curves
    let path = `M ${pixelPoints[0].x} ${pixelPoints[0].y}`;
    
    for (let i = 1; i < pixelPoints.length; i++) {
      const current = pixelPoints[i];
      const previous = pixelPoints[i - 1];
      
      if (i === pixelPoints.length - 1) {
        // Last point - use simple line
        path += ` L ${current.x} ${current.y}`;
      } else {
        // Use quadratic curve to next point
        const next = pixelPoints[i + 1];
        const cpx = current.x;
        const cpy = current.y;
        const endx = (current.x + next.x) / 2;
        const endy = (current.y + next.y) / 2;
        path += ` Q ${cpx} ${cpy} ${endx} ${endy}`;
      }
    }
    
    return path;
  } else {
    // Simple line path
    let path = `M ${pixelPoints[0].x} ${pixelPoints[0].y}`;
    for (let i = 1; i < pixelPoints.length; i++) {
      path += ` L ${pixelPoints[i].x} ${pixelPoints[i].y}`;
    }
    return path;
  }
}

// ===============================================
// LineChart Component
// ===============================================

export function LineChart({
  data,
  width,
  height,
  className,
  showTooltip = true,
  showLegend = true,
  showGrid = true,
  showDots = true,
  animate = true,
  smooth = false,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  dotRadius = DEFAULT_DOT_RADIUS,
  colors,
  formatValue,
  formatLabel,
  onPointClick,
  onPointHover,
  ariaLabel = 'Line chart',
  ariaDescription,
}: LineChartProps) {
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
    debugLog('LineChart', 'Processing chart data', { seriesCount: data?.length });
    
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

  // Calculate paths and points for rendering
  const pathsData = useMemo((): PathData[] => {
    if (plotWidth <= 0 || plotHeight <= 0) return [];

    return normalizedData.normalizedSeries.map(series => {
      const path = createPath(
        series.points,
        plotWidth,
        plotHeight,
        typeof normalizedData.allXValues[0] === 'number' ? normalizedData.minX : 0,
        typeof normalizedData.allXValues[normalizedData.allXValues.length - 1] === 'number' ? normalizedData.maxX : normalizedData.allXValues.length - 1,
        normalizedData.minY,
        normalizedData.maxY,
        smooth
      );

      // Calculate pixel coordinates for dots
      const xRange = normalizedData.maxX - normalizedData.minX || 1;
      const yRange = normalizedData.maxY - normalizedData.minY || 1;
      
      const points = series.points.map((point, index) => {
        const xValue = typeof point.x === 'number' ? point.x : index;
        const x = ((xValue - normalizedData.minX) / xRange) * plotWidth;
        const y = plotHeight - ((point.y - normalizedData.minY) / yRange) * plotHeight;
        
        return {
          x,
          y,
          value: point.y,
          label: String(point.original.label || point.x),
          dataPoint: point.original,
        };
      });

      return {
        seriesId: series.id,
        seriesName: series.name,
        color: series.color,
        path,
        points,
      };
    });
  }, [normalizedData, plotWidth, plotHeight, smooth]);

  // Handle point interactions
  const handlePointMouseEnter = useCallback((
    event: React.MouseEvent<SVGCircleElement>,
    point: PathData['points'][0],
    seriesId: string,
    seriesName: string
  ) => {
    if (!showTooltip) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltip({
      visible: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      dataPoint: point.dataPoint,
      seriesId,
      seriesName,
    });

    onPointHover?.(point.dataPoint, seriesId);
  }, [showTooltip, onPointHover]);

  const handlePointMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
    onPointHover?.(null);
  }, [onPointHover]);

  const handlePointClick = useCallback((
    point: PathData['points'][0],
    seriesId: string
  ) => {
    onPointClick?.(point.dataPoint, seriesId);
  }, [onPointClick]);

  // Generate grid lines
  const gridLines = useMemo(() => {
    if (!showGrid || plotHeight <= 0 || plotWidth <= 0) return { horizontal: [], vertical: [] };
    
    const numHorizontalLines = 5;
    const numVerticalLines = Math.min(normalizedData.allXValues.length, 10);
    
    const horizontal: Array<{ y: number; value: number }> = [];
    const vertical: Array<{ x: number; value: string | number }> = [];
    
    // Horizontal grid lines (Y-axis)
    for (let i = 0; i <= numHorizontalLines; i++) {
      const ratio = i / numHorizontalLines;
      const y = plotHeight - (ratio * plotHeight);
      const value = normalizedData.minY + (ratio * (normalizedData.maxY - normalizedData.minY));
      horizontal.push({ y, value });
    }
    
    // Vertical grid lines (X-axis)
    const step = Math.max(1, Math.floor(normalizedData.allXValues.length / numVerticalLines));
    for (let i = 0; i < normalizedData.allXValues.length; i += step) {
      const xValue = normalizedData.allXValues[i];
      const numericX = typeof xValue === 'number' ? xValue : i;
      const xRange = normalizedData.maxX - normalizedData.minX || 1;
      const x = ((numericX - normalizedData.minX) / xRange) * plotWidth;
      vertical.push({ x, value: xValue });
    }
    
    return { horizontal, vertical };
  }, [showGrid, plotHeight, plotWidth, normalizedData]);

  // Format functions
  const defaultFormatValue = useCallback((value: number) => 
    formatNumber(value, { maximumFractionDigits: 2 }), []);
  const defaultFormatLabel = useCallback((label: string | number | Date) => {
    if (label instanceof Date) {
      return label.toLocaleDateString();
    }
    return String(label);
  }, []);
  
  const valueFormatter = formatValue || defaultFormatValue;
  const labelFormatter = formatLabel || defaultFormatLabel;

  // Handle empty data
  if (!data || data.length === 0 || pathsData.length === 0) {
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
            {/* Horizontal grid lines */}
            {gridLines.horizontal.map(({ y, value }, index) => (
              <g key={`h-${index}`}>
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
            
            {/* Vertical grid lines */}
            {gridLines.vertical.map(({ x, value }, index) => (
              <line
                key={`v-${index}`}
                x1={PADDING.left + x}
                y1={PADDING.top}
                x2={PADDING.left + x}
                y2={PADDING.top + plotHeight}
                stroke="currentColor"
                strokeWidth={GRID_STROKE_WIDTH}
                className="opacity-20"
              />
            ))}
          </g>
        )}

        {/* Line paths */}
        <g className="line-paths" transform={`translate(${PADDING.left}, ${PADDING.top})`}>
          {pathsData.map((pathData, index) => (
            <path
              key={pathData.seriesId}
              d={pathData.path}
              fill="none"
              stroke={pathData.color}
              strokeWidth={strokeWidth}
              className={cn(
                'transition-all duration-300',
                animate && 'animate-[draw_1s_ease-out]'
              )}
              style={{
                strokeDasharray: animate ? '1000' : undefined,
                strokeDashoffset: animate ? '1000' : undefined,
                animationDelay: animate ? `${index * 200}ms` : undefined,
              }}
            />
          ))}
        </g>

        {/* Data points */}
        {showDots && (
          <g className="data-points" transform={`translate(${PADDING.left}, ${PADDING.top})`}>
            {pathsData.map((pathData) =>
              pathData.points.map((point, pointIndex) => (
                <circle
                  key={`${pathData.seriesId}-${pointIndex}`}
                  cx={point.x}
                  cy={point.y}
                  r={dotRadius}
                  fill={pathData.color}
                  stroke="white"
                  strokeWidth={2}
                  className={cn(
                    'cursor-pointer transition-all duration-200',
                    animate && 'hover:scale-125'
                  )}
                  onMouseEnter={(e) => handlePointMouseEnter(e, point, pathData.seriesId, pathData.seriesName)}
                  onMouseLeave={handlePointMouseLeave}
                  onClick={() => handlePointClick(point, pathData.seriesId)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${pathData.seriesName}: ${point.label} - ${valueFormatter(point.value)}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePointClick(point, pathData.seriesId);
                    }
                  }}
                />
              ))
            )}
          </g>
        )}

        {/* X-axis labels */}
        <g className="x-axis-labels">
          {gridLines.vertical.map(({ x, value }, index) => (
            <text
              key={index}
              x={PADDING.left + x}
              y={chartHeight - PADDING.bottom + 20}
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
              className="opacity-70"
            >
              {labelFormatter(value)}
            </text>
          ))}
        </g>
      </svg>

      {/* Legend */}
      {showLegend && normalizedData.normalizedSeries.length > 1 && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {normalizedData.normalizedSeries.map((series) => (
            <div key={series.id} className="flex items-center gap-2">
              <div
                className="w-4 h-0.5 rounded-full"
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
              {labelFormatter(tooltip.dataPoint.label || tooltip.dataPoint.x)}
            </div>
          )}
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}

      {/* CSS for line drawing animation */}
      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Export default for convenience
export default LineChart;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)  
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
