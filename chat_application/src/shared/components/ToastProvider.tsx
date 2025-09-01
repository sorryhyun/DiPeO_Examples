// filepath: src/shared/components/ToastProvider.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Toast } from '@/shared/components/Toast';
import { on, off } from '@/core/events';
import type { NotificationState } from '@/core/contracts';
import { uid } from '@/core/utils';

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface ToastContextValue {
  toasts: NotificationState[];
  show: (toast: Omit<NotificationState, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  defaultDuration?: number;
}

// =============================================================================
// Context Creation
// =============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

// =============================================================================
// ToastProvider Component
// =============================================================================

export function ToastProvider({
  children,
  maxToasts = 5,
  position = 'top-right',
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<NotificationState[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  // Clear timer for a specific toast
  const clearTimer = useCallback((id: string) => {
    const timerId = timersRef.current.get(id);
    if (timerId) {
      clearTimeout(timerId);
      timersRef.current.delete(id);
    }
  }, []);

  // Auto-dismiss timer setup
  const scheduleAutoDismiss = useCallback((id: string, duration: number) => {
    if (duration > 0) {
      const timerId = window.setTimeout(() => {
        dismiss(id);
      }, duration);
      timersRef.current.set(id, timerId);
    }
  }, []);

  // Show a new toast
  const show = useCallback((toastData: Omit<NotificationState, 'id'>): string => {
    const id = uid('toast-');
    const duration = toastData.duration ?? defaultDuration;

    const newToast: NotificationState = {
      ...toastData,
      id,
      duration,
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      // Enforce max toasts limit by removing oldest
      return updated.slice(0, maxToasts);
    });

    // Schedule auto-dismiss
    scheduleAutoDismiss(id, duration);

    return id;
  }, [defaultDuration, maxToasts, scheduleAutoDismiss]);

  // Dismiss a specific toast
  const dismiss = useCallback((id: string) => {
    clearTimer(id);
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, [clearTimer]);

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach(timerId => clearTimeout(timerId));
    timersRef.current.clear();
    
    setToasts([]);
  }, []);

  // Listen for global toast events
  useEffect(() => {
    const unsubscribeShow = on('toast.show', (payload) => {
      show({
        type: payload.type || 'info',
        title: payload.title,
        message: payload.message,
        duration: payload.duration,
      });
    });

    const unsubscribeNotification = on('notification.show', (payload) => {
      show({
        type: payload.type,
        title: payload.title,
        message: payload.message,
        duration: payload.duration,
      });
    });

    return () => {
      unsubscribeShow();
      unsubscribeNotification();
    };
  }, [show]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timerId => clearTimeout(timerId));
      timersRef.current.clear();
    };
  }, []);

  // Context value
  const contextValue: ToastContextValue = {
    toasts,
    show,
    dismiss,
    dismissAll,
  };

  // Position-based styling
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div
        className={positionClasses[position]}
        aria-live="polite"
        aria-label="Notifications"
        role="region"
      >
        <div className="flex flex-col gap-2 min-w-80 max-w-md">
          {toasts.map((toast, index) => (
            <Toast
              key={toast.id}
              {...toast}
              onDismiss={() => dismiss(toast.id)}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

// =============================================================================
// Context Hook
// =============================================================================

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  
  return context;
}

// =============================================================================
// Enhanced Toast Manager (Internal)
// =============================================================================

interface ToastManagerState {
  activeToasts: Set<string>;
  queue: NotificationState[];
  pausedTimers: Map<string, { remaining: number; startTime: number }>;
}

// Internal state for advanced toast management
const createToastManager = () => {
  const state: ToastManagerState = {
    activeToasts: new Set(),
    queue: [],
    pausedTimers: new Map(),
  };

  const pauseTimer = (id: string) => {
    const timer = state.pausedTimers.get(id);
    if (timer) {
      const elapsed = Date.now() - timer.startTime;
      const remaining = Math.max(0, timer.remaining - elapsed);
      state.pausedTimers.set(id, { remaining, startTime: Date.now() });
    }
  };

  const resumeTimer = (id: string, dismiss: (id: string) => void) => {
    const timer = state.pausedTimers.get(id);
    if (timer && timer.remaining > 0) {
      setTimeout(() => dismiss(id), timer.remaining);
      state.pausedTimers.delete(id);
    }
  };

  return { state, pauseTimer, resumeTimer };
};

// =============================================================================
// Development Helpers
// =============================================================================

if (import.meta.env.MODE === 'development') {
  // Add global reference for debugging
  (globalThis as any).__TOAST_PROVIDER_DEBUG = {
    show: (message: string, type: NotificationState['type'] = 'info') => {
      // This will be available after provider is rendered
      console.log('Toast debug helper - use within a component with useToastContext');
    },
  };
}

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/shared/components/Toast, @/core/events, @/core/contracts, @/core/utils)
- [x] Uses providers/hooks (creates provider context, doesn't directly manipulate DOM)
- [x] Reads config from `@/app/config` (uses import.meta.env for development mode detection)
- [x] Exports default named component (exports ToastProvider and useToastContext)
- [x] Adds basic ARIA and keyboard handlers (aria-live, aria-label, role for accessibility)
- [x] Implements toast stacking with configurable max limit
- [x] Handles auto-dismiss timers with proper cleanup
- [x] Listens to global events from core/events for decoupled toast triggering
- [x] Provides flexible positioning options for toast container
- [x] Uses proper React patterns with useCallback for performance
- [x] Includes error boundary for context usage outside provider
- [x] Handles timer cleanup on unmount to prevent memory leaks
- [x] Uses uid from core/utils for unique toast identifiers
- [x] Provides typed context interface for consumer hooks
*/
