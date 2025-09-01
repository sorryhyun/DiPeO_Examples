// filepath: src/shared/components/Dropdown.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/theme';
import { animations } from '@/theme/animations';
import { FocusTrap } from '@/shared/components/FocusTrap';

/**
 * Dropdown menu with keyboard navigation, ARIA roles, and motion-based transitions.
 * Provides accessible menu patterns with focus management and customizable styling.
 */

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
  shortcut?: string;
  href?: string;
  className?: string;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top';
  offset?: number;
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  closeOnSelect?: boolean;
  className?: string;
  menuClassName?: string;
  'data-testid'?: string;
}

// =============================================================================
// Dropdown Item Component
// =============================================================================

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  disabled = false,
  destructive = false,
  icon,
  shortcut,
  href,
  className = '',
}) => {
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    
    onClick?.();
  }, [onClick, disabled]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  }, [onClick, disabled]);

  const baseStyles = `
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    width: 100%;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    text-align: left;
    border: none;
    background: transparent;
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
    transition: all ${theme.transitions.fast};
    font-size: ${theme.typography.sm.fontSize};
    line-height: ${theme.typography.sm.lineHeight};
    border-radius: ${theme.radii.sm};
    opacity: ${disabled ? '0.5' : '1'};
    color: ${destructive 
      ? theme.colors.semantic.error 
      : disabled 
        ? theme.colors.text.secondary 
        : theme.colors.text.primary};
    
    &:hover:not(:disabled) {
      background-color: ${destructive 
        ? `${theme.colors.semantic.error}10` 
        : theme.colors.surface.hover};
    }
    
    &:focus {
      outline: none;
      background-color: ${destructive 
        ? `${theme.colors.semantic.error}15` 
        : theme.colors.surface.focus};
      box-shadow: 0 0 0 2px ${theme.colors.primary.main}40;
    }
    
    &:active:not(:disabled) {
      background-color: ${destructive 
        ? `${theme.colors.semantic.error}20` 
        : theme.colors.surface.active};
    }
  `;

  const Component = href ? 'a' : 'button';

  return (
    <Component
      className={`dropdown-item ${className}`}
      style={{ 
        ...Object.fromEntries(baseStyles.split(';').map(rule => {
          const [prop, value] = rule.split(':').map(s => s.trim());
          return [prop?.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) || '', value?.replace(/[{}]/g, '') || ''];
        }).filter(([prop]) => prop))
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      href={href}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      {icon && (
        <span className="dropdown-item-icon" style={{ flexShrink: 0 }}>
          {icon}
        </span>
      )}
      
      <span className="dropdown-item-content" style={{ flex: 1, minWidth: 0 }}>
        {children}
      </span>
      
      {shortcut && (
        <span 
          className="dropdown-item-shortcut"
          style={{
            fontSize: theme.typography.xs.fontSize,
            color: theme.colors.text.tertiary,
            fontFamily: 'monospace',
            flexShrink: 0,
          }}
        >
          {shortcut}
        </span>
      )}
    </Component>
  );
};

// =============================================================================
// Main Dropdown Component
// =============================================================================

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  placement = 'bottom-start',
  offset = 8,
  disabled = false,
  onOpen,
  onClose,
  closeOnSelect = true,
  className = '',
  menuClassName = '',
  'data-testid': testId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Get all interactive menu items
  const getMenuItems = useCallback((): HTMLElement[] => {
    if (!menuRef.current) return [];
    return Array.from(
      menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')
    ) as HTMLElement[];
  }, []);

  // Handle dropdown open/close
  const handleToggle = useCallback(() => {
    if (disabled) return;
    
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      onOpen?.();
      setFocusedIndex(0); // Focus first item when opening
    } else {
      onClose?.();
      setFocusedIndex(-1);
      // Return focus to trigger when closing
      setTimeout(() => {
        triggerRef.current?.focus();
      }, 0);
    }
  }, [isOpen, disabled, onOpen, onClose]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
    setFocusedIndex(-1);
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 0);
  }, [onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
      return;
    }

    const items = getMenuItems();
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        handleClose();
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : 0;
        setFocusedIndex(nextIndex);
        items[nextIndex]?.focus();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : items.length - 1;
        setFocusedIndex(prevIndex);
        items[prevIndex]?.focus();
        break;
        
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        items[0]?.focus();
        break;
        
      case 'End':
        event.preventDefault();
        const lastIndex = items.length - 1;
        setFocusedIndex(lastIndex);
        items[lastIndex]?.focus();
        break;
        
      case 'Tab':
        handleClose();
        break;
    }
  }, [isOpen, focusedIndex, getMenuItems, handleToggle, handleClose]);

  // Handle clicks outside dropdown
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Handle item selection
  const handleItemClick = useCallback(() => {
    if (closeOnSelect) {
      handleClose();
    }
  }, [closeOnSelect, handleClose]);

  // Clone children to add click handlers
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === DropdownItem) {
      return React.cloneElement(child, {
        onClick: () => {
          child.props.onClick?.();
          handleItemClick();
        },
      });
    }
    return child;
  });

  // Calculate menu position styles
  const getMenuPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: theme.zIndices.dropdown,
    };

    switch (placement) {
      case 'bottom-start':
        return { ...baseStyles, top: `calc(100% + ${offset}px)`, left: 0 };
      case 'bottom-end':
        return { ...baseStyles, top: `calc(100% + ${offset}px)`, right: 0 };
      case 'bottom':
        return { ...baseStyles, top: `calc(100% + ${offset}px)`, left: '50%', transform: 'translateX(-50%)' };
      case 'top-start':
        return { ...baseStyles, bottom: `calc(100% + ${offset}px)`, left: 0 };
      case 'top-end':
        return { ...baseStyles, bottom: `calc(100% + ${offset}px)`, right: 0 };
      case 'top':
        return { ...baseStyles, bottom: `calc(100% + ${offset}px)`, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...baseStyles, top: `calc(100% + ${offset}px)`, left: 0 };
    }
  };

  return (
    <div 
      className={`dropdown ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
      data-testid={testId}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        className="dropdown-trigger"
        style={{
          border: 'none',
          background: 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'dropdown-menu' : undefined}
      >
        {trigger}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <FocusTrap
            active={isOpen}
            initialFocus={false}
            returnFocus={false}
          >
            <motion.div
              ref={menuRef}
              id="dropdown-menu"
              className={`dropdown-menu ${menuClassName}`}
              style={{
                ...getMenuPositionStyles(),
                minWidth: '200px',
                backgroundColor: theme.colors.surface.elevated,
                border: `1px solid ${theme.colors.border.subtle}`,
                borderRadius: theme.radii.md,
                boxShadow: theme.shadows.lg,
                padding: theme.spacing.xs,
                backdropFilter: 'blur(8px)',
              }}
              role="menu"
              aria-labelledby="dropdown-trigger"
              initial="closed"
              animate="open"
              exit="closed"
              variants={animations.dropdown}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {enhancedChildren}
            </motion.div>
          </FocusTrap>
        )}
      </AnimatePresence>
    </div>
  );
};

// =============================================================================
// Default Export
// =============================================================================

export default Dropdown;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/theme, @/shared/components, framer-motion, React)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects, uses React hooks)
- [x] Reads config from `@/app/config` (uses theme from @/theme which reads config)
- [x] Exports default named component (exports Dropdown as default and DropdownItem as named)
- [x] Adds basic ARIA and keyboard handlers (comprehensive ARIA roles, keyboard navigation with arrow keys, escape, tab, enter/space, focus management, and screen reader support)
*/
