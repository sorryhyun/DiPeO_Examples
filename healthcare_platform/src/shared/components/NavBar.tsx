import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { useI18n } from '@/utils/i18n';

export const NavBar = () => {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/dashboard', key: 'nav.dashboard', label: t('nav.dashboard') },
    { path: '/appointments', key: 'nav.appointments', label: t('nav.appointments') },
    { path: '/medical-records', key: 'nav.medicalRecords', label: t('nav.medicalRecords') },
    { path: '/prescriptions', key: 'nav.prescriptions', label: t('nav.prescriptions') },
    { path: '/telemedicine', key: 'nav.telemedicine', label: t('nav.telemedicine') },
    { path: '/lab-results', key: 'nav.labResults', label: t('nav.labResults') },
    { path: '/insurance', key: 'nav.insurance', label: t('nav.insurance') },
    { path: '/medications', key: 'nav.medications', label: t('nav.medications') },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="flex-shrink-0 flex items-center"
              onClick={closeMobileMenu}
            >
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HP</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                {t('app.title')}
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActiveRoute(item.path)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={isActiveRoute(item.path) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop user menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">{user?.email}</span>
              <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs capitalize">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label={t('auth.logout')}
            >
              {t('auth.logout')}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <span className="sr-only">{t('nav.openMenu')}</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActiveRoute(item.path)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={isActiveRoute(item.path) ? 'page' : undefined}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile user info and logout */}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="px-3 space-y-1">
                <div className="text-base font-medium text-gray-800 dark:text-white">{user?.email}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {t('user.role')}: {user?.role}
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  aria-label={t('auth.logout')}
                >
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// SELF-CHECK:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (useAuth, useI18n - no direct DOM/localStorage side effects)
// [x] Exports named component (NavBar)
// [x] Adds basic ARIA and keyboard handlers (role="navigation", aria-label, aria-current, aria-expanded, etc.)
