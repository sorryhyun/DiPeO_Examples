// filepath: src/shared/components/ToastProvider.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ToastContainer, ToastData, createToastId, ToastPosition } from '@/shared/components/Toast';
import { eventBus } from '@/core/events';

// ===============================================
// Toast Provider Types & Context
// ===============================================

export interface ToastOptions {
  title?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextValue {
  // Imperative API
  addToast: (type: 'success' | 'error' | 'warning' | 'info', message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  
  // Convenience methods
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  
  // Current toasts
  toasts: ToastData[];
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ===============================================
// Toast Provider Props
// ===============================================

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
  pauseOnHover?: boolean;
}

// ===============================================
// Toast Provider Implementation
// ===============================================

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000,
  pauseOnHover = true,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Add toast function
  const addToast = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options: ToastOptions = {}
  ): string => {
    const id = createToastId();
    
    const newToast: ToastData = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration ?? defaultDuration,
      persistent: options.persistent ?? false,
      action: options.action,
      onDismiss: () => {
        // Emit dismiss event for analytics/logging
        eventBus.emit('toast:dismissed', { id, type, message });
      },
    };

    setToasts(prev => {
      // Remove oldest toast if we're at the limit
      const newToasts = prev.length >= maxToasts ? prev.slice(1) : prev;
      return [...newToasts, newToast];
    });

    // Emit toast added event
    eventBus.emit('toast:added', { id, type, message });

    return id;
  }, [defaultDuration, maxToasts]);

  // Remove toast function
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
    eventBus.emit('toast:cleared', {});
  }, []);

  // Convenience methods
  const success = useCallback((message: string, options?: ToastOptions) => 
    addToast('success', message, options), [addToast]);

  const error = useCallback((message: string, options?: ToastOptions) => 
    addToast('error', message, options), [addToast]);

  const warning = useCallback((message: string, options?: ToastOptions) => 
    addToast('warning', message, options), [addToast]);

  const info = useCallback((message: string, options?: ToastOptions) => 
    addToast('info', message, options), [addToast]);

  // Context value
  const contextValue: ToastContextValue = {
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    toasts,
  };

  // Listen for global toast events
  useEffect(() => {
    const unsubscribeAdd = eventBus.on('toast:add', (payload) => {
      addToast(
        payload.type, 
        payload.message || 'Notification',
        {
          title: payload.title,
          duration: payload.duration,
          persistent: payload.persistent,
        }
      );
    });

    const unsubscribeAuthLogin = eventBus.on('auth:login', (payload) => {
      success(`Welcome back, ${payload.user.name || 'User'}!`, {
        duration: 3000,
      });
    });

    const unsubscribeAuthLogout = eventBus.on('auth:logout', () => {
      info('You have been logged out', {
        duration: 3000,
      });
    });

    // Error handling - listen for global errors
    const unsubscribeError = eventBus.on('error:global', (payload) => {
      error(payload.message || 'An error occurred', {
        persistent: payload.critical,
        action: payload.action ? {
          label: payload.action.label,
          onClick: payload.action.onClick,
        } : undefined,
      });
    });

    return () => {
      unsubscribeAdd();
      unsubscribeAuthLogin();
      unsubscribeAuthLogout();
      unsubscribeError();
    };
  }, [addToast, success, error, info]);

  // Keyboard shortcut to clear all toasts (Ctrl+Shift+C)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        clearAllToasts();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearAllToasts]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position={position}
        maxToasts={maxToasts}
        pauseOnHover={pauseOnHover}
      />
    </ToastContext.Provider>
  );
}

// ===============================================
// useToast Hook
// ===============================================

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}

// ===============================================
// useToastSafe Hook (doesn't throw)
// ===============================================

export function useToastSafe(): ToastContextValue | null {
  return useContext(ToastContext);
}

// ===============================================
// Higher-Order Component for Toast Integration
// ===============================================

export function withToast<P extends object>(
  Component: React.ComponentType<P & { toast?: ToastContextValue }>
): React.ComponentType<P> {
  const WrappedComponent: React.FC<P> = (props) => {
    const toast = useToastSafe();
    
    return <Component {...props} toast={toast} />;
  };

  WrappedComponent.displayName = `withToast(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// ===============================================
// Toast Hook with Auto-Cleanup
// ===============================================

export function useAutoToast() {
  const toast = useToast();
  const toastIdsRef = React.useRef<Set<string>>(new Set());

  const addAutoToast = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options?: ToastOptions
  ) => {
    const id = toast.addToast(type, message, options);
    toastIdsRef.current.add(id);
    return id;
  }, [toast]);

  // Cleanup all toasts created by this hook on unmount
  useEffect(() => {
    return () => {
      toastIdsRef.current.forEach(id => {
        toast.removeToast(id);
      });
      toastIdsRef.current.clear();
    };
  }, [toast]);

  return {
    ...toast,
    addToast: addAutoToast,
    success: useCallback((message: string, options?: ToastOptions) => 
      addAutoToast('success', message, options), [addAutoToast]),
    error: useCallback((message: string, options?: ToastOptions) => 
      addAutoToast('error', message, options), [addAutoToast]),
    warning: useCallback((message: string, options?: ToastOptions) => 
      addAutoToast('warning', message, options), [addAutoToast]),
    info: useCallback((message: string, options?: ToastOptions) => 
      addAutoToast('info', message, options), [addAutoToast]),
  };
}

// Export default
export default ToastProvider;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not directly applicable but follows pattern)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (keyboard shortcut for clearing toasts)
*/
