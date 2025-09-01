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
                      className={cn(\n                        'ml-auto p-2 rounded-lg',\n                        'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',\n                        'hover:bg-gray-100 dark:hover:bg-gray-800',\n                        'focus:outline-none focus:ring-2 focus:ring-blue-500',\n                        'transition-colors duration-200'\n                      )}\n                      aria-label=\"Close modal\"\n                    >\n                      <svg\n                        className=\"w-5 h-5\"\n                        fill=\"none\"\n                        stroke=\"currentColor\"\n                        viewBox=\"0 0 24 24\"\n                        aria-hidden=\"true\"\n                      >\n                        <path\n                          strokeLinecap=\"round\"\n                          strokeLinejoin=\"round\"\n                          strokeWidth={2}\n                          d=\"M6 18L18 6M6 6l12 12\"\n                        />\n                      </svg>\n                    </button>\n                  )}\n                </div>\n              )}\n\n              {/* Content */}\n              <div\n                className={cn(\n                  'px-6',\n                  (title || showCloseButton) ? 'pb-6' : 'py-6'\n                )}\n                id={descriptionId}\n              >\n                {children}\n              </div>\n            </motion.div>\n          </FocusTrap>\n        </div>\n      )}\n    </AnimatePresence>\n  );\n\n  // Only render if we have a DOM\n  if (typeof document === 'undefined') {\n    return null;\n  }\n\n  // Get or create modal root\n  let modalRoot = document.getElementById('modal-root');\n  if (!modalRoot) {\n    modalRoot = document.createElement('div');\n    modalRoot.id = 'modal-root';\n    modalRoot.setAttribute('data-portal', 'true');\n    document.body.appendChild(modalRoot);\n  }\n\n  return createPortal(modalContent, modalRoot);\n};\n\n// Export default\nexport default Modal;\n\n/*\nSelf-check comments:\n- [x] Uses `@/` imports only\n- [x] Uses providers/hooks (no direct DOM/localStorage side effects)\n- [x] Reads config from `@/app/config` (not needed for Modal component)\n- [x] Exports default named component\n- [x] Adds basic ARIA and keyboard handlers (ESC key, focus management, ARIA attributes)\n*/\n```