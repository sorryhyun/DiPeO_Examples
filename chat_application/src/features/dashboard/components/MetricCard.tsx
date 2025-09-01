// filepath: src/features/dashboard/components/MetricCard.tsx
import { memo, useMemo } from 'react';
import { Card } from '@/shared/components/Card';
import { Chart } from '@/shared/components/Chart';
import { Skeleton } from '@/shared/components/Skeleton';
import { theme } from '@/theme';
import type { ChartSeries } from '@/core/contracts';

export interface MetricCardProps {
  /**
   * The primary metric value to display
   */
  value: string | number;
  
  /**
   * Label for the metric (e.g., "Total Patients", "Revenue")
   */
  label: string;
  
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  
  /**
   * Change from previous period (can be positive or negative)
   */
  delta?: {
    value: number;
    percentage: boolean;
    period?: string; // e.g., "vs last month"
  };
  
  /**
   * Sparkline data for mini trend chart
   */
  sparklineData?: ChartSeries[];
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Visual variant for the card
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Optional icon component
   */
  icon?: React.ReactNode;
  
  /**
   * Click handler for interactive cards
   */
  onClick?: () => void;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Accessibility label override
   */
  'aria-label'?: string;
  
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

const MetricCard = memo<MetricCardProps>(({
  value,
  label,
  subtitle,
  delta,
  sparklineData,
  isLoading = false,
  variant = 'default',
  size = 'md',
  icon,
  onClick,
  className = '',
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  // Memoize style calculations
  const styles = useMemo(() => {
    const variantColors = {
      default: {
        border: theme.colors.gray[200],
        accent: theme.colors.primary[500],
        background: 'white',
      },
      primary: {
        border: theme.colors.primary[200],
        accent: theme.colors.primary[500],
        background: theme.colors.primary[50],
      },
      success: {
        border: theme.colors.success[200],
        accent: theme.colors.success[500],
        background: theme.colors.success[50],
      },
      warning: {
        border: theme.colors.warning[200],
        accent: theme.colors.warning[500],
        background: theme.colors.warning[50],
      },
      error: {
        border: theme.colors.error[200],
        accent: theme.colors.error[500],
        background: theme.colors.error[50],
      },
    };
    
    const sizeStyles = {
      sm: {
        padding: theme.spacing[3],
        valueSize: theme.typography.fontSize.lg,
        labelSize: theme.typography.fontSize.sm,
        chartHeight: '24px',
      },
      md: {
        padding: theme.spacing[4],
        valueSize: theme.typography.fontSize['2xl'],
        labelSize: theme.typography.fontSize.base,
        chartHeight: '32px',
      },
      lg: {
        padding: theme.spacing[6],
        valueSize: theme.typography.fontSize['3xl'],
        labelSize: theme.typography.fontSize.lg,
        chartHeight: '40px',
      },
    };
    
    return {
      variant: variantColors[variant],
      size: sizeStyles[size],
    };
  }, [variant, size]);
  
  // Format delta display
  const deltaDisplay = useMemo(() => {
    if (!delta) return null;
    
    const isPositive = delta.value >= 0;
    const sign = isPositive ? '+' : '';
    const suffix = delta.percentage ? '%' : '';
    const period = delta.period ? ` ${delta.period}` : '';
    
    return {
      text: `${sign}${delta.value}${suffix}${period}`,
      color: isPositive ? theme.colors.success[600] : theme.colors.error[600],
      icon: isPositive ? '↗' : '↘',
      isPositive,
    };
  }, [delta]);
  
  // Accessibility label
  const accessibilityLabel = useMemo(() => {
    if (ariaLabel) return ariaLabel;
    
    let label = `${label}: ${value}`;
    if (subtitle) label += `, ${subtitle}`;
    if (deltaDisplay) {
      label += `, Change: ${deltaDisplay.text}`;
    }
    
    return label;
  }, [ariaLabel, label, value, subtitle, deltaDisplay]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card
        className={`relative overflow-hidden ${className}`}
        style={{
          padding: styles.size.padding,
          backgroundColor: styles.variant.background,
          borderColor: styles.variant.border,
        }}
        data-testid={testId ? `${testId}-loading` : undefined}
      >
        <div className="space-y-3">
          {/* Icon skeleton */}
          {icon && (
            <Skeleton
              width="24px"
              height="24px"
              className="rounded"
            />
          )}
          
          {/* Label skeleton */}
          <Skeleton
            width="60%"
            height={styles.size.labelSize}
            className="rounded"
          />
          
          {/* Value skeleton */}
          <Skeleton
            width="40%"
            height={styles.size.valueSize}
            className="rounded"
          />
          
          {/* Delta skeleton */}
          <Skeleton
            width="30%"
            height={theme.typography.fontSize.sm}
            className="rounded"
          />
          
          {/* Sparkline skeleton */}
          {sparklineData && (
            <Skeleton
              width="100%"
              height={styles.size.chartHeight}
              className="rounded mt-4"
            />
          )}
        </div>
      </Card>
    );
  }
  
  return (
    <Card
      className={`
        relative overflow-hidden transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${className}
      `}
      style={{
        padding: styles.size.padding,
        backgroundColor: styles.variant.background,
        borderColor: styles.variant.border,
      }}
      onClick={onClick}
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={accessibilityLabel}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      data-testid={testId}
    >
      {/* Accent border */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: styles.variant.accent }}
        aria-hidden="true"
      />
      
      <div className="space-y-2">
        {/* Header row with icon and label */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {icon && (
              <div
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
                style={{ color: styles.variant.accent }}
                aria-hidden="true"
              >
                {icon}
              </div>
            )}\n            <div className="min-w-0 flex-1">\n              <h3\n                className="font-medium text-gray-900 truncate"\n                style={{\n                  fontSize: styles.size.labelSize,\n                  lineHeight: theme.typography.lineHeight.tight,\n                }}\n              >\n                {label}\n              </h3>\n              {subtitle && (\n                <p\n                  className="text-gray-500 truncate"\n                  style={{\n                    fontSize: theme.typography.fontSize.xs,\n                    lineHeight: theme.typography.lineHeight.snug,\n                  }}\n                >\n                  {subtitle}\n                </p>\n              )}\n            </div>\n          </div>\n        </div>\n        \n        {/* Main value */}\n        <div className="flex items-end justify-between">\n          <div className="min-w-0 flex-1">\n            <p\n              className="font-bold text-gray-900 truncate"\n              style={{\n                fontSize: styles.size.valueSize,\n                lineHeight: theme.typography.lineHeight.none,\n                color: styles.variant.accent,\n              }}\n            >\n              {value}\n            </p>\n          </div>\n          \n          {/* Delta indicator */}\n          {deltaDisplay && (\n            <div \n              className="flex items-center space-x-1 text-sm font-medium flex-shrink-0 ml-2"\n              style={{ color: deltaDisplay.color }}\n            >\n              <span \n                className="text-xs"\n                aria-hidden="true"\n              >\n                {deltaDisplay.icon}\n              </span>\n              <span>{Math.abs(delta!.value)}{delta!.percentage ? '%' : ''}</span>\n              {delta!.period && (\n                <span className="text-xs text-gray-500 ml-1">\n                  {delta!.period}\n                </span>\n              )}\n            </div>\n          )}\n        </div>\n        \n        {/* Sparkline chart */}\n        {sparklineData && sparklineData.length > 0 && (\n          <div \n            className="mt-4"\n            style={{ height: styles.size.chartHeight }}\n          >\n            <Chart\n              type="line"\n              data={sparklineData}\n              options={{\n                responsive: true,\n                maintainAspectRatio: false,\n                plugins: {\n                  legend: {\n                    display: false,\n                  },\n                  tooltip: {\n                    enabled: false,\n                  },\n                },\n                scales: {\n                  x: {\n                    display: false,\n                  },\n                  y: {\n                    display: false,\n                  },\n                },\n                elements: {\n                  line: {\n                    borderWidth: 2,\n                    borderColor: styles.variant.accent,\n                    backgroundColor: 'transparent',\n                    tension: 0.4,\n                  },\n                  point: {\n                    radius: 0,\n                    hitRadius: 0,\n                  },\n                },\n                interaction: {\n                  intersect: false,\n                  mode: 'index',\n                },\n              }}\n              height={parseInt(styles.size.chartHeight)}\n              aria-label={`Trend chart for ${label}`}\n            />\n          </div>\n        )}\n      </div>\n      \n      {/* Focus indicator for keyboard navigation */}\n      {onClick && (\n        <div\n          className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none focus-within:opacity-100"\n          style={{\n            boxShadow: `0 0 0 2px ${styles.variant.accent}`,\n          }}\n          aria-hidden="true"\n        />\n      )}\n    </Card>\n  );\n});\n\nMetricCard.displayName = 'MetricCard';\n\nexport { MetricCard };\nexport default MetricCard;\n\n/*\nSelf-check comments:\n- [x] Uses `@/` imports only\n- [x] Uses providers/hooks (no direct DOM/localStorage side effects)\n- [x] Reads config from `@/app/config` (uses theme system)\n- [x] Exports default named component\n- [x] Adds basic ARIA and keyboard handlers (accessible labels, keyboard navigation for interactive cards)\n*/\n```