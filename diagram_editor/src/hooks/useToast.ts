// filepath: src/hooks/useToast.ts

import { useContext, useCallback } from 'react';
import { publishEvent } from '@/core/events';

// Toast context interface that should be provided by ToastProvider
interface ToastContextType {
  show: (toast: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

// Toast options interface
export interface ToastOptions {
  id?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  autoDismiss?: number; // milliseconds
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Create a React context for toast provider
// This will be set by ToastProvider.tsx
const ToastContext = React.createContext<ToastContextType | null>(null);

export { ToastContext };

// Toast hook interface
export interface UseToastReturn {
  show: (options: ToastOptions) => string;
  success: (message: string, options?: Partial<ToastOptions>) => string;
  error: (message: string, options?: Partial<ToastOptions>) => string;
  info: (message: string, options?: Partial<ToastOptions>) => string;
  warning: (message: string, options?: Partial<ToastOptions>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

/**
 * Hook that exposes toast controls (show, success, error) that internally use 
 * the ToastProvider or event bus if outside provider scope.
 */
export function useToast(): UseToastReturn {
  const context = useContext(ToastContext);

  // Helper to generate unique toast ID
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Show toast - uses context if available, falls back to event bus
  const show = useCallback((options: ToastOptions): string => {
    const id = options.id || generateId();
    const toastPayload = {
      id,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      autoDismiss: options.autoDismiss,
      persistent: options.persistent,
      action: options.action,
    };

    if (context) {
      // Use ToastProvider context if available
      return context.show(toastPayload);
    } else {
      // Fall back to event bus for components outside provider scope
      publishEvent('toast:show', toastPayload);
      return id;
    }
  }, [context, generateId]);

  // Convenience method for success toasts
  const success = useCallback((message: string, options: Partial<ToastOptions> = {}): string => {
    return show({
      ...options,
      type: 'success',
      message,
    });
  }, [show]);

  // Convenience method for error toasts
  const error = useCallback((message: string, options: Partial<ToastOptions> = {}): string => {
    return show({
      ...options,
      type: 'error',
      message,
      persistent: options.persistent !== false, // Errors are persistent by default
    });
  }, [show]);

  // Convenience method for info toasts
  const info = useCallback((message: string, options: Partial<ToastOptions> = {}): string => {
    return show({
      ...options,
      type: 'info',
      message,
    });
  }, [show]);

  // Convenience method for warning toasts
  const warning = useCallback((message: string, options: Partial<ToastOptions> = {}): string => {
    return show({
      ...options,
      type: 'warning',
      message,
    });
  }, [show]);

  // Dismiss specific toast
  const dismiss = useCallback((id: string): void => {
    if (context) {
      context.dismiss(id);
    } else {
      // Fall back to event bus
      publishEvent('toast:dismiss', { id });
    }
  }, [context]);

  // Clear all toasts
  const clear = useCallback((): void => {
    if (context) {
      context.clear();
    } else {
      // Fall back to event bus
      publishEvent('toast:clear', {});
    }
  }, [context]);

  return {
    show,
    success,
    error,
    info,
    warning,
    dismiss,
    clear,
  };
}

// Additional utility hooks for common toast patterns

/**
 * Hook for handling async operations with automatic toast feedback
 */
export function useAsyncToast() {
  const toast = useToast();

  const executeWithToast = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: {
      loading?: string;
      success?: string | ((result: T) => string);
      error?: string | ((error: any) => string);
    } = {}
  ): Promise<T> => {
    const loadingToastId = options.loading ? toast.info(options.loading, { persistent: true }) : null;

    try {
      const result = await asyncFn();
      
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      
      if (options.success) {
        const message = typeof options.success === 'function' 
          ? options.success(result) 
          : options.success;
        toast.success(message);
      }
      
      return result;
    } catch (error) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      
      if (options.error) {
        const message = typeof options.error === 'function' 
          ? options.error(error) 
          : options.error;
        toast.error(message);
      } else {
        // Default error message
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        toast.error(errorMessage);
      }
      
      throw error;
    }
  }, [toast]);

  return {
    ...toast,
    executeWithToast,
  };
}

/**
 * Hook for form validation toast feedback
 */
export function useFormToast() {
  const toast = useToast();

  const showValidationErrors = useCallback((errors: Record<string, string>): void => {
    const errorMessages = Object.values(errors);
    if (errorMessages.length > 0) {
      const message = errorMessages.length === 1 
        ? errorMessages[0]
        : `Please fix ${errorMessages.length} validation errors`;
      
      toast.error(message, {
        title: 'Form Validation',
        persistent: true,
      });
    }
  }, [toast]);

  const showSaveSuccess = useCallback((entityName = 'Item'): void => {
    toast.success(`${entityName} saved successfully`);
  }, [toast]);

  const showDeleteSuccess = useCallback((entityName = 'Item'): void => {
    toast.success(`${entityName} deleted successfully`);
  }, [toast]);

  return {
    ...toast,
    showValidationErrors,
    showSaveSuccess,
    showDeleteSuccess,
  };
}

// Export types for use in other files
export type { ToastContextType };

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not needed for this hook)
// [x] Exports default named component (exports useToast hook)
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for this hook, handled by Toast component
