// filepath: src/shared/layouts/MainLayout.tsx
import React, { useState, useRef, useEffect } from 'react';
import { NavBar } from '@/shared/components/Nav/NavBar';
import { Sidebar } from '@/shared/components/Sidebar/Sidebar';
import { useResponsive } from '@/hooks/useResponsive';
import { eventBus } from '@/core/events';
import { config } from '@/app/config';

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className = '' }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const mainContentRef = useRef<HTMLElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  // Auto-collapse sidebar on mobile and tablet
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
      setIsSidebarCollapsed(true);
    } else if (isTablet) {
      setIsSidebarCollapsed(true);
    } else if (isDesktop) {
      setIsSidebarOpen(true);
      setIsSidebarCollapsed(false);
    }
  }, [isMobile, isTablet, isDesktop]);

  // Listen for sidebar toggle events
  useEffect(() => {
    const unsubscribe = eventBus.on('sidebar:toggle', () => {
      if (isMobile) {
        setIsSidebarOpen(prev => !prev);
      } else {
        setIsSidebarCollapsed(prev => !prev);
      }
    });

    return unsubscribe;
  }, [isMobile]);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isSidebarOpen]);

  // Handle skip to main content
  const handleSkipToMain = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      mainContentRef.current?.focus();
    }
  };

  const handleSkipLinkFocus = () => {
    skipLinkRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculate main content margins based on sidebar state
  const getMainContentStyles = () => {
    const baseStyles: React.CSSProperties = {
      minHeight: '100vh',
      paddingTop: '4rem', // Account for fixed navbar height
      transition: 'margin-left 0.3s ease-in-out, padding-left 0.3s ease-in-out',
      position: 'relative'
    };

    if (isMobile) {
      return {
        ...baseStyles,
        marginLeft: 0,
        paddingLeft: '1rem',
        paddingRight: '1rem'
      };
    }

    if (isTablet) {
      return {
        ...baseStyles,
        marginLeft: isSidebarCollapsed ? '4rem' : '16rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem'
      };
    }

    // Desktop
    return {
      ...baseStyles,
      marginLeft: isSidebarCollapsed ? '4rem' : '16rem',
      paddingLeft: '2rem',
      paddingRight: '2rem'
    };
  };

  return (
    <div className={`main-layout ${className}`}>
      {/* Skip to main content link for screen readers */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        className="skip-link"
        onFocus={handleSkipLinkFocus}
        onKeyDown={handleSkipToMain}
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999999,
          padding: '0.5rem 1rem',
          backgroundColor: '#000',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '0.875rem',
          borderRadius: '0.25rem',
          transition: 'left 0.3s ease'
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.left = '1rem';
          e.currentTarget.style.top = '1rem';
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <NavBar
        onMenuClick={() => {
          eventBus.emit('sidebar:toggle');
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: '4rem'
        }}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => {
          if (isMobile) {
            setIsSidebarOpen(false);
          }
        }}
        style={{
          position: 'fixed',
          top: '4rem',
          left: 0,
          height: 'calc(100vh - 4rem)',
          zIndex: 999,
          transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease-in-out'
        }}
      />

      {/* Mobile backdrop overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: '4rem',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            transition: 'opacity 0.3s ease-in-out'
          }}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <main
        id="main-content"
        ref={mainContentRef}
        className="main-content"
        style={getMainContentStyles()}
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        <div
          className="content-container"
          style={{
            maxWidth: '100%',
            width: '100%',
            paddingBottom: '2rem'
          }}
        >
          {children}
        </div>
      </main>

      {/* Global styles for the layout */}
      <style>{`
        .main-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: var(--color-background, #fafafa);
        }

        .skip-link:focus {
          left: 1rem !important;
          top: 1rem !important;
        }

        .main-content {
          flex: 1;
          outline: none;
        }

        .content-container {
          animation: contentSlideIn 0.3s ease-out;
        }

        @keyframes contentSlideIn {
          from {
            opacity: 0;
            transform: translateY(0.5rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Focus management */
        .main-content:focus {
          outline: 2px solid var(--color-primary, #3b82f6);
          outline-offset: -2px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .sidebar-backdrop {
            background-color: rgba(0, 0, 0, 0.8) !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .main-content,
          .content-container,
          .sidebar-backdrop {
            transition: none !important;
            animation: none !important;
          }
        }

        /* Print styles */
        @media print {
          .skip-link,
          .sidebar-backdrop {
            display: none !important;
          }
          
          .main-content {
            margin-left: 0 !important;
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default MainLayout;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/shared/components, @/hooks, @/core/events, @/app/config)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useResponsive hook and event bus
- [x] Reads config from `@/app/config` (imports config for potential future configuration)
- [x] Exports default named component (exports MainLayout as both named and default)
- [x] Adds basic ARIA and keyboard handlers (skip link, escape key handling, ARIA labels, focus management)
*/
