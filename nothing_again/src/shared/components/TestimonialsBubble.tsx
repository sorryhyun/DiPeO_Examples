import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import type { Testimonial } from '@/types';

interface TestimonialsBubbleProps {
  testimonial: Testimonial;
  delay?: number;
  duration?: number;
}

export const TestimonialsBubble: React.FC<TestimonialsBubbleProps> = ({
  testimonial,
  delay = 0,
  duration = 4
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <div
        className={`
          relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg 
          cursor-pointer transform transition-all duration-300 hover:scale-105
          ${isHovered ? '' : 'animate-float'}
        `}
        style={{
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        tabIndex={0}
        role="button"
        aria-label={`Testimonial from ${testimonial.name}. Click to expand.`}
      >
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {testimonial.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">
              {testimonial.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {testimonial.role}
            </p>
          </div>
        </div>

        {/* Quote Snippet */}
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          "{testimonial.quote.length > 80 
            ? testimonial.quote.substring(0, 80) + '...' 
            : testimonial.quote}"
        </p>

        {/* Expand Indicator */}
        <div className="absolute bottom-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center opacity-70">
          <svg 
            className="w-3 h-3 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 9l4-4 4 4m0 6l-4 4-4-4" 
            />
          </svg>
        </div>
      </div>

      {/* Modal with full testimonial */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Testimonial from ${testimonial.name}`}
      >
        <div className="space-y-4">
          {/* Full Avatar and Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {testimonial.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {testimonial.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {testimonial.role}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {testimonial.company}
              </p>
            </div>
          </div>

          {/* Full Quote */}
          <blockquote className="text-gray-800 dark:text-gray-200 leading-relaxed text-base border-l-4 border-purple-500 pl-4">
            "{testimonial.quote}"
          </blockquote>

          {/* Rating if available */}
          {testimonial.rating && (
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating! ? 'fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {testimonial.rating}/5 stars
              </span>
            </div>
          )}

          {/* Case Study Link */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Nothing™ Case Study: The Complete Absence Experience
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Discover how {testimonial.name} achieved unprecedented levels of nothing 
              through our revolutionary absolutely-nothing-as-a-service platform.
            </p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">ROI:</span>
                <span className="text-purple-600 dark:text-purple-400 ml-1">∞%</span>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Time Saved:</span>
                <span className="text-purple-600 dark:text-purple-400 ml-1">All of it</span>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Value Added:</span>
                <span className="text-purple-600 dark:text-purple-400 ml-1">Absolutely Nothing™</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(1deg);
          }
          66% {
            transform: translateY(5px) rotate(-1deg);
          }
        }
        
        .animate-float {
          animation: float infinite ease-in-out;
        }
      `}</style>
    </>
  );
};

export default TestimonialsBubble;
