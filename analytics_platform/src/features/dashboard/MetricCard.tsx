// src/features/dashboard/MetricCard.tsx
/* src/features/dashboard/MetricCard.tsx
   Presentational card component for displaying dashboard metrics.
   - Displays metric title, value, and optional trend/change data
   - Supports loading state with spinner
   - Provides visual status indication (positive, negative, neutral)
   - Includes accessibility attributes and keyboard navigation
*/

import React from 'react';
import { Spinner } from '@/shared/components/Spinner';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number; // percentage or absolute change
    isPositive: boolean;
    label?: string; // e.g. "vs last month"
  };
  loading?: boolean;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  loading = false,
  status = 'neutral',
  icon,
  onClick,
  className = ''
}) => {
  const isClickable = Boolean(onClick);
  
  // Base classes for the card
  const baseClasses = `
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700 
    rounded-lg p-6 
    shadow-sm hover:shadow-md 
    transition-shadow duration-200
  `.trim();

  // Status-based styling
  const statusClasses = {
    success: 'border-l-4 border-l-green-500',
    warning: 'border-l-4 border-l-yellow-500', 
    error: 'border-l-4 border-l-red-500',
    neutral: ''
  }[status];

  // Clickable styling
  const clickableClasses = isClickable 
    ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    : '';

  // Trend styling
  const getTrendClasses = (isPositive: boolean) => 
    isPositive 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';

  const getTrendIcon = (isPositive: boolean) => 
    isPositive ? '↗' : '↘';

  // Handle keyboard navigation for clickable cards
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.();
    }
  };

  const cardClasses = [baseClasses, statusClasses, clickableClasses, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClasses}
      onClick={isClickable ? onClick : undefined}
      onKeyPress={handleKeyPress}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={isClickable ? `View details for ${title}` : undefined}
    >
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
          {title}
        </h3>
        {icon && (
          <div className="text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
            {icon}
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="mb-2">
        {loading ? (
          <div className="flex items-center justify-center h-8">
            <Spinner size="sm" />
          </div>
        ) : (
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        )}
      </div>

      {/* Subtitle and trend */}
      <div className="flex items-center justify-between text-sm">
        {subtitle && (
          <span className="text-gray-500 dark:text-gray-400 truncate">
            {subtitle}
          </span>
        )}
        
        {trend && !loading && (
          <div className={`flex items-center space-x-1 ${getTrendClasses(trend.isPositive)}`}>
            <span aria-hidden="true">{getTrendIcon(trend.isPositive)}</span>
            <span>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Example usage:
// <MetricCard
//   title="Total Patients"
//   value={1247}
//   subtitle="Active patients"
//   trend={{ value: 12.5, isPositive: true, label: "vs last month" }}
//   status="success"
//   icon={<UserIcon className="w-4 h-4" />}
//   onClick={() => navigate('/patients')}
// />

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure presentational component
- [x] Reads config from `@/app/config` (not needed for this presentational component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (role, aria-label, tabIndex, onKeyPress for clickable cards)
*/
