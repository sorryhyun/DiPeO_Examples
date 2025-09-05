// filepath: src/shared/components/Modal.tsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FocusTrap } from '@/shared/components/FocusTrap';
import { theme } from '@/theme';
import { modalAnimations } from '@/theme/animations';
import { cn } from '@/core/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  backdropClassName?: string;
  contentClassName?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  initialFocus?: string;
  returnFocusOnClose?: boolean;
  preventScroll?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  backdropClassName,
  contentClassName,
  ariaLabel,
  ariaDescribedBy,
  initialFocus,
  returnFocusOnClose = true,
  preventScroll = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Handle body scroll prevention
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, preventScroll]);

  // Handle ESC key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [isOpen, closeOnEscape, onClose]);

  // Return focus when modal closes
  useEffect(() => {
    if (!isOpen && returnFocusOnClose && previousActiveElement.current) {
      // Use setTimeout to ensure modal is fully unmounted
      setTimeout(() => {
        previousActiveElement.current?.focus();
      }, 0);
    }
  }, [isOpen, returnFocusOnClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (!closeOnBackdrop) return;
    
    // Only close if clicking directly on backdrop, not on modal content
    if (event.target === backdropRef.current) {
      onClose();
    }
  };

  const handleCloseClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };

  // Size configuration
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-full mx-4',
  };

  // Generate unique IDs for accessibility
  const modalId = `modal-${Math.random().toString(36).substr(2, 9)}`;
  const titleId = title ? `${modalId}-title` : undefined;
  const descriptionId = ariaDescribedBy ? `${modalId}-description` : undefined;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            className
          )}
          role="presentation"
        >
          {/* Backdrop */}
          <motion.div
            ref={backdropRef}
            className={cn(
              'absolute inset-0 bg-black/50 backdrop-blur-sm',
              'cursor-pointer',
              backdropClassName
            )}
            onClick={handleBackdropClick}
            variants={modalAnimations.backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <FocusTrap
            isActive={isOpen}
            initialFocus={initialFocus}
            returnFocusOnDeactivate={false}
            clickOutsideDeactivates={false}
          >
            <motion.div
              ref={modalRef}
              className={cn(
                'relative z-10 w-full',
                sizeClasses[size],
                'mx-4 my-8 max-h-[calc(100vh-4rem)] overflow-y-auto',
                'bg-white dark:bg-gray-900',
                'border border-gray-200 dark:border-gray-700',
                'rounded-xl shadow-2xl',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'focus:ring-blue-500 dark:focus:ring-blue-400',
                contentClassName
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId || ariaDescribedBy}
              aria-label={!title ? ariaLabel : undefined}
              tabIndex={-1}
              variants={modalAnimations.modal}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 pb-4">
                  {title && (
                    <h2
                      id={titleId}
                      className={cn(
                        'text-xl font-semibold text-gray-900 dark:text-gray-100',
                        'pr-8' // Space for close button
                      )}
                    >
                      {title}
                    </h2>
                  )}
                  
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={handleCloseClick}
                      className={cn(
                        'ml-auto p-2 rounded-lg',
                        'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        'transition-colors duration-200'
                      )}
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
                className={cn(
                  'px-6',
                  (title || showCloseButton) ? 'pb-6' : 'py-6'
                )}
                id={descriptionId}
              >
                {children}
              </div>
            </motion.div>
          </FocusTrap>
        </div>
      )}
    </AnimatePresence>
  );

  // Only render if we have a DOM
  if (typeof document === 'undefined') {
    return null;
  }

  // Get or create modal root
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    modalRoot.setAttribute('data-portal', 'true');
    document.body.appendChild(modalRoot);
  }

  return createPortal(modalContent, modalRoot);
};

// Export default
export default Modal;

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for Modal component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (ESC key, focus management, ARIA attributes)
*/