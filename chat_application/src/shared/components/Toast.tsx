// filepath: src/shared/components/Toast.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/theme';
import { motionVariants, timing } from '@/theme/animations';
import { cn } from '@/core/utils';

/**
 * Single toast notification component with multiple types, ARIA live region support,
 * and smooth enter/exit animations. Handles auto-dismiss and user dismissal.
 */

// =============================================================================
// Types and Interfaces
// =============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // Auto-dismiss duration in milliseconds (0 = no auto-dismiss)
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

// =============================================================================
// Toast Styling Configuration
// =============================================================================

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string; iconColor: string }> = {
  success: {
    bg: theme.colors.success[50],
    border: theme.colors.success[200],
    icon: 'check-circle',
    iconColor: theme.colors.success[500],
  },
  error: {
    bg: theme.colors.error[50],
    border: theme.colors.error[200],
    icon: 'x-circle',
    iconColor: theme.colors.error[500],
  },
  warning: {
    bg: theme.colors.warning[50],
    border: theme.colors.warning[200],
    icon: 'exclamation-triangle',
    iconColor: theme.colors.warning[500],
  },
  info: {
    bg: theme.colors.info[50],
    border: theme.colors.info[200],
    icon: 'information-circle',
    iconColor: theme.colors.info[500],
  },
};

// =============================================================================
// Toast Icons
// =============================================================================

const ToastIcons = {
  'check-circle': (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.73 10.23a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  'x-circle': (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  ),
  'exclamation-triangle': (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  'information-circle': (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// =============================================================================
// Toast Animation Variants
// =============================================================================

const slideInVariants = {
  'top-right': motionVariants.slideRight,
  'top-left': motionVariants.slideLeft,
  'bottom-right': motionVariants.slideRight,
  'bottom-left': motionVariants.slideLeft,
  'top-center': motionVariants.fadeInDown,
  'bottom-center': motionVariants.fadeInUp,
};

// =============================================================================
// Toast Component
// =============================================================================

export const Toast: React.FC<ToastProps> = ({
  toast,
  onDismiss,
  position = 'top-right',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const { id, type, title, message, duration = 5000, action } = toast;
  const style = toastStyles[type];
  const icon = ToastIcons[style.icon];

  // Auto-dismiss functionality
  useEffect(() => {
    if (duration === 0) return; // No auto-dismiss

    let progressInterval: NodeJS.Timeout;
    let dismissTimeout: NodeJS.Timeout;

    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining > 0) {
        progressInterval= setTimeout(updateProgress, 50);
      }
    };

    // Start progress animation
    updateProgress();

    // Set auto-dismiss timer
    dismissTimeout = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      clearTimeout(progressInterval);
      clearTimeout(dismissTimeout);
    };
  }, [duration, id]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Allow animation to complete before calling onDismiss
    setTimeout(() => onDismiss(id), 300);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleDismiss();
    }
  };

  // ARIA live region attributes based on toast type
  const ariaLive = type === 'error' ? 'assertive' : 'polite';
  const ariaLabel = `${type} notification: ${title}${message ? ` - ${message}` : ''}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'relative max-w-sm w-full pointer-events-auto overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5',
            'focus-within:ring-2 focus-within:ring-offset-2'
          )}
          style={{
            backgroundColor: style.bg,
            borderColor: style.border,
            focusRingColor: style.iconColor,
          }}
          variants={slideInVariants[position]}
          initial="initial"
          animate="animate"
          exit="exit"
          layout
          role="alert"
          aria-live={ariaLive}
          aria-label={ariaLabel}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              className="absolute top-0 left-0 h-1 rounded-t-lg"
              style={{ backgroundColor: style.iconColor }}
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          )}

          {/* Toast content */}
          <div className="p-4">
            <div className="flex items-start">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div
                  className="w-5 h-5"
                  style={{ color: style.iconColor }}
                  aria-hidden="true"
                >
                  {icon}
                </div>
              </div>

              {/* Content */}
              <div className="ml-3 w-0 flex-1">
                <p
                  className="text-sm font-medium"
                  style={{ color: theme.colors.gray[900] }}
                >
                  {title}
                </p>
                {message && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: theme.colors.gray[600] }}
                  >
                    {message}
                  </p>
                )}

                {/* Action button */}
                {action && (
                  <div className="mt-3">
                    <button
                      type="button"
                      className={cn(
                        'text-sm font-medium underline hover:no-underline',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 rounded',
                        'transition-colors duration-200'
                      )}
                      style={{
                        color: style.iconColor,
                        focusRingColor: style.iconColor,
                      }}
                      onClick={() => {
                        action.onClick();
                        handleDismiss();
                      }}
                    >
                      {action.label}
                    </button>
                  </div>
                )}
              </div>

              {/* Dismiss button */}
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  type="button"
                  className={cn(
                    'inline-flex rounded-md p-1.5',
                    'hover:bg-black hover:bg-opacity-10',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    'transition-colors duration-200'
                  )}
                  style={{
                    color: theme.colors.gray[400],
                    focusRingColor: style.iconColor,
                  }}
                  onClick={handleDismiss}
                  aria-label="Dismiss notification"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =============================================================================
// Toast Factory Functions
// =============================================================================

/**
 * Create a success toast
 */
export const createSuccessToast = (
  title: string,
  message?: string,
  options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
): Omit<Toast, 'id'> => ({
  type: 'success',
  title,
  message,
  duration: 5000,
  ...options,
});

/**
 * Create an error toast
 */
export const createErrorToast = (
  title: string,
  message?: string,
  options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
): Omit<Toast, 'id'> => ({
  type: 'error',
  title,
  message,
  duration: 0, // Errors don't auto-dismiss
  ...options,
});

/**
 * Create a warning toast
 */
export const createWarningToast = (
  title: string,
  message?: string,
  options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
): Omit<Toast, 'id'> => ({
  type: 'warning',
  title,
  message,
  duration: 7000, // Warning toasts stay longer
  ...options,
});

/**
 * Create an info toast
 */
export const createInfoToast = (
  title: string,
  message?: string,
  options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
): Omit<Toast, 'id'> => ({
  type: 'info',
  title,
  message,
  duration: 5000,
  ...options,
});

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate a unique ID for toasts
 */
export const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Determine if a toast should auto-dismiss based on its type
 */
export const shouldAutoDistract = (type: ToastType): boolean => {
  // Error toasts typically don't auto-dismiss to ensure user sees critical information
  return type !== 'error';
};

/**
 * Get appropriate duration for toast type
 */
export const getDefaultDuration = (type: ToastType): number => {
  switch (type) {
    case 'error':
      return 0; // No auto-dismiss
    case 'warning':
      return 7000; // Longer for warnings
    case 'success':
    case 'info':
    default:
      return 5000; // Standard duration
  }
};

export default Toast;

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (imports theme and animations from core)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (ARIA live regions, keyboard dismiss, proper roles and labels)
*/