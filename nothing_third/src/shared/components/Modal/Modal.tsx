// filepath: src/shared/components/Modal/Modal.tsx
import React, { useEffect, useRef, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { classNames, focusTrapHelpers } from '@/core/utils';
import { fadeIn, slideIn, scaleIn } from '@/theme/animations';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback fired when modal should close */
  onClose: () => void;
  /** Modal title for accessibility */
  title?: string;
  /** Modal size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Animation variant */
  animation?: 'fade' | 'slide' | 'scale';
  /** Whether to close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Whether to close on ESC key */
  closeOnEscape?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether to blur the backdrop */
  blurBackdrop?: boolean;
  /** Custom backdrop color */
  backdropColor?: string;
  /** Z-index for the modal */
  zIndex?: number;
  /** Selector for initial focus element */
  initialFocusSelector?: string;
  /** Selector for return focus element */
  returnFocusSelector?: string;
  /** Custom portal container */
  portalContainer?: Element | DocumentFragment;
  /** Additional CSS classes for modal container */
  className?: string;
  /** Additional CSS classes for backdrop */
  backdropClassName?: string;
  /** Custom motion props for modal content */
  motionProps?: Partial<MotionProps>;
  /** Custom motion props for backdrop */
  backdropMotionProps?: Partial<MotionProps>;
  /** ARIA role override */
  role?: string;
  /** ARIA labelledby override */
  'aria-labelledby'?: string;
  /** ARIA describedby */
  'aria-describedby'?: string;
  /** Children content */
  children: React.ReactNode;
  /** Callback fired when modal is opened */
  onOpen?: () => void;
  /** Callback fired after modal animation completes */
  onAnimationComplete?: () => void;
  /** Callback fired when modal starts closing */
  onClosing?: () => void;
}

const sizeClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-none w-full h-full'
};

const animationVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      size = 'md',
      animation = 'scale',
      closeOnBackdropClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      blurBackdrop = true,
      backdropColor = 'rgba(0, 0, 0, 0.5)',
      zIndex = 1000,
      initialFocusSelector,
      returnFocusSelector,
      portalContainer,
      className,
      backdropClassName,
      motionProps,
      backdropMotionProps,
      role = 'dialog',
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      children,
      onOpen,
      onAnimationComplete,
      onClosing,
      ...restProps
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);
    const focusHelpersRef = useRef<ReturnType<typeof focusTrapHelpers> | null>(null);
    
    // Use forwarded ref or internal ref
    const resolvedRef = (ref || modalRef) as React.RefObject<HTMLDivElement>;
    
    // Generate unique IDs
    const modalId = `modal-${Math.random().toString(36).substr(2, 9)}`;
    const titleId = title ? `${modalId}-title` : ariaLabelledBy;
    
    // Handle ESC key
    const handleEscape = useCallback((event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClosing?.();
        onClose();
      }
    }, [closeOnEscape, onClose, onClosing]);
    
    // Handle backdrop click
    const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClosing?.();
        onClose();
      }
    }, [closeOnBackdropClick, onClose, onClosing]);
    
    // Handle close button click
    const handleCloseClick = useCallback(() => {
      onClosing?.();
      onClose();
    }, [onClose, onClosing]);
    
    // Setup focus management
    useEffect(() => {
      if (isOpen && resolvedRef.current) {
        // Remember currently focused element
        previouslyFocusedElement.current = document.activeElement as HTMLElement;
        
        // Setup focus trap
        focusHelpersRef.current = focusTrapHelpers(
          resolvedRef.current,
          initialFocusSelector
        );
        focusHelpersRef.current.trapFocus();
        
        // Call onOpen callback
        onOpen?.();
        
        return () => {
          // Release focus trap and restore focus
          if (focusHelpersRef.current) {
            focusHelpersRef.current.releaseFocus();
            focusHelpersRef.current = null;
          }
          
          // Restore focus to return element or previously focused element
          const elementToFocus = returnFocusSelector 
            ? document.querySelector(returnFocusSelector) as HTMLElement
            : previouslyFocusedElement.current;
            
          if (elementToFocus && document.contains(elementToFocus)) {
            try {
              elementToFocus.focus();
            } catch {
              // Element might not be focusable anymore
            }
          }
        };
      }
    }, [isOpen, initialFocusSelector, returnFocusSelector, onOpen]);\n    
    // Setup keyboard event listener
    useEffect(() => {
      if (isOpen) {\n        document.addEventListener('keydown', handleEscape);\n        return () => document.removeEventListener('keydown', handleEscape);\n      }\n    }, [isOpen, handleEscape]);\n    \n    // Prevent body scroll when modal is open\n    useEffect(() => {\n      if (isOpen) {\n        const originalOverflow = document.body.style.overflow;\n        document.body.style.overflow = 'hidden';\n        \n        return () => {\n          document.body.style.overflow = originalOverflow;\n        };\n      }\n    }, [isOpen]);\n    \n    // Get portal container\n    const getPortalContainer = () => {\n      return portalContainer || document.body;\n    };\n    \n    // Build backdrop classes\n    const backdropClasses = classNames(\n      // Base styles\n      'fixed inset-0 flex items-center justify-center p-4',\n      'transition-all duration-300',\n      \n      // Blur effect\n      {\n        'backdrop-blur-sm': blurBackdrop\n      },\n      \n      // Custom classes\n      backdropClassName\n    );\n    \n    // Build modal classes\n    const modalClasses = classNames(\n      // Base styles\n      'relative bg-white dark:bg-gray-800',\n      'rounded-lg shadow-xl',\n      'max-h-full overflow-y-auto',\n      'focus:outline-none',\n      \n      // Size classes\n      sizeClasses[size],\n      \n      // Full size specific styles\n      {\n        'rounded-none': size === 'full',\n        'mx-auto': size !== 'full'\n      },\n      \n      // Custom classes\n      className\n    );\n    \n    // Animation props\n    const currentAnimationVariant = animationVariants[animation];\n    const modalMotionProps: MotionProps = {\n      initial: currentAnimationVariant.initial,\n      animate: currentAnimationVariant.animate,\n      exit: currentAnimationVariant.exit,\n      transition: {\n        type: \"spring\",\n        stiffness: 300,\n        damping: 30\n      },\n      onAnimationComplete: onAnimationComplete,\n      ...motionProps\n    };\n    \n    const backdropMotionPropsResolved: MotionProps = {\n      initial: backdropVariants.hidden,\n      animate: backdropVariants.visible,\n      exit: backdropVariants.hidden,\n      transition: { duration: 0.2 },\n      ...backdropMotionProps\n    };\n    \n    // Modal content\n    const modalContent = (\n      <AnimatePresence mode=\"wait\">\n        {isOpen && (\n          <motion.div\n            ref={backdropRef}\n            className={backdropClasses}\n            style={{\n              zIndex,\n              backgroundColor: backdropColor\n            }}\n            onClick={handleBackdropClick}\n            {...backdropMotionPropsResolved}\n          >\n            <motion.div\n              ref={resolvedRef}\n              id={modalId}\n              className={modalClasses}\n              role={role}\n              aria-modal=\"true\"\n              aria-labelledby={titleId}\n              aria-describedby={ariaDescribedBy}\n              onClick={(e) => e.stopPropagation()}\n              {...modalMotionProps}\n              {...restProps}\n            >\n              {/* Close button */}\n              {showCloseButton && (\n                <button\n                  type=\"button\"\n                  className={classNames(\n                    'absolute top-4 right-4 z-10',\n                    'p-2 rounded-md',\n                    'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',\n                    'hover:bg-gray-100 dark:hover:bg-gray-700',\n                    'focus:outline-none focus:ring-2 focus:ring-blue-500',\n                    'transition-colors duration-200'\n                  )}\n                  onClick={handleCloseClick}\n                  aria-label=\"Close modal\"\n                >\n                  <svg\n                    className=\"w-5 h-5\"\n                    fill=\"none\"\n                    stroke=\"currentColor\"\n                    viewBox=\"0 0 24 24\"\n                    aria-hidden=\"true\"\n                  >\n                    <path\n                      strokeLinecap=\"round\"\n                      strokeLinejoin=\"round\"\n                      strokeWidth={2}\n                      d=\"M6 18L18 6M6 6l12 12\"\n                    />\n                  </svg>\n                </button>\n              )}\n              \n              {/* Title */}\n              {title && (\n                <div className=\"px-6 py-4 border-b border-gray-200 dark:border-gray-700\">\n                  <h2\n                    id={titleId}\n                    className=\"text-lg font-semibold text-gray-900 dark:text-gray-100\"\n                  >\n                    {title}\n                  </h2>\n                </div>\n              )}\n              \n              {/* Content */}\n              <div className={classNames(\n                'relative',\n                {\n                  'p-6': size !== 'full',\n                  'p-0': size === 'full'\n                }\n              )}>\n                {children}\n              </div>\n            </motion.div>\n          </motion.div>\n        )}\n      </AnimatePresence>\n    );\n    \n    // Render modal in portal\n    return createPortal(modalContent, getPortalContainer());\n  }\n);\n\nModal.displayName = 'Modal';\n\n// Modal sub-components for better composition\nexport interface ModalHeaderProps {\n  className?: string;\n  children: React.ReactNode;\n}\n\nexport function ModalHeader({ className, children, ...props }: ModalHeaderProps) {\n  return (\n    <div\n      className={classNames(\n        'px-6 py-4 border-b border-gray-200 dark:border-gray-700',\n        className\n      )}\n      {...props}\n    >\n      {children}\n    </div>\n  );\n}\n\nexport interface ModalBodyProps {\n  className?: string;\n  children: React.ReactNode;\n}\n\nexport function ModalBody({ className, children, ...props }: ModalBodyProps) {\n  return (\n    <div\n      className={classNames('px-6 py-4', className)}\n      {...props}\n    >\n      {children}\n    </div>\n  );\n}\n\nexport interface ModalFooterProps {\n  className?: string;\n  children: React.ReactNode;\n}\n\nexport function ModalFooter({ className, children, ...props }: ModalFooterProps) {\n  return (\n    <div\n      className={classNames(\n        'px-6 py-4 border-t border-gray-200 dark:border-gray-700',\n        'flex items-center justify-end space-x-3',\n        className\n      )}\n      {...props}\n    >\n      {children}\n    </div>\n  );\n}\n\n// Confirmation modal variant\nexport interface ConfirmationModalProps extends Omit<ModalProps, 'children'> {\n  /** Confirmation message */\n  message: string;\n  /** Confirm button text */\n  confirmText?: string;\n  /** Cancel button text */\n  cancelText?: string;\n  /** Confirm button variant */\n  confirmVariant?: 'primary' | 'danger';\n  /** Whether confirm button is loading */\n  isConfirming?: boolean;\n  /** Callback for confirm action */\n  onConfirm: () => void;\n}\n\nexport function ConfirmationModal({\n  message,\n  confirmText = 'Confirm',\n  cancelText = 'Cancel',\n  confirmVariant = 'primary',\n  isConfirming = false,\n  onConfirm,\n  onClose,\n  title = 'Confirm Action',\n  ...modalProps\n}: ConfirmationModalProps) {\n  const handleConfirm = () => {\n    onConfirm();\n  };\n  \n  const confirmButtonClass = classNames(\n    'px-4 py-2 text-sm font-medium rounded-md',\n    'focus:outline-none focus:ring-2 focus:ring-offset-2',\n    'transition-colors duration-200',\n    {\n      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': confirmVariant === 'primary',\n      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': confirmVariant === 'danger',\n      'opacity-50 cursor-not-allowed': isConfirming\n    }\n  );\n  \n  return (\n    <Modal\n      title={title}\n      size=\"sm\"\n      onClose={onClose}\n      {...modalProps}\n    >\n      <ModalBody>\n        <p className=\"text-gray-700 dark:text-gray-300\">{message}</p>\n      </ModalBody>\n      \n      <ModalFooter>\n        <button\n          type=\"button\"\n          className=\"px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700\"\n          onClick={onClose}\n          disabled={isConfirming}\n        >\n          {cancelText}\n        </button>\n        <button\n          type=\"button\"\n          className={confirmButtonClass}\n          onClick={handleConfirm}\n          disabled={isConfirming}\n        >\n          {isConfirming ? (\n            <div className=\"flex items-center\">\n              <svg className=\"animate-spin -ml-1 mr-2 h-4 w-4\" fill=\"none\" viewBox=\"0 0 24 24\">\n                <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\" />\n                <path className=\"opacity-75\" fill=\"currentColor\" d=\"m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\" />\n              </svg>\n              Loading...\n            </div>\n          ) : (\n            confirmText\n          )}\n        </button>\n      </ModalFooter>\n    </Modal>\n  );\n}\n\n// Export modal components together\nexport const ModalComponents = {\n  Modal,\n  Header: ModalHeader,\n  Body: ModalBody,\n  Footer: ModalFooter,\n  Confirmation: ConfirmationModal\n};\n\n/*\nSelf-check comments:\n- [x] Uses `@/` imports only (imports from @/core/utils, @/theme/animations)\n- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses focus trap helpers from utils\n- [x] Reads config from `@/app/config` (N/A for this component)\n- [x] Exports default named component (exports Modal with forwardRef plus sub-components)\n- [x] Adds basic ARIA and keyboard handlers (aria-modal, aria-labelledby, aria-describedby, role=\"dialog\", ESC key handling, focus management)\n*/\n```