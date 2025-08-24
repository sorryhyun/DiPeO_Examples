import React, { useState } from 'react';
import { Testimonial } from '@/types';
import { fetchTestimonials } from '@/services/testimonialService';
import { sendEvent } from '@/services/analyticsService';
import { Button } from '@/shared/components/Button';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

interface ReviewsProps {
  className?: string;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center space-x-1" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <StarIcon key={star} filled={star <= rating} />
    ))}
  </div>
);

const ReviewCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <StarRating rating={5} />
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {new Date().toLocaleDateString()}
      </span>
    </div>
    
    <blockquote className="text-gray-700 dark:text-gray-300 mb-4 italic">
      "{testimonial.content}"
    </blockquote>
    
    <div className="flex items-center">
      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
        {testimonial.author.charAt(0).toUpperCase()}
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {testimonial.author}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Verified Nothing™ Customer
        </p>
      </div>
    </div>
  </div>
);

export const Reviews: React.FC<ReviewsProps> = ({ className = '' }) => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialized, setInitialized] = useState(false);

  React.useEffect(() => {
    const loadInitialReviews = async () => {
      setLoading(true);
      try {
        const initialReviews = await fetchTestimonials();
        setReviews(initialReviews);
        setInitialized(true);
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialReviews();
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    
    // Track analytics event
    await sendEvent({
      event: 'reviews_load_more',
      category: 'interaction',
      properties: {
        current_count: reviews.length
      },
      sessionId: 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      page: '/reviews'
    });

    try {
      // Mock infinite loading by appending the same testimonials
      const moreReviews = await fetchTestimonials();
      
      // Add slight delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setReviews(prev => [...prev, ...moreReviews]);
    } catch (error) {
      console.error('Failed to load more reviews:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading && !initialized) {
    return (
      <section className={`py-16 ${className}`} aria-labelledby="reviews-title">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 ${className}`} aria-labelledby="reviews-title">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 
            id="reviews-title"
            className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            Customer Reviews
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            See what our customers are saying about Nothing™
          </p>
          <div className="flex items-center justify-center space-x-2 text-lg">
            <StarRating rating={5} />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              5.0 out of 5 stars
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ({reviews.length} reviews)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reviews.map((review, index) => (
            <ReviewCard key={`${review.author}-${index}`} testimonial={review} />
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="secondary"
            size="lg"
            className="min-w-[200px]"
            aria-label="Load more reviews"
          >
            {loadingMore ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Loading More...
              </>
            ) : (
              'Load More Reviews'
            )}
          </Button>
          
          {reviews.length > 0 && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Showing {reviews.length} reviews of infinite nothing
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
