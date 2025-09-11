// filepath: src/providers/ModalProvider.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config` (not needed for this file)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'
import Modal from '@/shared/components/Modal'
import { eventBus } from '@/core/events'

// Modal configuration and state types
export interface ModalConfig {
  id: string
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  backdrop?: boolean
  className?: string
  onClose?: () => void
}

export interface ModalState extends ModalConfig {
  isOpen: boolean
  content: ReactNode
}

// Modal context value
export interface ModalContextValue {
  modals: ModalState[]
  openModal: (config: ModalConfig & { content: ReactNode }) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
  updateModal: (id: string, updates: Partial<ModalConfig & { content: ReactNode }>) => void
  isModalOpen: (id: string) => boolean
}

// Create context
const ModalContext = createContext<ModalContextValue | null>(null)

// Provider props
export interface ModalProviderProps {
  children: ReactNode
  maxModals?: number
}

export function ModalProvider({ children, maxModals = 5 }: ModalProviderProps): JSX.Element {
  const [modals, setModals] = useState<ModalState[]>([])
  const nextZIndex = useRef(1000)

  // Open a new modal
  const openModal = useCallback((config: ModalConfig & { content: ReactNode }) => {
    const { content, ...modalConfig } = config
    
    setModals(prev => {
      // Check if modal already exists
      const existing = prev.find(m => m.id === config.id)
      if (existing) {
        // Update existing modal
        return prev.map(m => 
          m.id === config.id 
            ? { ...m, ...modalConfig, content, isOpen: true }
            : m
        )
      }

      // Add new modal (respect maxModals limit)
      const newModal: ModalState = {
        ...modalConfig,
        content,
        isOpen: true,
        closable: modalConfig.closable ?? true,
        backdrop: modalConfig.backdrop ?? true,
        size: modalConfig.size ?? 'md'
      }

      const updated = [...prev, newModal]
      
      // Remove oldest modals if exceeding limit
      if (updated.length > maxModals) {
        const overflow = updated.slice(0, updated.length - maxModals)
        overflow.forEach(modal => {
          eventBus.emit('analytics:event', { 
            name: 'modal:force_closed', 
            properties: { modalId: modal.id, reason: 'max_limit' }
          })
        })
        return updated.slice(-maxModals)
      }

      return updated
    })

    // Analytics event
    eventBus.emit('analytics:event', { 
      name: 'modal:opened', 
      properties: { modalId: config.id, size: config.size }
    })
  }, [maxModals])

  // Close a specific modal
  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const modal = prev.find(m => m.id === id)
      if (!modal) return prev

      // Call onClose callback if provided
      if (modal.onClose) {
        try {
          modal.onClose()
        } catch (err) {
          eventBus.emit('analytics:event', { 
            name: 'modal:close_callback_error', 
            properties: { modalId: id, error: String(err) }
          })
        }
      }

      // Analytics event
      eventBus.emit('analytics:event', { 
        name: 'modal:closed', 
        properties: { modalId: id }
      })

      return prev.filter(m => m.id !== id)
    })
  }, [])

  // Close all modals
  const closeAllModals = useCallback(() => {
    setModals(prev => {
      // Call onClose for each modal
      prev.forEach(modal => {
        if (modal.onClose) {
          try {
            modal.onClose()
          } catch (err) {
            eventBus.emit('analytics:event', { 
              name: 'modal:close_callback_error', 
              properties: { modalId: modal.id, error: String(err) }
            })
          }
        }
      })

      if (prev.length > 0) {
        eventBus.emit('analytics:event', { 
          name: 'modal:closed_all', 
          properties: { count: prev.length }
        })
      }

      return []
    })
  }, [])

  // Update modal configuration
  const updateModal = useCallback((id: string, updates: Partial<ModalConfig & { content: ReactNode }>) => {
    setModals(prev => 
      prev.map(modal => 
        modal.id === id 
          ? { ...modal, ...updates }
          : modal
      )
    )
  }, [])

  // Check if modal is open
  const isModalOpen = useCallback((id: string): boolean => {
    return modals.some(m => m.id === id && m.isOpen)
  }, [modals])

  // Handle escape key globally
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modals.length > 0) {
        // Close the topmost closable modal
        const topModal = modals[modals.length - 1]
        if (topModal && topModal.closable !== false) {
          closeModal(topModal.id)
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [modals, closeModal])

  // Context value
  const contextValue: ModalContextValue = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    isModalOpen,
  }

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      
      {/* Render all open modals */}
      {modals.map((modal, index) => (
        <Modal
          key={modal.id}
          isOpen={modal.isOpen}
          onClose={modal.closable !== false ? () => closeModal(modal.id) : undefined}
          title={modal.title}
          size={modal.size}
          backdrop={modal.backdrop}
          className={modal.className}
          style={{ zIndex: nextZIndex.current + index }}
        >
          {modal.content}
        </Modal>
      ))}
    </ModalContext.Provider>
  )
}

// Hook to use modal context
export function useModal(): ModalContextValue {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

// Convenience hooks for common modal operations
export function useModalState(id: string) {
  const { isModalOpen, openModal, closeModal } = useModal()
  
  return {
    isOpen: isModalOpen(id),
    open: (config: Omit<ModalConfig, 'id'> & { content: ReactNode }) => 
      openModal({ ...config, id }),
    close: () => closeModal(id),
  }
}

// Default export is the provider
export default ModalProvider
