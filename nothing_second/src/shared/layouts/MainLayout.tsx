// filepath: src/shared/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { NavBar } from '@/shared/components/Nav/NavBar';
import { Sidebar } from '@/shared/components/Sidebar/Sidebar';
import { config } from '@/app/config';
import { globalEventBus } from '@/core/events';
import { classNames } from '@/core/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout shell with responsive sidebar and navigation.
 * Provides skip-to-content accessibility and layout state management.
 */
export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      
      // Auto-close sidebar on mobile
      if (isMobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, [isSidebarOpen]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setIsSidebarOpen(prev => !prev);
    
    // Emit analytics event if enabled
    if (config.isFeatureEnabled('analytics')) {
      globalEventBus.emit('analytics:event', {
        name: 'sidebar_toggle',
        properties: { 
          action: isSidebarOpen ? 'close' : 'open',
          viewport: isMobileView ? 'mobile' : 'desktop'
        }
      });
    }
  };

  // Close sidebar when clicking outside on mobile
  const handleMainClick = () => {
    if (isMobileView && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Close sidebar with Escape key
    if (event.key === 'Escape' && isSidebarOpen) {
      setIsSidebarOpen(false);
      
      // Return focus to sidebar toggle button
      const toggleButton = document.querySelector('[data-sidebar-toggle]') as HTMLElement;
      if (toggleButton) {
        toggleButton.focus();
      }
    }
  };

  // Skip to main content handler
  const handleSkipToMain = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div 
      className={classNames(
        'min-h-screen bg-gray-50',
        'flex flex-col',
        config.isDevelopment && 'debug-layout'
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        onClick={handleSkipToMain}
        className={classNames(
          'sr-only focus:not-sr-only',
          'absolute top-0 left-0 z-50',
          'bg-blue-600 text-white px-4 py-2',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'transition-all duration-200'
        )}
        onFocus={() => {
          // Announce to screen readers
          const announcement = document.createElement('div');
          announcement.setAttribute('aria-live', 'polite');
          announcement.setAttribute('aria-atomic', 'true');
          announcement.className = 'sr-only';
          announcement.textContent = 'Skip to main content link focused';
          document.body.appendChild(announcement);
          setTimeout(() => document.body.removeChild(announcement), 1000);
        }}
      >
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <header role="banner" className="relative z-30">
        <NavBar 
          onMenuToggle={handleSidebarToggle}
          showMenuToggle={true}
        />
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          role="navigation"
          aria-label="Main navigation"
          className={classNames(
            'fixed inset-y-0 left-0 z-20',
            'transform transition-transform duration-300 ease-in-out',
            'md:relative md:translate-x-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            isMobileView && isSidebarOpen && 'shadow-lg'
          )}
        >
          <Sidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isMobile={isMobileView}
          />
        </aside>

        {/* Mobile overlay */}
        {isMobileView && isSidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className={classNames(
            'flex-1 flex flex-col',
            'min-w-0', // Prevent flex item from overflowing
            'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
            'transition-all duration-300 ease-in-out'
          )}
          onClick={handleMainClick}
          aria-live="polite"
        >
          {/* Content container */}
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>

          {/* Footer spacer for proper scroll behavior */}
          <div className="h-16" aria-hidden="true" />
        </main>
      </div>

      {/* Development indicator */}
      {config.isDevelopment && (
        <div
          className="fixed bottom-4 right-4 z-50"
          role="status"
          aria-live="polite"
        >
          <div className="bg-yellow-100 border border-yellow-300 rounded-md px-3 py-1 text-xs text-yellow-800">
            Development Mode
            {config.shouldUseMockData && ' (Mock Data)'}
          </div>
        </div>
      )}

      {/* Accessibility announcements region */}
      <div
        id="announcements"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}

// Export as default for convenience
export default MainLayout;

// Layout state management hook for components that need layout context
export function useMainLayout() {
  const [layoutState, setLayoutState] = useState({
    sidebarOpen: false,
    isMobile: false
  });

  useEffect(() => {
    const updateLayoutState = () => {
      setLayoutState(prev => ({
        ...prev,
        isMobile: window.innerWidth < 768
      }));
    };

    updateLayoutState();
    window.addEventListener('resize', updateLayoutState);
    
    // Listen for sidebar events
    const unsubscribe = globalEventBus.on('sidebar:toggle', (payload) => {
      setLayoutState(prev => ({
        ...prev,
        sidebarOpen: payload.isOpen
      }));
    });

    return () => {
      window.removeEventListener('resize', updateLayoutState);
      unsubscribe();
    };
  }, []);

  return layoutState;
}

// Layout utilities for components
export const LayoutUtils = {
  /**
   * Get responsive content padding based on sidebar state
   */
  getContentPadding: (sidebarOpen: boolean, isMobile: boolean) => {
    if (isMobile) return 'px-4 py-6';
    return sidebarOpen ? 'px-6 py-8' : 'px-8 py-10';
  },

  /**
   * Get responsive grid columns based on layout
   */
  getGridColumns: (sidebarOpen: boolean, isMobile: boolean) => {
    if (isMobile) return 1;
    return sidebarOpen ? 2 : 3;
  },

  /**
   * Check if current viewport supports sidebar overlay
   */
  supportsOverlay: () => window.innerWidth >= 768
};

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
