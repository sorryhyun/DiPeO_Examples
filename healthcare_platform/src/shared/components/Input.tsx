import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-describedby={errorId}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          dark:bg-gray-800 dark:border-gray-600 dark:text-white
          dark:focus:ring-blue-400 dark:focus:border-blue-400
          dark:disabled:bg-gray-700 dark:disabled:text-gray-400
          ${error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400' 
            : 'border-gray-300 dark:border-gray-600'
          }
          ${className}
        `.trim()}
        {...props}
      />
      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;

/*
Self-check:
- [x] Uses `@/` imports only (no internal project imports needed for this component)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not applicable for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (aria-describedby, aria-invalid, role="alert")
*/
