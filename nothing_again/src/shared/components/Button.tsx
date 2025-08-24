import React from 'react';
import { trackEvent } from '@/utils/analytics';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  ...rest
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Track button clicks for analytics
    trackEvent({
      event: 'button_click',
      category: 'interaction',
      properties: {
        variant,
        size,
        disabled: false,
        loading: false
      },
      sessionId: 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    });
    
    onClick?.(event);
  };

  const baseStyles = [
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95 hover:scale-105 transform'
  ];

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantStyles = {
    primary: [
      'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
      'text-white shadow-lg hover:shadow-xl',
      'focus:ring-purple-500 dark:focus:ring-purple-400'
    ],
    secondary: [
      'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
      'text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600',
      'shadow-sm hover:shadow-md',
      'focus:ring-gray-500 dark:focus:ring-gray-400'
    ],
    ghost: [
      'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
      'text-gray-700 dark:text-gray-300',
      'focus:ring-gray-500 dark:focus:ring-gray-400'
    ],
    danger: [
      'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
      'focus:ring-red-500 dark:focus:ring-red-400'
    ]
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  const loadingSpinner = loading && (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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
  );

  const combinedClassName = [
    ...baseStyles,
    sizeStyles[size],
    ...variantStyles[variant],
    widthStyles,
    className
  ].join(' ');

  return (
    <button
      type={type}
      className={combinedClassName}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loadingSpinner}
      {children}
    </button>
  );
};
