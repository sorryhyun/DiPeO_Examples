import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, onClick, className = '', disabled = false, ariaLabel }, ref) => {
    const baseClasses = 'px-4 py-2 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    const defaultClasses = 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500';
    
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${defaultClasses} ${className}`}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
