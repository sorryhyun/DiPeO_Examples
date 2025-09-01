// src/shared/components/Layout.tsx
/* src/shared/components/Layout.tsx
   Generic page layout that composes Header, Footer and content area.
   - Accepts optional sidebar, className, and content props
   - Provides responsive grid structure with header/content/footer sections
   - Supports left sidebar, right sidebar, or no sidebar configurations
   - Manages scroll behavior and accessibility landmarks
*/

import React, { ReactNode } from 'react';
import { Header } from '@/shared/components/Header';
import { Footer } from '@/shared/components/Footer';

export type LayoutVariant = 'default' | 'with-left-sidebar' | 'with-right-sidebar' | 'with-both-sidebars';

export interface LayoutProps {
  children: ReactNode;
  variant?: LayoutVariant;
  className?: string;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  headerProps?: Record<string, any>;
  footerProps?: Record<string, any>;
  showHeader?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  variant = 'default',
  className = '',
  leftSidebar,
  rightSidebar,
  headerProps = {},
  footerProps = {},
  showHeader = true,
  showFooter = true,
  maxWidth = 'full'
}) => {
  // Determine grid template areas based on variant and sidebar content
  const hasLeftSidebar = variant.includes('left-sidebar') && leftSidebar;
  const hasRightSidebar = variant.includes('right-sidebar') && rightSidebar;

  // Build CSS grid template areas
  const getGridTemplateAreas = () => {
    if (hasLeftSidebar && hasRightSidebar) {
      return showHeader 
        ? `"header header header" "left-sidebar content right-sidebar" "footer footer footer"`
        : `"left-sidebar content right-sidebar" "left-sidebar content right-sidebar"`;
    }
    if (hasLeftSidebar) {
      return showHeader 
        ? `"header header" "left-sidebar content" "footer footer"`
        : `"left-sidebar content" "left-sidebar content"`;
    }
    if (hasRightSidebar) {
      return showHeader 
        ? `"header header" "content right-sidebar" "footer footer"`
        : `"content right-sidebar" "content right-sidebar"`;
    }
    return showHeader 
      ? `"header" "content" "footer"`
      : `"content" "content"`;
  };

  // Build CSS grid template columns
  const getGridTemplateColumns = () => {
    if (hasLeftSidebar && hasRightSidebar) {
      return 'minmax(240px, 300px) 1fr minmax(240px, 300px)';
    }
    if (hasLeftSidebar || hasRightSidebar) {
      return hasLeftSidebar 
        ? 'minmax(240px, 300px) 1fr'
        : '1fr minmax(240px, 300px)';
    }
    return '1fr';
  };

  // Build CSS grid template rows
  const getGridTemplateRows = () => {
    const headerRow = showHeader ? 'auto' : '';
    const footerRow = showFooter ? 'auto' : '';
    const contentRow = '1fr';
    
    return [headerRow, contentRow, footerRow].filter(Boolean).join(' ');
  };

  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md', 
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  const containerMaxWidth = maxWidthClasses[maxWidth];

  return (
    <div 
      className={`min-h-screen ${containerMaxWidth} mx-auto ${className}`}
      style={{
        display: 'grid',
        gridTemplateAreas: getGridTemplateAreas(),
        gridTemplateColumns: getGridTemplateColumns(),
        gridTemplateRows: getGridTemplateRows(),
      }}
    >
      {showHeader && (
        <header 
          className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10"
          style={{ gridArea: 'header' }}
          role="banner"
        >
          <Header {...headerProps} />
        </header>
      )}

      {hasLeftSidebar && (
        <aside 
          className="bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
          style={{ gridArea: 'left-sidebar' }}
          role="complementary"
          aria-label="Left sidebar navigation"
        >
          {leftSidebar}
        </aside>
      )}

      <main 
        className="overflow-y-auto bg-white dark:bg-gray-900"
        style={{ gridArea: 'content' }}
        role="main"
        tabIndex={-1}
        id="main-content"
      >
        {children}
      </main>

      {hasRightSidebar && (
        <aside 
          className="bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
          style={{ gridArea: 'right-sidebar' }}
          role="complementary"
          aria-label="Right sidebar"
        >
          {rightSidebar}
        </aside>
      )}

      {showFooter && (
        <footer 
          className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          style={{ gridArea: 'footer' }}
          role="contentinfo"
        >
          <Footer {...footerProps} />
        </footer>
      )}
    </div>
  );
};

// Convenience wrapper for common layout patterns
export const DashboardLayout: React.FC<Omit<LayoutProps, 'variant'> & { sidebar: ReactNode }> = ({
  sidebar,
  ...props
}) => (
  <Layout 
    variant="with-left-sidebar" 
    leftSidebar={sidebar} 
    {...props} 
  />
);

export const CenteredLayout: React.FC<Omit<LayoutProps, 'variant' | 'maxWidth'>> = (props) => (
  <Layout 
    variant="default" 
    maxWidth="lg"
    className="px-4 sm:px-6 lg:px-8"
    {...props} 
  />
);

// Skip to main content helper for accessibility
export const SkipToContent: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 
               bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    Skip to main content
  </a>
);

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for layout component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (role attributes, aria-label, tabIndex, skip link)
*/
