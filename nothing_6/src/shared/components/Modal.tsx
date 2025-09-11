// filepath: src/shared/components/Modal.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { motionPresets, durations } from '@/theme/animations'
import { uid } from '@/core/utils'
import { config } from '@/app/config'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  className?: string
  overlayClassName?: string
  contentClassName?: string
  preventScroll?: boolean
  initialFocus?: React.RefObject<HTMLElement>
  restoreFocus?: boolean
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full h-full'
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
  className = '',
  overlayClassName = '',
  contentClassName = '',
  preventScroll = true,
  initialFocus,
  restoreFocus = true,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}) => {
  const modalId = useRef(uid('modal-'))
  const titleId = useRef(uid('modal-title-'))
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([])

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return

    // Store the previously focused element
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement
    }

    // Get focusable elements within modal
    const getFocusableElements = (): HTMLElement[] => {
      if (!contentRef.current) return []
      
      const focusableSelectors = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable]'
      ].join(', ')
      
      return Array.from(contentRef.current.querySelectorAll(focusableSelectors))
    }

    const elements = getFocusableElements()
    setFocusableElements(elements)

    // Set initial focus
    const focusTarget = initialFocus?.current || elements[0]
    if (focusTarget) {
      // Delay focus to ensure modal is fully rendered
      requestAnimationFrame(() => {
        focusTarget.focus()
      })
    }

    // Handle tab key for focus trap
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (elements.length === 0) return

        const firstElement = elements[0]
        const lastElement = elements[elements.length - 1]

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }

      // Handle escape key
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeOnEscape, onClose, initialFocus, restoreFocus])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!preventScroll) return

    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen, preventScroll])

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && restoreFocus && previousActiveElement.current) {
      // Small delay to ensure the modal is fully unmounted
      requestAnimationFrame(() => {
        if (previousActiveElement.current) {
          previousActiveElement.current.focus()
        }
      })
    }
  }, [isOpen, restoreFocus])

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === overlayRef.current) {
      onClose()
    }
  }

  const handleCloseClick = () => {
    onClose()
  }

  // Determine ARIA attributes
  const ariaProps: Record<string, string> = {}
  
  if (ariaLabel) {
    ariaProps['aria-label'] = ariaLabel
  } else if (title || ariaLabelledby) {
    ariaProps['aria-labelledby'] = ariaLabelledby || titleId.current
  }

  if (ariaDescribedby) {
    ariaProps['aria-describedby'] = ariaDescribedby
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm ${overlayClassName}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durations.normal / 1000 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal Content Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              ref={contentRef}
              className={`
                relative w-full ${sizeClasses[size]} 
                bg-white dark:bg-gray-900 
                rounded-xl shadow-2xl
                ${size === 'full' ? 'm-0' : 'mx-auto my-8'}
                ${className}
              `}
              variants={motionPresets.scale}
              initial="initial"
              animate="animate"
              exit="exit"
              role="dialog"
              aria-modal="true"
              {...ariaProps}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 pb-4">
                  {title && (
                    <h2 
                      id={ariaLabelledby || titleId.current}
                      className="text-xl font-semibold text-gray-900 dark:text-white"
                    >
                      {title}
                    </h2>
                  )}
                  
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={handleCloseClick}
                      className="
                        ml-auto flex h-8 w-8 items-center justify-center
                        rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600
                        dark:hover:bg-gray-800 dark:hover:text-gray-300
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      "
                      aria-label="Close modal"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className={`${title || showCloseButton ? 'px-6 pb-6' : 'p-6'} ${contentClassName}`}>
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Helper hook for modal state management
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(!isOpen)

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  }
}

// Higher-order component for quick modal creation
export const withModal = <P extends object>(
  Component: React.ComponentType<P>,
  defaultProps?: Partial<ModalProps>
) => {
  return React.forwardRef<HTMLDivElement, P & ModalProps>((props, ref) => {
    const modalProps = { ...defaultProps, ...props }
    const componentProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => 
        !['isOpen', 'onClose', 'title', 'size', 'closeOnBackdrop', 'closeOnEscape', 'showCloseButton'].includes(key)
      )
    ) as P

    return (
      <Modal {...modalProps}>
        <Component {...componentProps} ref={ref} />
      </Modal>
    )
  })
}

export default Modal

// Development helpers
if (config.isDevelopment && typeof window !== 'undefined') {
  (window as any).__MODAL_DEBUG__ = {
    useModal,
    withModal,
  }
}

// Example usage (commented):
// const ExampleModal = () => {
//   const modal = useModal()
//   
//   return (
//     <>
//       <button onClick={modal.open}>Open Modal</button>
//       <Modal 
//         isOpen={modal.isOpen} 
//         onClose={modal.close}
//         title="Example Modal"
//         size="md"
//       >
//         <p>Modal content goes here...</p>
//         <div className="mt-4 flex gap-2">
//           <button onClick={modal.close}>Cancel</button>
//           <button onClick={modal.close}>Confirm</button>
//         </div>
//       </Modal>
//     </>
//   )
// }
