// filepath: src/shared/components/GradientBadge.tsx

import React from 'react';
import { config } from '@/app/config';
import { theme } from '@/theme';

// =============================
// TYPE DEFINITIONS
// =============================

export type BadgeVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'neutral';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface GradientBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  disabled?: boolean;
  'aria-label'?: string;
  role?: string;
  tabIndex?: number;
}

// =============================
// GRADIENT DEFINITIONS
// =============================

const GRADIENT_VARIANTS: Record<BadgeVariant, string> = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600',
  secondary: 'bg-gradient-to-r from-gray-400 to-gray-600',
  success: 'bg-gradient-to-r from-green-400 to-emerald-600',
  warning: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  error: 'bg-gradient-to-r from-red-400 to-pink-600',
  info: 'bg-gradient-to-r from-cyan-400 to-blue-500',
  neutral: 'bg-gradient-to-r from-slate-400 to-slate-600',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-sm',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

// =============================
// COMPONENT IMPLEMENTATION
// =============================

export const GradientBadge: React.FC<GradientBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
  onClick,
  onKeyDown,
  disabled = false,
  'aria-label': ariaLabel,
  role,
  tabIndex,
}) => {
  // =============================
  // EVENT HANDLERS
  // =============================

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Call custom handler if provided
    onKeyDown?.(event);

    // Handle Enter and Space for clickable badges
    if (onClick && !disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  // =============================
  // STYLE COMPUTATION
  // =============================

  const gradientClass = GRADIENT_VARIANTS[variant];
  const sizeClass = SIZE_CLASSES[size];
  
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'text-white',
    'rounded-full',
    'border-0',
    'shadow-sm',
    'transition-all',
    'duration-200',
    'whitespace-nowrap',
  ];

  const interactiveClasses = onClick && !disabled ? [
    'cursor-pointer',
    'hover:shadow-md',
    'hover:scale-105',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-blue-500',
    'active:scale-95',
  ] : [];

  const disabledClasses = disabled ? [
    'opacity-50',
    'cursor-not-allowed',
    'pointer-events-none',
  ] : [];

  const allClasses = [
    ...baseClasses,
    ...interactiveClasses,
    ...disabledClasses,
    gradientClass,
    sizeClass,
    className,
  ].filter(Boolean).join(' ');

  // =============================
  // ACCESSIBILITY PROPS
  // =============================

  const accessibilityProps = {
    'aria-label': ariaLabel,
    role: role || (onClick ? 'button' : undefined),
    tabIndex: onClick && !disabled ? (tabIndex ?? 0) : tabIndex,
    'aria-disabled': disabled ? true : undefined,
  };

  // =============================
  // RENDER
  // =============================

  const Element = onClick ? 'button' : 'span';

  return (
    <Element
      className={allClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...accessibilityProps}
    >
      {children}
    </Element>
  );
};

// =============================
// PRESET VARIANTS
// =============================

export const StatusBadge: React.FC<Omit<GradientBadgeProps, 'variant'> & {
  status: 'active' | 'inactive' | 'pending' | 'error';
}> = ({ status, ...props }) => {
  const variantMap: Record<typeof status, BadgeVariant> = {
    active: 'success',
    inactive: 'neutral',
    pending: 'warning',
    error: 'error',
  };

  return (
    <GradientBadge variant={variantMap[status]} {...props} />
  );
};

export const PriorityBadge: React.FC<Omit<GradientBadgeProps, 'variant'> & {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}> = ({ priority, ...props }) => {
  const variantMap: Record<typeof priority, BadgeVariant> = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    urgent: 'error',
  };

  return (
    <GradientBadge variant={variantMap[priority]} {...props} />
  );
};

// =============================
// DEVELOPMENT HELPERS
// =============================

/**
 * Development helper to preview all badge variants.
 * Only available in development mode.
 */
export const BadgeShowcase: React.FC = () => {
  if (!config.development_mode?.verbose_logs) {
    return null;
  }

  const variants: BadgeVariant[] = ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'neutral'];
  const sizes: BadgeSize[] = ['xs', 'sm', 'md', 'lg'];

  return (
    <div className="p-4 space-y-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold">Gradient Badge Showcase</h3>
      
      {/* Variants */}
      <div className="space-y-2">
        <h4 className="font-medium">Variants:</h4>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <GradientBadge key={variant} variant={variant}>
              {variant}
            </GradientBadge>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <h4 className="font-medium">Sizes:</h4>
        <div className="flex flex-wrap items-center gap-2">
          {sizes.map((size) => (
            <GradientBadge key={size} size={size}>
              {size}
            </GradientBadge>
          ))}
        </div>
      </div>

      {/* Interactive */}
      <div className="space-y-2">
        <h4 className="font-medium">Interactive:</h4>
        <div className="flex flex-wrap gap-2">
          <GradientBadge
            onClick={() => console.log('Badge clicked')}
            aria-label="Clickable badge"
          >
            Clickable
          </GradientBadge>
          <GradientBadge disabled>
            Disabled
          </GradientBadge>
        </div>
      </div>

      {/* Preset Components */}
      <div className="space-y-2">
        <h4 className="font-medium">Presets:</h4>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="active">Active</StatusBadge>
          <StatusBadge status="inactive">Inactive</StatusBadge>
          <StatusBadge status="pending">Pending</StatusBadge>
          <StatusBadge status="error">Error</StatusBadge>
        </div>
        <div className="flex flex-wrap gap-2">
          <PriorityBadge priority="low">Low Priority</PriorityBadge>
          <PriorityBadge priority="medium">Medium Priority</PriorityBadge>
          <PriorityBadge priority="high">High Priority</PriorityBadge>
          <PriorityBadge priority="urgent">Urgent</PriorityBadge>
        </div>
      </div>
    </div>
  );
};

// =============================
// DEFAULT EXPORT
// =============================

export default GradientBadge;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
