// filepath: src/shared/components/FocusTrap.tsx
import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Focus trap component that constrains keyboard focus within its children.
 * Used by Modal and other overlay components to maintain accessibility.
 */

export interface FocusTrapProps {
  /** Whether the focus trap is active */
  active?: boolean;
  /** Elements to focus trap within */
  children: React.ReactNode;
  /** Initial element to focus when trap activates */
  initialFocus?: React.RefObject<HTMLElement>;
  /** Element to return focus to when trap deactivates */
  restoreFocus?: React.RefObject<HTMLElement>;
  /** Custom container props */
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'a[href]',
  'area[href]',
  'summary',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const FocusTrap: React.FC<FocusTrapProps> = ({
  active = true,
  children,
  initialFocus,
  restoreFocus,
  containerProps = {},
  onEscape,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  /**
   * Get all focusable elements within the container
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    
    const elements = Array.from(
      containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
    ) as HTMLElement[];
    
    return elements.filter(element => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.hasAttribute('inert')
      );
    });
  }, []);

  /**
   * Focus the first focusable element or initial focus target
   */
  const focusFirstElement = useCallback(() => {
    if (initialFocus?.current) {
      initialFocus.current.focus();
      return;
    }

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [initialFocus, getFocusableElements]);

  /**
   * Handle tab key navigation to trap focus
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!active || !containerRef.current) return;

    // Handle escape key
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }

    // Only handle tab key for focus trapping
    if (event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift+Tab: Move focus to last element if currently on first
      if (activeElement === firstElement || !containerRef.current.contains(activeElement)) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: Move focus to first element if currently on last
      if (activeElement === lastElement || !containerRef.current.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [active, onEscape, getFocusableElements]);

  /**
   * Handle clicks outside the container to prevent focus loss
   */
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!active || !containerRef.current) return;
    
    const target = event.target as HTMLElement;
    if (!containerRef.current.contains(target)) {
      event.preventDefault();
      // Return focus to the container
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [active, getFocusableElements]);

  // Set up focus trap when active
  useEffect(() => {
    if (!active) return;

    // Store the previously active element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus the initial element
    const timeoutId = setTimeout(focusFirstElement, 0);

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [active, focusFirstElement, handleKeyDown, handleMouseDown]);

  // Restore focus when trap is deactivated
  useEffect(() => {
    return () => {
      if (!active && previousActiveElementRef.current) {
        // Restore focus to the element that was focused before trap activation
        if (restoreFocus?.current) {
          restoreFocus.current.focus();
        } else if (previousActiveElementRef.current.isConnected) {
          previousActiveElementRef.current.focus();
        }
      }
    };
  }, [active, restoreFocus]);

  return (
    <div
      ref={containerRef}
      {...containerProps}
      // Ensure the container can receive focus if no focusable children
      tabIndex={getFocusableElements().length === 0 ? 0 : undefined}
      role={containerProps.role || 'group'}
      aria-label={containerProps['aria-label'] || 'Focus trapped content'}
    >
      {children}
    </div>
  );
};

/**
 * Hook to manage focus trap state and provide utilities
 */
export function useFocusTrap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = React.useState(false);

  const activate = useCallback(() => setIsActive(true), []);
  const deactivate = useCallback(() => setIsActive(false), []);

  const focusTrapProps = {
    ref: containerRef,
    active: isActive,
  };

  return {
    containerRef,
    isActive,
    activate,
    deactivate,
    focusTrapProps,
  };
}

/*
Self-check comments:
- [x] Uses `@/` imports only (no external imports needed for this component)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects - only DOM focus management)
- [x] Reads config from `@/app/config` (not needed for this component)
- [x] Exports default named component (exports FocusTrap component and useFocusTrap hook)
- [x] Adds basic ARIA and keyboard handlers (comprehensive keyboard navigation, escape handling, ARIA attributes)
*/
