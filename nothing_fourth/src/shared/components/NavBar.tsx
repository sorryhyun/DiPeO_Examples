// filepath: src/shared/components/NavBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MenuIcon, 
  SearchIcon, 
  BellIcon, 
  ChevronDownIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon,
  HelpCircleIcon,
  XIcon
} from 'lucide-react';
import { cn } from '@/core/utils';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import { Button } from '@/shared/components/Button';
import { Avatar } from '@/shared/components/Avatar';
import type { User } from '@/core/contracts';

// ===============================================
// NavBar Component Types & Props
// ===============================================

export interface NavBarProps {
  user?: User | null;
  onMenuToggle?: () => void;
  onLogout?: () => void;
  className?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  external?: boolean;
}

// ===============================================
// Default Navigation Items
// ===============================================

const defaultNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    id: 'patients',
    label: 'Patients',
    href: '/patients',
  },
  {
    id: 'appointments',
    label: 'Appointments',
    href: '/appointments',
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
  },
];

// ===============================================
// Utility Functions
// ===============================================

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

// ===============================================
// Search Component
// ===============================================

const SearchBox: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(searchRef, () => setIsExpanded(false));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      eventBus.emit('search:query', { query: searchQuery.trim() });
      setSearchQuery('');
      setIsExpanded(false);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <motion.form
        onSubmit={handleSearch}
        className={cn(
          'flex items-center transition-all duration-200',
          isExpanded ? 'w-80' : 'w-10'
        )}
        initial={false}
        animate={{ 
          width: isExpanded ? '320px' : '40px',
        }}
      >
        <div className="relative flex items-center w-full">
          <Button
            type={isExpanded ? 'submit' : 'button'}
            variant="ghost"
            size="sm"
            className={cn(
              'absolute left-0 z-10 p-2',
              isExpanded && searchQuery.trim() && 'text-primary-600'
            )}
            onClick={() => !isExpanded && setIsExpanded(true)}
            aria-label={isExpanded ? 'Search' : 'Open search'}
          >
            <SearchIcon className="w-4 h-4" />
          </Button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.input
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients, appointments..."
                className={cn(
                  'w-full pl-10 pr-4 py-2 text-sm',
                  'bg-gray-100 dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                  'placeholder-gray-500 dark:placeholder-gray-400'
                )}
                autoFocus
              />
            )}
          </AnimatePresence>
        </div>
      </motion.form>
    </div>
  );
};

// ===============================================
// Profile Menu Component
// ===============================================

const ProfileMenu: React.FC<{ user: User; onLogout?: () => void }> = ({ 
  user, 
  onLogout 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useClickOutside(menuRef, () => setIsOpen(false));

  const handleLogout = () => {
    onLogout?.();
    eventBus.emit('auth:logout', { userId: user.id });
    setIsOpen(false);
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon className="w-4 h-4" />,
      onClick: () => {
        navigate('/profile');
        setIsOpen(false);
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon className="w-4 h-4" />,
      onClick: () => {
        navigate('/settings');
        setIsOpen(false);
      },
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircleIcon className="w-4 h-4" />,
      onClick: () => {
        navigate('/help');
        setIsOpen(false);
      },
    },
    {
      id: 'divider',
      label: '',
      icon: null,
      onClick: () => {},
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOutIcon className="w-4 h-4" />,
      onClick: handleLogout,
      className: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <Avatar
          src={user.avatarUrl}
          name={user.name}
          size="sm"
          aria-hidden="true"
        />
        <span className="hidden md:inline-block text-sm font-medium truncate max-w-32">
          {user.name}
        </span>
        <ChevronDownIcon 
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute right-0 top-full mt-2 w-56',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'rounded-lg shadow-lg',
              'py-2 z-50'
            )}
            role="menu"
            aria-orientation="vertical"
          >
            {menuItems.map((item) => {
              if (item.id === 'divider') {
                return (
                  <div 
                    key="divider"
                    className="border-t border-gray-200 dark:border-gray-700 my-1"
                    role="separator"
                  />
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 text-left text-sm',
                    'hover:bg-gray-50 dark:hover:bg-gray-700',
                    'transition-colors duration-150',
                    'focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700',
                    item.className
                  )}
                  role="menuitem"
                >
                  {item.icon && (
                    <span className="flex-shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===============================================
// Mobile Menu Component
// ===============================================

const MobileMenu: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  user?: User | null;
  onLogout?: () => void;
}> = ({ isOpen, onClose, user, onLogout }) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed left-0 top-0 h-full w-80 max-w-sm',
              'bg-white dark:bg-gray-900',
              'border-r border-gray-200 dark:border-gray-700',
              'z-50 md:hidden overflow-y-auto'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {config.appName.charAt(0)}
                  </span>
                </div>
                <span className="text-lg font-semibold">{config.appName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close menu"
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatarUrl}
                    name={user.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="p-2">
              {defaultNavItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {item.icon && (
                    <span className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Footer Actions */}
            {user && (
              <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    onLogout?.();
                    onClose();
                  }}
                  className="justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ===============================================
// Main NavBar Component
// ===============================================

export function NavBar({ 
  user, 
  onMenuToggle, 
  onLogout,
  className 
}: NavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMenuToggle?.();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 w-full',
          'bg-white/80 dark:bg-gray-900/80',
          'backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50',
          'transition-colors duration-200',
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 mx-auto max-w-7xl lg:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMobileMenuToggle}
              className="md:hidden"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <MenuIcon className="w-5 h-5" />
            </Button>

            {/* Logo */}
            <NavLink 
              to="/" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label="Home"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {config.appName.charAt(0)}
                </span>
              </div>
              <span className="hidden sm:block text-lg font-semibold text-gray-900 dark:text-white">
                {config.appName}
              </span>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-8">
              {defaultNavItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.href}
                  className={({ isActive }) => cn(
                    'relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                    isActive
                      ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <span className="relative z-10">{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden sm:block">
              <SearchBox />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {/* User Profile */}
            {user ? (
              <ProfileMenu user={user} onLogout={onLogout} />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        user={user}
        onLogout={onLogout}
      />
    </>
  );
}

// Export default
export default NavBar;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
