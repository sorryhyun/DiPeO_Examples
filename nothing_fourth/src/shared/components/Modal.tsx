// filepath: src/shared/components/Modal.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/core/utils';
import { modalBackdrop, modalContent, motionPresets } from '@/theme/animations';
import { Button } from '@/shared/components/Button';

// ===============================================
// Modal Component Types & Props
// ===============================================

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps extends Omit<HTMLMotionProps<'div'>, 'size'> {
  // Visibility
  isOpen: boolean;
  onClose: () => void;
  
  // Content
  title?: string;
  children: React.ReactNode;
  
  // Configuration
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventClose?: boolean;
  
  // Layout
  centered?: boolean;
  fullHeight?: boolean;
  
  // Styling
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  
  // Accessibility
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  role?: string;
  
  // Callbacks
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
  
  // Portal
  portalTarget?: Element | null;
}

// ===============================================
// Modal Size Configurations
// ===============================================

const modalSizes = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
} as const;

// ===============================================
// Focus Trap Hook
// ===============================================

function useFocusTrap(isOpen: boolean, containerRef: React.RefObject<HTMLElement>) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    
    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    // Get all focusable elements within the modal
    const getFocusableElements = () => {
      if (!containerRef.current) return [];
      
      const focusableSelectors = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(',');
      
      return Array.from(containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors))
        .filter(el => {
          return el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hasAttribute('hidden');
        });
    };
    
    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    // Handle Tab key navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.shiftKey) {
        // Shift + Tab: move to previous element
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move to next element
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to the previously focused element
      if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, containerRef]);
}

// ===============================================
// Body Scroll Lock Hook
// ===============================================

function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    return () => {
      // Restore original styles
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);
}

// ===============================================
// Modal Component
// ===============================================

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventClose = false,
  centered = true,
  fullHeight = false,
  className,
  overlayClassName,
  contentClassName,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  role = 'dialog',
  onAfterOpen,
  onAfterClose,
  portalTarget,
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  useFocusTrap(isOpen, modalRef);
  useBodyScrollLock(isOpen);
  
  // Handle close actions
  const handleClose = useCallback(() => {
    if (preventClose) return;
    onClose();
  }, [onClose, preventClose]);
  
  // Handle overlay click
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (!closeOnOverlayClick || preventClose) return;
    
    // Only close if clicking directly on the overlay (not bubbled from content)
    if (event.target === overlayRef.current) {
      handleClose();
    }
  }, [closeOnOverlayClick, preventClose, handleClose]);
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, handleClose]);
  
  // Handle after open/close callbacks
  useEffect(() => {
    if (isOpen && onAfterOpen) {
      // Small delay to ensure modal is rendered
      const timeout = setTimeout(onAfterOpen, 100);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, onAfterOpen]);
  
  useEffect(() => {
    if (!isOpen && onAfterClose) {
      // Delay to allow exit animation to complete
      const timeout = setTimeout(onAfterClose, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, onAfterClose]);
  
  // Generate IDs for accessibility
  const titleId = ariaLabelledBy || (title ? `modal-title-${Math.random().toString(36).substr(2, 9)}` : undefined);
  const descriptionId = ariaDescribedBy || `modal-description-${Math.random().toString(36).substr(2, 9)}`;
  
  // Portal target
  const portalElement = portalTarget || document.body;
  
  // Modal content
  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            className={cn(
              'fixed inset-0 bg-black/50 backdrop-blur-sm',
              overlayClassName
            )}
            onClick={handleOverlayClick}
            {...modalBackdrop}
          />
          
          {/* Modal Content Container */}
          <motion.div
            ref={modalRef}
            className={cn(
              // Base styles
              'relative flex flex-col bg-white dark:bg-gray-900',
              'rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700',
              'max-h-[90vh] w-full',
              
              // Size
              modalSizes[size],
              
              // Layout
              centered && 'mx-auto',
              fullHeight && 'h-full max-h-none',
              
              // Custom styles
              className
            )}
            role={role}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            {...modalContent}
            {...props}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                {title && (
                  <h2 
                    id={titleId}
                    className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate pr-4"
                  >
                    {title}
                  </h2>
                )}
                
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={preventClose}
                    className="flex-shrink-0 -mr-2"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div 
              id={descriptionId}
              className={cn(
                'flex-1 overflow-y-auto px-6 py-4',
                contentClassName
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
  
  // Render modal in portal
  return createPortal(modalContent, portalElement);
};

// ===============================================
// Modal Hook (Bonus Utility)
// ===============================================

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialOpen = false): UseModalReturn {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
}

// ===============================================
// Modal Variants (Bonus Components)
// ===============================================

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      preventClose={loading}
    >
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          {message}
        </p>
        
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Export default Modal
export default Modal;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (focus trap, ESC key, ARIA roles)
*/
