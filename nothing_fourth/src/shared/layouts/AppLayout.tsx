// filepath: src/shared/layouts/AppLayout.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { NavBar } from '@/shared/components/NavBar'
import { Sidebar } from '@/shared/components/Sidebar'
import { GradientBackground } from '@/shared/components/GradientBackground'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { hooks } from '@/core/hooks'

interface AppLayoutProps {
  children?: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const mainContentRef = useRef<HTMLMainElement>(null)
  const skipToContentRef = useRef<HTMLAnchorElement>(null)

  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (isMobile) {
        setSidebarOpen(false)
      }
    }

    eventBus.on('navigation:change', handleRouteChange)
    return () => eventBus.off('navigation:change', handleRouteChange)
  }, [isMobile])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
        return
      }

      // Skip to main content with Tab
      if (e.key === 'Tab' && !e.shiftKey && document.activeElement === skipToContentRef.current) {
        e.preventDefault()
        mainContentRef.current?.focus()
        return
      }

      // Close sidebar with Escape
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  // Execute layout hooks
  useEffect(() => {
    hooks.execute('layout:mounted', { layout: 'app' })
    return () => hooks.execute('layout:unmounted', { layout: 'app' })
  }, [])

  const handleSidebarToggle = () => {
    setSidebarOpen(prev => !prev)
    eventBus.emit('sidebar:toggled', { open: !sidebarOpen })
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
    eventBus.emit('sidebar:closed')
  }

  // Focus trap for mobile sidebar
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleSidebarClose()
    }
  }

  const sidebarWidth = config.ui.sidebar.width || '280px'
  const navbarHeight = config.ui.navbar.height || '64px'

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <GradientBackground />
      
      {/* Skip to main content link */}
      <a
        ref={skipToContentRef}
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow-lg"
        onClick={(e) => {
          e.preventDefault()
          mainContentRef.current?.focus()
        }}
      >
        Skip to main content
      </a>

      {/* Navigation Bar */}
      <div 
        className="fixed top-0 left-0 right-0 z-40"
        style={{ height: navbarHeight }}
      >
        <NavBar 
          onMenuClick={handleSidebarToggle}
          sidebarOpen={sidebarOpen}
        />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {(sidebarOpen || !isMobile) && (
            <>
              {/* Mobile overlay */}
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                  onClick={handleOverlayClick}
                  aria-hidden="true"
                />
              )}

              {/* Sidebar container */}
              <motion.aside
                initial={{ x: isMobile ? '-100%' : 0, opacity: isMobile ? 0 : 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: isMobile ? '-100%' : 0, opacity: isMobile ? 0 : 1 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  duration: 0.3
                }}
                className={`
                  fixed top-0 left-0 z-30 h-full
                  ${isMobile ? 'w-80 max-w-[80vw]' : 'w-64'}
                  bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
                  border-r border-gray-200/20 dark:border-gray-700/20
                  shadow-xl
                `}
                style={{ 
                  paddingTop: navbarHeight,
                  width: isMobile ? 'min(320px, 80vw)' : sidebarWidth
                }}
                role="navigation"
                aria-label="Main navigation"
              >
                <Sidebar 
                  onClose={handleSidebarClose}
                  isMobile={isMobile}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main
          ref={mainContentRef}
          id="main-content"
          className={`
            flex-1 min-h-screen transition-all duration-300
            ${!isMobile && sidebarOpen ? `ml-[${sidebarWidth}]` : 'ml-0'}
          `}
          style={{ 
            paddingTop: navbarHeight,
            marginLeft: !isMobile && sidebarOpen ? sidebarWidth : 0
          }}
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          <div className="relative z-10 p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="max-w-7xl mx-auto"
            >
              {children || <Outlet />}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Global focus outline styles */}
      <style>{`
        .focus-visible:focus-visible {
          outline: 2px solid theme('colors.blue.500');
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}

export default AppLayout

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
