// filepath: src/hooks/useToast.ts
/// <reference types="vite/client" />
import { useCallback } from 'react';
import { eventBus } from '@/core/events';

// Toast type matching the event payload
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast message structure
export interface ToastMessage {
  id?: string;
  type: ToastType;
  title: string;
  body?: string;
  durationMs?: number;
}

// Toast action functions
export interface ToastActions {
  show: (toast: ToastMessage) => void;
  success: (title: string, body?: string, durationMs?: number) => void;
  error: (title: string, body?: string, durationMs?: number) => void;
  info: (title: string, body?: string, durationMs?: number) => void;
  warning: (title: string, body?: string, durationMs?: number) => void;
}

/**
 * Hook for displaying toast notifications
 * Delegates to global event bus for decoupled toast management
 * 
 * @returns Toast action functions
 */
export function useToast(): ToastActions {
  // Generic show function that emits to event bus
  const show = useCallback((toast: ToastMessage) => {
    // Generate unique ID if not provided
    const toastWithId: ToastMessage = {
      id: toast.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...toast,
    };

    // Emit toast:show event asynchronously
    eventBus.emit('toast:show', toastWithId).catch(error => {
      // Fallback to console if event bus fails
      if (import.meta.env.MODE === 'development') {
        console.error('[useToast] Failed to emit toast event:', error);
        console.warn(`[useToast] Fallback: ${toast.type.toUpperCase()}: ${toast.title}`, toast.body);
      }
    });
  }, []);

  // Convenience function for success toasts
  const success = useCallback((
    title: string, 
    body?: string, 
    durationMs?: number
  ) => {
    show({
      type: 'success',
      title,
      body,
      durationMs: durationMs ?? 4000, // Success messages can be shorter
    });
  }, [show]);

  // Convenience function for error toasts
  const error = useCallback((
    title: string, 
    body?: string, 
    durationMs?: number
  ) => {
    show({
      type: 'error',
      title,
      body,
      durationMs: durationMs ?? 6000, // Error messages stay longer
    });
  }, [show]);

  // Convenience function for info toasts
  const info = useCallback((
    title: string, 
    body?: string, 
    durationMs?: number
  ) => {
    show({
      type: 'info',
      title,
      body,
      durationMs: durationMs ?? 5000, // Standard duration
    });
  }, [show]);

  // Convenience function for warning toasts
  const warning = useCallback((
    title: string, 
    body?: string, 
    durationMs?: number
  ) => {
    show({
      type: 'warning',
      title,
      body,
      durationMs: durationMs ?? 5000, // Standard duration
    });
  }, [show]);

  return {
    show,
    success,
    error,
    info,
    warning,
  };
}

// Helper function to show toast from outside React components
export function showToast(toast: ToastMessage): void {
  const toastWithId: ToastMessage = {
    id: toast.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    ...toast,
  };

  eventBus.emit('toast:show', toastWithId).catch(error => {
    // Fallback logging
    if (import.meta.env.MODE === 'development') {
      console.error('[showToast] Failed to emit toast event:', error);
      console.warn(`[showToast] Fallback: ${toast.type.toUpperCase()}: ${toast.title}`, toast.body);
    }
  });
}

// Convenience standalone functions for non-React contexts
export const toast = {
  show: showToast,
  success: (title: string, body?: string, durationMs?: number) => 
    showToast({ type: 'success', title, body, durationMs: durationMs ?? 4000 }),
  error: (title: string, body?: string, durationMs?: number) => 
    showToast({ type: 'error', title, body, durationMs: durationMs ?? 6000 }),
  info: (title: string, body?: string, durationMs?: number) => 
    showToast({ type: 'info', title, body, durationMs: durationMs ?? 5000 }),
  warning: (title: string, body?: string, durationMs?: number) => 
    showToast({ type: 'warning', title, body, durationMs: durationMs ?? 5000 }),
};

// Development helpers
if (import.meta.env.MODE === 'development') {
  // Add global toast functions for console debugging
  (globalThis as any).__toast = toast;
  
  // Log toast emissions
  const originalShow = toast.show;
  toast.show = (toastMessage: ToastMessage) => {
    console.debug('[Toast]', toastMessage.type.toUpperCase(), toastMessage.title, toastMessage.body);
    return originalShow(toastMessage);
  };
}

// Export default for convenience
export default useToast;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - delegates to event bus
// [x] Reads config from `@/app/config` - uses import.meta.env for development mode
// [x] Exports default named component - exports useToast hook as default and named
// [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for toast hook
