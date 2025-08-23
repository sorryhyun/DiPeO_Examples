import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid';
import { mockTestimonials } from '../../mock/data/mockTestimonials';
import type { Testimonial } from '../../types';

const CustomerReviews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Filter testimonials to only show 5-star reviews
  const fiveStarReviews = mockTestimonials.filter(testimonial => testimonial.rating === 5);

  useEffect(() => {
    if (!isAutoScrolling || fiveStarReviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === fiveStarReviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, fiveStarReviews.length]);

  const handlePrevious = () => {
    setIsAutoScrolling(false);
    setCurrentIndex(currentIndex === 0 ? fiveStarReviews.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    setIsAutoScrolling(false);
    setCurrentIndex(currentIndex === fiveStarReviews.length - 1 ? 0 : currentIndex + 1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      handlePrevious();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        aria-hidden="true"
      />
    ));
  };

  if (fiveStarReviews.length === 0) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Customer Reviews
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No reviews available at the moment.
          </p>
        </div>
      </section>
    );
  }

  const currentReview = fiveStarReviews[currentIndex];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900" aria-label="Customer Reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Customers Say About Nothing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Don't just take our word for it. See what people are saying about their experience with absolutely nothing.
          </p>
        </div>

        <div 
          className="relative max-w-4xl mx-auto"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Customer review carousel"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            {/* Review content */}
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <div className="flex space-x-1">
                  {renderStars(currentReview.rating)}
                </div>
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                  5.0 out of 5 stars
                </span>
              </div>

              <blockquote className="text-xl md:text-2xl text-gray-900 dark:text-white font-medium leading-relaxed mb-8">
                "{currentReview.content}"
              </blockquote>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {currentReview.author}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {currentReview.title}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            {fiveStarReviews.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Previous review"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </button>
                
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Next review"
                >
                  <ChevronRightIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </button>
              </>
            )}
          </div>

          {/* Indicators */}
          {fiveStarReviews.length > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {fiveStarReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoScrolling(false);
                  }}
                  className={`w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    index === currentIndex
                      ? 'bg-purple-500'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Resume auto-scroll button */}
          {!isAutoScrolling && fiveStarReviews.length > 1 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setIsAutoScrolling(true)}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 focus:outline-none focus:underline"
              >
                Resume auto-scroll
              </button>
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {fiveStarReviews.length}+
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Five Star Reviews
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              5.0
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Average Rating
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              100%
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Satisfaction Rate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
