// filepath: src/utils/accessibility.ts

// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

/**
 * Trap focus within a container element for modal/dropdown accessibility
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ];

  const focusableElements = element.querySelectorAll<HTMLElement>(
    focusableSelectors.join(', ')
  );
  
  if (focusableElements.length === 0) return () => {};

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab: focus previous element
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: focus next element
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  
  // Set initial focus
  firstFocusable.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announce messages to screen readers via aria-live region
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  let announcer = document.getElementById('aria-announcer') as HTMLElement;
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'aria-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
  } else {
    // Update priority if different
    announcer.setAttribute('aria-live', priority);
  }

  // Clear previous message and set new one
  announcer.textContent = '';
  
  // Use setTimeout to ensure screen readers pick up the change
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
}

/**
 * Get focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ];

  return Array.from(
    container.querySelectorAll<HTMLElement>(selectors.join(', '))
  ).filter(element => {
    // Filter out hidden elements
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
  });
}

/**
 * Restore focus to previously focused element
 */
export function restoreFocus(previousElement?: HTMLElement): void {
  if (previousElement && document.contains(previousElement)) {
    previousElement.focus();
  }
}

/**
 * Create a focus management context for modals and overlays
 */
export function createFocusManager(container: HTMLElement) {
  const previousActiveElement = document.activeElement as HTMLElement;
  const cleanup = trapFocus(container);

  return {
    destroy: () => {
      cleanup();
      restoreFocus(previousActiveElement);
    },
    announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      announce(message, priority);
    }
  };
}
