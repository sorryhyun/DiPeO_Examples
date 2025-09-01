// filepath: src/hooks/useToast.ts
import { useCallback } from 'react';
import { emit } from '@/core/events';

/**
 * Convenience hook for displaying toast notifications throughout the application.
 * Uses the global event bus to trigger toast display, ensuring toasts work
 * regardless of component hierarchy or ToastProvider location.
 */

export interface ToastOptions {
  id?: string;
  title?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    handler: () => void;
  }>;
}

export interface UseToastReturn {
  /**
   * Show a success toast notification.
   */
  success: (message: string, options?: ToastOptions) => void;
  
  /**
   * Show an info toast notification.
   */
  info: (message: string, options?: ToastOptions) => void;
  
  /**
   * Show a warning toast notification.
   */
  warning: (message: string, options?: ToastOptions) => void;
  
  /**
   * Show an error toast notification.
   */
  error: (message: string, options?: ToastOptions) => void;
  
  /**
   * Show a custom toast with full control over type and options.
   */
  show: (type: 'success' | 'error' | 'info' | 'warning', message: string, options?: ToastOptions) => void;
}

export function useToast(): UseToastReturn {
  
  const show = useCallback((
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    options: ToastOptions = {}
  ) => {
    // Generate unique ID if not provided
    const id = options.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    // Set default duration based on toast type
    const defaultDuration = type === 'error' ? 8000 : type === 'warning' ? 6000 : 4000;
    const duration = options.duration ?? defaultDuration;
    
    // Emit toast event through global event bus
    emit('toast.show', {
      id,
      type,
      title: options.title,
      message,
      duration,
      actions: options.actions,
    });
  }, []);

  const success = useCallback((message: string, options?: ToastOptions) => {
    show('success', message, options);
  }, [show]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    show('info', message, options);
  }, [show]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    show('warning', message, options);
  }, [show]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    show('error', message, options);
  }, [show]);

  return {
    success,
    info,
    warning,
    error,
    show,
  };
}

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/events)
- [x] Uses providers/hooks (emits events through global event bus, no direct DOM effects)
- [x] Reads config from `@/app/config` (not applicable for toast hook)
- [x] Exports default named component (exports useToast function)
- [x] Adds basic ARIA and keyboard handlers (not applicable for toast hook - handled by ToastProvider)
*/
