// filepath: src/shared/components/Toast.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/core/utils';
import { tokens } from '@/theme/index';
import { toastSlideIn, toastStack } from '@/theme/animations';

// ===============================================
// Toast Component Types & Props
// ===============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastData {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export interface ToastProps extends ToastData {
  onClose: (id: string) => void;
  pauseOnHover?: boolean;
  position?: ToastPosition;
}

// ===============================================
// Toast Type Configurations
// ===============================================

const toastTypeConfig = {
  success: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    colors: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-700/50',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-800 dark:text-green-300',
      message: 'text-green-700 dark:text-green-400',
      closeButton: 'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300',
    },
  },
  error: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    colors: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-700/50',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-800 dark:text-red-300',
      message: 'text-red-700 dark:text-red-400',
      closeButton: 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300',
    },
  },
  warning: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    colors: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-700/50',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-300',
      message: 'text-yellow-700 dark:text-yellow-400',
      closeButton: 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300',
    },
  },
  info: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    colors: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-700/50',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-300',
      message: 'text-blue-700 dark:text-blue-400',
      closeButton: 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300',
    },
  },
} as const;

// ===============================================
// Progress Bar Component
// ===============================================

const ProgressBar: React.FC<{
  duration: number;
  isPaused: boolean;
  onComplete: () => void;
}> = ({ duration, isPaused, onComplete }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pauseTimeRef = useRef<number>(0);
  const animationRef = useRef<number>();

  const updateProgress = useCallback(() => {
    if (!progressRef.current) return;

    const now = Date.now();
    const elapsed = now - startTimeRef.current - pauseTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    progressRef.current.style.transform = `scaleX(${1 - progress})`;

    if (progress >= 1) {
      onComplete();
    } else if (!isPaused) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [duration, isPaused, onComplete]);

  useEffect(() => {
    if (duration <= 0) return;

    if (isPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      const pauseStart = pauseTimeRef.current;
      if (pauseStart > 0) {
        pauseTimeRef.current += Date.now() - pauseStart;
      }
      animationRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, updateProgress, duration]);

  useEffect(() => {
    if (isPaused && pauseTimeRef.current === 0) {
      pauseTimeRef.current = Date.now();
    }
  }, [isPaused]);

  if (duration <= 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 overflow-hidden rounded-b-lg">
      <div
        ref={progressRef}
        className="h-full bg-current opacity-50 transform-gpu origin-left transition-transform"
        style={{ transform: 'scaleX(1)' }}
      />
    </div>
  );
};

// ===============================================
// Main Toast Component
// ===============================================

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  persistent = false,
  action,
  onDismiss,
  onClose,
  pauseOnHover = true,
}) => {
  const [isPaused, setIsPaused] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const config = toastTypeConfig[type];

  // Handle auto-dismiss
  useEffect(() => {
    if (persistent || duration <= 0) return;

    const handleDismiss = () => {
      onDismiss?.();
      onClose(id);
    };

    if (isPaused) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      timeoutRef.current = setTimeout(handleDismiss, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [id, duration, persistent, isPaused, onDismiss, onClose]);

  // Handle hover pause
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsHovered(true);
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsHovered(false);
      setIsPaused(false);
    }
  };

  // Handle manual close
  const handleClose = () => {
    onDismiss?.();
    onClose(id);
  };

  // Handle action click
  const handleActionClick = () => {
    action?.onClick();
    handleClose();
  };

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
    
    if (event.key === 'Enter' || event.key === ' ') {
      if (action) {
        event.preventDefault();
        handleActionClick();
      }
    }
  };

  return (
    <motion.div
      layout
      className={cn(
        // Base styles
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'backdrop-blur-sm max-w-md w-full',
        
        // Type-specific colors
        config.colors.bg,
        config.colors.border,
        
        // Interactive states
        'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-current/20',
        isHovered && 'shadow-xl',
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      {...toastSlideIn}
      {...toastStack}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', config.colors.icon)}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('font-medium text-sm mb-1', config.colors.title)}>
            {title}
          </h4>
        )}
        
        <p className={cn('text-sm leading-5', config.colors.message)}>
          {message}
        </p>

        {action && (
          <div className="mt-3">
            <button
              type="button"
              className={cn(
                'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md',
                'transition-colors duration-200 focus:outline-none',
                'focus:ring-2 focus:ring-offset-2 focus:ring-current/20',
                config.colors.title,
                'bg-white/50 dark:bg-black/50 hover:bg-white/70 dark:hover:bg-black/70',
              )}
              onClick={handleActionClick}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      {/* Close Button */}
      {!persistent && (
        <button
          type="button"
          className={cn(
            'flex-shrink-0 p-1 rounded-md transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current/20',
            config.colors.closeButton,
          )}
          onClick={handleClose}
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Progress Bar */}
      {!persistent && duration > 0 && (
        <ProgressBar
          duration={duration}
          isPaused={isPaused}
          onComplete={handleClose}
        />
      )}
    </motion.div>
  );
};

// ===============================================
// Toast Container Component
// ===============================================

export interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
  position?: ToastPosition;
  pauseOnHover?: boolean;
  maxToasts?: number;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
  pauseOnHover = true,
  maxToasts = 5,
  className,
}) => {
  // Position configurations
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  // Limit number of visible toasts
  const visibleToasts = toasts.slice(0, maxToasts);

  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-3 pointer-events-none',
        positionClasses[position],
        className
      )}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              {...toast}
              onClose={onClose}
              pauseOnHover={pauseOnHover}
              position={position}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ===============================================
// Toast Utilities
// ===============================================

export const createToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createToast = (
  type: ToastType,
  message: string,
  options: Partial<Omit<ToastData, 'id' | 'type' | 'message'>> = {}
): ToastData => {
  return {
    id: createToastId(),
    type,
    message,
    duration: 5000,
    persistent: false,
    ...options,
  };
};

// Convenience toast creators
export const toastSuccess = (
  message: string,
  options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>
) => createToast('success', message, options);

export const toastError = (
  message: string,
  options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>
) => createToast('error', message, options);

export const toastWarning = (
  message: string,
  options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>
) => createToast('warning', message, options);

export const toastInfo = (
  message: string,
  options?: Partial<Omit<ToastData, 'id' | 'type' | 'message'>>
) => createToast('info', message, options);

// Export default Toast
export default Toast;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
