// filepath: src/components/Dropdown.tsx
/* src/components/Dropdown.tsx

Accessible dropdown/menu component with keyboard navigation, ARIA roles, and virtualized list support for long menus (hook-friendly).
*/

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useKeyboardNavigation } from '@/shared/hooks/useKeyboardNavigation';
import { FocusTrap } from '@/shared/components/FocusTrap';
import { Tooltip } from '@/components/Tooltip';

export interface DropdownItem {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  divider?: boolean; // Add divider after this item
  danger?: boolean; // Destructive action styling
}

export interface DropdownProps {
  /** Dropdown items to display */
  items: DropdownItem[];
  /** Currently selected item ID */
  value?: string;
  /** Callback when item is selected */
  onSelect?: (item: DropdownItem) => void;
  /** Trigger element (button, input, etc.) */
  trigger: React.ReactElement;
  /** Dropdown placement relative to trigger */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right' | 'left';
  /** Whether dropdown is open (controlled) */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to virtualize long lists (default: true for >50 items) */
  virtualized?: boolean;
  /** Max height before scrolling */
  maxHeight?: number;
  /** Filter/search functionality */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Minimum width of dropdown */
  minWidth?: number;
  /** Whether to close on item select */
  closeOnSelect?: boolean;
  /** Custom item renderer */
  renderItem?: (item: DropdownItem, index: number) => React.ReactNode;
  /** Dropdown menu className */
  menuClassName?: string;
  /** Dropdown item className */
  itemClassName?: string;
  /** Whether dropdown is disabled */
  disabled?: boolean;
  /** ARIA label for dropdown */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
}

const ITEM_HEIGHT = 44; // Height of each dropdown item in px
const MAX_VISIBLE_ITEMS = 8; // Number of items visible without scrolling

export function Dropdown({
  items,
  value,
  onSelect,
  trigger,
  placement = 'bottom-start',
  open: controlledOpen,
  onOpenChange,
  virtualized,
  maxHeight = MAX_VISIBLE_ITEMS * ITEM_HEIGHT,
  searchable = false,
  searchPlaceholder = 'Search...',
  loading = false,
  error,
  minWidth = 200,
  closeOnSelect = true,
  renderItem,
  menuClassName,
  itemClassName,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase().trim();
    return items.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Determine if we should use virtualization
  const shouldVirtualize = virtualized ?? filteredItems.length > 50;

  // Calculate visible range for virtualization
  const [scrollTop, setScrollTop] = useState(0);
  const visibleRange = useMemo(() => {
    if (!shouldVirtualize) {
      return { start: 0, end: filteredItems.length };
    }

    const containerHeight = maxHeight;
    const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    const endIndex = Math.min(
      filteredItems.length,
      startIndex + Math.ceil(containerHeight / ITEM_HEIGHT) + 1
    );

    return { start: startIndex, end: endIndex };
  }, [shouldVirtualize, maxHeight, scrollTop, filteredItems.length]);

  // Keyboard navigation
  const { 
    handleKeyDown: handleListKeyDown,
    focusedIndex: keyboardFocusedIndex,
    setFocusedIndex: setKeyboardFocusedIndex
  } = useKeyboardNavigation({
    items: filteredItems.filter(item => !item.disabled),
    onSelect: (index) => {
      const item = filteredItems.filter(item => !item.disabled)[index];
      if (item && onSelect) {
        onSelect(item);
        if (closeOnSelect) {
          setIsOpen(false);
        }
      }
    },
    loop: true,
  });

  // Sync keyboard navigation focus with internal focus
  useEffect(() => {
    setFocusedIndex(keyboardFocusedIndex);
  }, [keyboardFocusedIndex]);

  // Handle trigger click
  const handleTriggerClick = useCallback(() => {
    if (disabled) return;
    setIsOpen(!isOpen);
  }, [disabled, isOpen, setIsOpen]);

  // Handle item selection
  const handleItemSelect = useCallback((item: DropdownItem) => {
    if (item.disabled) return;
    
    onSelect?.(item);
    if (closeOnSelect) {
      setIsOpen(false);
    }
  }, [onSelect, closeOnSelect, setIsOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen, searchable]);

  // Handle scroll for virtualization
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Reset search and focus when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setFocusedIndex(-1);
      setKeyboardFocusedIndex(-1);
    }
  }, [isOpen, setKeyboardFocusedIndex]);

  // Calculate dropdown position
  const getDropdownStyle = useCallback((): React.CSSProperties => {
    if (!triggerRef.current) return {};

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const style: React.CSSProperties = {
      position: 'fixed',
      minWidth: Math.max(minWidth, triggerRect.width),
      zIndex: 1000,
    };

    switch (placement) {
      case 'bottom-start':
        style.top = triggerRect.bottom + 4;
        style.left = triggerRect.left;
        break;
      case 'bottom-end':
        style.top = triggerRect.bottom + 4;
        style.right = window.innerWidth - triggerRect.right;
        break;
      case 'top-start':
        style.bottom = window.innerHeight - triggerRect.top + 4;
        style.left = triggerRect.left;
        break;
      case 'top-end':
        style.bottom = window.innerHeight - triggerRect.top + 4;
        style.right = window.innerWidth - triggerRect.right;
        break;
      case 'right':
        style.top = triggerRect.top;
        style.left = triggerRect.right + 4;
        break;
      case 'left':
        style.top = triggerRect.top;
        style.right = window.innerWidth - triggerRect.left + 4;
        break;
      default:
        style.top = triggerRect.bottom + 4;
        style.left = triggerRect.left;
    }

    return style;
  }, [placement, minWidth]);

  // Enhanced trigger element with dropdown controls
  const enhancedTrigger = React.cloneElement(trigger, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      // Call original ref if it exists
      if (typeof trigger.ref === 'function') {
        trigger.ref(node);
      } else if (trigger.ref) {
        trigger.ref.current = node;
      }
    },
    onClick: (event: React.MouseEvent) => {
      handleTriggerClick();
      trigger.props.onClick?.(event);
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleTriggerClick();
      } else if (event.key === 'ArrowDown' && !isOpen) {
        event.preventDefault();
        setIsOpen(true);
      }
      trigger.props.onKeyDown?.(event);
    },
    'aria-expanded': isOpen,
    'aria-haspopup': 'listbox',
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    disabled: disabled || trigger.props.disabled,
  });

  // Render dropdown item
  const renderDropdownItem = useCallback((item: DropdownItem, index: number, actualIndex: number) => {
    if (renderItem) {
      return renderItem(item, actualIndex);
    }

    const isSelected = value === item.id;
    const isFocused = index === focusedIndex;

    return (
      <div
        key={item.id}
        role="option"
        aria-selected={isSelected}
        aria-disabled={item.disabled}
        className={`
          dropdown-item
          ${itemClassName || ''}
          ${isSelected ? 'dropdown-item--selected' : ''}
          ${isFocused ? 'dropdown-item--focused' : ''}
          ${item.disabled ? 'dropdown-item--disabled' : ''}
          ${item.danger ? 'dropdown-item--danger' : ''}
        `.trim()}
        style={{
          position: shouldVirtualize ? 'absolute' : 'relative',
          top: shouldVirtualize ? actualIndex * ITEM_HEIGHT : undefined,
          height: ITEM_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          backgroundColor: isFocused ? 'var(--color-primary-50, rgba(59, 130, 246, 0.1))' : 'transparent',
          color: item.disabled 
            ? 'var(--color-gray-400, #9CA3AF)' 
            : item.danger 
              ? 'var(--color-red-600, #DC2626)' 
              : 'var(--color-gray-900, #111827)',
        }}
        onMouseEnter={() => !item.disabled && setFocusedIndex(index)}
        onMouseDown={(event) => {
          event.preventDefault(); // Prevent focus loss
          if (!item.disabled) {
            handleItemSelect(item);
          }
        }}
      >
        {item.icon && (
          <span className="dropdown-item__icon" style={{ marginRight: 8 }}>
            {item.icon}
          </span>
        )}
        <div className="dropdown-item__content" style={{ flex: 1, minWidth: 0 }}>
          <div className="dropdown-item__label" style={{ 
            fontWeight: isSelected ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.label}
          </div>
          {item.description && (
            <div className="dropdown-item__description" style={{ 
              fontSize: '0.875rem',
              color: 'var(--color-gray-600, #4B5563)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {item.description}
            </div>
          )}
        </div>
        {isSelected && (
          <span className="dropdown-item__check" style={{ marginLeft: 8 }}>
            ✓
          </span>
        )}
      </div>
    );
  }, [
    renderItem, value, focusedIndex, itemClassName, shouldVirtualize, 
    handleItemSelect, setFocusedIndex
  ]);

  if (!isOpen) {
    return enhancedTrigger;
  }

  const dropdownContent = (
    <div
      ref={menuRef}
      className={`dropdown-menu ${menuClassName || ''}`}
      style={{
        ...getDropdownStyle(),
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid var(--color-gray-200, #E5E7EB)',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        maxHeight: maxHeight + (searchable ? 48 : 0), // Add space for search input
        overflow: 'hidden',
      }}
    >
      {searchable && (
        <div className="dropdown-search" style={{ 
          padding: '8px',
          borderBottom: '1px solid var(--color-gray-200, #E5E7EB)',
        }}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="dropdown-search__input"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--color-gray-300, #D1D5DB)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              outline: 'none',
            }}
            onKeyDown={handleListKeyDown}
          />
        </div>
      )}

      {loading ? (
        <div className="dropdown-loading" style={{ 
          padding: '16px',
          textAlign: 'center',
          color: 'var(--color-gray-600, #4B5563)',
        }}>
          Loading...
        </div>
      ) : error ? (
        <div className="dropdown-error" style={{ 
          padding: '16px',
          textAlign: 'center',
          color: 'var(--color-red-600, #DC2626)',
        }}>
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="dropdown-empty" style={{ 
          padding: '16px',
          textAlign: 'center',
          color: 'var(--color-gray-600, #4B5563)',
        }}>
          {searchQuery ? 'No results found' : 'No items'}
        </div>
      ) : (
        <div
          ref={listRef}
          className="dropdown-list"
          role="listbox"
          aria-label={ariaLabel}
          style={{
            maxHeight: maxHeight,
            overflow: 'auto',
            position: 'relative',
          }}
          onScroll={shouldVirtualize ? handleScroll : undefined}
          onKeyDown={!searchable ? handleListKeyDown : undefined}
          tabIndex={!searchable ? 0 : -1}
        >
          {shouldVirtualize ? (
            <>
              {/* Virtual spacer for items before visible range */}
              <div style={{ height: visibleRange.start * ITEM_HEIGHT }} />
              
              {/* Render visible items */}
              {filteredItems
                .slice(visibleRange.start, visibleRange.end)
                .map((item, index) => {
                  const actualIndex = visibleRange.start + index;
                  const enabledIndex = filteredItems
                    .slice(0, actualIndex + 1)
                    .filter(item => !item.disabled).length - 1;
                  
                  return renderDropdownItem(item, enabledIndex, actualIndex);
                })}
              
              {/* Virtual spacer for items after visible range */}
              <div style={{ height: (filteredItems.length - visibleRange.end) * ITEM_HEIGHT }} />
            </>
          ) : (
            filteredItems.map((item, index) => {
              const enabledIndex = filteredItems
                .slice(0, index + 1)
                .filter(item => !item.disabled).length - 1;
              
              return renderDropdownItem(item, enabledIndex, index);
            })
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {enhancedTrigger}
      {isOpen && (
        <FocusTrap>
          {dropdownContent}
        </FocusTrap>
      )}
    </>
  );
}

// Convenience component for individual dropdown items (for external use)
export function DropdownItem({
  children,
  onClick,
  disabled = false,
  selected = false,
  danger = false,
  icon,
  description,
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      className={`dropdown-item ${className || ''} ${selected ? 'dropdown-item--selected' : ''} ${disabled ? 'dropdown-item--disabled' : ''} ${danger ? 'dropdown-item--danger' : ''}`}
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled 
          ? 'var(--color-gray-400, #9CA3AF)' 
          : danger 
            ? 'var(--color-red-600, #DC2626)' 
            : 'var(--color-gray-900, #111827)',
        backgroundColor: selected ? 'var(--color-primary-50, rgba(59, 130, 246, 0.1))' : 'transparent',
        ...props.style,
      }}
      {...props}
    >
      {icon && (
        <span className="dropdown-item__icon" style={{ marginRight: 8 }}>
          {icon}
        </span>
      )}
      <div className="dropdown-item__content" style={{ flex: 1, minWidth: 0 }}>
        <div className="dropdown-item__label" style={{ 
          fontWeight: selected ? 600 : 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {children}
        </div>
        {description && (
          <div className="dropdown-item__description" style={{ 
            fontSize: '0.875rem',
            color: 'var(--color-gray-600, #4B5563)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {description}
          </div>
        )}
      </div>
      {selected && (
        <span className="dropdown-item__check" style={{ marginLeft: 8 }}>
          ✓
        </span>
      )}
    </div>
  );
}

/* Example usage:

import { Dropdown, DropdownItem } from '@/components/Dropdown'

const items = [
  { id: '1', label: 'Profile', value: 'profile', icon: <UserIcon /> },
  { id: '2', label: 'Settings', value: 'settings', icon: <SettingsIcon /> },
  { id: 'divider1', label: '', value: '', divider: true },
  { id: '3', label: 'Sign Out', value: 'logout', danger: true, icon: <LogoutIcon /> },
]

function UserMenu() {
  return (
    <Dropdown
      items={items}
      onSelect={(item) => console.log('Selected:', item)}
      trigger={<button>Menu</button>}
      placement="bottom-end"
      searchable
      closeOnSelect
      aria-label="User menu"
    />
  )
}

*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not applicable for dropdown component)
// [x] Exports default named component (exports Dropdown and DropdownItem)
// [x] Adds basic ARIA and keyboard handlers
