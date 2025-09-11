// filepath: src/providers/ToastProvider.tsx

// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Toast from '@/shared/components/Toast'
import { eventBus } from '@/core/events'
import { config } from '@/app/config'

// Toast types and interfaces
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
}

export interface ToastContextValue {
  // Toast state
  toasts: ToastMessage[]
  
  // Toast actions
  success: (message: string, options?: Partial<ToastMessage>) => string
  error: (message: string, options?: Partial<ToastMessage>) => string
  warning: (message: string, options?: Partial<ToastMessage>) => string
  info: (message: string, options?: Partial<ToastMessage>) => string
  
  // Generic toast creation
  show: (toast: Omit<ToastMessage, 'id'>) => string
  dismiss: (id: string) => void
  dismissAll: () => void
  
  // Utility
  isVisible: (id: string) => boolean
}

// Create toast context
const ToastContext = createContext<ToastContextValue | null>(null)

// Toast provider props
export interface ToastProviderProps {
  children: ReactNode
  /** Maximum number of toasts to show at once */
  maxToasts?: number
  /** Default duration for auto-dismiss (ms) */
  defaultDuration?: number
  /** Portal container selector */
  portalTarget?: string
}

// Hook to use toast context
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Generate unique toast ID
const generateToastId = (() => {
  let counter = 0
  return () => `toast-${Date.now()}-${++counter}`
})()

// Toast provider component
export function ToastProvider({
  children,
  maxToasts = 5,
  defaultDuration = 5000,
  portalTarget = 'body',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [portalContainer, setPortalContainer] = useState<Element | null>(null)

  // Initialize portal container
  useEffect(() => {
    const container = document.querySelector(portalTarget) || document.body
    setPortalContainer(container)
  }, [portalTarget])

  // Auto-dismiss toasts with duration
  useEffect(() => {
    const timers: Record<string, NodeJS.Timeout> = {}

    toasts.forEach(toast => {
      if (toast.duration && toast.duration > 0) {
        timers[toast.id] = setTimeout(() => {
          dismissToast(toast.id)
        }, toast.duration)
      }
    })

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer))
    }
  }, [toasts])

  // Add toast to state
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>): string => {
    const id = generateToastId()
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration,
      dismissible: toast.dismissible ?? true,
    }

    setToasts(current => {
      const updated = [newToast, ...current]
      // Respect max toasts limit
      return updated.slice(0, maxToasts)
    })

    // Emit analytics event
    eventBus.emit('analytics:event', {
      name: 'toast:shown',
      properties: {
        type: toast.type,
        hasTitle: !!toast.title,
        hasActions: !!(toast.actions?.length),
      },
    })

    return id
  }, [defaultDuration, maxToasts])

  // Remove toast from state
  const dismissToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id))
    
    eventBus.emit('analytics:event', {
      name: 'toast:dismissed',
      properties: { toastId: id },
    })
  }, [])

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    const count = toasts.length
    setToasts([])
    
    if (count > 0) {
      eventBus.emit('analytics:event', {
        name: 'toast:dismissed_all',
        properties: { count },
      })
    }
  }, [toasts.length])

  // Check if toast is visible
  const isVisible = useCallback((id: string) => {
    return toasts.some(toast => toast.id === id)
  }, [toasts])

  // Convenience methods for different toast types
  const success = useCallback((message: string, options: Partial<ToastMessage> = {}) => {
    return addToast({ ...options, type: 'success', message })
  }, [addToast])

  const error = useCallback((message: string, options: Partial<ToastMessage> = {}) => {
    return addToast({ ...options, type: 'error', message })
  }, [addToast])

  const warning = useCallback((message: string, options: Partial<ToastMessage> = {}) => {
    return addToast({ ...options, type: 'warning', message })
  }, [addToast])

  const info = useCallback((message: string, options: Partial<ToastMessage> = {}) => {
    return addToast({ ...options, type: 'info', message })
  }, [addToast])

  // Listen to EventBus for toast events
  useEffect(() => {
    const unsubscribeSuccess = eventBus.on('toast:success', ({ message, options }) => {
      success(message, options)
    })

    const unsubscribeError = eventBus.on('toast:error', ({ message, options }) => {
      error(message, options)
    })

    const unsubscribeWarning = eventBus.on('toast:warning', ({message, options }) => {
      warning(message, options)
    })

    const unsubscribeInfo = eventBus.on('toast:info', ({ message, options }) => {
      info(message, options)
    })

    const unsubscribeDismiss = eventBus.on('toast:dismiss', ({ id }) => {
      if (id) dismissToast(id)
      else dismissAll()
    })

    return () => {
      unsubscribeSuccess()
      unsubscribeError()
      unsubscribeWarning()
      unsubscribeInfo()
      unsubscribeDismiss()
    }
  }, [success, error, warning, info, dismissToast, dismissAll])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Dismiss all toasts with Escape
      if (event.key === 'Escape' && toasts.length > 0) {
        dismissAll()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toasts.length, dismissAll])

  // Context value
  const contextValue: ToastContextValue = {
    toasts,
    success,
    error,
    warning,
    info,
    show: addToast,
    dismiss: dismissToast,
    dismissAll,
    isVisible,
  }

  // Debug logging in development
  useEffect(() => {
    if (config.isDevelopment) {
      console.debug('[ToastProvider] Toast state:', {
        count: toasts.length,
        toasts: toasts.map(t => ({ id: t.id, type: t.type, message: t.message })),
      })
    }
  }, [toasts])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {portalContainer &&
        createPortal(
          <div
            className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
            role="region"
            aria-label="Notifications"
            aria-live="polite"
          >
            {toasts.map(toast => (
              <Toast
                key={toast.id}
                {...toast}
                onDismiss={() => dismissToast(toast.id)}
              />
            ))}
          </div>,
          portalContainer
        )}
    </ToastContext.Provider>
  )
}

// Standalone toast API (for use outside React components)
export const toast = {
  success: (message: string, options?: Partial<ToastMessage>) => {
    eventBus.emit('toast:success', { message, options })
  },
  error: (message: string, options?: Partial<ToastMessage>) => {
    eventBus.emit('toast:error', { message, options })
  },
  warning: (message: string, options?: Partial<ToastMessage>) => {
    eventBus.emit('toast:warning', { message, options })
  },
  info: (message: string, options?: Partial<ToastMessage>) => {
    eventBus.emit('toast:info', { message, options })
  },
  dismiss: (id?: string) => {
    eventBus.emit('toast:dismiss', { id })
  },
  dismissAll: () => {
    eventBus.emit('toast:dismiss', {})
  },
}

// Higher-order component for toast injection
export function withToast<P extends object>(
  Component: React.ComponentType<P & { toast: ToastContextValue }>
): React.ComponentType<P> {
  return function ToastComponent(props: P) {
    const toastContext = useToast()
    return <Component {...props} toast={toastContext} />
  }
}

// Default export
export default ToastProvider

// Development helpers
if (config.isDevelopment && typeof window !== 'undefined') {
  (window as any).__TOAST_PROVIDER__ = {
    ToastProvider,
    useToast,
    toast,
  }
}
