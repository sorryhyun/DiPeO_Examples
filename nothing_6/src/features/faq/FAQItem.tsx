// filepath: src/features/faq/FAQItem.tsx
// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)  
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

import React from 'react';
import Accordion from '@/shared/components/Accordion';
import { animations } from '@/theme/animations';

export interface FAQItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function FAQItem({ 
  question, 
  answer, 
  isOpen = false, 
  onToggle,
  className = '' 
}: FAQItemProps) {
  return (
    <div className={`faq-item ${className}`}>
      <Accordion
        isOpen={isOpen}
        onToggle={onToggle}
        trigger={
          <div className="flex items-center justify-between w-full p-6 text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {question}
            </h3>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
              style={{ 
                transitionDuration: animations.durations.normal,
                transitionTimingFunction: animations.easing.easeInOut
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        }
        content={
          <div 
            className="px-6 pb-6 text-gray-600 dark:text-gray-300"
            style={{
              animation: isOpen 
                ? `fadeIn ${animations.durations.normal} ${animations.easing.easeInOut}`
                : undefined
            }}
          >
            <p className="leading-relaxed">{answer}</p>
          </div>
        }
        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
      />
    </div>
  );
}
