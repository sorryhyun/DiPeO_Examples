import React, { useState, useCallback, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { eventBus } from '@/core/events'
import { config } from '@/app/config'
import { routes } from '@/routes'

export interface NavItem {
  path: string
  label: string
  external?: boolean
  ariaLabel?: string
}

export interface NavProps {
  items?: NavItem[]
  className?: string
  mobileMenuId?: string
  onItemClick?: (item: NavItem) => void
}

// Generate navigation items from route definitions
const generateNavItemsFromRoutes = (): NavItem[] => {
  return routes
    .filter(route => route.showInNav !== false)
    .map(route => ({
      path: route.path,
      label: route.navLabel || route.label || route.path.replace('/', '') || 'Home',
      ariaLabel: route.ariaLabel || `Navigate to ${route.label || route.path}`,
      external: route.external
    }))
}

const DEFAULT_NAV_ITEMS: NavItem[] = generateNavItemsFromRoutes()

export function Nav({ 
  items = DEFAULT_NAV_ITEMS, 
  className = '', 
  mobileMenuId = 'mobile-nav-menu',
  onItemClick 
}: NavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => {
      const newState = !prev
      eventBus.emit('nav:menu-toggled', { isOpen: newState })
      return newState
    })
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    eventBus.emit('nav:menu-closed', {})
  }, [])

  const handleItemClick = useCallback((item: NavItem) => {
    closeMenu()
    onItemClick?.(item)
    eventBus.emit('nav:item-clicked', { item, currentPath: location.pathname })
  }, [closeMenu, onItemClick, location.pathname])

  const handleKeyDown = useCallback((event: React.KeyboardEvent, item: NavItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleItemClick(item)
    }
  }, [handleItemClick])

  const handleMenuKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeMenu()
    }
  }, [closeMenu])

  // Close menu on route change
  useEffect(() => {
    closeMenu()
  }, [location.pathname, closeMenu])

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const mobileMenu = document.getElementById(mobileMenuId)
      const menuButton = document.querySelector('[data-mobile-menu-button]')
      
      if (isMenuOpen && mobileMenu && !mobileMenu.contains(target) && !menuButton?.contains(target)) {
        closeMenu()
      }
    }

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMenuOpen, mobileMenuId, closeMenu])

  const renderNavItem = (item: NavItem, isMobile = false) => {
    const isActive = location.pathname === item.path
    const baseClasses = `
      relative px-3 py-2 text-sm font-medium transition-all duration-200 
      hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-md
      ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}
      ${isMobile ? 'block w-full text-left' : 'inline-flex items-center'}
    `

    const content = (
      <>
        {item.label}
        {isActive && (
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
        )}
      </>
    )

    if (item.external) {
      return (
        <a
          key={item.path}
          href={item.path}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
          aria-label={item.ariaLabel || item.label}
          onClick={() => handleItemClick(item)}
          onKeyDown={(e) => handleKeyDown(e, item)}
        >
          {content}
          <span className="sr-only">(opens in new tab)</span>
        </a>
      )
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={baseClasses}
        aria-label={item.ariaLabel || item.label}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => handleItemClick(item)}
        onKeyDown={(e) => handleKeyDown(e, item)}
      >
        {content}
      </Link>
    )
  }

  return (
    <nav className={`relative ${className}`} role="navigation" aria-label="Main navigation">
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:items-center md:space-x-1">
        {items.map(item => renderNavItem(item, false))}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          type="button"
          data-mobile-menu-button
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-expanded={isMenuOpen}
          aria-controls={mobileMenuId}
          aria-label="Toggle navigation menu"
          onClick={toggleMenu}
        >
          <span className="sr-only">
            {isMenuOpen ? 'Close main menu' : 'Open main menu'}
          </span>
          <svg
            className={`w-6 h-6 transition-transform duration-200 ${isMenuOpen ? 'rotate-45' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id={mobileMenuId}
        className={`
          md:hidden absolute top-full left-0 right-0 z-50 
          bg-white border border-gray-200 rounded-lg shadow-lg mt-2
          transition-all duration-200 origin-top
          ${isMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        `}
        onKeyDown={handleMenuKeyDown}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="mobile-menu-button"
      >
        <div className="px-2 py-2 space-y-1">
          {items.map(item => (
            <div key={item.path} role="menuitem">
              {renderNavItem(item, true)}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}

export function useNavigation() {
  const location = useLocation()

  const navigateToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      eventBus.emit('nav:section-navigated', { sectionId, path: location.pathname })
    }
  }, [location.pathname])

  return {
    currentPath: location.pathname,
    navigateToSection,
  }
}

export default Nav
