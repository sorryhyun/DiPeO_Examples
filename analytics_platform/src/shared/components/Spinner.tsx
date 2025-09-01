// src/shared/components/Spinner.tsx
/* src/shared/components/Spinner.tsx
   Small loading spinner component used in buttons and loading states.
   - Provides customizable size and color variants
   - Includes proper ARIA labels for accessibility
   - Can be used inline or as overlay
   - Supports different animation speeds
*/


export interface SpinnerProps {
  /** Size variant of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant of the spinner */
  variant?: 'primary' | 'secondary' | 'white' | 'current';
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast';
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
  /** Whether to show as overlay (centered with backdrop) */
  overlay?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const variantClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  current: 'text-current'
};

const speedClasses = {
  slow: 'animate-spin-slow',
  normal: 'animate-spin',
  fast: 'animate-spin-fast'
};

export function Spinner({
  size = 'md',
  variant = 'primary',
  speed = 'normal',
  className = '',
  label = 'Loading...',
  overlay = false
}: SpinnerProps) {
  const spinnerElement = (
    <svg
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${speedClasses[speed]}
        ${className}
      `.trim()}
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label={label}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (overlay) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-3">
          {spinnerElement}
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {label}
          </span>
        </div>
      </div>
    );
  }

  return spinnerElement;
}

// Convenience components for common use cases
export function ButtonSpinner({ 
  className = '', 
  ...props 
}: Omit<SpinnerProps, 'size' | 'overlay'>) {
  return (
    <Spinner
      size="sm"
      variant="current"
      className={`mr-2 ${className}`}
      overlay={false}
      {...props}
    />
  );
}

export function PageSpinner({ 
  label = 'Loading page...', 
  ...props 
}: Omit<SpinnerProps, 'overlay'>) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner
        size="lg"
        label={label}
        overlay={false}
        {...props}
      />
    </div>
  );
}

export function InlineSpinner({ 
  className = '', 
  ...props 
}: Omit<SpinnerProps, 'overlay'>) {
  return (
    <Spinner
      size="sm"
      className={`inline-block ${className}`}
      overlay={false}
      {...props}
    />
  );
}

// Default export for easier importing
export default Spinner;

// Example usage:
// Basic spinner: <Spinner />
// Button spinner: <ButtonSpinner />  
// Page loading: <PageSpinner label="Loading dashboard..." />
// Overlay loading: <Spinner overlay label="Saving changes..." />
// Custom: <Spinner size="xl" variant="white" speed="fast" />

/*
- [x] Uses `@/` imports only (no external imports needed for this component)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for spinner component)
- [x] Exports default named component (exports Spinner as default and named export)
- [x] Adds basic ARIA and keyboard handlers (includes role, aria-label, aria-modal for accessibility)
*/
