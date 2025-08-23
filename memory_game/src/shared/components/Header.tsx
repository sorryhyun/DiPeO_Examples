import React from 'react';
import { useGameStore } from '../../state/store';
import ThemeSelector from './ThemeSelector';
import MoveCounter from './MoveCounter';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { moves, isGameActive } = useGameStore();

  const navigationLinks = [
    { href: '#/', label: 'Home', ariaLabel: 'Go to home page' },
    { href: '#/game', label: 'Game', ariaLabel: 'Start new game' },
    { href: '#/leaderboard', label: 'Leaderboard', ariaLabel: 'View leaderboard' },
    { href: '#/multiplayer', label: 'Multiplayer', ariaLabel: 'Play multiplayer' },
    { href: '#/settings', label: 'Settings', ariaLabel: 'Open settings' },
    { href: '#/daily', label: 'Daily', ariaLabel: 'Play daily challenge' }
  ];

  const handleNavClick = (href: string) => {
    window.location.hash = href;
  };

  return (
    <header 
      className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 ${className}`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Memory Game
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:block" role="navigation" aria-label="Main navigation">
            <div className="flex items-center space-x-4">
              {navigationLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label={link.ariaLabel}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Mobile Navigation Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 p-2 rounded-md"
              aria-label="Open mobile menu"
              onClick={() => {
                // Simple mobile menu toggle - in a real app you'd manage this state
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                  mobileMenu.classList.toggle('hidden');
                }
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Game Stats - only show during active game */}
            {isGameActive && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MoveCounter moves={moves} />
              </div>
            )}

            {/* Theme Selector */}
            <div className="flex items-center">
              <ThemeSelector />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div id="mobile-menu" className="md:hidden hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationLinks.map((link) => (
              <button
                key={`mobile-${link.href}`}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label={link.ariaLabel}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
