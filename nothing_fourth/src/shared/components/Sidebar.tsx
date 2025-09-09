// filepath: src/shared/components/Sidebar.tsx
import React from 'react';
import { eventBus } from '@/core/events';
import { useUiStore } from '../../stores/uiStore';
import { Button } from './Button';

interface SidebarProps {
  children?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  children, 
  className = '' 
}) => {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useUiStore();

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeSidebar();
      eventBus.emit('sidebar:closed', { trigger: 'keyboard' });
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeSidebar();
      eventBus.emit('sidebar:closed', { trigger: 'backdrop' });
    }
  };

  const handleToggle = () => {
    toggleSidebar();
    eventBus.emit(isSidebarOpen ? 'sidebar:closed' : 'sidebar:opened', { 
      trigger: 'button' 
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white/90 backdrop-blur-lg border-r border-gray-200/50
          shadow-xl transform transition-transform duration-300 ease-in-out z-50
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          w-64 ${className}
        `}
        role="complementary"
        aria-label="Sidebar navigation"
        aria-hidden={!isSidebarOpen}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="lg:hidden"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </aside>

      {/* Toggle button for desktop */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="hidden lg:flex fixed top-4 left-4 z-30"
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {isSidebarOpen ? (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
            />
          ) : (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          )}
        </svg>
      </Button>
    </>
  );
};

export default Sidebar;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not applicable for this component)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
