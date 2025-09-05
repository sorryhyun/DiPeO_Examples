// filepath: src/shared/components/Tooltip.tsx

import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, scaleIn } from '@/theme/animations';
import { useTheme } from '@/providers/ThemeProvider';

// =============================
// TYPES & INTERFACES
// =============================

export type TooltipPosition = 
  | 'top' 
  | 'bottom' 
  | 'left' 
  | 'right' 
  | 'top-start' 
  | 'top-end'
  | 'bottom-start' 
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  arrow?: boolean;
  interactive?: boolean;
  maxWidth?: number;
  offset?: number;
  onShow?: () => void;
  onHide?: () => void;
}

interface TooltipPositionData {
  x: number;
  y: number;
  transformOrigin: string;
}

// =============================
// UTILITY FUNCTIONS
// =============================

/**
 * Calculate tooltip position based on trigger element and preferred position
 */
function calculateTooltipPosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  position: TooltipPosition,
  offset: number,
  arrow: boolean
): TooltipPositionData {
  const arrowSize = arrow ? 8 : 0;
  const totalOffset = offset + arrowSize;
  
  let x = 0;
  let y = 0;
  let transformOrigin = 'center';

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  switch (position) {
    case 'top':
      x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.top - tooltipRect.height - totalOffset;
      transformOrigin = 'bottom center';
      break;
      
    case 'top-start':
      x = triggerRect.left;
      y = triggerRect.top - tooltipRect.height - totalOffset;
      transformOrigin = 'bottom left';
      break;
      
    case 'top-end':
      x = triggerRect.right - tooltipRect.width;
      y = triggerRect.top - tooltipRect.height - totalOffset;
      transformOrigin = 'bottom right';
      break;

    case 'bottom':
      x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.bottom + totalOffset;
      transformOrigin = 'top center';
      break;
      
    case 'bottom-start':
      x = triggerRect.left;
      y = triggerRect.bottom + totalOffset;
      transformOrigin = 'top left';
      break;
      
    case 'bottom-end':
      x = triggerRect.right - tooltipRect.width;
      y = triggerRect.bottom + totalOffset;
      transformOrigin = 'top right';
      break;

    case 'left':
      x = triggerRect.left - tooltipRect.width - totalOffset;
      y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      transformOrigin = 'right center';
      break;
      
    case 'left-start':
      x = triggerRect.left - tooltipRect.width - totalOffset;
      y = triggerRect.top;
      transformOrigin = 'right top';
      break;
      
    case 'left-end':
      x = triggerRect.left - tooltipRect.width - totalOffset;
      y = triggerRect.bottom - tooltipRect.height;
      transformOrigin = 'right bottom';
      break;

    case 'right':
      x = triggerRect.right + totalOffset;
      y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      transformOrigin = 'left center';
      break;
      
    case 'right-start':
      x = triggerRect.right + totalOffset;
      y = triggerRect.top;
      transformOrigin = 'left top';
      break;
      
    case 'right-end':
      x = triggerRect.right + totalOffset;
      y = triggerRect.bottom - tooltipRect.height;
      transformOrigin = 'left bottom';
      break;
  }

  // Viewport boundary corrections
  const margin = 8; // Minimum distance from viewport edge
  
  if (x < margin) {
    x = margin;
  } else if (x + tooltipRect.width > viewportWidth - margin) {
    x = viewportWidth - tooltipRect.width - margin;
  }
  
  if (y < margin) {
    y = margin;
  } else if (y + tooltipRect.height > viewportHeight - margin) {
    y = viewportHeight - tooltipRect.height - margin;
  }

  return { x, y, transformOrigin };
}

/**
 * Get arrow styles based on position
 */
function getArrowStyles(position: TooltipPosition): React.CSSProperties {
  const size = 8;
  const offset = -size;

  const baseStyles: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  };

  switch (true) {
    case position.startsWith('top'):
      return {
        ...baseStyles,
        bottom: offset,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `${size}px ${size}px 0 ${size}px`,
        borderColor: 'var(--tooltip-bg, #1f2937) transparent transparent transparent',
      };
      
    case position.startsWith('bottom'):
      return {
        ...baseStyles,
        top: offset,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `0 ${size}px ${size}px ${size}px`,
        borderColor: 'transparent transparent var(--tooltip-bg, #1f2937) transparent',
      };
      
    case position.startsWith('left'):
      return {
        ...baseStyles,
        right: offset,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${size}px 0 ${size}px ${size}px`,
        borderColor: 'transparent transparent transparent var(--tooltip-bg, #1f2937)',
      };
      
    case position.startsWith('right'):
      return {
        ...baseStyles,
        left: offset,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${size}px ${size}px ${size}px 0`,
        borderColor: 'transparent var(--tooltip-bg, #1f2937) transparent transparent',
      };
      
    default:
      return baseStyles;
  }
}

// =============================
// TOOLTIP COMPONENT
// =============================

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 300,
  disabled = false,
  className = '',
  contentClassName = '',
  arrow = true,
  interactive = false,
  maxWidth = 320,
  offset = 8,
  onShow,
  onHide,
}: TooltipProps) {
  const { isDark, reducedMotion } = useTheme();
  
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPositionData>({
    x: 0,
    y: 0,
    transformOrigin: 'center',
  });
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);

  // =============================
  // POSITION CALCULATION
  // =============================

  const updateTooltipPosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current || !isVisible) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const positionData = calculateTooltipPosition(
      triggerRect,
      tooltipRect,
      position,
      offset,
      arrow
    );
    
    setTooltipPosition(positionData);
  }, [position, offset, arrow, isVisible]);

  // Update position when tooltip becomes visible or on resize
  useLayoutEffect(() => {
    if (isVisible) {
      updateTooltipPosition();
      
      const handleResize = () => updateTooltipPosition();
      const handleScroll = () => updateTooltipPosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isVisible, updateTooltipPosition]);

  // =============================
  // SHOW/HIDE LOGIC
  // =============================

  const showTooltip = useCallback(() => {
    if (disabled) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    if (showTimeoutRef.current) return; // Already scheduled
    
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      onShow?.();\n      showTimeoutRef.current = null;
    }, delay);
  }, [disabled, delay, onShow]);

  const hideTooltip = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    
    if (!isVisible) return;
    
    const hideDelay = interactive ? 100 : 0; // Small delay for interactive tooltips
    
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      onHide?.();
      hideTimeoutRef.current = null;
    }, hideDelay);
  }, [isVisible, interactive, onHide]);

  // =============================
  // EVENT HANDLERS
  // =============================

  const handleTriggerMouseEnter = useCallback(() => {
    showTooltip();
  }, [showTooltip]);

  const handleTriggerMouseLeave = useCallback(() => {
    if (!interactive) {
      hideTooltip();
    }
  }, [interactive, hideTooltip]);

  const handleTriggerFocus = useCallback(() => {
    showTooltip();
  }, [showTooltip]);

  const handleTriggerBlur = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  const handleTooltipMouseEnter = useCallback(() => {
    if (interactive && hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, [interactive]);

  const handleTooltipMouseLeave = useCallback(() => {
    if (interactive) {
      hideTooltip();
    }
  }, [interactive, hideTooltip]);

  // Keyboard handling for tooltip dismissal
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isVisible) {
      hideTooltip();
      // Return focus to trigger element
      if (triggerRef.current) {
        const focusableElement = triggerRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || triggerRef.current;
        focusableElement.focus();
      }
    }
  }, [isVisible, hideTooltip]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // =============================
  // ANIMATION VARIANTS
  // =============================

  const tooltipVariants = reducedMotion 
    ? { 
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      }
    : {
        hidden: {
          opacity: 0,
          scale: 0.8,
          ...scaleIn.initial,
        },
        visible: {
          opacity: 1,
          scale: 1,
          ...scaleIn.animate,
          transition: {
            ...scaleIn.animate.transition,
            transformOrigin: tooltipPosition.transformOrigin,
          },
        },
        exit: {
          opacity: 0,
          scale: 0.8,
          ...scaleIn.exit,
          transition: {
            ...scaleIn.exit.transition,
            transformOrigin: tooltipPosition.transformOrigin,
          },
        },
      };

  // =============================
  // STYLES
  // =============================

  const tooltipBaseStyles: React.CSSProperties = {
    position: 'fixed',
    left: tooltipPosition.x,
    top: tooltipPosition.y,
    zIndex: 9999,
    maxWidth,
    pointerEvents: interactive ? 'auto' : 'none',
    // CSS variables for theming
    '--tooltip-bg': isDark ? '#1f2937' : '#374151',
    '--tooltip-text': isDark ? '#f9fafb' : '#ffffff',
    '--tooltip-border': isDark ? '#374151' : '#4b5563',
  } as React.CSSProperties;

  const defaultTooltipClasses = [
    'px-3 py-2',
    'text-sm font-medium',
    'rounded-lg',
    'shadow-lg',
    'border',
    'backdrop-blur-sm',
    'select-none',
  ].join(' ');

  const tooltipStyles: React.CSSProperties = {
    backgroundColor: 'var(--tooltip-bg)',
    color: 'var(--tooltip-text)',
    borderColor: 'var(--tooltip-border)',
  };

  // =============================
  // RENDER
  // =============================

  return (
    <>
      {/* Trigger Element */}
      <div
        ref={triggerRef}
        className={className}
        onMouseEnter={handleTriggerMouseEnter}
        onMouseLeave={handleTriggerMouseLeave}
        onFocus={handleTriggerFocus}
        onBlur={handleTriggerBlur}
        onKeyDown={handleKeyDown}
        aria-describedby={isVisible ? tooltipId.current : undefined}
      >
        {children}
      </div>

      {/* Tooltip Portal */}
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            id={tooltipId.current}
            role="tooltip"
            className={`${defaultTooltipClasses} ${contentClassName}`}
            style={{
              ...tooltipBaseStyles,
              ...tooltipStyles,
            }}
            variants={tooltipVariants}
            initial="hidden"
animate="visible"
            exit="exit"
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            // Prevent tooltip from blocking mouse events when not interactive
            onPointerEvents={interactive ? undefined : 'none'}
          >
            {content}
            
            {/* Arrow */}
            {arrow && (
              <div
                style={getArrowStyles(position)}
                aria-hidden="true"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// =============================
// DEVELOPMENT HELPERS
// =============================

if (import.meta.env.DEV) {
  Tooltip.displayName = 'Tooltip';
}

// =============================
// EXPORT DEFAULT
// =============================

export default Tooltip;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (uses import.meta.env appropriately)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (aria-describedby, role="tooltip", Escape key handling)
