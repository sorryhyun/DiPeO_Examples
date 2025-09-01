// filepath: src/shared/layouts/AppLayout.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/theme';
import { GradientBackground } from '@/shared/components/GradientBackground';
import { Card } from '@/shared/components/Card';
import { Tooltip } from '@/shared/components/Tooltip';
import { cn } from '@/core/utils';
import { config } from '@/app/config';
import { emit } from '@/core/events';

/**
 * Main application layout with responsive header, collapsible sidebar, and footer.
 * Provides accessible navigation structure with proper ARIA landmarks.
 */

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
  headerActions?: React.ReactNode;
  footerContent?: React.ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
}

// =============================================================================
// Layout Components
// =============================================================================

const Header: React.FC<{
  title?: string;
  actions?: React.ReactNode;
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}> = ({ title, actions, onMenuToggle, sidebarOpen }) => {
  const handleMenuToggle = () => {
    onMenuToggle();
    emit('analytics.track', {
      event: 'sidebar_toggle',
      properties: { open: !sidebarOpen },
    });
  };

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-30',
        'border-b backdrop-blur-md',
        'px-4 py-3 lg:px-6'
      )}
      style={{
        backgroundColor: `${theme.colors.surface}CC`,
        borderColor: theme.colors.border,
        height: theme.layout.headerHeight,
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between max-w-full">
        {/* Left section: Menu button and title */}
        <div className="flex items-center gap-3">
          <Tooltip content={sidebarOpen ? 'Close menu' : 'Open menu'}>
            <button
              onClick={handleMenuToggle}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                'hover:bg-opacity-10 focus:outline-none focus:ring-2',
                'focus:ring-offset-2 lg:hidden'
              )}
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.text.primary,
              }}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={sidebarOpen}
            >
              <motion.div
                animate={{ rotate: sidebarOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <MenuIcon />
              </motion.div>
            </button>
          </Tooltip>

          {title && (
            <motion.h1
              className="text-xl font-semibold truncate"
              style={{ color: theme.colors.text.primary }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {title}
            </motion.h1>
          )}
        </div>

        {/* Right section: Actions */}
        {actions && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

const Sidebar: React.FC<{
  isOpen: boolean;
  content?: React.ReactNode;
  onClose: () => void;
}> = ({ isOpen, content, onClose }) => {
  const defaultNavItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'patients', label: 'Patients', href: '/patients' },
    { id: 'appointments', label: 'Appointments', href: '/appointments', badge: '3' },
    { id: 'reports', label: 'Reports', href: '/reports' },
    { id: 'settings', label: 'Settings', href: '/settings' },
  ];

  const handleNavClick = (item: NavigationItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      emit('route.change', { to: item.href });
    }

    emit('analytics.track', {
      event: 'navigation_click',
      properties: { itemId: item.id, href: item.href },
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-20 lg:hidden"
            style={{ backgroundColor: `${theme.colors.overlay}80` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed top-0 left-0 z-30 h-full',
          'border-r backdrop-blur-md overflow-y-auto',
          'lg:sticky lg:top-0'
        )}
        style={{
          backgroundColor: `${theme.colors.surface}F0`,
          borderColor: theme.colors.border,
          width: theme.layout.sidebarWidth,
          paddingTop: theme.layout.headerHeight,
        }}
        initial={{ x: -280, opacity: 0 }}
        animate={{
          x: isOpen ? 0 : -280,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-4 space-y-2">
          {content ? (
            content
          ) : (
            <nav className="space-y-1">
              {defaultNavItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                    'text-left transition-all duration-200',
                    'hover:bg-opacity-10 focus:outline-none focus:ring-2',
                    'focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.colors.text.primary,
                  }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.icon && (
                    <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  
                  <span className="flex-1 truncate">{item.label}</span>
                  
                  {item.badge && (
                    <motion.span
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: theme.colors.accent,
                        color: theme.colors.surface,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </nav>
          )}
        </div>
      </motion.aside>
    </>
  );
};

const Footer: React.FC<{
  content?: React.ReactNode;
}> = ({ content }) => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className={cn(
        'border-t backdrop-blur-md',
        'px-4 py-3 lg:px-6'
      )}
      style={{
        backgroundColor: `${theme.colors.surface}CC`,
        borderColor: theme.colors.border,
        minHeight: theme.layout.footerHeight,
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      {content ? (
        content
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div
            className="text-sm"
            style={{ color: theme.colors.text.secondary }}
          >
            © {currentYear} {config.appName}. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            {config.isDevelopment && (
              <span
                className="px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: theme.colors.warning,
                  color: theme.colors.surface,
                }}
              >
                DEV MODE
              </span>
            )}
            
            <span style={{ color: theme.colors.text.secondary }}>
              v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
            </span>
          </div>
        </div>
      )}
    </motion.footer>
  );
};

// =============================================================================
// Icons
// =============================================================================

const MenuIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// =============================================================================
// Main Layout Component
// =============================================================================

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  className,
  showSidebar = true,
  sidebarContent,
  headerActions,
  footerContent,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
        emit('analytics.track', {
          event: 'sidebar_close',
          properties: { method: 'keyboard' },
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Close sidebar on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Background */}
      <GradientBackground />

      {/* Header */}
      <Header
        title={title}
        actions={headerActions}
        onMenuToggle={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      {/* Main content area */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            isOpen={sidebarOpen}
            content={sidebarContent}
            onClose={closeSidebar}
          />
        )}

        {/* Main content */}
        <motion.main
          className={cn(
            'flex-1 flex flex-col',
            showSidebar && 'lg:ml-0'
          )}
          style={{
            paddingTop: theme.layout.headerHeight,
            minHeight: `calc(100vh - ${theme.layout.headerHeight} - ${theme.layout.footerHeight})`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex-1 p-4 lg:p-6">
            <Card className="h-full">
              {children}
            </Card>
          </div>
        </motion.main>
      </div>

      {/* Footer */}
      <Footer content={footerContent} />
    </div>
  );
};

export default AppLayout;

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
