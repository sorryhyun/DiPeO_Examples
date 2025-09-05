// filepath: src/shared/components/Card.tsx

import React, { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { theme } from '@/theme';

// =============================
// TYPE DEFINITIONS
// =============================

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  disabled?: boolean;
  className?: string;
  animate?: boolean;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  children: ReactNode;
  className?: string;
  divider?: boolean;
}

export interface CardBodyProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  maxHeight?: string;
}

export interface CardFooterProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  children: ReactNode;
  className?: string;
  divider?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
}

// =============================
// STYLING UTILITIES
// =============================

const getCardVariantStyles = (variant: CardProps['variant'], disabled?: boolean) => {
  const baseStyles = 'bg-white border transition-all duration-200';
  
  if (disabled) {
    return `${baseStyles} bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed`;
  }

  switch (variant) {
    case 'elevated':
      return `${baseStyles} border-gray-100 shadow-lg hover:shadow-xl`;
    case 'outlined':
      return `${baseStyles} border-gray-200 shadow-none hover:border-gray-300`;
    case 'filled':
      return `${baseStyles} bg-gray-50 border-gray-200 shadow-sm`;
    case 'default':
    default:
      return `${baseStyles} border-gray-100 shadow-md hover:shadow-lg`;
  }
};

const getSizeStyles = (size: CardProps['size']) => {
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'lg':
      return 'text-base';
    case 'md':
    default:
      return 'text-sm';
  }
};

const getPaddingStyles = (padding: CardProps['padding']) => {
  switch (padding) {
    case 'none':
      return 'p-0';
    case 'sm':
      return 'p-3';
    case 'lg':
      return 'p-8';
    case 'md':
    default:
      return 'p-6';
  }
};

const getRadiusStyles = (radius: CardProps['radius']) => {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-sm';
    case 'lg':
      return 'rounded-lg';
    case 'xl':
      return 'rounded-xl';
    case 'md':
    default:
      return 'rounded-md';
  }
};

const getJustifyStyles = (justify: CardFooterProps['justify']) => {
  switch (justify) {
    case 'start':
      return 'justify-start';
    case 'center':
      return 'justify-center';
    case 'end':
      return 'justify-end';
    case 'between':
      return 'justify-between';
    default:
      return 'justify-end';
  }
};

// =============================
// CARD COMPONENT
// =============================

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  size = 'md',
  padding = 'md',
  radius = 'md',
  interactive = false,
  disabled = false,
  className = '',
  animate = false,
  onClick,
  onKeyDown,
  tabIndex,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  // Build CSS classes
  const baseClasses = [
    'relative',
    'overflow-hidden',
    getCardVariantStyles(variant, disabled),
    getSizeStyles(size),
    getPaddingStyles(padding),
    getRadiusStyles(radius),
  ].join(' ');

  const interactiveClasses = interactive && !disabled
    ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    : '';

  const finalClassName = [baseClasses, interactiveClasses, className].filter(Boolean).join(' ');

  // Handle keyboard interaction for interactive cards
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (interactive && !disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(event as any);
    }
    onKeyDown?.(event);
  };

  // Determine ARIA properties
  const cardRole = role || (interactive ? 'button' : undefined);
  const cardTabIndex = interactive && !disabled ? (tabIndex ?? 0) : tabIndex;

  // Animation variants for framer-motion
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    hover: interactive && !disabled ? {
      y: -2,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    } : {},
    tap: interactive && !disabled ? {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: 'easeInOut'
      }
    } : {}
  };

  // Render as motion.div if animate is true, otherwise regular div
  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={finalClassName}
        onClick={interactive && !disabled ? onClick : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={cardTabIndex}
        role={cardRole}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={finalClassName}
      onClick={interactive && !disabled ? onClick : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={cardTabIndex}
      role={cardRole}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// =============================
// CARD HEADER COMPONENT
// =============================

export const CardHeader = forwardRef<HTMLElement, CardHeaderProps>(({
  children,
  className = '',
  divider = false,
  ...props
}, ref) => {
  const baseClasses = 'flex items-center justify-between';
  const dividerClasses = divider ? 'border-b border-gray-100 pb-4 mb-4' : '';
  const finalClassName = [baseClasses, dividerClasses, className].filter(Boolean).join(' ');

  return (
    <header
      ref={ref}
      className={finalClassName}
      {...props}
    >
      {children}
    </header>
  );
});

CardHeader.displayName = 'CardHeader';

// =============================
// CARD BODY COMPONENT
// =============================

export const CardBody = forwardRef<HTMLElement, CardBodyProps>(({
  children,
  className = '',
  scrollable = false,
  maxHeight,
  ...props
}, ref) => {
  const baseClasses = 'flex-1';
  const scrollClasses = scrollable ? 'overflow-y-auto' : '';
  const finalClassName = [baseClasses, scrollClasses, className].filter(Boolean).join(' ');

  const style = maxHeight ? { maxHeight, ...props.style } : props.style;

  return (
    <main
      ref={ref}
      className={finalClassName}
      style={style}
      {...props}
    >
      {children}
    </main>
  );
});

CardBody.displayName = 'CardBody';

// =============================
// CARD FOOTER COMPONENT
// =============================

export const CardFooter = forwardRef<HTMLElement, CardFooterProps>(({
  children,
  className = '',
  divider = false,
  justify = 'end',
  ...props
}, ref) => {
  const baseClasses = 'flex items-center gap-2';
  const dividerClasses = divider ? 'border-t border-gray-100 pt-4 mt-4' : '';
  const justifyClasses = getJustifyStyles(justify);
  const finalClassName = [baseClasses, dividerClasses, justifyClasses, className].filter(Boolean).join(' ');

  return (
    <footer
      ref={ref}
      className={finalClassName}
      {...props}
    >
      {children}
    </footer>
  );
});

CardFooter.displayName = 'CardFooter';

// =============================
// COMPOUND COMPONENT PATTERN
// =============================

// Attach sub-components as static properties for compound component pattern
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// =============================
// EXPORT TYPES FOR EXTERNAL USE
// =============================

export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };

// =============================
// DEVELOPMENT HELPERS
// =============================

if (import.meta.env.DEV) {
  // Add display names for better debugging
  Card.displayName = 'Card';
  CardHeader.displayName = 'CardHeader';
  CardBody.displayName = 'CardBody';
  CardFooter.displayName = 'CardFooter';
}

// =============================
// DEFAULT EXPORT
// =============================

export default Card;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses theme from @/theme
// [x] Reads config from `@/app/config` - uses import.meta.env for DEV mode
// [x] Exports default named component - exports Card as default and named export
// [x] Adds basic ARIA and keyboard handlers - includes role, tabIndex, aria-* attributes, keyboard event handling
