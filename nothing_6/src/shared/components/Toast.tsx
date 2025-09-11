// filepath: src/shared/components/Toast.tsx

import React, { useEffect, useState, useCallback } from 'react'
import { eventBus } from '@/core/events'
import { durations } from '@/theme/animations'
import { config } from '@/app/config'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  dismissible?: boolean
}

interface ToastProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
  index: number
}

interface ToastStackProps {
  maxToasts?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
}

const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss, index }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const handleDismiss = useCallback(() => {
    if (!toast.dismissible && toast.dismissible !== undefined) return
    
    setIsLeaving(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, durations.fast)
  }, [toast.id, toast.dismissible, onDismiss])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleDismiss()
    }
  }, [handleDismiss])

  const getTypeStyles = () => {
    const baseStyles = 'border-l-4'
    switch (toast.type) {
      case 'success':
        return `${baseStyles} border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100`
      case 'error':
        return `${baseStyles} border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100`
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100`
      case 'info':
      default:
        return `${baseStyles} border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100`
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
      default:
        return 'ⓘ'
    }
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      tabIndex={toast.dismissible !== false ? 0 : -1}
      onKeyDown={handleKeyDown}
      className={`
        transform transition-all duration-300
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        ${getTypeStyles()}
        relative max-w-md w-full p-4 rounded-lg shadow-lg backdrop-blur-sm
        cursor-pointer hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        mb-3
      `}
      style={{
        transform: `translateY(${index * -8}px)`,
        zIndex: 1000 - index
      }}
      onClick={handleDismiss}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-lg font-semibold">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-sm opacity-90 mt-1">
              {toast.message}
            </p>
          )}
        </div>
        {toast.dismissible !== false && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDismiss()
            }}
            className="flex-shrink-0 ml-2 text-lg opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss toast"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export const Toast: React.FC<ToastStackProps> = ({ 
  maxToasts = 5, 
  position = 'top-right' 
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
      dismissible: toast.dismissible ?? true
    }

    setToasts(prev => {
      const updated = [newToast, ...prev].slice(0, maxToasts)
      return updated
    })
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  useEffect(() => {
    const unsubscribe = eventBus.on('toast:show', addToast)
    const unsubscribeClear = eventBus.on('toast:clear', clearAll)

    return () => {
      unsubscribe()
      unsubscribeClear()
    }
  }, [addToast, clearAll])

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-right':
      default:
        return 'top-4 right-4'
    }
  }

  if (toasts.length === 0) return null

  return (
    <div
      className={`fixed z-50 pointer-events-none ${getPositionStyles()}`}
      aria-label="Toast notifications"
    >
      <div className="pointer-events-auto space-y-0">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={removeToast}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

export const toastController = {
  success: (title: string, message?: string, options?: Partial<ToastMessage>) => {
    eventBus.emit('toast:show', { type: 'success', title, message, ...options })
  },
  
  error: (title: string, message?: string, options?: Partial<ToastMessage>) => {
    eventBus.emit('toast:show', { type: 'error', title, message, ...options })
  },
  
  warning: (title: string, message?: string, options?: Partial<ToastMessage>) => {
    eventBus.emit('toast:show', { type: 'warning', title, message, ...options })
  },
  
  info: (title: string, message?: string, options?: Partial<ToastMessage>) => {
    eventBus.emit('toast:show', { type: 'info', title, message, ...options })
  },
  
  show: (toast: Omit<ToastMessage, 'id'>) => {
    eventBus.emit('toast:show', toast)
  },
  
  clear: () => {
    eventBus.emit('toast:clear')
  }
}

export default Toast
