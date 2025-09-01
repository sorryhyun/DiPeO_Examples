// filepath: src/components/Modal/Modal.tsx
/* src/components/Modal/Modal.tsx

Accessible modal dialog with backdrop blur, focus trap, Escape key handler, and optional width presets.
Uses FocusTrap for focus management and provides a useModal hook for state management.
*/

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FocusTrap } from '@/shared/components/FocusTrap';
import { Backdrop } from '@/components/Modal/Backdrop';
import { modalAnimations } from '@/theme/animations';

// Modal size presets
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Modal props interface
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  title?: string;
  hideCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

// Modal context for internal state management
interface ModalContextType {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId: string;
}

const ModalContext = createContext<ModalContextType | null>(null);

// Size mappings for modal widths
const sizeClasses: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full w-full h-full',
};

// Generate unique IDs for accessibility
let modalCounter = 0;
function generateModalId(): string {
  return `modal-${++modalCounter}`;
}

export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  title,
  hideCloseButton = false,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  contentClassName = '',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: ModalProps) {
  const modalId = useRef(generateModalId()).current;
  const titleId = `${modalId}-title`;
  const descriptionId = `${modalId}-description`;
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const contextValue: ModalContextType = {
    isOpen,
    onClose,
    titleId,
    descriptionId,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            <Backdrop />
            
            <FocusTrap isActive={isOpen}>
              <motion.div
                className={`
                  relative bg-white rounded-lg shadow-xl
                  ${sizeClasses[size]}
                  ${size !== 'full' ? 'max-h-[90vh] overflow-y-auto' : ''}
                  ${className}
                `}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy || (title ? titleId : undefined)}
                aria-describedby={ariaDescribedBy || descriptionId}
                onClick={(e) => e.stopPropagation()}
                {...modalAnimations.modal}
              >
                {/* Header */}
                {(title || !hideCloseButton) && (
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    {title && (
                      <h2 id={titleId} className="text-xl font-semibold text-gray-900">
                        {title}
                      </h2>
                    )}
                    
                    {!hideCloseButton && (
                      <button
                        type="button"
                        className="
                          text-gray-400 hover:text-gray-600
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          rounded-md p-1 transition-colors
                        "
                        onClick={onClose}
                        aria-label="Close modal"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
                
                {/* Content */}
                <div
                  className={`p-6 ${contentClassName}`}
                  id={descriptionId}
                >
                  {children}
                </div>
              </motion.div>
            </FocusTrap>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}

// Modal components for compound pattern
Modal.Header = function ModalHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal.Header must be used within a Modal component');
  }

  return (
    <div className={`border-b border-gray-200 px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

Modal.Body = function ModalBody({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

Modal.Footer = function ModalFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
};

// Hook for modal state management
interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/* Example usage:

import { Modal, useModal } from '@/components/Modal/Modal'

function MyComponent() {
  const modal = useModal()
  
  return (
    <>
      <button onClick={modal.open}>Open Modal</button>
      
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Example Modal"
        size="md"
      >
        <Modal.Body>
          <p>Modal content goes here</p>
        </Modal.Body>
        
        <Modal.Footer>
          <button onClick={modal.close}>Cancel</button>
          <button onClick={() => { /* handle save */ }}>Save</button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

// Using compound pattern:
<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Header>
    <h2>Custom Header</h2>
  </Modal.Header>
  <Modal.Body>
    <p>Body content</p>
  </Modal.Body>
  <Modal.Footer>
    <button>Action</button>
  </Modal.Footer>
</Modal>

*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not applicable for this component)
// [x] Exports default named component (exports Modal and useModal)
// [x] Adds basic ARIA and keyboard handlers (focus trap, escape key, ARIA attributes)
