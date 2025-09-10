// filepath: src/shared/components/Card.tsx

import React, { forwardRef, ReactNode } from 'react';
import { motion, MotionProps, Variants } from 'framer-motion';
import { EASINGS } from '@/theme/animations';
import { classNames } from '@/core/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'glass';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onAnimationStart' | 'onDragStart' | 'onDrag' | 'onDragEnd'> {
  /** Card content */
  children: ReactNode;
  
  /** Visual variant */
  variant?: CardVariant;
  
  /** Size variant affecting default padding and spacing */
  size?: CardSize;
  
  /** Custom padding override */
  padding?: CardPadding;
  
  /** Optional header content */
  header?: ReactNode;
  
  /** Optional footer content */
  footer?: ReactNode;
  
  /** Optional title (shorthand for simple header) */
  title?: string;
  
  /** Optional subtitle */
  subtitle?: string;
  
  /** Whether the card is interactive (clickable/hoverable) */
  interactive?: boolean;
  
  /** Whether the card is selected/active */
  selected?: boolean;
  
  /** Whether the card is disabled */
  disabled?: boolean;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Custom motion props */
  motionProps?: MotionProps;
  
  /** Custom class name */
  className?: string;
  
  /** Click handler for interactive cards */
  onClick?: () => void;
  
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

// ============================================================================
// STYLE VARIANTS
// ============================================================================

const variantStyles: Record<CardVariant, string> = {
  elevated: 'bg-white border border-gray-200 shadow-md hover:shadow-lg backdrop-blur-none',
  outlined: 'bg-white border-2 border-gray-300 shadow-none hover:shadow-sm backdrop-blur-none',
  filled: 'bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md backdrop-blur-none',
  glass: 'bg-white/10 border border-white/20 shadow-lg backdrop-blur-md hover:bg-white/20',
};

const sizeStyles: Record<CardSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg', 
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const headerPaddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'px-3 pt-3 pb-2',
  md: 'px-4 pt-4 pb-3',
  lg: 'px-6 pt-6 pb-4',
  xl: 'px-8 pt-8 pb-6',
};

const footerPaddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'px-3 pt-2 pb-3',
  md: 'px-4 pt-3 pb-4',
  lg: 'px-6 pt-4 pb-6',
  xl: 'px-8 pt-6 pb-8',
};

const contentPaddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'px-3 pb-3',
  md: 'px-4 pb-4',
  lg: 'px-6 pb-6',
  xl: 'px-8 pb-8',
};

// ============================================================================
// MOTION VARIANTS
// ============================================================================

const cardMotionVariants: Variants = {
  idle: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: EASINGS.smooth,
    },
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: 0.2,
      ease: EASINGS.smooth,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: 0.1,
      ease: EASINGS.smooth,
    },
  },
  disabled: {
    scale: 1,
    y: 0,
    opacity: 0.6,
    transition: {
      duration: 0.2,
      ease: EASINGS.smooth,
    },
  },
};

// ============================================================================
// LOADING SKELETON
// ============================================================================

const LoadingSkeleton = ({ padding }: { padding: CardPadding }) => (
  <div className={classNames('animate-pulse space-y-3', paddingStyles[padding])}>
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
  </div>
);

// ============================================================================
// CARD HEADER COMPONENT
// ============================================================================

const CardHeader = ({ 
  title, 
  subtitle, 
  children, 
  padding 
}: { 
  title?: string; 
  subtitle?: string; 
  children?: ReactNode; 
  padding: CardPadding; 
}) => {
  if (!title && !subtitle && !children) return null;

  return (
    <div className={classNames('border-b border-gray-200', headerPaddingStyles[padding])}>
      {children || (
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CARD FOOTER COMPONENT
// ============================================================================

const CardFooter = ({ 
  children, 
  padding 
}: { 
  children: ReactNode; 
  padding: CardPadding; 
}) => (
  <div className={classNames('border-t border-gray-200', footerPaddingStyles[padding])}>
    {children}
  </div>
);

// ============================================================================
// CARD COMPONENT
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'elevated',
  size = 'md',
  padding,
  header,
  footer,
  title,
  subtitle,
  interactive = false,
  selected = false,
  disabled = false,
  isLoading = false,
  motionProps,
  className,
  onClick,
  ariaLabel,
  ...rest
}, ref) => {
  // Determine default padding based on size if not explicitly provided
  const defaultPadding: Record<CardSize, CardPadding> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  };
  
  const finalPadding = padding || defaultPadding[size];
  const hasHeaderContent = !!(header || title || subtitle);
  const hasFooterContent = !!footer;
  
  const handleClick = React.useCallback(() => {
    if (disabled || isLoading) return;
    onClick?.();
  }, [disabled, isLoading, onClick]);
  
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (interactive && !disabled && !isLoading && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.();
    }
  }, [interactive, disabled, isLoading, onClick]);
  
  const cardClasses = classNames(
    // Base styles
    'relative overflow-hidden transition-all duration-200',
    
    // Size styles
    sizeStyles[size],
    
    // Variant styles
    variantStyles[variant],
    
    // Interactive styles
    interactive && !disabled && !isLoading && 'cursor-pointer',
    interactive && !disabled && !isLoading && 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    
    // Selected state
    selected && 'ring-2 ring-blue-500 ring-offset-2',
    
    // Disabled state
    disabled && 'opacity-60 cursor-not-allowed',
    
    // Custom className
    className
  );
  
  const currentVariant = disabled 
    ? 'disabled' 
    : 'idle';
  
  const content = isLoading ? (
    <LoadingSkeleton padding={finalPadding} />
  ) : (
    <>
      {hasHeaderContent && (
        <CardHeader 
          title={title} 
          subtitle={subtitle} 
          padding={finalPadding}
        >
          {header}
        </CardHeader>
      )}
      
      <div className={classNames(
        hasHeaderContent ? contentPaddingStyles[finalPadding] : paddingStyles[finalPadding]
      )}>
        {children}
      </div>
      
      {hasFooterContent && (
        <CardFooter padding={finalPadding}>
          {footer}
        </CardFooter>
      )}
    </>
  );
  
  return (
    <motion.div
      ref={ref}
      className={cardClasses}
      onClick={interactive ? handleClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      tabIndex={interactive && !disabled && !isLoading ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      aria-busy={isLoading}
      variants={cardMotionVariants}
      initial="idle"
      animate={currentVariant}
      whileHover={interactive && !disabled && !isLoading ? 'hover' : undefined}
      whileTap={interactive && !disabled && !isLoading ? 'tap' : undefined}
      {...motionProps}
      {...rest}
    >
      {content}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;
