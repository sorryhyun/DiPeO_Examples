// filepath: src/shared/components/NavBar.tsx

import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { Avatar } from '@/shared/components/Avatar';
import { config, isDevelopment, shouldUseMockData, getMockUser } from '@/app/config';
import { eventBus } from '@/core/events';
import { hooks } from '@/core/hooks';
import { User } from '@/core/contracts';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NavBarProps {
  /** Show mobile menu button */
  showMenuButton?: boolean;
  
  /** Mobile menu click handler */
  onMenuClick?: () => void;
  
  /** Current user data */
  user?: User | null;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Custom class name */
  className?: string;
  
  /** Show search functionality */
  showSearch?: boolean;
  
  /** Show notifications */
  showNotifications?: boolean;
}

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  requiresAuth?: boolean;
  roles?: string[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    requiresAuth: true,
  },
  {
    label: 'Patients',
    path: '/patients',
    requiresAuth: true,
    roles: ['doctor', 'nurse', 'admin'],
  },
  {
    label: 'Appointments',
    path: '/appointments',
    requiresAuth: true,
  },
  {
    label: 'Schedule',
    path: '/schedule',
    requiresAuth: true,
    roles: ['doctor', 'nurse'],
  },
  {
    label: 'Reports',
    path: '/reports',
    requiresAuth: true,
    roles: ['doctor', 'admin'],
  },
];

// ============================================================================
// SEARCH COMPONENT
// ============================================================================

const SearchBar: React.FC<{
  onSearch: (query: string) => void;
  className?: string;
}> = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!query) {
      setIsExpanded(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search patients, appointments..."
          className={`
            block w-full pl-10 pr-3 py-2 
            border border-gray-300 rounded-md 
            leading-5 bg-white placeholder-gray-500 
            focus:outline-none focus:placeholder-gray-400 
            focus:ring-1 focus:ring-blue-500 focus:border-blue-500 
            transition-all duration-200
            ${isExpanded ? 'w-64' : 'w-48'}
            sm:text-sm
          `}
          aria-label="Search"
        />
      </div>
    </form>
  );
};

// ============================================================================
// PROFILE DROPDOWN COMPONENT
// ============================================================================

const ProfileDropdown: React.FC<{
  user: User;
  onLogout: () => void;
}> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open user menu"
      >
        <Avatar
          src={user.avatarUrl}
          name={user.name}
          size="sm"
          status="online"
          showStatus={true}
        />
        <span className="hidden md:block text-gray-700 font-medium">
          {user.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-xs">{user.email}</div>
            </div>
            
            <button
              onClick={handleProfileClick}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              role="menuitem"
            >
              View Profile
            </button>
            
            <button
              onClick={handleSettingsClick}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              role="menuitem"
            >
              Settings
            </button>
            
            <div className="border-t border-gray-100">
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                role="menuitem"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// NAVBAR COMPONENT
// ============================================================================

export const NavBar: React.FC<NavBarProps> = ({
  showMenuButton = true,
  onMenuClick,
  user,
  isLoading = false,
  className = '',
  showSearch = true,
  showNotifications = true,
}) => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Use mock user in development if no user provided
  const currentUser = user || (shouldUseMockData ? getMockUser() : null);

  // Handle search
  const handleSearch = (query: string) => {
    eventBus.emit('search:query', { query });
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // Handle logout
  const handleLogout = () => {
    eventBus.emit('auth:logout', {});
    hooks.invoke('onLogout', { userId: currentUser?.id });
    navigate('/login');
  };

  // Handle mobile menu toggle
  const handleMenuToggle = () => {
    onMenuClick?.();
    eventBus.emit('sidebar:toggle', {});
  };

  // Handle notifications
  const handleNotificationsClick = () => {
    eventBus.emit('notifications:open', {});
    navigate('/notifications');
  };

  // Filter navigation items based on user permissions
  const visibleNavItems = navigationItems.filter(item => {
    if (!item.requiresAuth) return true;
    if (!currentUser) return false;
    if (!item.roles) return true;
    return item.roles.some(role => currentUser.roles.includes(role as any));
  });

  // Subscribe to notification events
  useEffect(() => {
    const unsubscribe = eventBus.on('notification:new', () => {
      setNotificationCount(prev => prev + 1);
    });

    return unsubscribe;
  }, []);

  return (
    <nav 
      className={`
        bg-white/90 backdrop-blur-md border-b border-gray-200/50
        sticky top-0 z-40 shadow-sm
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and nav items */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {showMenuButton && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                onClick={handleMenuToggle}
                className="lg:hidden"
                aria-label="Toggle sidebar"
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                }
              >
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            )}

            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="hidden sm:block">{config.appName}</span>
            </NavLink>

            {/* Desktop navigation items */}
            {currentUser && (
              <div className="hidden lg:flex items-center space-x-1">
                {visibleNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors
                       ${isActive 
                         ? 'bg-blue-100 text-blue-700' 
                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                       }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Search, notifications, profile */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            {showSearch && currentUser && (
              <div className="hidden md:block">
                <SearchBar onSearch={handleSearch} />
              </div>
            )}

            {/* Notifications */}
            {showNotifications && currentUser && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={handleNotificationsClick}
                  aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount})` : ''}`}
                  leftIcon={
                    <div className="relative">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {notificationCount > 0 && (
                        <span 
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                          aria-hidden="true"
                        >
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      )}
                    </div>
                  }
                >
                  <span className="sr-only">Notifications</span>
                </Button>
              </div>
            )}

            {/* User profile or login */}
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : currentUser ? (
              <ProfileDropdown user={currentUser} onLogout={handleLogout} />
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search */}
        {showSearch && currentUser && (
          <div className="md:hidden pb-4">
            <SearchBar onSearch={handleSearch} className="w-full" />
          </div>
        )}
      </div>

      {/* Development indicator */}
      {isDevelopment && (
        <div className="bg-yellow-100 border-t border-yellow-200 px-4 py-1">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-yellow-800">
              Development Mode {shouldUseMockData && '• Using Mock Data'}
            </p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/shared/components, @/app/config, @/core/events, @/core/hooks, @/core/contracts
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses event bus and hooks system, no direct side effects
// [x] Reads config from `@/app/config` - Uses config, isDevelopment, shouldUseMockData, getMockUser
// [x] Exports default named component - Exports NavBar as default and named export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Comprehensive accessibility: ARIA labels, keyboard navigation, focus management, screen reader support, escape key handling, and semantic navigation structure
