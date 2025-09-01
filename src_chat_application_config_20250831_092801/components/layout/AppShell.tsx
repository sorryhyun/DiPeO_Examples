import React, { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { isDevelopment } from '@/app/config';
import { debugLog } from '@/core/utils';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile when switching orientations
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
    setIsSidebarOpen(prev => !prev);
    debugLog('debug', 'Sidebar toggled', { isOpen: !isSidebarOpen });
  };

  // Close sidebar when clicking outside on mobile
  const handleMainClick = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isSidebarOpen]);

  // Skip rendering shell if not authenticated
  if (!isAuthenticated || isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Mobile sidebar overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          ${isMobile ? 'z-50' : 'z-30'}
          ${isSidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out
          ${isMobile ? 'w-80' : 'w-64'}
          h-full
        `}
        aria-label="Navigation sidebar"
      >
        <Sidebar 
          isOpen={isSidebarOpen || !isMobile} 
          onClose={() => setIsSidebarOpen(false)}
          isMobile={isMobile}
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header 
          className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
          role="banner"
        >
          <Header 
            onSidebarToggle={handleSidebarToggle}
            isSidebarOpen={isSidebarOpen}
          />
        </header>

        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 overflow-hidden bg-white dark:bg-gray-900"
          onClick={handleMainClick}
          role="main"
          tabIndex={-1}
          aria-label="Main content"
        >
          <div className="h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>

      {/* Development indicator */}
      {isDevelopment && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs font-mono">
            DEV
          </div>
        </div>
      )}
    </div>
  );
}
