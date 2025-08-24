import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  as?: 'button' | 'a';
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
  as = 'button',
  href,
  variant = 'primary',
  size = 'md',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };

  const baseClasses = `
    font-medium rounded-md transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    dark:focus:ring-offset-gray-800
    ${getSizeClasses()}
  `;

  const getVariantClasses = () => {
    if (disabled) {
      return `
        bg-gray-300 text-gray-500 cursor-not-allowed
        dark:bg-gray-700 dark:text-gray-400
      `;
    }
    
    switch (variant) {
      case 'primary':
        return `
          bg-blue-600 text-white hover:bg-blue-700
          dark:bg-blue-500 dark:hover:bg-blue-400
        `;
      case 'secondary':
        return `
          bg-gray-600 text-white hover:bg-gray-700
          dark:bg-gray-500 dark:hover:bg-gray-400
        `;
      case 'outline':
        return `
          bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50
          dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-800
        `;
      default:
        return `
          bg-blue-600 text-white hover:bg-blue-700
          dark:bg-blue-500 dark:hover:bg-blue-400
        `;
    }
  };

  const combinedClasses = `
    ${baseClasses}
    ${getVariantClasses()}
    ${className}
  `.trim();

  if (as === 'a') {
    return (
      <a
        href={href}
        className={combinedClasses}
        aria-label={ariaLabel}
        role="button"
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={combinedClasses}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};
