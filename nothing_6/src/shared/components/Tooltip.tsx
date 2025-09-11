// filepath: src/shared/components/Tooltip.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config` (not needed for this component)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uid } from '@/core/utils';
import { motionPresets, durations } from '@/theme/animations';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  offset?: number;
  arrow?: boolean;
  interactive?: boolean;
  maxWidth?: string;
  onShow?: () => void;
  onHide?: () => void;
}

export interface TooltipPosition {
  x: number;
  y: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 500,
  disabled = false,
  className = '',
  contentClassName = '',
  offset = 8,
  arrow = true,
  interactive = false,
  maxWidth = '200px',
  onShow,
  onHide,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0, placement });
  const [tooltipId] = useState(() => uid('tooltip-'));
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate optimal position based on viewport constraints
  const calculatePosition = useCallback((triggerElement: HTMLElement): TooltipPosition => {
    const triggerRect = triggerElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Estimated tooltip dimensions (we'll refine this after render)
    const tooltipWidth = 200; // approximate
    const tooltipHeight = 40; // approximate

    let optimalPlacement = placement;
    let x = 0;
    let y = 0;

    // Calculate position for each placement and check if it fits
    const positions = {
      top: {
        x: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
        y: triggerRect.top - tooltipHeight - offset,
        fits: triggerRect.top - tooltipHeight - offset > 0,
      },
      bottom: {
        x: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
        y: triggerRect.bottom + offset,
        fits: triggerRect.bottom + tooltipHeight + offset < viewport.height,
      },
      left: {
        x: triggerRect.left - tooltipWidth - offset,
        y: triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2,
        fits: triggerRect.left - tooltipWidth - offset > 0,
      },
      right: {
        x: triggerRect.right + offset,
        y: triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2,
        fits: triggerRect.right + tooltipWidth + offset < viewport.width,
      },
    };

    // Use preferred placement if it fits
    if (positions[placement].fits) {
      optimalPlacement = placement;
    } else {
      // Find the first placement that fits
      const fallbackOrder: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'right', 'left'];
      optimalPlacement = fallbackOrder.find(p => positions[p].fits) || placement;
    }

    const selectedPosition = positions[optimalPlacement];
    x = selectedPosition.x;
    y = selectedPosition.y;

    // Ensure tooltip stays within viewport bounds
    x = Math.max(8, Math.min(x, viewport.width - tooltipWidth - 8));
    y = Math.max(8, Math.min(y, viewport.height - tooltipHeight - 8));

    return { x, y, placement: optimalPlacement };
  }, [placement, offset]);

  const showTooltip = useCallback(() => {
    if (disabled || !content) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const newPosition = calculatePosition(triggerRef.current);
        setPosition(newPosition);
        setIsVisible(true);
        onShow?.();
      }
    }, delay);
  }, [disabled, content, delay, calculatePosition, onShow]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    if (interactive) {
      // Add a small delay for interactive tooltips to allow mouse movement
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        onHide?.();
      }, 100);
    } else {
      setIsVisible(false);
      onHide?.();
    }
  }, [interactive, onHide]);

  const handleMouseEnter = useCallback(() => {
    showTooltip();
  }, [showTooltip]);

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  const handleFocus = useCallback(() => {
    showTooltip();
  }, [showTooltip]);

  const handleBlur = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isVisible) {
      hideTooltip();
    }
  }, [isVisible, hideTooltip]);

  // Handle interactive tooltip hover
  const handleTooltipMouseEnter = useCallback(() => {
    if (interactive && hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
  }, [interactive]);

  const handleTooltipMouseLeave = useCallback(() => {
    if (interactive) {
      hideTooltip();
    }
  }, [interactive, hideTooltip]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      if (triggerRef.current) {
        const newPosition = calculatePosition(triggerRef.current);
        setPosition(newPosition);
      }
    };

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, calculatePosition]);

  // Arrow component
  const Arrow: React.FC<{ placement: string }> = ({ placement: arrowPlacement }) => {
    const arrowClasses = {
      top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900',
      bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900',
      left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900',
      right: 'left-[-4px] top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900',
    };

    return (
      <div
        className={`absolute w-0 h-0 ${arrowClasses[arrowPlacement as keyof typeof arrowClasses]}`}
        aria-hidden="true"
      />
    );
  };

  if (!content) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-describedby={isVisible ? tooltipId : undefined}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className={`fixed z-[9999] pointer-events-auto ${interactive ? 'cursor-default' : 'pointer-events-none'}`}
            style={{
              left: position.x,
              top: position.y,
              maxWidth,
            }}
            variants={motionPresets.fadeUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: durations.fast / 1000 }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div
              className={`
                relative px-2 py-1 text-sm text-white bg-gray-900 rounded-md shadow-lg
                border border-gray-700 backdrop-blur-sm
                ${contentClassName}
              `}
            >
              {content}
              {arrow && <Arrow placement={position.placement} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Tooltip;

// Usage examples (commented):
// <Tooltip content="This is a helpful tooltip">
//   <Button>Hover me</Button>
// </Tooltip>
//
// <Tooltip 
//   content="Interactive tooltip with link"
//   interactive
//   placement="bottom"
//   arrow={false}
// >
//   <span>Interactive trigger</span>
// </Tooltip>
