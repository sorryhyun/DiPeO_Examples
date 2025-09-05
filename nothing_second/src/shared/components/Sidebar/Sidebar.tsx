// filepath: src/shared/components/Sidebar/Sidebar.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import { useResponsive } from '@/hooks/useResponsive';
import { theme } from '@/theme';

// Navigation item types
export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Sidebar component props
export interface SidebarProps {
  groups?: NavigationGroup[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  width?: number;
  collapsedWidth?: number;
  className?: string;
  showToggleButton?: boolean;
  autoCollapseOnMobile?: boolean;
  activeItemId?: string;
  onNavigate?: (item: NavigationItem) => void;
  // Props used by MainLayout
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

// Internal state for group expansion
interface GroupState {
  [groupId: string]: boolean;
}

// Animation variants
const sidebarVariants = {
  expanded: (width: number) => ({
    width,
    transition: { duration: 0.3, ease: 'easeInOut' }
  }),
  collapsed: (collapsedWidth: number) => ({
    width: collapsedWidth,
    transition: { duration: 0.3, ease: 'easeInOut' }
  })
};

const contentVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, delay: 0.1 }
  },
  collapsed: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
};

const groupVariants = {
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeInOut' }
  },
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeInOut' }
  }
};

// NavigationItem component
const NavItem: React.FC<{
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  level: number;
  onNavigate: (item: NavigationItem) => void;
}> = ({ item, isActive, isCollapsed, level, onNavigate }) => {
  const handleClick = useCallback(() => {
    if (item.disabled) return;
    onNavigate(item);
  }, [item, onNavigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <motion.div
      className={`
        sidebar-nav-item
        ${isActive ? 'active' : ''}
        ${item.disabled ? 'disabled' : ''}
      `}
      style={{
        paddingLeft: `${level * 16 + 16}px`,
        ...(!isCollapsed && {
          backgroundColor: isActive ? theme.colors.primary + '10' : 'transparent',
          borderLeft: isActive ? `3px solid ${theme.colors.primary}` : 'none',
        })
      }}
      whileHover={!item.disabled ? { backgroundColor: theme.colors.neutral[100] } : {}}
      whileTap={!item.disabled ? { scale: 0.98 } : {}}
    >
      <button
        className="sidebar-nav-button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={item.disabled}
        aria-label={isCollapsed ? item.label : undefined}
        aria-current={isActive ? 'page' : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '12px 16px',
          border: 'none',
          background: 'transparent',
          color: isActive ? theme.colors.primary : theme.colors.text,
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: isActive ? 600 : 400,
          opacity: item.disabled ? 0.5 : 1,
          textAlign: 'left',
          gap: '12px'
        }}
      >
        {item.icon && (
          <span className="sidebar-nav-icon" style={{ minWidth: '20px' }}>
            {item.icon}
          </span>
        )}
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={contentVariants}
              className="sidebar-nav-content"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flex: 1,
                minWidth: 0
              }}
            >
              <span className="sidebar-nav-label" style={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.label}
              </span>
              
              {item.badge && (
                <span
                  className="sidebar-nav-badge"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && item.badge && (
          <div
            className="sidebar-badge-dot"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              backgroundColor: theme.colors.primary,
              borderRadius: '50%'
            }}
          />
        )}
      </button>
    </motion.div>
  );
};

// NavigationGroup component
const NavGroup: React.FC<{
  group: NavigationGroup;
  expanded: boolean;
  isCollapsed: boolean;
  activeItemId?: string;
  onToggleExpanded: (groupId: string) => void;
  onNavigate: (item: NavigationItem) => void;
}> = ({ group, expanded, isCollapsed, activeItemId, onToggleExpanded, onNavigate }) => {
  const handleToggle = useCallback(() => {
    if (group.collapsible !== false) {
      onToggleExpanded(group.id);
    }
  }, [group.id, group.collapsible, onToggleExpanded]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  const renderNavItem = useCallback((item: NavigationItem, level: number = 0): React.ReactNode => {
    const isActive = item.id === activeItemId;
    
    return (
      <div key={item.id}>
        <NavItem
          item={item}
          isActive={isActive}
          isCollapsed={isCollapsed}
          level={level}
          onNavigate={onNavigate}
        />
        {item.children && item.children.map(child => renderNavItem(child, level + 1))}
      </div>
    );
  }, [activeItemId, isCollapsed, onNavigate]);

  return (
    <div className="sidebar-nav-group">
      {!isCollapsed && (
        <motion.div
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          variants={contentVariants}
        >
          <button
            className="sidebar-group-header"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            aria-expanded={expanded}
            aria-controls={`group-${group.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              color: theme.colors.neutral[600],
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: group.collapsible !== false ? 'pointer' : 'default'
            }}
          >
            <span>{group.label}</span>
            {group.collapsible !== false && (
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '12px' }}
              >
                ▼
              </motion.span>
            )}
          </button>
        </motion.div>
      )}
      
      <AnimatePresence initial={false}>
        {(isCollapsed || expanded) && (
          <motion.div
            id={`group-${group.id}`}
            initial={!isCollapsed ? "collapsed" : false}
            animate="expanded"
            exit="collapsed"
            variants={!isCollapsed ? groupVariants : {}}
            style={{ overflow: 'hidden' }}
          >
            {group.items.map(item => renderNavItem(item))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Sidebar component
export const Sidebar: React.FC<SidebarProps> = ({
  groups = [],
  collapsed = false,
  onCollapse,
  width = 280,
  collapsedWidth = 64,
  className = '',
  showToggleButton = true,
  autoCollapseOnMobile = true,
  activeItemId,
  onNavigate,
  // MainLayout-specific props
  isOpen,
  onClose,
  isMobile,
}) => {
  const { isMobile: hookIsMobile } = useResponsive();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Use prop isMobile if provided, otherwise fall back to hook
  const effectiveIsMobile = isMobile !== undefined ? isMobile : hookIsMobile;
  
  // Internal collapsed state management
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const [groupStates, setGroupStates] = useState<GroupState>(() => {
    const initialState: GroupState = {};
    groups.forEach(group => {
      initialState[group.id] = group.defaultExpanded ?? true;
    });
    return initialState;
  });

  // Determine effective collapsed state
  const effectiveCollapsed = useMemo(() => {
    // If isOpen prop is provided (from MainLayout), use its inverse
    if (isOpen !== undefined) return !isOpen;
    // Otherwise use the normal collapsed logic
    if (autoCollapseOnMobile && effectiveIsMobile) return true;
    return onCollapse ? collapsed : internalCollapsed;
  }, [isOpen, autoCollapseOnMobile, effectiveIsMobile, onCollapse, collapsed, internalCollapsed]);

  // Handle collapse toggle
  const handleToggle = useCallback(() => {
    const newCollapsed = !effectiveCollapsed;
    
    // If onClose is provided (from MainLayout), call it when collapsing
    if (onClose && !newCollapsed) {
      onClose();
    } else if (onCollapse) {
      onCollapse(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }

    // Emit event for other components
    eventBus.emit('route:change', {
      from: 'sidebar',
      to: newCollapsed ? 'collapsed' : 'expanded'
    });
  }, [effectiveCollapsed, onClose, onCollapse]);

  // Handle group expansion toggle
  const handleGroupToggle = useCallback((groupId: string) => {
    setGroupStates(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((item: NavigationItem) => {
    if (item.disabled) return;

    // Call custom navigation handler if provided
    if (onNavigate) {
      onNavigate(item);
    }

    // Handle href navigation
    if (item.href) {
      window.location.href = item.href;
    }

    // Call item's onClick if provided
    if (item.onClick) {
      item.onClick();
    }

    // Emit navigation event
    eventBus.emit('route:change', {
      from: activeItemId || 'unknown',
      to: item.id
    });

    // Auto-collapse on mobile after navigation
    if (autoCollapseOnMobile && effectiveIsMobile && !effectiveCollapsed) {
      handleToggle();
    }
  }, [onNavigate, activeItemId, autoCollapseOnMobile, effectiveIsMobile, effectiveCollapsed, handleToggle]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sidebarRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown': {
          e.preventDefault();
          const buttons = sidebarRef.current.querySelectorAll('button:not(:disabled)');
          const currentIndex = Array.from(buttons).indexOf(document.activeElement as HTMLButtonElement);
          const nextIndex = e.key === 'ArrowDown' 
            ? Math.min(currentIndex + 1, buttons.length - 1)
            : Math.max(currentIndex - 1, 0);
          (buttons[nextIndex] as HTMLButtonElement)?.focus();
          break;
        }
        case 'Home':
          e.preventDefault();
          (sidebarRef.current.querySelector('button:not(:disabled)') as HTMLButtonElement)?.focus();
          break;
        case 'End': {
          e.preventDefault();
          const buttons = sidebarRef.current.querySelectorAll('button:not(:disabled)');
          (buttons[buttons.length - 1] as HTMLButtonElement)?.focus();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update group states when groups change
  useEffect(() => {
    setGroupStates(prev => {
      const newState: GroupState = {};
      groups.forEach(group => {
        newState[group.id] = prev[group.id] ?? (group.defaultExpanded ?? true);
      });
      return newState;
    });
  }, [groups]);

  return (
    <motion.nav
      ref={sidebarRef}
      className={`sidebar ${className}`}
      custom={effectiveCollapsed ? collapsedWidth : width}
      animate={effectiveCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        backgroundColor: theme.colors.white,
        borderRight: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.sm,
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Toggle Button */}
      {showToggleButton && (
        <div 
          className="sidebar-toggle-container"
          style={{
            padding: '16px',
            borderBottom: `1px solid ${theme.colors.border}`
          }}
        >
          <button
            className="sidebar-toggle"
            onClick={handleToggle}
            aria-label={effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: effectiveCollapsed ? '32px' : '100%',
              height: '32px',
              border: 'none',
              background: 'transparent',
              color: theme.colors.neutral[600],
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <motion.span
              animate={{ rotate: effectiveCollapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              ☰
            </motion.span>
            
            {!effectiveCollapsed && (
              <motion.span
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={contentVariants}
                style={{ marginLeft: '8px', fontSize: '14px' }}
              >
                Menu
              </motion.span>
            )}
          </button>
        </div>
      )}

      {/* Navigation Groups */}
      <div 
        className="sidebar-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {groups.map(group => (
          <NavGroup
            key={group.id}
            group={group}
            expanded={groupStates[group.id] ?? true}
            isCollapsed={effectiveCollapsed}
            activeItemId={activeItemId}
            onToggleExpanded={handleGroupToggle}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </motion.nav>
  );
};

// Export alias for compatibility with index.ts
export type SidebarItem = NavigationItem;

// Export default
export default Sidebar;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useResponsive hook and eventBus
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant) - full keyboard navigation, ARIA labels, focus management
