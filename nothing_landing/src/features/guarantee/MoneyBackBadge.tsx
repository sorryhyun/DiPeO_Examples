import React, { useState } from 'react';
import { useModal } from '../../shared/providers/ModalProvider';

interface MoneyBackBadgeProps {
  className?: string;
}

export const MoneyBackBadge: React.FC<MoneyBackBadgeProps> = ({ className = '' }) => {
  const { openModal } = useModal();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    openModal('money-back-guarantee', {
      title: 'Absolutely Nothing™ Money-Back Guarantee',
      children: (
        <div className="p-6 max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Absolutely Nothing™ Money-Back Guarantee
        </h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            We guarantee that our product delivers absolutely nothing, exactly as advertised. 
            If you receive anything other than nothing, we'll refund your payment immediately.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Guarantee Terms:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Full refund if you receive anything at all</li>
              <li>No questions asked within 30 days</li>
              <li>Void where prohibited by the laws of existence</li>
              <li>Does not cover existential crises caused by nothing</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            * This guarantee is as real as our product. Terms subject to the fundamental 
            nature of nothingness and the paradox of guaranteeing the absence of everything.
          </p>
        </div>
        </div>
      )
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 
        border-2 border-green-300 dark:border-green-700 rounded-full cursor-pointer 
        transition-all duration-200 hover:bg-green-200 dark:hover:bg-green-900/50 
        hover:border-green-400 dark:hover:border-green-600 hover:scale-105 
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
        dark:focus:ring-offset-gray-900 ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label="View money-back guarantee details"
    >
      <svg
        className={`w-6 h-6 text-green-600 dark:text-green-400 transition-transform duration-200 
          ${isHovered ? 'scale-110' : ''}`}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-green-800 dark:text-green-200">
          100% Money Back
        </span>
        <span className="text-xs text-green-700 dark:text-green-300">
          Guaranteed Nothing
        </span>
      </div>
      
      <svg
        className={`w-4 h-4 text-green-600 dark:text-green-400 transition-transform duration-200 
          ${isHovered ? 'translate-x-1' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};

export default MoneyBackBadge;
