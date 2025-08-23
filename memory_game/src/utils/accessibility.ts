/**
 * Accessibility utilities for keyboard navigation and focus management
 * Provides helpers for accessible card grid navigation and interactive element detection
 */

/**
 * Checks if an element is an interactive element that should handle its own keyboard events
 * @param element - The element to check
 * @returns true if the element is interactive (input, button, etc.)
 */
export function isInteractiveElement(element: Element): boolean {
  const interactiveTags = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A'];
  const tagName = element.tagName.toUpperCase();
  
  if (interactiveTags.includes(tagName)) {
    return true;
  }
  
  // Check for elements with role attributes that make them interactive
  const role = element.getAttribute('role');
  const interactiveRoles = ['button', 'link', 'textbox', 'combobox', 'slider'];
  if (role && interactiveRoles.includes(role)) {
    return true;
  }
  
  // Check for contenteditable
  if (element.getAttribute('contenteditable') === 'true') {
    return true;
  }
  
  // Check for tabindex (except -1 which removes from tab order)
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex && tabIndex !== '-1') {
    return true;
  }
  
  return false;
}

/**
 * Gets all focusable card elements within a container
 * @param container - The container element to search within
 * @returns Array of focusable card elements
 */
function getFocusableCards(container: Element): HTMLElement[] {
  const cards = container.querySelectorAll('[data-card-id]');
  return Array.from(cards).filter(card => {
    const element = card as HTMLElement;
    return element.tabIndex >= 0 && !element.hasAttribute('disabled');
  }) as HTMLElement[];
}

/**
 * Calculates the grid dimensions based on card layout
 * @param cards - Array of card elements
 * @param container - The container element
 * @returns Object with columns and rows count
 */
function getGridDimensions(cards: HTMLElement[], container: Element) {
  if (cards.length === 0) {
    return { columns: 0, rows: 0 };
  }
  
  // Get the container's computed style to determine grid layout
  const containerStyle = window.getComputedStyle(container);
  const gridTemplateColumns = containerStyle.gridTemplateColumns;
  
  if (gridTemplateColumns && gridTemplateColumns !== 'none') {
    // CSS Grid layout - count the columns from grid-template-columns
    const columns = gridTemplateColumns.split(' ').length;
    const rows = Math.ceil(cards.length / columns);
    return { columns, rows };
  }
  
  // Fallback: detect by comparing positions
  const firstCardRect = cards[0].getBoundingClientRect();
  let columns = 1;
  
  for (let i = 1; i < cards.length; i++) {
    const cardRect = cards[i].getBoundingClientRect();
    if (Math.abs(cardRect.top - firstCardRect.top) < 5) {
      columns++;
    } else {
      break;
    }
  }
  
  const rows = Math.ceil(cards.length / columns);
  return { columns, rows };
}

/**
 * Moves focus to the next card in the grid (right arrow or down arrow behavior)
 * @param currentElement - Currently focused element
 * @param container - Container element holding the cards
 * @param direction - Direction to move: 'right' or 'down'
 */
export function focusNextCard(
  currentElement: HTMLElement,
  container: Element,
  direction: 'right' | 'down' = 'right'
): void {
  const cards = getFocusableCards(container);
  const currentIndex = cards.indexOf(currentElement);
  
  if (currentIndex === -1 || cards.length === 0) {
    return;
  }
  
  const { columns, rows } = getGridDimensions(cards, container);
  let nextIndex: number;
  
  if (direction === 'right') {
    // Move right, wrap to next row
    nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      nextIndex = 0; // Wrap to beginning
    }
  } else {
    // Move down
    nextIndex = currentIndex + columns;
    if (nextIndex >= cards.length) {
      // Wrap to top of same column
      nextIndex = currentIndex % columns;
    }
  }
  
  const nextCard = cards[nextIndex];
  if (nextCard) {
    nextCard.focus();
  }
}

/**
 * Moves focus to the previous card in the grid (left arrow or up arrow behavior)
 * @param currentElement - Currently focused element
 * @param container - Container element holding the cards
 * @param direction - Direction to move: 'left' or 'up'
 */
export function focusPrevCard(
  currentElement: HTMLElement,
  container: Element,
  direction: 'left' | 'up' = 'left'
): void {
  const cards = getFocusableCards(container);
  const currentIndex = cards.indexOf(currentElement);
  
  if (currentIndex === -1 || cards.length === 0) {
    return;
  }
  
  const { columns, rows } = getGridDimensions(cards, container);
  let prevIndex: number;
  
  if (direction === 'left') {
    // Move left, wrap to previous row
    prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = cards.length - 1; // Wrap to end
    }
  } else {
    // Move up
    prevIndex = currentIndex - columns;
    if (prevIndex < 0) {
      // Wrap to bottom of same column
      const column = currentIndex % columns;
      const lastRowStart = Math.floor((cards.length - 1) / columns) * columns;
      prevIndex = lastRowStart + column;
      if (prevIndex >= cards.length) {
        prevIndex = lastRowStart + column - columns;
      }
    }
  }
  
  const prevCard = cards[prevIndex];
  if (prevCard) {
    prevCard.focus();
  }
}

/**
 * Sets up roving tabindex for a group of elements
 * Only one element in the group should be tabbable at a time
 * @param elements - Array of elements to manage
 * @param activeIndex - Index of the currently active element
 */
export function setupRovingTabindex(elements: HTMLElement[], activeIndex: number = 0): void {
  elements.forEach((element, index) => {
    element.tabIndex = index === activeIndex ? 0 : -1;
  });
}

/**
 * Finds the next focusable element in a container
 * @param container - Container to search within
 * @param currentElement - Current element (optional)
 * @param reverse - Whether to search backwards
 * @returns Next focusable element or null
 */
export function getNextFocusableElement(
  container: Element,
  currentElement?: HTMLElement,
  reverse: boolean = false
): HTMLElement | null {
  const focusableSelectors = [
    'button:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[data-card-id]:not([disabled])'
  ].join(', ');
  
  const focusableElements = Array.from(
    container.querySelectorAll(focusableSelectors)
  ) as HTMLElement[];
  
  if (focusableElements.length === 0) {
    return null;
  }
  
  if (!currentElement) {
    return reverse ? focusableElements[focusableElements.length - 1] : focusableElements[0];
  }
  
  const currentIndex = focusableElements.indexOf(currentElement);
  if (currentIndex === -1) {
    return reverse ? focusableElements[focusableElements.length - 1] : focusableElements[0];
  }
  
  let nextIndex: number;
  if (reverse) {
    nextIndex = currentIndex - 1;
    if (nextIndex < 0) {
      nextIndex = focusableElements.length - 1;
    }
  } else {
    nextIndex = currentIndex + 1;
    if (nextIndex >= focusableElements.length) {
      nextIndex = 0;
    }
  }
  
  return focusableElements[nextIndex];
}

/**
 * Announces a message to screen readers
 * @param message - Message to announce
 * @param priority - Priority level for the announcement
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  
  // Set the message after a brief delay to ensure it's announced
  setTimeout(() => {
    announcement.textContent = message;
  }, 100);
  
  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Traps focus within a container element
 * Useful for modals and other overlay components
 * @param container - Container to trap focus within
 * @returns Function to remove the focus trap
 */
export function trapFocus(container: Element): () => void {
  const focusableElements = getNextFocusableElement(container) ? 
    Array.from(container.querySelectorAll([
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]'
    ].join(', '))) as HTMLElement[] : [];
  
  if (focusableElements.length === 0) {
    return () => {};
  }
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') {
      return;
    }
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleTabKey);
  
  // Focus the first element
  firstElement.focus();
  
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}
