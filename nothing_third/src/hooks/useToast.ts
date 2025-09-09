// filepath: src/hooks/useToast.ts
import { useCallback } from 'react';
import { eventBus } from '@/core/events';
import { generateId } from '@/core/utils';

export interface ToastOptions {
  id?: string;
  title: string;
  body?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  durationMs?: number;
}

export interface UseToastResult {
  show: (options: ToastOptions) => string;
  showSuccess: (title: string, body?: string) => string;
  showError: (title: string, body?: string) => string;
  showInfo: (title: string, body?: string) => string;
  showWarning: (title: string, body?: string) => string;
  dismiss: (id: string) => void;
}

/**
 * Hook for displaying toast notifications via the global event bus.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const toast = useToast();
 *   
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       toast.showSuccess('Data saved successfully');
 *     } catch (error) {
 *       toast.showError('Failed to save data', error.message);
 *     }
 *   };
 *   
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export function useToast(): UseToastResult {
  const show = useCallback((options: ToastOptions): string => {
    const id = options.id ?? generateId('toast');
    
    // Emit toast event via global event bus
    eventBus.emit('toast:show', {
      id,
      type: options.type ?? 'info',
      title: options.title,
      body: options.body,
      durationMs: options.durationMs
    });
    
    return id;
  }, []);

  const showSuccess = useCallback((title: string, body?: string): string => {
    return show({
      type: 'success',
      title,
      body
    });
  }, [show]);

  const showError = useCallback((title: string, body?: string): string => {
    return show({
      type: 'error',
      title,
      body,
      durationMs: 6000 // Errors stay longer
    });
  }, [show]);

  const showInfo = useCallback((title: string, body?: string): string => {
    return show({
      type: 'info',
      title,
      body
    });
  }, [show]);

  const showWarning = useCallback((title: string, body?: string): string => {
    return show({
      type: 'warning',
      title,
      body
    });
  }, [show]);

  const dismiss = useCallback((id: string): void => {
    // For dismissal, we could emit a dismiss event if ToastProvider supports it
    // For now, this is a placeholder for future implementation
    console.debug('Toast dismiss requested for id:', id);
  }, []);

  return {
    show,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismiss
  };
}

// Export alias for convenience
export const useNotification = useToast;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/events and @/core/utils)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - delegates to event bus
- [x] Reads config from `@/app/config` (N/A for toast hook)
- [x] Exports default named component (exports useToast function and types)
- [x] Adds basic ARIA and keyboard handlers (N/A for hook, ARIA handled by ToastProvider)
*/
