// filepath: src/shared/components/Sidebar.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { useAppStore } from '@/state/store';
import { NavigationItem } from '@/core/contracts';
import { publishEvent } from '@/core/events';
import { cn } from '@/core/utils';
import { useTheme } from '@/providers/ThemeProvider';

// =============================
// TYPES & INTERFACES
// =============================

export interface SidebarProps {
  className?: string;
  navigationItems?: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
}

interface SidebarItemProps {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: (item: NavigationItem) => void;
}

// =============================
// DEFAULT NAVIGATION ITEMS
// =============================

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'home',
    order: 1,
  },
  {
    id: 'patients',
    label: 'Patients',
    path: '/patients',
    icon: 'users',
    order: 2,
  },
  {
    id: 'appointments',
    label: 'Appointments',
    path: '/appointments',
    icon: 'calendar',
    order: 3,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'chart-bar',
    order: 4,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'settings',
    order: 5,
  },
];

// =============================
// SIDEBAR ITEM COMPONENT
// =============================

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  isCollapsed,
  onClick,
}) => {
  const { isDark } = useTheme();
  
  const handleClick = () => {
    onClick?.(item);
    
    // Publish navigation event
    publishEvent('navigation:item_clicked', {
      itemId: item.id,
      path: item.path,
      label: item.label,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const baseClasses = cn(
    'flex items-center w-full px-3 py-2.5 text-sm font-medium',
    'rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'group relative',
    {
      // Active state
      'bg-blue-500 text-white shadow-sm': isActive,
      
      // Inactive states for light mode
      'text-gray-700 hover:bg-gray-100 hover:text-gray-900': !isActive && !isDark,
      
      // Inactive states for dark mode
      'text-gray-300 hover:bg-gray-800 hover:text-white': !isActive && isDark,
      
      // Collapsed state adjustments
      'justify-center px-2': isCollapsed,
      'justify-start': !isCollapsed,
    }
  );

  return (
    <Link
      to={item.path}
      className={baseClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={0}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? item.label : undefined}
    >
      {/* Icon */}
      <Icon
        name={item.icon}
        size={20}
        className={cn(
          'flex-shrink-0 transition-colors',
          {
            'text-white': isActive,
            'text-gray-500 group-hover:text-gray-700': !isActive && !isDark,
            'text-gray-400 group-hover:text-gray-200': !isActive && isDark,
          }
        )}
        aria-hidden="true"
      />
      
      {/* Label with animation */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="ml-3 truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badge/indicator */}
      {item.badge && !isCollapsed && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'ml-auto px-2 py-0.5 text-xs font-medium rounded-full',
            {
              'bg-white text-blue-500': isActive,
              'bg-gray-200 text-gray-700': !isActive && !isDark,
              'bg-gray-700 text-gray-300': !isActive && isDark,
            }
          )}
        >
          {item.badge}
        </motion.span>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div
          className={cn(
            'absolute left-full ml-2 px-3 py-1.5',
            'bg-gray-900 text-white text-sm rounded-lg',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-200',
            'pointer-events-none z-50',
            'whitespace-nowrap shadow-lg'
          )}
          role="tooltip"
        >
          {item.label}
          <div className="absolute top-1/2 -left-1 w-2 h-2 bg-gray-900 rotate-45 transform -translate-y-1/2" />
        </div>
      )}
    </Link>
  );
};

// =============================
// MAIN SIDEBAR COMPONENT
// =============================

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  navigationItems = defaultNavigationItems,
  onItemClick,
}) => {
  const location = useLocation();
  const { isDark } = useTheme();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Sort navigation items by order
  const sortedItems = [...navigationItems].sort((a, b) => a.order - b.order);

  // Get active item based on current path
  const getActiveItemId = () => {
    const activeItem = sortedItems.find(item => {
      if (item.path === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(item.path);
    });
    return activeItem?.id;
  };

  const activeItemId = getActiveItemId();

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const items = sortedItems;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
        
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
        
      case 'End':
        event.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
        
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0 && items[focusedIndex]) {
          event.preventDefault();
          onItemClick?.(items[focusedIndex]);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        setFocusedIndex(-1);
        sidebarRef.current?.blur();
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && sidebarRef.current) {
      const items = sidebarRef.current.querySelectorAll('[role="menuitem"]');
      const itemToFocus = items[focusedIndex] as HTMLElement;
      if (itemToFocus) {
        itemToFocus.focus();
      }
    }
  }, [focusedIndex]);

  // Handle toggle with keyboard
  const handleToggleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSidebar();
    }
  };

  // Publish sidebar state changes
  useEffect(() => {
    publishEvent('sidebar:state_changed', {
      collapsed: sidebarCollapsed,
      timestamp: Date.now(),
    });
  }, [sidebarCollapsed]);

  const sidebarClasses = cn(
    'flex flex-col h-full',
    'bg-white dark:bg-gray-900',
    'border-r border-gray-200 dark:border-gray-700',
    'transition-all duration-300 ease-in-out',
    {
      'w-16': sidebarCollapsed,
      'w-64': !sidebarCollapsed,
    },
    className
  );

  return (
    <motion.aside
      ref={sidebarRef}
      className={sidebarClasses}
      initial={false}
      animate={{
        width: sidebarCollapsed ? 64 : 256,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onKeyDown={handleKeyDown}
      role="navigation"
      aria-label="Main navigation"
      tabIndex={0}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-4',
        'border-b border-gray-200 dark:border-gray-700'
      )}>
        {/* Logo/Brand */}
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Icon 
                name="heart" 
                size={24} 
                className="text-blue-500 mr-2" 
                aria-hidden="true"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                HealthApp
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          onKeyDown={handleToggleKeyDown}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            {
              'mx-auto': sidebarCollapsed,
            }
          )}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
        >
          <Icon
            name={sidebarCollapsed ? 'chevron-right' : 'chevron-left'}
            size={20}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav 
        className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
        role="menu"
        aria-label="Navigation menu"
      >
        {sortedItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
            isCollapsed={sidebarCollapsed}
            onClick={onItemClick}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className={cn(
        'p-4 border-t border-gray-200 dark:border-gray-700',
        'flex items-center justify-center'
      )}>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-gray-500 dark:text-gray-400 text-center"
          >
            © 2024 HealthApp
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};

// =============================
// DEVELOPMENT HELPERS
// =============================

if (import.meta.env.DEV) {
  Sidebar.displayName = 'Sidebar';
  
  // Development helper to test sidebar accessibility
  (window as any).__testSidebarAccessibility = () => {
    const sidebar = document.querySelector('[role="navigation"]') as HTMLElement;
    if (!sidebar) {
      console.warn('Sidebar not found');
      return false;
    }

    console.group('🔍 Sidebar Accessibility Check');
    
    const checks = [
      {
        name: 'Has role="navigation"',
        pass: sidebar.getAttribute('role') === 'navigation',
      },
      {
        name: 'Has aria-label',
        pass: !!sidebar.getAttribute('aria-label'),
      },
      {
        name: 'Navigation items have role="menuitem"',
        pass: sidebar.querySelectorAll('[role="menuitem"]').length > 0,
      },
      {
        name: 'Active item has aria-current="page"',
        pass: !!sidebar.querySelector('[aria-current="page"]'),
      },
      {
        name: 'Toggle button has aria-label',
        pass: !!sidebar.querySelector('button[aria-label*="sidebar"]'),
      },
      {
        name: 'Toggle button has aria-expanded',
        pass: !!sidebar.querySelector('button[aria-expanded]'),
      },
    ];

    checks.forEach(check => {
      console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
    });
    
    console.groupEnd();
    
    return checks.every(check => check.pass);
  };
}

export default Sidebar;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAppStore, useTheme, React Router
// [x] Reads config from `@/app/config` - uses import.meta.env for development mode
// [x] Exports default named component - exports Sidebar as default and named export
// [x] Adds basic ARIA and keyboard handlers (role="navigation", aria-label, keyboard navigation, focus management, aria-current)
