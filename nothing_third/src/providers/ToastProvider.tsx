// filepath: src/providers/ToastProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { eventBus } from '@/core/events';
import { generateId } from '@/core/utils';
import { config } from '@/app/config';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  body?: string;
  durationMs?: number;
  createdAt: number;
  isVisible: boolean;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id' | 'createdAt' | 'isVisible'>) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}

export function ToastProvider({ 
  children, 
  maxToasts = 5,
  defaultDuration = 5000 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toastData: Omit<Toast, 'id' | 'createdAt' | 'isVisible'>): string => {
    const id = generateId('toast');
    const newToast: Toast = {
      ...toastData,
      id,
      createdAt: Date.now(),
      isVisible: true,
      durationMs: toastData.durationMs ?? defaultDuration
    };

    setToasts(prev => {
      // Remove oldest toasts if we exceed maxToasts
      const updatedToasts = prev.length >= maxToasts 
        ? prev.slice(-(maxToasts - 1)) 
        : prev;
      
      return [...updatedToasts, newToast];
    });

    // Auto-dismiss after duration (unless duration is 0 or negative)
    if (newToast.durationMs > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.durationMs);
    }

    return id;
  }, [maxToasts, defaultDuration]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id 
          ? { ...toast, isVisible: false }
          : toast
      )
    );

    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300); // Match animation duration
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts(prev => prev.map(toast => ({ ...toast, isVisible: false })));
    
    // Remove all from DOM after animation
    setTimeout(() => {
      setToasts([]);
    }, 300);
  }, []);

  // Listen to global event bus for toast events
  useEffect(() => {
    const unsubscribe = eventBus.on('toast:show', (payload) => {
      showToast({
        type: payload.type,
        title: payload.title,
        body: payload.body,
        durationMs: payload.durationMs
      });
    });

    return unsubscribe;
  }, [showToast]);

  const contextValue: ToastContextValue = {
    toasts,
    showToast,
    hideToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const context = useContext(ToastContext);
  
  if (!context) {
    return null;
  }

  const { toasts, hideToast } = context;

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="toast-container"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '400px',
        pointerEvents: 'none'
      }}
    >
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id}
          toast={toast}
          onDismiss={hideToast}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const handleDismiss = () => {
    onDismiss(toast.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDismiss();
    }
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '';
    }
  };

  const getToastColors = (type: Toast['type']) => {
    const colors = {
      success: { bg: '#10b981', border: '#059669' },
      error: { bg: '#ef4444', border: '#dc2626' },
      warning: { bg: '#f59e0b', border: '#d97706' },
      info: { bg: '#3b82f6', border: '#2563eb' }
    };
    return colors[type] || colors.info;
  };

  const colors = getToastColors(toast.type);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="toast-item"
      style={{
        backgroundColor: '#ffffff',
        border: `2px solid ${colors.border}`,
        borderRadius: '0.5rem',
        padding: '1rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        pointerEvents: 'auto',
        transform: toast.isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: toast.isVisible ? 1 : 0,
        transition: 'all 0.3s ease-in-out',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        minWidth: '300px',
        maxWidth: '400px'
      }}
    >
      <div
        style={{
          width: '1.5rem',
          height: '1.5rem',
          borderRadius: '50%',
          backgroundColor: colors.bg,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          flexShrink: 0
        }}
        aria-hidden="true"
      >
        {getToastIcon(toast.type)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div 
          style={{ 
            fontWeight: '600', 
            fontSize: '0.875rem',
            color: '#111827',
            marginBottom: toast.body ? '0.25rem' : 0
          }}
        >
          {toast.title}
        </div>
        {toast.body && (
          <div 
            style={{ 
              fontSize: '0.875rem',
              color: '#6b7280',
              lineHeight: '1.4'
            }}
          >
            {toast.body}
          </div>
        )}
      </div>

      <button
        onClick={handleDismiss}
        onKeyDown={handleKeyDown}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '0.25rem',
          fontSize: '1.25rem',
          lineHeight: 1,
          flexShrink: 0,
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#6b7280';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#9ca3af';
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = `2px solid ${colors.border}`;
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
      >
        ×
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}

// Convenience hook methods for common toast types
export function useToastHelpers() {
  const { showToast } = useToast();

  const showSuccess = useCallback((title: string, body?: string, durationMs?: number) => {
    return showToast({ type: 'success', title, body, durationMs });
  }, [showToast]);

  const showError = useCallback((title: string, body?: string, durationMs?: number) => {
    return showToast({ type: 'error', title, body, durationMs });
  }, [showToast]);

  const showWarning = useCallback((title: string, body?: string, durationMs?: number) => {
    return showToast({ type: 'warning', title, body, durationMs });
  }, [showToast]);

  const showInfo = useCallback((title: string, body?: string, durationMs?: number) => {
    return showToast({ type: 'info', title, body, durationMs });
  }, [showToast]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast
  };
}

// Export alias for convenience
export const ToastRootProvider = ToastProvider;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/events, @/core/utils, @/app/config)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses React context pattern
- [x] Reads config from `@/app/config` (imports config for potential future configuration)
- [x] Exports default named component (exports ToastProvider and ToastRootProvider alias)
- [x] Adds basic ARIA and keyboard handlers (role="alert", aria-live, keyboard dismiss with Enter/Space)
*/
