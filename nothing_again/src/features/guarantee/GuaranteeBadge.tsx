import React from 'react';

interface GuaranteeBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GuaranteeBadge: React.FC<GuaranteeBadgeProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full
        bg-green-100 dark:bg-green-900/20
        text-green-800 dark:text-green-300
        border border-green-200 dark:border-green-700
        ${sizeClasses[size]}
        ${className}
      `}
      role="img"
      aria-label="100% Money-Back Guarantee"
    >
      <svg
        className={`${iconSizes[size]} flex-shrink-0`}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span className="font-medium whitespace-nowrap">
        100% Money-Back Guarantee
      </span>
    </div>
  );
};

export default GuaranteeBadge;
