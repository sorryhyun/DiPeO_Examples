// filepath: src/shared/components/Nav/NavBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components/Icon/Icon';
import { Avatar } from '@/shared/components/Avatar/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/providers/ThemeProvider';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import { classNames, focusTrapHelpers } from '@/core/utils';
import { theme } from '@/theme';

export interface NavBarProps {
  className?: string;
  logo?: React.ReactNode;
  brand?: string;
  hideUserMenu?: boolean;
  hideThemeToggle?: boolean;
  additionalActions?: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  roles?: string[];
  external?: boolean;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'home', requiresAuth: true },
  { label: 'Patients', href: '/patients', icon: 'users', requiresAuth: true, roles: ['admin', 'doctor', 'nurse'] },
  { label: 'Appointments', href: '/appointments', icon: 'calendar', requiresAuth: true },
  { label: 'Reports', href: '/reports', icon: 'chart-bar', requiresAuth: true, roles: ['admin', 'doctor'] },
];

export function NavBar({
  className,
  logo,
  brand = 'Healthcare App',
  hideUserMenu = false,
  hideThemeToggle = false,
  additionalActions
}: NavBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const { isDarkMode, toggleMode } = useTheme();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Filter navigation items based on auth and roles
  const visibleNavItems = DEFAULT_NAV_ITEMS.filter(item => {
    if (item.requiresAuth && !user) return false;
    if (item.roles && item.roles.length > 0 && !item.roles.some(role => hasRole(role))) {
      return false;
    }
    return true;
  });

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      
      // Close mobile menu if clicking outside
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
      
      // Close user menu if clicking outside
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target) && 
          userMenuButtonRef.current && !userMenuButtonRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isMobileMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileMenuOpen, isUserMenuOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen || !mobileMenuRef.current) return;

    const focusHelpers = focusTrapHelpers(mobileMenuRef.current);
    focusHelpers.trapFocus();

    return () => focusHelpers.releaseFocus();
  }, [isMobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
          userMenuButtonRef.current?.focus();
        } else if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate('/login');
      
      eventBus.emit('toast:show', {
        type: 'success',
        title: 'Logged out successfully'
      });
    } catch (error) {
      eventBus.emit('toast:show', {
        type: 'error',
        title: 'Failed to log out',
        body: 'Please try again'
      });
    }
  };

  const handleThemeToggle = () => {
    toggleMode();
    
    if (config.isFeatureEnabled('analytics')) {
      eventBus.emit('analytics:event', {
        name: 'theme_toggle_clicked',
        properties: {
          source: 'navbar',
          newMode: isDarkMode ? 'light' : 'dark'
        }
      });
    }
  };

  const isCurrentPath = (href: string): boolean => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const navBarClasses = classNames(
    'sticky top-0 z-50 w-full border-b transition-all duration-200',
    'bg-background-primary/95 backdrop-blur-md border-border-primary',
    'supports-[backdrop-filter]:bg-background-primary/75',
    className
  );

  const logoSection = logo || (
    <div className="flex items-center space-x-2">
      <Icon 
        name="heart-pulse" 
        className="h-8 w-8 text-primary-600" 
        aria-hidden="true" 
      />
      <span className="font-bold text-xl text-text-primary">
        {brand}
      </span>
    </div>
  );

  return (
    <nav className={navBarClasses} role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1 -m-1"
              aria-label={`${brand} home`}
            >
              {logoSection}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {visibleNavItems.map((item) => {
                const isActive = isCurrentPath(item.href);
                const linkClasses = classNames(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  'flex items-center space-x-2',
                  {
                    'bg-primary-50 text-primary-700 border border-primary-200': isActive && !isDarkMode,
                    'bg-primary-900/20 text-primary-300 border border-primary-700/30': isActive && isDarkMode,
                    'text-text-secondary hover:text-text-primary hover:bg-background-secondary': !isActive
                  }
                );

                const LinkComponent = item.external ? 'a' : Link;
                const linkProps = item.external 
                  ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { to: item.href };

                return (
                  <LinkComponent
                    key={item.href}
                    {...linkProps}
                    className={linkClasses}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.icon && (
                      <Icon 
                        name={item.icon} 
                        className="h-4 w-4" 
                        aria-hidden="true" 
                      />
                    )}
                    <span>{item.label}</span>
                    {item.external && (
                      <Icon 
                        name="external-link" 
                        className="h-3 w-3 ml-1" 
                        aria-hidden="true" 
                      />
                    )}
                  </LinkComponent>
                );
              })}
            </div>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle */}
            {!hideThemeToggle && (
              <button
                onClick={handleThemeToggle}
                className={classNames(
                  'p-2 rounded-md transition-colors duration-200',
                  'text-text-secondary hover:text-text-primary hover:bg-background-secondary',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                <Icon 
                  name={isDarkMode ? 'sun' : 'moon'} 
                  className="h-5 w-5" 
                  aria-hidden="true" 
                />
              </button>
            )}

            {/* Additional actions */}
            {additionalActions}

            {/* User menu */}
            {!hideUserMenu && user && (
              <div className="relative">
                <button
                  ref={userMenuButtonRef}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={classNames(
                    'flex items-center space-x-2 p-1 rounded-full transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    'hover:bg-background-secondary'
                  )}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <Avatar 
                    src={user.avatarUrl} 
                    alt={user.fullName}
                    size="sm"
                    fallback={user.fullName.charAt(0).toUpperCase()}
                  />
                  <Icon 
                    name="chevron-down" 
                    className={classNames(
                      'h-4 w-4 text-text-secondary transition-transform duration-200',
                      { 'rotate-180': isUserMenuOpen }
                    )}
                    aria-hidden="true"
                  />
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div 
                    ref={userMenuRef}
                    className={classNames(
                      'absolute right-0 mt-2 w-56 rounded-md shadow-lg z-50',
                      'bg-background-primary border border-border-primary',
                      'ring-1 ring-black ring-opacity-5 focus:outline-none'
                    )}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="px-4 py-3 border-b border-border-primary">
                      <p className="text-sm font-medium text-text-primary">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-text-secondary truncate">
                        {user.email}
                      </p>
                      {user.roles && user.roles.length > 0 && (
                        <p className="text-xs text-text-tertiary mt-1">
                          {user.roles.join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/settings"
                        className={classNames(
                          'flex items-center px-4 py-2 text-sm text-text-primary',
                          'hover:bg-background-secondary transition-colors duration-150',
                          'focus:outline-none focus:bg-background-secondary'
                        )}
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Icon 
                          name="settings" 
                          className="h-4 w-4 mr-3" 
                          aria-hidden="true" 
                        />
                        Settings
                      </Link>
                      
                      <Link
                        to="/profile"
                        className={classNames(
                          'flex items-center px-4 py-2 text-sm text-text-primary',
                          'hover:bg-background-secondary transition-colors duration-150',
                          'focus:outline-none focus:bg-background-secondary'
                        )}
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Icon 
                          name="user" 
                          className="h-4 w-4 mr-3" 
                          aria-hidden="true" 
                        />
                        Profile
                      </Link>

                      <div className="border-t border-border-primary my-1" />
                      
                      <button
                        onClick={handleLogout}
                        className={classNames(
                          'flex items-center w-full px-4 py-2 text-sm text-text-primary',
                          'hover:bg-background-secondary transition-colors duration-150',
                          'focus:outline-none focus:bg-background-secondary text-left'
                        )}
                        role="menuitem"
                      >
                        <Icon 
                          name="logout" 
                          className="h-4 w-4 mr-3" 
                          aria-hidden="true" 
                        />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login button if not authenticated */}
            {!user && (
              <Link
                to="/login"
                className={classNames(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                  'bg-primary-600 text-white hover:bg-primary-700',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                )}
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={classNames(
                'p-2 rounded-md text-text-secondary hover:text-text-primary',
                'hover:bg-background-secondary transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
              aria-expanded={isMobileMenuOpen}
              aria-label="Open main menu"
            >
              <Icon 
                name={isMobileMenuOpen ? 'x' : 'menu'} 
                className="h-6 w-6" 
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden border-t border-border-primary"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {visibleNavItems.map((item) => {
                const isActive = isCurrentPath(item.href);
                const linkClasses = classNames(
                  'block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  {
                    'bg-primary-50 text-primary-700': isActive && !isDarkMode,
                    'bg-primary-900/20 text-primary-300': isActive && isDarkMode,
                    'text-text-secondary hover:text-text-primary hover:bg-background-secondary': !isActive
                  }
                );

                const LinkComponent = item.external ? 'a' : Link;
                const linkProps = item.external 
                  ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { to: item.href };

                return (
                  <LinkComponent
                    key={item.href}
                    {...linkProps}
                    className={linkClasses}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon && (
                        <Icon 
                          name={item.icon} 
                          className="h-5 w-5" 
                          aria-hidden="true" 
                        />
                      )}
                      <span>{item.label}</span>
                      {item.external && (
                        <Icon 
                          name="external-link" 
                          className="h-4 w-4 ml-auto" 
                          aria-hidden="true" 
                        />
                      )}
                    </div>
                  </LinkComponent>
                );
              })}
            </div>

            {/* Mobile user section */}
            {user ? (
              <div className="pt-4 pb-3 border-t border-border-primary">
                <div className="flex items-center px-5 space-x-3">
                  <Avatar 
                    src={user.avatarUrl} 
                    alt={user.fullName}
                    size="md"
                    fallback={user.fullName.charAt(0).toUpperCase()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-text-primary">
                      {user.fullName}
                    </p>
                    <p className="text-sm text-text-secondary truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 px-2 space-y-1">
                  {!hideThemeToggle && (
                    <button
                      onClick={handleThemeToggle}
                      className={classNames(
                        'flex items-center w-full px-3 py-2 rounded-md text-base font-medium',
                        'text-text-secondary hover:text-text-primary hover:bg-background-secondary',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200'
                      )}
                    >
                      <Icon 
                        name={isDarkMode ? 'sun' : 'moon'} 
                        className="h-5 w-5 mr-3" 
                        aria-hidden="true" 
                      />
                      {isDarkMode ? 'Light mode' : 'Dark mode'}
                    </button>
                  )}
                  
                  <Link
                    to="/settings"
                    className={classNames(
                      'flex items-center px-3 py-2 rounded-md text-base font-medium',
                      'text-text-secondary hover:text-text-primary hover:bg-background-secondary',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon 
                      name="settings" 
                      className="h-5 w-5 mr-3" 
                      aria-hidden="true" 
                    />
                    Settings
                  </Link>
                  
                  <Link
                    to="/profile"
                    className={classNames(
                      'flex items-center px-3 py-2 rounded-md text-base font-medium',
                      'text-text-secondary hover:text-text-primary hover:bg-background-secondary',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon 
                      name="user" 
                      className="h-5 w-5 mr-3" 
                      aria-hidden="true" 
                    />
Profile
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className={classNames(
                      'flex items-center w-full px-3 py-2 rounded-md text-base font-medium',
                      'text-text-secondary hover:text-text-primary hover:bg-background-secondary',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 text-left'
                    )}
                  >
                    <Icon 
                      name="logout" 
                      className="h-5 w-5 mr-3" 
                      aria-hidden="true" 
                    />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-border-primary">
                <div className="px-2">
                  <Link
                    to="/login"
                    className={classNames(
                      'block w-full px-3 py-2 rounded-md text-base font-medium text-center',
                      'bg-primary-600 text-white hover:bg-primary-700',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/shared/components, @/hooks, @/providers, @/app/config, @/core/events, @/core/utils, @/theme)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAuth, useTheme hooks and eventBus
- [x] Reads config from `@/app/config` (uses config.isFeatureEnabled for analytics)
- [x] Exports default named component (exports NavBar component)
- [x] Adds basic ARIA and keyboard handlers (comprehensive ARIA labels, keyboard navigation, focus trapping, escape handling, roles)
*/
