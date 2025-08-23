import React, { forwardRef, InputHTMLAttributes } from 'react';
import clsx from '../../utils/clsx';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: string;
  error?: string;
  variant?: 'default' | 'dark';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, variant = 'default', className, ...props }, ref) => {
    const inputId = React.useId();
    const errorId = React.useId();

    const inputClasses = clsx(
      'w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2',
      // Default variant
      variant === 'default' && !error && 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20',
      variant === 'default' && error && 'bg-white border-red-300 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-red-500/20',
      // Dark variant
      variant === 'dark' && !error && 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/20',
      variant === 'dark' && error && 'bg-gray-800 border-red-400 text-white placeholder-gray-400 focus:border-red-400 focus:ring-red-400/20',
      className
    );

    const labelClasses = clsx(
      'block text-sm font-medium mb-2',
      {
        'text-gray-700': variant === 'default',
        'text-gray-200': variant === 'dark',
      }
    );

    const errorClasses = clsx(
      'mt-1 text-sm',
      {
        'text-red-600': variant === 'default',
        'text-red-400': variant === 'dark',
      }
    );

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {error && (
          <p id={errorId} className={errorClasses} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
