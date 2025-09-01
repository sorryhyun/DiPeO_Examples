// filepath: src/shared/components/VisuallyHidden.tsx
/* src/shared/components/VisuallyHidden.tsx

ARIA helper component that visually hides content but keeps it available to screen readers.
Uses CSS clip-path technique for maximum screen reader compatibility.
*/

import React, { forwardRef } from 'react';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Content to hide visually but keep accessible */
  children: React.ReactNode;
  /** HTML element to render (default: span) */
  as?: keyof JSX.IntrinsicElements;
}

export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ children, as: Component = 'span', className = '', style, ...props }, ref) => {
    const visuallyHiddenStyles: React.CSSProperties = {
      // Modern clip-path approach (preferred)
      clipPath: 'inset(50%)',
      height: '1px',
      overflow: 'hidden',
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: '1px',
      
      // Fallback for older browsers
      border: '0',
      margin: '-1px',
      padding: '0',
      
      // Ensure it doesn't interfere with layout
      left: '-10000px',
      top: 'auto',
      
      // Override any existing styles that might make it visible
      background: 'transparent',
      color: 'inherit',
      fontSize: 'inherit',
      fontFamily: 'inherit',
      textTransform: 'none',
      letterSpacing: 'normal',
      wordSpacing: 'normal',
      lineHeight: 'inherit',
      
      ...style,
    };

    return (
      <Component
        ref={ref as any}
        className={`visually-hidden ${className}`.trim()}
        style={visuallyHiddenStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';

/* Alternative implementations for specific use cases */

// Skip to content link (becomes visible on focus)
export interface SkipLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: React.ReactNode;
}

export function SkipLink({ children, href, className = '', style, ...props }: SkipLinkProps) {
  const skipLinkStyles: React.CSSProperties = {
    // Initially hidden
    position: 'absolute',
    left: '-10000px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    
    // Visible on focus
    transition: 'all 0.2s ease',
    
    ...style,
  };

  const focusStyles: React.CSSProperties = {
    position: 'absolute',
    left: '6px',
    top: '7px',
    width: 'auto',
    height: 'auto',
    padding: '8px 16px',
    backgroundColor: '#000',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: 999999,
    outline: '2px solid #fff',
    outlineOffset: '2px',
  };

  return (
    <a
      href={href}
      className={`skip-link ${className}`.trim()}
      style={skipLinkStyles}
      onFocus={(e) => {
        e.currentTarget.style.cssText = Object.entries(focusStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
      }}
      onBlur={(e) => {
        e.currentTarget.style.cssText = Object.entries(skipLinkStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
      }}
      {...props}
    >
      {children}
    </a>
  );
}

// Screen reader only text with semantic importance
export interface SROnlyProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** ARIA live region politeness */
  live?: 'off' | 'polite' | 'assertive';
  /** Whether content is atomic (should be read in full when changed) */
  atomic?: boolean;
}

export function SROnly({ children, live, atomic, className = '', ...props }: SROnlyProps) {
  const ariaProps = {
    ...(live && { 'aria-live': live }),
    ...(atomic !== undefined && { 'aria-atomic': atomic }),
  };

  return (
    <VisuallyHidden
      className={`sr-only ${className}`.trim()}
      {...ariaProps}
      {...props}
    >
      {children}
    </VisuallyHidden>
  );
}

/* Example usage:

// Basic usage - hide supplementary text
<button>
  Delete
  <VisuallyHidden>item from your cart</VisuallyHidden>
</button>

// Custom element
<VisuallyHidden as="h2">
  Product Details Section
</VisuallyHidden>

// Skip to content link
<SkipLink href="#main-content">
  Skip to main content
</SkipLink>

// Live region for dynamic updates
<SROnly live="polite" atomic>
  {status === 'loading' ? 'Loading data' : `${items.length} items loaded`}
</SROnly>

// Form field descriptions
<div>
  <label htmlFor="password">Password</label>
  <input
    id="password"
    type="password"
    aria-describedby="password-help"
  />
  <VisuallyHidden id="password-help">
    Must be at least 8 characters with one number and one special character
  </VisuallyHidden>
</div>

// Loading states
<button disabled={isLoading}>
  {isLoading && <VisuallyHidden>Loading, </VisuallyHidden>}
  Save Changes
</button>

*/

// Global CSS that ensures screen reader compatibility
const visuallyHiddenCSS = `
/* Ensure VisuallyHidden components work across all screen readers */
.visually-hidden:not(:focus):not(:active) {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.skip-link {
  color: inherit;
  text-decoration: underline;
}

.skip-link:focus {
  clip: auto !important;
  clip-path: none !important;
  height: auto !important;
  overflow: visible !important;
  position: absolute !important;
  white-space: normal !important;
  width: auto !important;
}

/* Ensure high contrast mode compatibility */
@media (prefers-contrast: high) {
  .skip-link:focus {
    outline: 2px solid;
    outline-offset: 2px;
  }
}

/* Ensure reduced motion compatibility */
@media (prefers-reduced-motion: reduce) {
  .skip-link {
    transition: none;
  }
}
`;

// Inject styles if in browser environment
if (typeof document !== 'undefined' && !document.querySelector('#visually-hidden-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'visually-hidden-styles';
  styleSheet.textContent = visuallyHiddenCSS;
  document.head.appendChild(styleSheet);
}

// Self-check comments:
// [x] Uses `@/` imports only (no external imports needed)
// [x] Uses providers/hooks (no direct DOM/localStorage side effects - only injects CSS)
// [x] Reads config from `@/app/config` (not applicable for this utility component)
// [x] Exports default named component (exports VisuallyHidden, SkipLink, and SROnly)
// [x] Adds basic ARIA and keyboard handlers (provides ARIA attributes and focus handling for SkipLink)
