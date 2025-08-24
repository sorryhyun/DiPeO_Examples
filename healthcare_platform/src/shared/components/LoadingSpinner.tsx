import { type FC } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div 
      role="status" 
      aria-live="polite"
      className={`inline-block ${className}`}
    >
      <svg
        className={`animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
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
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
```

// SELF-CHECK:
// [x] Uses `@/` imports only - N/A, no internal imports needed
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - N/A, pure component
// [x] Reads config from `@/app/config` - N/A, no config needed
// [x] Exports default named component - Yes, both named and default exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Yes, role="status" and aria-live for accessibility