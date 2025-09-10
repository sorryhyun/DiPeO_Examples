// filepath: src/hooks/useModal.ts

import React, { useCallback } from 'react';
import { useModalSafe } from '@/providers/ModalProvider';
import { eventBus } from '@/core/events';
import { debugLog } from '@/core/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UseModalOptions {
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Modal title for accessibility */
  title?: string;
  
  /** Whether the modal can be closed */
  closable?: boolean;
  
  /** Callback when modal closes */
  onClose?: () => void;
  
  /** Whether to close on backdrop click */
  closeOnBackdropClick?: boolean;
  
  /** Whether to close on ESC key */
  closeOnEscape?: boolean;
  
  /** Custom CSS classes */
  className?: string;
  
  /** Z-index for stacking */
  zIndex?: number;
}

export interface UseModalAPI {
  /** Open a modal with content and options */
  openModal: (content: React.ReactNode, options?: UseModalOptions) => string;
  
  /** Close a specific modal by ID */
  closeModal: (id: string) => void;
  
  /** Close all modals */
  closeAllModals: () => void;
  
  /** Get currently open modals */
  modals: Array<{
    id: string;
    title?: string;
    content: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closable?: boolean;
    onClose?: () => void;
  }>;
  
  /** Check if any modal is open */
  hasOpenModals: boolean;
  
  /** Get the number of open modals */
  modalCount: number;
}

export interface ConfirmModalOptions {
  /** Modal title */
  title: string;
  
  /** Confirmation message */
  message: string;
  
  /** Confirm button text */
  confirmText?: string;
  
  /** Cancel button text */
  cancelText?: string;
  
  /** Button variant for confirm button */
  variant?: 'default' | 'primary' | 'danger';
  
  /** Size of the modal */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for programmatically managing modals
 * Provides methods to open, close, and query modal state
 */
export function useModal(): UseModalAPI {
  const modalProvider = useModalSafe();
  
  const openModal = useCallback((
    content: React.ReactNode, 
    options: UseModalOptions = {}
  ): string => {
    const {
      size = 'md',
      title,
      closable = true,
      onClose,
      ...otherOptions
    } = options;
    
    debugLog('useModal: Opening modal', { title, size, closable });
    
    // Create enhanced onClose that emits event
    const handleClose = onClose ? () => {
      debugLog('useModal: Modal closing via onClose callback');
      eventBus.emit('modal:close', { id: 'unknown' });
      onClose();
    } : undefined;
    
    const modalId = modalProvider.openModal({
      title,
      content,
      size,
      closable,
      onClose: handleClose,
      ...otherOptions,
    });
    
    // Emit modal opened event
    eventBus.emit('modal:open', { id: modalId, type: 'programmatic', timestamp: Date.now() });
    
    debugLog('useModal: Modal opened', { modalId, title });
    
    return modalId;
  }, [modalProvider]);
  
  const closeModal = useCallback((id: string) => {
    debugLog('useModal: Closing modal', { id });
    modalProvider.closeModal(id);
    eventBus.emit('modal:close', { id });
  }, [modalProvider]);
  
  const closeAllModals = useCallback(() => {
    debugLog('useModal: Closing all modals');
    modalProvider.closeAllModals();
    eventBus.emit('modal:close', { id: 'all' });
  }, [modalProvider]);
  
  return {
    openModal,
    closeModal,
    closeAllModals,
    modals: modalProvider.modals,
    hasOpenModals: modalProvider.modals.length > 0,
    modalCount: modalProvider.modals.length,
  };
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for creating confirmation dialogs
 * Returns a function to show confirm dialogs with promise-based result
 */
export function useConfirmModal() {
  const { openModal, closeModal } = useModal();
  
  const confirm = useCallback((
    options: ConfirmModalOptions
  ): Promise<boolean> => {
    const {
      title,
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      variant = 'default',
      size = 'sm',
    } = options;
    
    return new Promise<boolean>((resolve) => {
      let resolved = false;
      
      const handleResolve = (result: boolean) => {
        if (resolved) return;
        resolved = true;
        resolve(result);
      };
      
      const content = (
        <div className="p-6">
          <div className="flex items-center mb-4">
            {variant === 'danger' && (
              <div className="flex-shrink-0 mr-3">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {title}
              </h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => handleResolve(false)}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${{
                default: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
                primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
                danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
              }[variant]}`}
              onClick={() => handleResolve(true)}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </div>
      );
      
      const modalId = openModal(content, {
        title,
        size,
        closable: true,
        onClose: () => handleResolve(false),
      });
      
      debugLog('useConfirmModal: Opened confirmation dialog', { 
        modalId, 
        title, 
        variant 
      });
    });
  }, [openModal]);
  
  return { confirm };
}

/**
 * Hook for creating alert dialogs
 * Returns a function to show alert dialogs with promise-based acknowledgment
 */
export function useAlertModal() {
  const { openModal } = useModal();
  
  const alert = useCallback((
    title: string,
message: string,
    options: {
      buttonText?: string;
      variant?: 'info' | 'success' | 'warning' | 'error';
      size?: 'sm' | 'md' | 'lg';
    } = {}
  ): Promise<void> => {
    const {
      buttonText = 'OK',
      variant = 'info',
      size = 'sm',
    } = options;
    
    return new Promise<void>((resolve) => {
      let resolved = false;
      
      const handleResolve = () => {
        if (resolved) return;
        resolved = true;
        resolve();
      };
      
      // Icon based on variant
      const getIcon = () => {
        switch (variant) {
          case 'success':
            return (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            );
          case 'warning':
            return (
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            );
          case 'error':
            return (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            );
          default:
            return (
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            );
        }
      };
      
      const content = (
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 mr-3">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {title}
              </h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleResolve}
              autoFocus
            >
              {buttonText}
            </button>
          </div>
        </div>
      );
      
      const modalId = openModal(content, {
        title,
        size,
        closable: true,
        onClose: handleResolve,
      });
      
      debugLog('useAlertModal: Opened alert dialog', { 
        modalId, 
        title, 
        variant 
      });
    });
  }, [openModal]);
  
  return { alert };
}

/**
 * Hook for creating custom modal with specific content component
 * Useful for complex modal content that needs its own state/logic
 */
export function useCustomModal<TProps = Record<string, unknown>>() {
  const { openModal, closeModal } = useModal();
  
  const openCustomModal = useCallback((
    Component: React.ComponentType<TProps & { onClose: () => void }>,
    props: TProps,
    options: UseModalOptions = {}
  ): string => {
    let modalId: string;
    
    const handleClose = () => {
      closeModal(modalId);
      options.onClose?.();
    };
    
    const content = React.createElement(Component, {
      ...props,
      onClose: handleClose,
    } as TProps & { onClose: () => void });
    
    modalId = openModal(content, {
      ...options,
      onClose: handleClose,
    });
    
    debugLog('useCustomModal: Opened custom modal', { modalId, Component });
    
    return modalId;
  }, [openModal, closeModal]);
  
  return { openCustomModal };
}

// Default export
export default useModal;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/providers/ModalProvider, @/core/events, @/core/utils
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses ModalProvider context, no direct DOM manipulation
// [x] Reads config from `@/app/config` - Not needed for modal hook
// [x] Exports default named component - Exports useModal as default and multiple convenience hooks
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Modal components include ARIA attributes, focus management, and keyboard handling
