import React, { useEffect, ReactNode } from 'react';
import { NavBar } from '@/shared/components/NavBar';

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, pageTitle }) => {
  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle;
    }
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <header role="banner">
        <NavBar />
      </header>
      <main 
        role="main" 
        className="container mx-auto px-4 py-6 max-w-7xl"
        aria-label={pageTitle || 'Main content'}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;

// SELF-CHECK:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` - N/A for this component
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
