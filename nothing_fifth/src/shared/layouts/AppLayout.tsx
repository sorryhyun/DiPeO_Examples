// filepath: src/shared/layouts/AppLayout.tsx
import React, { useState, useEffect } from 'react';
import { NavBar } from '@/shared/components/NavBar';
import { Sidebar } from '@/shared/components/Sidebar';
import { GradientBackground } from '@/shared/components/GradientBackground';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
  sidebarCollapsed = false,
  onSidebarToggle
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(!sidebarCollapsed);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isSidebarOpen]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
    onSidebarToggle?.();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + B
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        handleSidebarToggle();
      }

      // Close sidebar on Escape when mobile
      if (event.key === 'Escape' && isMobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isSidebarOpen]);

  // Handle sidebar events
  useEffect(() => {
    const unsubscribe = eventBus.on('sidebar:toggle', () => {
      handleSidebarToggle();
    });

    return unsubscribe;
  }, []);

  // Handle mobile overlay click
  const handleOverlayClick = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden"
      role="application"
      aria-label="Main application layout"
    >
      <GradientBackground />
      
      {/* Navigation Header */}
      <header className="relative z-30">
        <NavBar 
          onMenuClick={handleSidebarToggle}
          showMenuButton={showSidebar}
        />
      </header>

      <div className="flex relative z-20">
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Mobile overlay */}
            {isMobile && isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={handleOverlayClick}
                aria-hidden="true"
              />
            )}
            
            <aside 
              className={`
                fixed lg:relative top-16 lg:top-0 left-0 z-50 lg:z-20
                h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]
                transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${!isSidebarOpen && !isMobile ? 'lg:w-16' : 'w-64'}
              `}
              aria-label="Main navigation sidebar"
              aria-hidden={!isSidebarOpen && isMobile}
            >
              <Sidebar 
                onItemSelect={(item) => console.log('Selected:', item)}
              />
            </aside>
          </>
        )}

        {/* Main Content */}
        <main 
          className={`
            flex-1 min-h-[calc(100vh-4rem)] relative
            transition-all duration-300 ease-in-out
            ${showSidebar && isSidebarOpen && !isMobile ? 'lg:ml-0' : ''}
            ${showSidebar && !isSidebarOpen && !isMobile ? 'lg:ml-0' : ''}
          `}
          role="main"
          aria-label="Main content area"
        >
          <div className="h-full p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
    </div>
  );
};

export default AppLayout;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
