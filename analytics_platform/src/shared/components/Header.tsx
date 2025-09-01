// src/shared/components/Header.tsx
/* src/shared/components/Header.tsx
   Top navigation/header component that displays site branding and user controls.
   - Shows app name/logo from config
   - Displays authenticated user info and logout button when logged in
   - Shows login prompt when not authenticated
   - Responsive design with mobile-friendly navigation
*/

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/shared/components/Button';
import { appConfig } from '@/app/config';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header 
      className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 ${className}`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand Section */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {appConfig.appName}
              </h1>
            </div>
          </div>

          {/* Navigation/User Controls */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div 
                className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
                aria-label="Loading user information"
              />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="flex items-center space-x-2">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.fullName} avatar`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      aria-label={`${user.fullName} avatar`}
                    >
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.fullName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.role}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2"
                  aria-label="Sign out"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Please sign in to continue
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Export default for consistency with component patterns
export default Header;

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAuth hook
- [x] Reads config from `@/app/config` - imports appConfig for app name
- [x] Exports default named component - exports both named Header and default
- [x] Adds basic ARIA and keyboard handlers - includes aria-label, role="banner", and semantic HTML
*/
