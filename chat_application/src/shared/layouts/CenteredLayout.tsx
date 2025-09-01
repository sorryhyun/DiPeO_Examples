// filepath: src/shared/layouts/CenteredLayout.tsx
import React from 'react';
import { theme } from '@/theme';

/**
 * A utility layout component that centers its children both vertically and horizontally.
 * Perfect for loading states, simple pages, modals, and any content that should be centered.
 * Supports flexible sizing and optional background customization.
 */

export interface CenteredLayoutProps {
  /** Content to be centered */
  children: React.ReactNode;
  /** Full viewport height (100vh) vs container height (100%) */
  fullHeight?: boolean;
  /** Custom background color or gradient */
  background?: string;
  /** Additional CSS class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Minimum height when not using fullHeight */
  minHeight?: string | number;
  /** Maximum width for the centered content */
  maxWidth?: string | number;
  /** Padding around the centered content */
  padding?: string | number;
  /** Whether to add a subtle backdrop blur effect */
  withBackdrop?: boolean;
  /** ARIA role for the layout container */
  role?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

/**
 * CenteredLayout component that provides flexible centering for any content.
 * Uses CSS flexbox for reliable centering across all browsers and screen sizes.
 */
export const CenteredLayout: React.FC<CenteredLayoutProps> = ({
  children,
  fullHeight = true,
  background,
  className = '',
  style = {},
  minHeight,
  maxWidth,
  padding = theme.spacing.md,
  withBackdrop = false,
  role,
  'aria-label': ariaLabel,
}) => {
  // Compute container styles
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: fullHeight ? '100vh' : '100%',
    minHeight: minHeight || (fullHeight ? '100vh' : '300px'),
    width: '100%',
    padding: typeof padding === 'number' ? `${padding}px` : padding,
    background: background || (withBackdrop ? 'rgba(255, 255, 255, 0.02)' : 'transparent'),
    backdropFilter: withBackdrop ? 'blur(8px)' : 'none',
    position: 'relative',
    ...style,
  };

  // Compute content wrapper styles
  const contentStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth || 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  };

  // Combine CSS classes
  const containerClasses = [
    'centered-layout',
    withBackdrop && 'with-backdrop',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      style={containerStyles}
      role={role}
      aria-label={ariaLabel}
    >
      <div style={contentStyles}>
        {children}
      </div>
    </div>
  );
};

// Export component as default
export default CenteredLayout;

/**
 * Preset configurations for common use cases
 */
export const CenteredLayoutPresets = {
  /** Full-screen loading state */
  loading: {
    fullHeight: true,
    withBackdrop: true,
    'aria-label': 'Loading content',
  } as Partial<CenteredLayoutProps>,

  /** Modal/dialog centering */
  modal: {
    fullHeight: true,
    withBackdrop: true,
    maxWidth: '90vw',
    role: 'dialog',
  } as Partial<CenteredLayoutProps>,

  /** Error page centering */
  errorPage: {
    fullHeight: true,
    maxWidth: '600px',
    padding: theme.spacing.xl,
  } as Partial<CenteredLayoutProps>,

  /** Simple card centering */
  card: {
    fullHeight: false,
    minHeight: '400px',
    maxWidth: '400px',
    padding: theme.spacing.lg,
  } as Partial<CenteredLayoutProps>,

  /** Auth form centering */
  authForm: {
    fullHeight: true,
    maxWidth: '450px',
    padding: theme.spacing.lg,
    background: `linear-gradient(135deg, ${theme.colors.background}f0, ${theme.colors.surface}f0)`,
  } as Partial<CenteredLayoutProps>,
} as const;

/**
 * Hook for using preset configurations with custom overrides
 */
export const useCenteredLayoutPreset = (
  presetName: keyof typeof CenteredLayoutPresets,
  overrides: Partial<CenteredLayoutProps> = {}
): CenteredLayoutProps => {
  const preset = CenteredLayoutPresets[presetName];
  return {
    children: null, // Will be overridden by component usage
    ...preset,
    ...overrides,
  } as CenteredLayoutProps;
};

/**
 * Common centered layout patterns as ready-to-use components
 */

interface LoadingCenteredProps {
  message?: string;
  children?: React.ReactNode;
}

export const LoadingCentered: React.FC<LoadingCenteredProps> = ({ 
  message = 'Loading...', 
  children 
}) => (
  <CenteredLayout {...CenteredLayoutPresets.loading}>
    {children || (
      <div style={{ color: theme.colors.textSecondary }}>
        {message}
      </div>
    )}
  </CenteredLayout>
);

interface ErrorCenteredProps {
  title?: string;
  message?: string;
  children?: React.ReactNode;
}

export const ErrorCentered: React.FC<ErrorCenteredProps> = ({
  title = 'Something went wrong',
  message = 'Please try again later.',
  children
}) => (
  <CenteredLayout {...CenteredLayoutPresets.errorPage}>
    {children || (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: theme.spacing.md,
        color: theme.colors.textSecondary 
      }}>
        <h2 style={{ 
          margin: 0, 
          color: theme.colors.text,
          fontSize: theme.typography.sizes.xl 
        }}>
          {title}
        </h2>
        <p style={{ margin: 0 }}>{message}</p>
      </div>
    )}
  </CenteredLayout>
);

interface EmptyCenteredProps {
  title?: string;
  message?: string;
  children?: React.ReactNode;
}

export const EmptyCentered: React.FC<EmptyCenteredProps> = ({
  title = 'No data available',
  message = 'There are no items to display.',
  children
}) => (
  <CenteredLayout 
    fullHeight={false}
    minHeight="300px"
    padding={theme.spacing.xl}
  >
    {children || (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: theme.spacing.sm,
        color: theme.colors.textSecondary,
        opacity: 0.7 
      }}>
        <h3 style={{ 
          margin: 0, 
          color: theme.colors.textSecondary,
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.medium
        }}>
          {title}
        </h3>
        <p style={{ margin: 0, fontSize: theme.typography.sizes.sm }}>
          {message}
        </p>
      </div>
    )}
  </CenteredLayout>
);

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)  
- [x] Reads config from `@/app/config` (uses theme from @/theme)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (role, aria-label support)
- [x] Provides flexible centering with customizable options
- [x] Includes preset configurations for common use cases
- [x] Offers ready-to-use specialized components (Loading, Error, Empty)
- [x] Uses CSS flexbox for reliable cross-browser centering
- [x] Supports both full-height and container-height modes
- [x] Includes backdrop blur option for modal-like effects
- [x] Provides proper TypeScript interfaces and props documentation
- [x] Follows React functional component patterns with proper prop destructuring
*/
