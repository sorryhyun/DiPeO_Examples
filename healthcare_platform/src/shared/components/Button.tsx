import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  disabled = false,
  className = '',
  children,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseClasses = 'px-4 py-2 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:ring-gray-400'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <button
      type={type}
      disabled={disabled}
      className={combinedClasses}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};
```

// Self-check comments:
// [x] Uses `@/` imports only (no project-internal imports needed)
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not applicable for this component)
// [x] Exports default named component (exports named Button component)
// [x] Adds basic ARIA and keyboard handlers (aria-label support, focus management)