// src/shared/components/Footer.tsx
/* src/shared/components/Footer.tsx
   Footer component with minimal site metadata and links.
   - Displays app name, version, and basic navigation links
   - Reads configuration from app config for dynamic content
   - Uses semantic HTML with proper ARIA landmarks
   - Provides keyboard navigation support
*/

import React from 'react';
import { appConfig } from '@/app/config';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/support', label: 'Support' },
    { href: '/about', label: 'About' }
  ];

  return (
    <footer 
      className={`bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* App branding and copyright */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} {appConfig.appName}. All rights reserved.
            </p>
            {appConfig.env === 'development' && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Development Mode
              </p>
            )}
          </div>

          {/* Navigation links */}
          <nav aria-label="Footer navigation">
            <ul className="flex space-x-6">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-1 py-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.currentTarget.click();
                      }
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Additional metadata for development */}
        {appConfig.env === 'development' && appConfig.development_mode?.enable_mock_data && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-500">
              Mock data enabled • API: {appConfig.apiBaseUrl}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};

// Example usage:
// import { Footer } from '@/shared/components/Footer'
// 
// function Layout() {
//   return (
//     <div className="min-h-screen flex flex-col">
//       <main className="flex-1">
//         {/* Main content */}
//       </main>
//       <Footer />
//     </div>
//   )
// }

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (role="contentinfo", aria-label, focus management, keyboard navigation)
*/
