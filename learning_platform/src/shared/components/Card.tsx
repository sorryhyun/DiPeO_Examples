import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  tabIndex?: number;
  role?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  footer,
  className = '',
  onClick,
  onKeyDown,
  tabIndex,
  role,
}) => {
  return (
    <article 
      className={`
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-lg shadow-sm 
        overflow-hidden
        ${className}
      `}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role={role || "article"}
    >
      {title && (
        <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </header>
      )}
      
      <div className="p-6">
        {children}
      </div>
      
      {footer && (
        <footer className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </footer>
      )}
    </article>
  );
};
