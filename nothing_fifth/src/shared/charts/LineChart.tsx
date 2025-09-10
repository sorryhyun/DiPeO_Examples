// filepath: src/shared/charts/LineChart.tsx

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { ChartSeries, ChartPoint } from '@/core/contracts';
import { useWindowSize } from '@/hooks/useWindowSize';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface LineChartProps {
  /** Chart data series */
  readonly series: readonly ChartSeries[];
  /** Chart title */
  readonly title?: string;
  /** Chart height in pixels */
  readonly height?: number;
  /** Whether to show the legend */
  readonly showLegend?: boolean;
  /** Whether to show grid lines */
  readonly showGrid?: boolean;
  /** Whether to animate the chart */
  readonly animate?: boolean;
  /** Color palette override */
  readonly colors?: readonly string[];
  /** X-axis label */
  readonly xAxisLabel?: string;
  /** Y-axis label */
  readonly yAxisLabel?: string;
  /** Whether the chart should be responsive */
  readonly responsive?: boolean;
  /** Minimum Y-axis value */
  readonly minY?: number;
  /** Maximum Y-axis value */
  readonly maxY?: number;
  /** Custom className for the container */
  readonly className?: string;
  /** Accessibility label for the chart */
  readonly ariaLabel?: string;
  /** Event handler for point clicks */
  readonly onPointClick?: (seriesId: string, pointIndex: number, point: ChartPoint) => void;
}

// ============================================================================
// DEFAULT COLORS
// ============================================================================

const DEFAULT_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert ChartSeries data to Chart.js format
 */
function convertToChartData(
  series: readonly ChartSeries[],
  colors: readonly string[]
) {
  // Extract all unique x-values for labels
  const allXValues = new Set<string>();
  series.forEach(s => {
    s.points.forEach(p => {
      allXValues.add(String(p.x));
    });
  });
  
  const labels = Array.from(allXValues).sort();

  // Convert each series to Chart.js dataset format
  const datasets = series.map((s, index) => {
    const color = colors[index % colors.length];
    
    // Create data array aligned with labels
    const data = labels.map(label => {
      const point = s.points.find(p => String(p.x) === label);
      return point ? point.y : null;
    });

    return {
      label: s.name || s.id,
      data,
      borderColor: color,
      backgroundColor: `${color}20`, // 20% opacity for fill
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.1, // Smooth curves
      fill: false,
    };
  });

  return { labels, datasets };
}

/**
 * Create Chart.js options configuration
 */
function createChartOptions(
  props: LineChartProps,
  isSmallScreen: boolean
): ChartOptions<'line'> {
  const {
    title,
    showLegend = true,
    showGrid = true,
    animate = true,
    xAxisLabel,
    yAxisLabel,
    responsive = true,
    minY,
    maxY,
  } = props;

  return {
    responsive,
    maintainAspectRatio: false,
    animation: animate ? {
      duration: 750,
      easing: 'easeInOutQuart',
    } : false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: {
          size: isSmallScreen ? 14 : 16,
          weight: 'bold',
        },
        color: '#374151', // gray-700
        padding: {
          bottom: 20,
        },
      },
      legend: {
        display: showLegend,
        position: isSmallScreen ? 'bottom' : 'top',
        labels: {
          font: {
            size: isSmallScreen ? 12 : 14,
          },
          color: '#6B7280', // gray-500
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value?.toLocaleString() ?? 'N/A'}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel,
          font: {
            size: isSmallScreen ? 12 : 14,
            weight: 'bold',
          },
          color: '#6B7280',
        },
        grid: {
          display: showGrid,
          color: '#E5E7EB', // gray-200
          lineWidth: 1,
        },
        ticks: {
          font: {
            size: isSmallScreen ? 10 : 12,
          },
          color: '#6B7280',
          maxTicksLimit: isSmallScreen ? 6 : 10,
        },
      },
      y: {
        display: true,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          font: {
            size: isSmallScreen ? 12 : 14,
            weight: 'bold',
          },
          color: '#6B7280',
        },
        grid: {
          display: showGrid,
          color: '#E5E7EB',
          lineWidth: 1,
        },
        ticks: {
          font: {
            size: isSmallScreen ? 10 : 12,
          },
          color: '#6B7280',
          callback: function(value: string | number) {
            if (typeof value === 'number') {
              return value.toLocaleString();
            }
            return value;
          },
        },
        min: minY,
        max: maxY,
      },
    },
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LineChart: React.FC<LineChartProps> = (props) => {
  const {
    series,
    height = 400,
    colors = DEFAULT_COLORS,
    className = '',
    ariaLabel = 'Line chart visualization',
    onPointClick,
  } = props;

  const { width } = useWindowSize();
  const isSmallScreen = width < 768; // md breakpoint

  // Memoize chart data conversion
  const chartData = useMemo(() => {
    if (!series || series.length === 0) {
      return { labels: [], datasets: [] };
    }
    return convertToChartData(series, colors);
  }, [series, colors]);

  // Memoize chart options
  const chartOptions = useMemo(() => {
    const options = createChartOptions(props, isSmallScreen);
    
    // Add click handler if provided
    if (onPointClick) {
      options.onClick = (event: any, elements: any[]) => {
        if (elements.length > 0) {
          const element = elements[0];
          const datasetIndex = element.datasetIndex;
          const pointIndex = element.index;
          const seriesData = series[datasetIndex];
          
          if (seriesData && seriesData.points[pointIndex]) {
            onPointClick(seriesData.id, pointIndex, seriesData.points[pointIndex]);
          }
        }
      };
    }
    
    return options;
  }, [props, isSmallScreen, onPointClick, series]);

  // Handle empty data
  if (!series || series.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ height }}
        role="img"
        aria-label="Empty chart - no data available"
      >
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium">No Data Available</div>
          <div className="text-sm">Add data series to display the chart</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{ height }}
      role="img"
      aria-label={ariaLabel}
    >
      <Line
        data={chartData}
        options={chartOptions}
        aria-label={ariaLabel}
      />
    </div>
  );
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default LineChart;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/core/contracts and @/hooks/useWindowSize
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses useWindowSize hook for responsive behavior
// [x] Reads config from `@/app/config` - Not needed for this chart component
// [x] Exports default named component - Exports LineChart as both named and default export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Includes ARIA labels and role attributes for accessibility
