// filepath: src/shared/components/Accordion.tsx

/*
- [x] Uses `@/` imports as much as possible
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/

import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { motionPresets, durations } from '@/theme/animations'
import GlassCard from '@/shared/components/GlassCard'

// Accordion context interface
interface AccordionContextValue {
  openItems: string[]
  toggleItem: (itemId: string) => void
  allowMultiple: boolean
  disabled: boolean
}

// Create accordion context
const AccordionContext = createContext<AccordionContextValue | null>(null)

// Hook to use accordion context
function useAccordion() {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('useAccordion must be used within an Accordion component')
  }
  return context
}

// Accordion item data interface
export interface AccordionItemData {
  id: string
  title: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
  badge?: React.ReactNode
}

// Accordion props interface
export interface AccordionProps {
  /** Accordion items data */
  items?: AccordionItemData[]
  /** Children (for manual AccordionItem usage) */
  children?: React.ReactNode
  /** Allow multiple items to be open simultaneously */
  allowMultiple?: boolean
  /** Initially open item IDs */
  defaultOpen?: string | string[]
  /** Controlled open state */
  open?: string | string[]
  /** Callback when items are opened/closed */
  onOpenChange?: (openItems: string[]) => void
  /** Disable all items */
  disabled?: boolean
  /** Custom styling */
  className?: string
  /** Glass card variant */
  variant?: 'default' | 'flat' | 'elevated' | 'glass'
  /** Animation variant */
  animation?: 'fade' | 'slide' | 'scale'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

// Individual accordion item props
export interface AccordionItemProps {
  /** Unique identifier */
  id: string
  /** Item title/trigger content */
  title: React.ReactNode
  /** Item body content */
  children: React.ReactNode
  /** Disable this specific item */
  disabled?: boolean
  /** Optional icon */
  icon?: React.ReactNode
  /** Optional badge */
  badge?: React.ReactNode
  /** Custom trigger className */
  triggerClassName?: string
  /** Custom content className */
  contentClassName?: string
}

// Accordion Item component
export function AccordionItem({
  id,
  title,
  children,
  disabled = false,
  icon,
  badge,
  triggerClassName = '',
  contentClassName = '',
}: AccordionItemProps) {
  const { openItems, toggleItem, disabled: contextDisabled } = useAccordion()
  const isOpen = openItems.includes(id)
  const isDisabled = disabled || contextDisabled
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto')

  // Handle toggle
  const handleToggle = useCallback(() => {
    if (isDisabled) return
    toggleItem(id)
    
    // Emit analytics event
    eventBus.emit('accordion:toggle', {
      itemId: id,
      isOpen: !isOpen,
      timestamp: Date.now(),
    })
  }, [id, isDisabled, isOpen, toggleItem])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (isDisabled) return
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        handleToggle()
        break
      case 'ArrowDown':
      case 'ArrowUp':
        // Allow parent to handle arrow navigation
        break
    }
  }, [handleToggle, isDisabled])

  // Measure content height for animation
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight
      setContentHeight(isOpen ? height : 0)
    }
  }, [isOpen, children])

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        className={`
          w-full px-4 py-4 text-left flex items-center justify-between
          transition-colors duration-200 ease-in-out
          hover:bg-gray-50 dark:hover:bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen ? 'bg-gray-50 dark:bg-gray-800' : ''}
          ${triggerClassName}
        `.trim()}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
        aria-disabled={isDisabled}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
              {icon}
            </div>
          )}
          
          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {title}
            </div>
          </div>
          
          {/* Badge */}
          {badge && (
            <div className="flex-shrink-0 ml-2">
              {badge}
            </div>
          )}
        </div>
        
        {/* Chevron Icon */}
        <div className="flex-shrink-0 ml-4">
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: durations.fast / 1000 }}
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </motion.svg>
        </div>
      </button>
      
      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-content-${id}`}
            role="region"
            aria-labelledby={`accordion-trigger-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: contentHeight, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: durations.normal / 1000, ease: 'easeInOut' },
              opacity: { duration: durations.fast / 1000, ease: 'easeInOut' },
            }}
            className="overflow-hidden"
          >
            <div
              ref={contentRef}
              className={`
                px-4 py-4 text-gray-700 dark:text-gray-300
                border-t border-gray-100 dark:border-gray-700
                ${contentClassName}
              `.trim()}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Main Accordion component
export function Accordion({
  items = [],
  children,
  allowMultiple = false,
  defaultOpen,
  open,
  onOpenChange,
  disabled = false,
  className = '',
  variant = 'default',
  animation = 'slide',
  size = 'md',
}: AccordionProps) {
  // Internal state for open items
  const [internalOpenItems, setInternalOpenItems] = useState<string[]>(() => {
    if (open !== undefined) return Array.isArray(open) ? open : [open]
    if (defaultOpen !== undefined) return Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen]
    return []
  })

  // Use controlled or internal state
  const openItems = open !== undefined 
    ? (Array.isArray(open) ? open : [open])
    : internalOpenItems

  // Toggle item function
  const toggleItem = useCallback((itemId: string) => {
    const newOpenItems = openItems.includes(itemId)
      ? openItems.filter(id => id !== itemId) // Close item
      : allowMultiple 
        ? [...openItems, itemId] // Add to open items
        : [itemId] // Replace open items (single mode)

    // Update internal state if not controlled
    if (open === undefined) {
      setInternalOpenItems(newOpenItems)
    }

    // Call external handler
    onOpenChange?.(newOpenItems)
  }, [openItems, allowMultiple, open, onOpenChange])

  // Context value
  const contextValue: AccordionContextValue = {
    openItems,
    toggleItem,
    allowMultiple,
    disabled,
  }

  // Size class mapping
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <AccordionContext.Provider value={contextValue}>
      <GlassCard
        variant={variant}
        className={`
          accordion overflow-hidden
          ${sizeClasses[size]}
          ${className}
        `.trim()}
        role="tablist"
        aria-multiselectable={allowMultiple}
      >
        {/* Render items from props */}
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            id={item.id}
            title={item.title}
            disabled={item.disabled}
            icon={item.icon}
            badge={item.badge}
          >
            {item.content}
          </AccordionItem>
        ))}
        
        {/* Render children */}
        {children}
      </GlassCard>
    </AccordionContext.Provider>
  )
}

// Default export
export default Accordion

// Development helpers
if (config.isDevelopment) {
  Accordion.displayName = 'Accordion'
  AccordionItem.displayName = 'AccordionItem'
}
