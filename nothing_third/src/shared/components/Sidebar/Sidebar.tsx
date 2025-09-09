// filepath: src/shared/components/Sidebar/Sidebar.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import { classNames, focusTrapHelpers } from '@/core/utils';
import { useTheme } from '@/providers/ThemeProvider';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: string | number;
  children?: SidebarNavItem[];
}

export interface SidebarNavGroup {
  id: string;
  title: string;
  items: SidebarNavItem[];
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface SidebarProps {
  // Navigation structure
  groups: SidebarNavGroup[];
  
  // State control
  isOpen?: boolean;
  isCollapsed?: boolean;
  onToggleOpen?: (isOpen: boolean) => void;
  onToggleCollapse?: (isCollapsed: boolean) => void;
  
  // Responsive behavior
  breakpoint?: number;
  autoCollapseOnMobile?: boolean;
  
  // Customization
  className?: string;
  width?: string | number;
  collapsedWidth?: string | number;
  
  // Accessibility
  ariaLabel?: string;
  
  // Footer content
  footer?: React.ReactNode;
}

const DEFAULT_WIDTH = 280;
const DEFAULT_COLLAPSED_WIDTH = 64;
const DEFAULT_BREAKPOINT = 1024;

export function Sidebar({
  groups = [],
  isOpen = true,
  isCollapsed = false,
  onToggleOpen,
  onToggleCollapse,
  breakpoint = DEFAULT_BREAKPOINT,
  autoCollapseOnMobile = true,
  className,
  width = DEFAULT_WIDTH,
  collapsedWidth = DEFAULT_COLLAPSED_WIDTH,
  ariaLabel = 'Main navigation',
  footer
}: SidebarProps) {
  const { isDarkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.filter(g => g.defaultExpanded).map(g => g.id))
  );
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  // Auto-collapse on mobile if enabled
  useEffect(() => {
    if (autoCollapseOnMobile && isMobile && !isCollapsed) {
      onToggleCollapse?.(true);
    }
  }, [isMobile, autoCollapseOnMobile, isCollapsed, onToggleCollapse]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onToggleOpen?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen, onToggleOpen]);

  // Focus trap for mobile overlay mode
  const { trapFocus, releaseFocus } = sidebarRef.current 
    ? focusTrapHelpers(sidebarRef.current)
    : { trapFocus: () => {}, releaseFocus: () => {} };

  useEffect(() => {
    if (isMobile && isOpen) {
      trapFocus();
    } else {
      releaseFocus();
    }

    return releaseFocus;
  }, [isMobile, isOpen, trapFocus, releaseFocus]);

  // Handle group expand/collapse
  const toggleGroup = useCallback((groupId: string) => {
    if (isCollapsed) return; // Don't expand groups when sidebar is collapsed
    
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });

    // Emit analytics event
    if (config.isFeatureEnabled('analytics')) {
      eventBus.emit('analytics:event', {
        name: 'sidebar_group_toggled',
        properties: { groupId, expanded: !expandedGroups.has(groupId) }
      });
    }
  }, [isCollapsed, expandedGroups]);

  // Handle navigation item click
  const handleItemClick = useCallback((item: SidebarNavItem) => {
    if (item.onClick) {
      item.onClick();
    }

    // Close mobile sidebar after navigation
    if (isMobile) {
      onToggleOpen?.(false);
    }

    // Emit analytics event
    if (config.isFeatureEnabled('analytics')) {
      eventBus.emit('analytics:event', {
        name: 'sidebar_navigation',
        properties: { 
          itemId: item.id, 
          label: item.label,
          href: item.href 
        }
      });
    }
  }, [isMobile, onToggleOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) return;

    const allItems = groups.flatMap(group => {
      const items = [group, ...group.items];
      return items.flatMap(item => 
        'children' in item && item.children ? [item, ...item.children] : [item]
      );
    }).map(item => item.id);

    const currentIndex = focusedItemId ? allItems.indexOf(focusedItemId) : -1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < allItems.length - 1 ? currentIndex + 1 : 0;
        setFocusedItemId(allItems[nextIndex]);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : allItems.length - 1;
        setFocusedItemId(allItems[prevIndex]);
        break;
        
      case 'Enter':
      case ' ':
        if (focusedItemId) {
          event.preventDefault();
          const focusedItem = groups
            .flatMap(g => [g, ...g.items.flatMap(i => i.children ? [i, ...i.children] : [i])])
            .find(item => item.id === focusedItemId);
          
          if (focusedItem && 'items' in focusedItem) {
            // It's a group
            toggleGroup(focusedItemId);
          } else if (focusedItem) {
            // It's a nav item
            handleItemClick(focusedItem as SidebarNavItem);
          }
        }
        break;
        
      case 'Escape':
        if (isMobile) {
          event.preventDefault();
          onToggleOpen?.(false);
        }
        break;
    }
  }, [isOpen, focusedItemId, groups, toggleGroup, handleItemClick, isMobile, onToggleOpen]);

  // Calculate sidebar width
  const sidebarWidth = isCollapsed ? collapsedWidth : width;

  // Theme-aware styles
  const sidebarStyles = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    color: isDarkMode ? '#f9fafb' : '#111827'
  };

  const overlayStyles = isMobile ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' as const : 'hidden' as const,
    transition: 'opacity 0.3s ease, visibility 0.3s ease'
  } : {};

  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <div 
          style={overlayStyles}
          onClick={() => onToggleOpen?.(false)}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        role="navigation"
        aria-label={ariaLabel}
        className={classNames('sidebar', className)}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        style={{
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          width: typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth,
          minWidth: typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth,
          transform: isMobile ? 
            `translateX(${isOpen ? '0' : '-100%'})` : 
            'translateX(0)',
          transition: 'all 0.3s ease',
          zIndex: isMobile ? 50 : 10,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid',
          ...sidebarStyles
        }}
      >
        {/* Sidebar Header */}
        <div 
          style={{
            padding: isCollapsed ? '1rem 0.5rem' : '1rem',
            borderBottom: '1px solid',
            borderBottomColor: sidebarStyles.borderColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between'
          }}
        >
          {!isCollapsed && (
            <h2 style={{
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: '600',
              color: sidebarStyles.color
            }}>
              Navigation
            </h2>
          )}
          
          {/* Toggle button for desktop */}
          {!isMobile && (
            <button
              onClick={() => onToggleCollapse?.(!isCollapsed)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                background: 'none',
                border: 'none',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = sidebarStyles.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isDarkMode ? '#9ca3af' : '#6b7280';
              }}
            >
              {isCollapsed ? '→' : '←'}
            </button>
          )}
        </div>

        {/* Navigation Content */}
        <nav 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0'
          }}
        >
          {groups.map(group => (
            <SidebarGroup
              key={group.id}
              group={group}
              isCollapsed={isCollapsed}
              isExpanded={expandedGroups.has(group.id)}
              onToggle={() => toggleGroup(group.id)}
              onItemClick={handleItemClick}
              focusedItemId={focusedItemId}
              onFocusItem={setFocusedItemId}
              isDarkMode={isDarkMode}
            />
          ))}
        </nav>

        {/* Footer */}
        {footer && !isCollapsed && (
          <div 
            style={{
              padding: '1rem',
              borderTop: '1px solid',
              borderTopColor: sidebarStyles.borderColor
            }}
          >
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

interface SidebarGroupProps {
  group: SidebarNavGroup;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (item: SidebarNavItem) => void;
  focusedItemId: string | null;
  onFocusItem: (id: string) => void;
  isDarkMode: boolean;
}

function SidebarGroup({
  group,
  isCollapsed,
  isExpanded,
  onToggle,
  onItemClick,
  focusedItemId,
  onFocusItem,
  isDarkMode
}: SidebarGroupProps) {
  const handleGroupClick = () => {
    if (group.isCollapsible && !isCollapsed) {
      onToggle();
    }
  };

  const handleGroupKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleGroupClick();
    }
  };

  const groupHeaderStyle = {
    width: '100%',
    background: 'none',
    border: 'none',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: isCollapsed ? '0.5rem' : '0.5rem 1rem',
    textAlign: 'left' as const,
    cursor: group.isCollapsible && !isCollapsed ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '0.375rem',
    margin: '0 0.5rem 0.5rem',
    transition: 'background-color 0.2s ease',
    outline: focusedItemId === group.id ? `2px solid ${isDarkMode ? '#3b82f6' : '#2563eb'}` : 'none'
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {!isCollapsed && (
        <button
          style={groupHeaderStyle}
          onClick={handleGroupClick}
          onKeyDown={handleGroupKeyDown}
          onFocus={() => onFocusItem(group.id)}
          onMouseEnter={(e) => {
            if (group.isCollapsible) {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-expanded={group.isCollapsible ? isExpanded : undefined}
          tabIndex={0}
        >
          <span>{group.title}</span>
          {group.isCollapsible && (
            <span style={{
              transform: `rotate(${isExpanded ? '90deg' : '0deg'})`,
              transition: 'transform 0.2s ease'
            }}>
              ▶
            </span>
          )}
        </button>
      )}

      {/* Group Items */}
      <div style={{
        display: (!isCollapsed && isExpanded) || isCollapsed ? 'block' : 'none'
      }}>
        {group.items.map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
            onClick={() => onItemClick(item)}
            isFocused={focusedItemId === item.id}
            onFocus={() => onFocusItem(item.id)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
}

interface SidebarItemProps {
  item: SidebarNavItem;
  isCollapsed: boolean;
  onClick: () => void;
  isFocused: boolean;
  onFocus: () => void;
  isDarkMode: boolean;
  level?: number;
}

function SidebarItem({
  item,
  isCollapsed,
  onClick,
  isFocused,
  onFocus,
  isDarkMode,
  level = 0
}: SidebarItemProps) {
  const handleClick = () => {
    onClick();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const itemStyle = {
    width: '100%',
    background: 'none',
    border: 'none',
    color: item.isActive 
      ? isDarkMode ? '#3b82f6' : '#2563eb'
      : isDarkMode ? '#d1d5db' : '#374151',
    fontSize: '0.875rem',
    fontWeight: item.isActive ? '600' : '500',
    padding: isCollapsed ? '0.75rem' : `0.75rem ${1 + level * 0.5}rem`,
    textAlign: 'left' as const,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderRadius: '0.375rem',
    margin: '0 0.5rem 0.25rem',
    transition: 'all 0.2s ease',
    backgroundColor: item.isActive 
      ? isDarkMode ? '#1e40af' : '#dbeafe'
      : isFocused 
        ? isDarkMode ? '#374151' : '#f3f4f6'
        : 'transparent',
    outline: isFocused ? `2px solid ${isDarkMode ? '#3b82f6' : '#2563eb'}` : 'none',
    justifyContent: isCollapsed ? 'center' : 'flex-start'
  };

  const Component = item.href ? 'a' : 'button';
  const linkProps = item.href ? { href: item.href } : {};

  return (
    <>
      <Component
        style={itemStyle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onMouseEnter={(e) => {
          if (!item.isActive) {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          if (!item.isActive && !isFocused) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        tabIndex={0}
        aria-current={item.isActive ? 'page' : undefined}
        {...linkProps}
      >
        {/* Icon */}
        {item.icon && (
          <span 
            style={{
              fontSize: '1.25rem',
              lineHeight: 1
            }}
            aria-hidden="true"
          >
            {item.icon}
          </span>
        )}

        {/* Label and Badge */}
        {!isCollapsed && (
          <>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  backgroundColor: isDarkMode ? '#ef4444' : '#dc2626',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  lineHeight: 1,
                  minWidth: '1.5rem',
                  textAlign: 'center'
                }}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </Component>

      {/* Child items */}
      {item.children && !isCollapsed && (
        <div style={{ marginLeft: '1rem' }}>
          {item.children.map(childItem => (
            <SidebarItem
              key={childItem.id}
              item={childItem}
              isCollapsed={false}
              onClick={() => onItemClick(childItem)}
              isFocused={focusedItemId === childItem.id}
              onFocus={onFocus}
              isDarkMode={isDarkMode}
              level={level + 1}
/>
          ))}
        </div>
      )}
    </>
  );
}

// Default export for convenience
export default Sidebar;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/app/config, @/core/events, @/core/utils, @/providers/ThemeProvider)
- [x] Uses providers/hooks (uses useTheme hook, no direct DOM/localStorage side effects except for resize listener)
- [x] Reads config from `@/app/config` (uses config.isFeatureEnabled for analytics)
- [x] Exports default named component (exports Sidebar as named export and default export)
- [x] Adds basic ARIA and keyboard handlers (role="navigation", aria-label, keyboard navigation with arrows/enter/escape, focus management, aria-expanded, aria-current)
*/
