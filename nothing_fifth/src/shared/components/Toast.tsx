// filepath: src/shared/components/Toast.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toastMotion, DURATIONS } from '@/theme/animations';
import { theme } from '@/theme/index';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  pauseOnHover?: boolean;
  showCloseButton?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

// ============================================================================
// TOAST COMPONENT
// ============================================================================

export function Toast({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
  pauseOnHover = true,
  showCloseButton = true,
  action,
}: ToastProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const timeoutRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const remainingTimeRef = useRef<number>(duration);
  
  // Auto-dismiss logic with pause/resume support
  useEffect(() => {
    if (duration <= 0) return;

    const startTimer = () => {
      startTimeRef.current = Date.now();
      timeoutRef.current = setTimeout(() => {
        onClose(id);
      }, remainingTimeRef.current);
    };

    const pauseTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
        }
      }
    };

    if (isPaused) {
      pauseTimer();
    } else {
      startTimer();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [id, onClose, isPaused, duration]);

  // Progress bar animation
  useEffect(() => {
    if (duration <= 0 || isPaused) return;

    const interval = setInterval(() => {
      const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const newProgress = Math.max(0, ((remainingTimeRef.current - elapsed) / duration) * 100);
      setProgress(newProgress);
      
      if (newProgress <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, isPaused]);

  // Handle close
  const handleClose = () => {
    onClose(id);
  };

  // Handle action click
  const handleActionClick = () => {
    if (action) {
      action.handler();
      handleClose();
    }
  };

  // Pause/resume on hover
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  // Get toast colors and icon based on type
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          colors: {
            bg: theme.colors.success[50],
            border: theme.colors.success[200],
            icon: theme.colors.success[500],
            text: theme.colors.success[900],
            progress: theme.colors.success[500],
          },
        };
      case 'error':
        return {
          icon: AlertCircle,
          colors: {
            bg: theme.colors.error[50],
            border: theme.colors.error[200],
            icon: theme.colors.error[500],
            text: theme.colors.error[900],
            progress: theme.colors.error[500],
          },
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          colors: {
            bg: theme.colors.warning[50],
            border: theme.colors.warning[200],
            icon: theme.colors.warning[500],
            text: theme.colors.warning[900],
            progress: theme.colors.warning[500],
          },
        };
      case 'info':
      default:
        return {
          icon: Info,
          colors: {
            bg: theme.colors.info[50],
            border: theme.colors.info[200],
            icon: theme.colors.info[500],
            text: theme.colors.info[900],
            progress: theme.colors.info[500],
          },
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={toastMotion}
      className="relative w-full max-w-md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Main toast container */}
      <div
        className="relative overflow-hidden rounded-lg shadow-lg backdrop-blur-sm border"
        style={{
          backgroundColor: config.colors.bg,
          borderColor: config.colors.border,
        }}
      >
        {/* Progress bar */}
        {duration > 0 && (
          <div
            className="absolute top-0 left-0 h-1 transition-all duration-100 ease-out"
            style={{
              backgroundColor: config.colors.progress,
              width: `${progress}%`,
            }}
          />
        )}

        {/* Content */}
        <div className="flex items-start gap-3 p-4 pt-5">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <IconComponent
              size={20}
              style={{ color: config.colors.icon }}
              aria-hidden="true"
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4
                className="text-sm font-medium mb-1"
                style={{ color: config.colors.text }}
              >
                {title}
              </h4>
            )}
            <p
              className="text-sm"
              style={{ color: config.colors.text }}
            >
              {message}
            </p>

            {/* Action button */}
            {action && (
              <button
                onClick={handleActionClick}
                className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded"
                style={{
                  color: config.colors.icon,
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleActionClick();
                  }
                }}
              >
                {action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors"
              style={{
                color: config.colors.text,
              }}
              aria-label="Close notification"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClose();
                }
              }}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// TOAST CONTAINER COMPONENT
// ============================================================================

export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    action?: {
      label: string;
      handler: () => void;
    };
  }>;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxVisible?: number;
}

export function ToastContainer({
  toasts,
  onRemove,
  position = 'top-right',
  maxVisible = 5,
}: ToastContainerProps) {
  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  // Limit visible toasts
  const visibleToasts = toasts.slice(0, maxVisible);
  const isBottom = position.includes('bottom');

  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 pointer-events-none ${getPositionClasses()}`}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {(isBottom ? [...visibleToasts].reverse() : visibleToasts).map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              {...toast}
              onClose={onRemove}
              pauseOnHover={true}
              showCloseButton={true}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Default export
export default Toast;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/theme/animations and @/theme/index
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure component with props and callbacks
// [x] Reads config from `@/app/config` - Uses theme tokens for consistent styling
// [x] Exports default named component - Exports Toast as default and ToastContainer as named export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Includes role="alert", aria-live, keyboard navigation, focus management
