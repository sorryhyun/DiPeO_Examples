// filepath: src/shared/charts/BarChart.tsx
import React, { useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartConfig } from '@/core/contracts';
import { useWindowSize } from '@/hooks/useWindowSize';

export interface BarChartDataPoint {
  name: string | number;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  config?: ChartConfig;
  width?: number;
  height?: number;
  className?: string;
  onBarClick?: (data: BarChartDataPoint, index: number) => void;
  onBarHover?: (data: BarChartDataPoint | null, index: number) => void;
  colors?: string[];
  showGrid?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  accessibilityLabel?: string;
  accessibilityDescription?: string;
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          <span className="inline-block w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: data.color }} />
          {data.name}: <span className="font-medium">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  config,
  width,
  height = 300,
  className = '',
  onBarClick,
  onBarHover,
  colors = DEFAULT_COLORS,
  showGrid = true,
  showTooltip = true,
  animate = true,
  accessibilityLabel,
  accessibilityDescription,
}) => {
  const { width: windowWidth } = useWindowSize();

  const chartConfig = useMemo(() => ({
    xKey: 'name',
    yKey: 'value',
    ...config,
  }), [config]);

  const responsiveWidth = useMemo(() => {
    if (width) return width;
    if (windowWidth < 640) return windowWidth - 32; // sm breakpoint with padding
    if (windowWidth < 1024) return windowWidth - 64; // lg breakpoint with padding
    return Math.min(windowWidth - 128, 800); // max width with padding
  }, [width, windowWidth]);

  const handleBarClick = (data: any, index: number) => {
    if (onBarClick && data.payload) {
      onBarClick(data.payload, index);
    }
  };

  const handleMouseEnter = (data: any, index: number) => {
    if (onBarHover && data.payload) {
      onBarHover(data.payload, index);
    }
  };

  const handleMouseLeave = () => {
    if (onBarHover) {
      onBarHover(null, -1);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: responsiveWidth, height }}
        role="img"
        aria-label={accessibilityLabel || "Empty bar chart"}
      >
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div 
      className={`${className}`}
      role="img"
      aria-label={accessibilityLabel || "Bar chart"}
      aria-describedby={accessibilityDescription ? "bar-chart-description" : undefined}
    >
      {accessibilityDescription && (
        <div id="bar-chart-description" className="sr-only">
          {accessibilityDescription}
        </div>
      )}
      
      <ResponsiveContainer width={responsiveWidth} height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          onMouseLeave={handleMouseLeave}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f3f4f6" 
              opacity={0.7}
            />
          )}
          
          <XAxis 
            dataKey={chartConfig.xKey}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          
          <Bar 
            dataKey={chartConfig.yKey}
            radius={[4, 4, 0, 0]}
            cursor="pointer"
            onClick={handleBarClick}
            onMouseEnter={handleMouseEnter}
            animationDuration={animate ? 750 : 0}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;

// Self-Check Comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useWindowSize hook
// [x] Reads config from `@/app/config` - not applicable for this component
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - includes role, aria-label, aria-describedby, and sr-only description
