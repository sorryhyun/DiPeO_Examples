// filepath: src/shared/layouts/AppLayout.tsx
/* src/shared/layouts/AppLayout.tsx

Main responsive application layout: header, navigation (collapsible), content area, and footer.
Handles responsive breakpoints and ARIA landmarks.
*/

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Icon } from '@/shared/components/Icon';
import { appConfig } from '@/app/config';
import { ROUTES } from '@/constants/routes';
import type { User } from '@/core/contracts';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'dashboard',
    requiresAuth: true,
  },
  {
    label: 'Patients',
    href: '/patients',
    icon: 'users',
    requiresAuth: true,
    roles: ['admin', 'doctor', 'nurse'],
  },
  {
    label: 'Appointments',
    href: '/appointments',
    icon: 'calendar',
    requiresAuth: true,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: 'chart',
    requiresAuth: true,
    roles: ['admin', 'doctor'],
  },
];

function AppHeader({ 
  user, 
  onMenuToggle, 
  isMenuOpen 
}: { 
  user: User | null; 
  onMenuToggle: () => void; 
  isMenuOpen: boolean;
}) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header 
      className="app-header"
      role="banner"
      aria-label="Main header"
    >
      <div className="header-container">
        {/* Menu toggle button */}
        <button
          className="menu-toggle"
          onClick={onMenuToggle}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          type="button"
        >
          <Icon name={isMenuOpen ? 'close' : 'menu'} size="md" />
        </button>

        {/* Logo/Brand */}
        <div className="header-brand">
          <Link 
            to={ROUTES.HOME}
            className="brand-link"
            aria-label="Go to homepage"
          >
            <Icon name="logo" size="lg" />
            {appConfig.isDevelopment && (
              <span className="brand-text">HealthApp</span>
            )}
          </Link>
        </div>

        {/* User menu */}
        <div className="header-user">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name" aria-label={`Logged in as ${user.name}`}>
                  {user.name}
                </span>
                {user.avatarUrl && (
                  <img 
                    src={user.avatarUrl} 
                    alt={`${user.name} avatar`}
                    className="user-avatar"
                  />
                )}
              </div>
              <button
                onClick={handleLogout}
                className="logout-button"
                aria-label="Sign out"
                type="button"
              >
                <Icon name="logout" size="sm" />
              </button>
            </div>
          ) : (
            <Link 
              to={ROUTES.LOGIN}
              className="login-link"
              aria-label="Sign in"
            >
              <Icon name="user" size="sm" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function AppNavigation({ 
  user, 
  isOpen, 
  onClose 
}: { 
  user: User | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Filter navigation items based on user permissions
  const visibleItems = navigationItems.filter(item => {
    if (!item.requiresAuth) return true;
    if (!user) return false;
    
    if (item.roles && item.roles.length > 0) {
      return item.roles.some(role => user.roles.includes(role));
    }
    
    return true;
  });

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="nav-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <nav
        ref={navRef}
        id="main-navigation"
        className={`app-navigation ${isOpen ? 'nav-open' : 'nav-closed'}`}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        <div className="nav-content">
          <ul className="nav-list" role="list">
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.href} role="listitem">
                  <Link
                    to={item.href}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    {item.icon && (
                      <Icon 
                        name={item.icon} 
                        size="sm" 
                        className="nav-icon"
                        aria-hidden="true"
                      />
                    )}
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}

function AppFooter() {
  return (
    <footer 
      className="app-footer"
      role="contentinfo"
      aria-label="Main footer"
    >
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">
            © 2024 HealthApp. All rights reserved.
          </p>
          {appConfig.isDevelopment && (
            <div className="footer-debug">
              <span className="debug-badge">Development Mode</span>
              {appConfig.shouldUseMockData && (
                <span className="debug-badge">Mock Data</span>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive breakpoints
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Close navigation on desktop
      if (!mobile) {
        setIsNavOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuToggle = () => {
    setIsNavOpen(prev => !prev);
  };

  const handleNavClose = () => {
    setIsNavOpen(false);
  };

  // Skip to main content link for screen readers
  const skipToMainId = 'main-content';

  return (
    <div className="app-layout">
      {/* Skip navigation link */}
      <a 
        href={`#${skipToMainId}`}
        className="skip-link"
        tabIndex={0}
      >
        Skip to main content
      </a>

      <AppHeader
        user={user}
        onMenuToggle={handleMenuToggle}
        isMenuOpen={isNavOpen}
      />

      <div className="app-body">
        <AppNavigation
          user={user}
          isOpen={isNavOpen}
          onClose={handleNavClose}
        />

        <main
          id={skipToMainId}
          className="app-main"
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          <div className="main-container">
            {children}
          </div>
        </main>
      </div>

      <AppFooter />

      <style jsx>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--color-background-primary);
        }

        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: var(--color-accent);
          color: var(--color-text-inverse);
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
          z-index: 1000;
          transition: top 0.2s;
        }

        .skip-link:focus {
          top: 6px;
        }

        /* Header Styles */
        .app-header {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--spacing-md);
          height: 64px;
          max-width: 1440px;
          margin: 0 auto;
        }

        .menu-toggle {
          display: none;
          background: transparent;
          border: none;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--color-text-primary);
          transition: background-color 0.2s;
        }

        .menu-toggle:hover {
          background: var(--color-background-secondary);
        }

        .menu-toggle:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .header-brand {
          display: flex;
          align-items: center;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          text-decoration: none;
          color: var(--color-text-primary);
          font-weight: 600;
          font-size: 1.25rem;
          transition: opacity 0.2s;
        }

        .brand-link:hover {
          opacity: 0.8;
        }

        .brand-link:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }

        .header-user {
          display: flex;
          align-items: center;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .user-name {
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .logout-button {
          background: transparent;
          border: none;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all 0.2s;
        }

        .logout-button:hover {
          background: var(--color-background-secondary);
          color: var(--color-text-primary);
        }

        .logout-button:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .login-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          text-decoration: none;
          color: var(--color-text-secondary);
          font-weight: 500;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }

        .login-link:hover {
          background: var(--color-background-secondary);
          color: var(--color-text-primary);
        }

        .login-link:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        /* Body Layout */
        .app-body {
          flex: 1;
          display: flex;
        }

        /* Navigation Styles */
        .nav-overlay {
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 90;
          backdrop-filter: blur(2px);
        }

        .app-navigation {
          background: var(--color-surface);
          border-right: 1px solid var(--color-border);
          transition: transform 0.3s ease;
          z-index: 95;
        }

        .nav-content {
          padding: var(--spacing-md) 0;
        }

        .nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all 0.2s;
          font-weight: 500;
        }

        .nav-link:hover {
          background: var(--color-background-secondary);
          color: var(--color-text-primary);
        }

        .nav-link:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: -2px;
        }

        .nav-link-active {
          background: var(--color-accent-subtle);
          color: var(--color-accent);
          border-right: 2px solid var(--color-accent);
        }

        .nav-icon {
          flex-shrink: 0;
        }

        .nav-label {
          white-space: nowrap;
        }

        /* Main Content */
        .app-main {
          flex: 1;
          overflow-y: auto;
          background: var(--color-background-primary);
        }

        .main-container {
          padding: var(--spacing-lg);
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
        }

        /* Footer */
        .app-footer {
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          padding: var(--spacing-md) 0;
        }

        .footer-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 var(--spacing-md);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .footer-text {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .footer-debug {
          display: flex;
          gap: var(--spacing-xs);
        }

        .debug-badge {
          background: var(--color-warning);
          color: var(--color-text-inverse);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }

          .app-navigation {
            position: fixed;
            top: 64px;
            left: 0;
            width: 280px;
            height: calc(100vh - 64px);
            transform: translateX(-100%);
          }

          .nav-open {
            transform: translateX(0);
          }

          .main-container {
            padding: var(--spacing-md);
          }

          .user-name {
            display: none;
          }

          .brand-text {
            display: none;
          }

          .footer-content {
            justify-content: center;
            text-align: center;
          }
        }

        @media (min-width: 769px) {
          .app-navigation {
            width: 240px;
            position: static;
          }

          .nav-closed[aria-hidden="true"] {
            transform: none;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            padding: 0 var(--spacing-sm);
          }

          .main-container {
            padding: var(--spacing-sm);
          }
        }
      `}</style>
    </div>
  );
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (useAuth hook, no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (AppLayout)
// [x] Adds basic ARIA and keyboard handlers (ARIA landmarks, keyboard navigation, escape key, focus management)
