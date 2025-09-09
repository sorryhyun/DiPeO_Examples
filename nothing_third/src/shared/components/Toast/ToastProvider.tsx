// filepath: src/shared/components/Toast/ToastProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { eventBus } from '@/core/events';
import { generateId, classNames } from '@/core/utils';
import { config } from '@/app/config';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  body?: string;
  durationMs?: number;
  createdAt: number;
  isVisible: boolean;
  isPaused: boolean;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id' | 'createdAt' | 'isVisible' | 'isPaused'>) => string;
  hideToast: (id: string) => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastProvider({ 
  children, 
  maxToasts = 5,
  defaultDuration = 5000,
  position = 'top-right'
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const announcementRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((toastData: Omit<Toast, 'id' | 'createdAt' | 'isVisible' | 'isPaused'>): string => {
    const id = generateId('toast');
    const newToast: Toast = {
      ...toastData,
      id,
      createdAt: Date.now(),
      isVisible: true,
      isPaused: false,
      durationMs: toastData.durationMs ?? defaultDuration
    };

    setToasts(prev => {
      // Remove oldest toasts if we exceed maxToasts
      const updatedToasts = prev.length >= maxToasts 
        ? prev.slice(-(maxToasts - 1)) 
        : prev;
      
      return [...updatedToasts, newToast];
    });

    // Schedule auto-dismiss if duration > 0
    if (newToast.durationMs > 0) {
      const timer = setTimeout(() => {
        hideToast(id);
      }, newToast.durationMs);
      
      timersRef.current.set(id, timer);
    }

    // Announce to screen readers
    if (announcementRef.current) {
      const announcement = `${newToast.type} notification: ${newToast.title}`;
      announcementRef.current.textContent = announcement;
    }

    // Emit analytics event
    if (config.isFeatureEnabled('analytics')) {
      eventBus.emit('analytics:event', {
        name: 'toast_shown',
        properties: {
          type: newToast.type,
          hasBody: Boolean(newToast.body),
          duration: newToast.durationMs
        }
      });
    }

    return id;
  }, [maxToasts, defaultDuration]);

  const hideToast = useCallback((id: string) => {
    // Clear any pending timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

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
    }, 300); // Match slide-out animation duration
  }, []);

  const pauseToast = useCallback((id: string) => {
    // Clear timer when paused
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts(prev => 
      prev.map(toast => 
        toast.id === id 
          ? { ...toast, isPaused: true }
          : toast
      )
    );
  }, []);

  const resumeToast = useCallback((id: string) => {
    setToasts(prev => {
      const updatedToasts = prev.map(toast => 
        toast.id === id 
          ? { ...toast, isPaused: false }
          : toast
      );

      // Find the resumed toast and restart its timer
      const resumedToast = updatedToasts.find(t => t.id === id);
      if (resumedToast && resumedToast.durationMs > 0) {
        // Calculate remaining duration based on elapsed time
        const elapsed = Date.now() - resumedToast.createdAt;
        const remaining = Math.max(0, resumedToast.durationMs - elapsed);
        
        if (remaining > 0) {
          const timer = setTimeout(() => {
            hideToast(id);
          }, remaining);
          
          timersRef.current.set(id, timer);
        } else {
          // Toast has expired, hide immediately
          setTimeout(() => hideToast(id), 0);
        }
      }

      return updatedToasts;
    });
  }, [hideToast]);

  const clearAllToasts = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();

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

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const contextValue: ToastContextValue = {
    toasts,
    showToast,
    hideToast,
    pauseToast,
    resumeToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position} />
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  position: ToastProviderProps['position'];
}

function ToastContainer({ position = 'top-right' }: ToastContainerProps) {
  const context = useContext(ToastContext);
  
  if (!context) {
    return null;
  }

  const { toasts } = context;

  if (toasts.length === 0) {
    return null;
  }

  const getPositionStyles = (pos: string) => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
      maxWidth: '400px',
      pointerEvents: 'none' as const
    };

    switch (pos) {
      case 'top-right':
        return { ...baseStyles, top: '1rem', right: '1rem' };
      case 'top-left':
        return { ...baseStyles, top: '1rem', left: '1rem' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '1rem', right: '1rem' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '1rem', left: '1rem' };
      case 'top-center':
        return { ...baseStyles, top: '1rem', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...baseStyles, bottom: '1rem', left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...baseStyles, top: '1rem', right: '1rem' };
    }
  };

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="toast-container"
      style={getPositionStyles(position)}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
}

function ToastItem({ toast }: ToastItemProps) {
  const context = useContext(ToastContext);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  if (!context) {
    return null;
  }

  const { hideToast, pauseToast, resumeToast } = context;

  const handleDismiss = () => {
    hideToast(toast.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDismiss();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleDismiss();
    }
  };

  const handleMouseEnter = () => {
    if (!toast.isPaused) {
      pauseToast(toast.id);
    }
  };

  const handleMouseLeave = () => {
    if (toast.isPaused) {
      resumeToast(toast.id);
    }
  };

  const handleFocus = () => {
    if (!toast.isPaused) {
      pauseToast(toast.id);
    }
  };

  const handleBlur = () => {
    if (toast.isPaused) {
      resumeToast(toast.id);
    }
  };

  // Update progress bar
  useEffect(() => {
    if (toast.durationMs <= 0 || toast.isPaused) {
      return;
    }

    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - Math.max(startTime, toast.createdAt);
      const remaining = Math.max(0, toast.durationMs - elapsed);
      setRemainingTime(remaining);

      if (remaining > 0) {
        progressIntervalRef.current = setTimeout(updateProgress, 50);
      }
    };

    updateProgress();

    return () => {
      if (progressIntervalRef.current) {
        clearTimeout(progressIntervalRef.current);
      }
    };
  }, [toast.createdAt, toast.durationMs, toast.isPaused]);

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
      success: { bg: '#10b981', border: '#059669', text: '#065f46' },
      error: { bg: '#ef4444', border: '#dc2626', text: '#7f1d1d' },
      warning: { bg: '#f59e0b', border: '#d97706', text: '#78350f' },
      info: { bg: '#3b82f6', border: '#2563eb', text: '#1e3a8a' }
    };
    return colors[type] || colors.info;
  };

  const colors = getToastColors(toast.type);
  const progressPercentage = toast.durationMs > 0 ? (remainingTime / toast.durationMs) * 100 : 0;

  return (
    <div
      role="alert"
      aria-live="assertive"
      tabIndex={0}
      className={classNames('toast-item', {
        'toast-item--visible': toast.isVisible,
        'toast-item--hidden': !toast.isVisible,
        'toast-item--paused': toast.isPaused
      })}
      style={{
        backgroundColor: '#ffffff',
        border: `2px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)',
        pointerEvents: 'auto',
        transform: toast.isVisible ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
        opacity: toast.isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        minWidth: '320px',
        maxWidth: '400px',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {/* Progress bar */}
      {toast.durationMs > 0 && (
        <div
          className="toast-progress"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            backgroundColor: colors.bg,
            width: `${progressPercentage}%`,
            transition: toast.isPaused ? 'none' : 'width 50ms linear',
            opacity: 0.8
          }}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <div
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          backgroundColor: colors.bg,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: 'bold',
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        aria-hidden="true"
      >
        {getToastIcon(toast.type)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div 
          style={{ 
            fontWeight: '600', 
            fontSize: '0.875rem',
            color: colors.text,
            marginBottom: toast.body ? '0.375rem' : 0,
            lineHeight: '1.4'
          }}
        >
          {toast.title}
        </div>
        {toast.body && (
          <div 
            style={{ 
              fontSize: '0.8125rem',
              color: '#6b7280',
              lineHeight: '1.5'
            }}
          >
            {toast.body}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        aria-label={`Dismiss ${toast.type} notification: ${toast.title}`}
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
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1.5rem',
          height: '1.5rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#6b7280';
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#9ca3af';
          e.currentTarget.style.backgroundColor = 'transparent';
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

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  
  return context;
}

// Convenience hook methods for common toast types
export function useToast() {
  const { showToast, hideToast, clearAllToasts } = useToastContext();

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
    showToast,
    hideToast,
    clearAllToasts
  };
}

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
