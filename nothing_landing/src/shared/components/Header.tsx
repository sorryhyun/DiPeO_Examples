import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../hooks/useTheme';
import Button from './Button';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleAuthClick = async () => {
    if (currentUser) {
      logout();
    } else {
      // In a real app, this would open a login modal
      // For demo purposes, using default credentials
      try {
        await login('demo@nothing.com', 'demo');
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Absolutely Nothing™
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/press-kit" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Press
            </Link>
            <Link 
              to="/api-docs" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link 
              to="/status" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Status
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              <Icon 
                name={theme === 'dark' ? 'sun' : 'moon'} 
                className="w-5 h-5" 
              />
            </button>

            {/* Auth */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Avatar 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  size="sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAuthClick}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAuthClick}
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              <Icon 
                name={isMobileMenuOpen ? 'x' : 'menu'} 
                className="w-6 h-6" 
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/press-kit"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Press
              </Link>
              <Link
                to="/api-docs"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Docs
              </Link>
              <Link
                to="/status"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Status
              </Link>
              
              <div className="flex items-center justify-between px-3 py-2">
                {/* Mobile Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  <Icon 
                    name={theme === 'dark' ? 'sun' : 'moon'} 
                    className="w-5 h-5" 
                  />
                  <span className="text-sm font-medium">
                    {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </span>
                </button>
              </div>

              {/* Mobile Auth */}
              <div className="px-3 py-2">
                {currentUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar 
                        src={currentUser.avatar} 
                        alt={currentUser.name}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentUser.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleAuthClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleAuthClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
