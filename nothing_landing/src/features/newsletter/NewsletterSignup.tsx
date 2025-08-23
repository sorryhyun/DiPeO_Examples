import React, { useState } from 'react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { useLocalStorage } from '../../shared/hooks/useLocalStorage';
import { useSound } from '../../shared/hooks/useSound';
import { newsletterService } from '../../services/newsletterService';

interface NewsletterSignupProps {
  className?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubscribed, setIsSubscribed] = useLocalStorage('newsletter_subscribed', false);
  const { playSound } = useSound();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await newsletterService.subscribe(email);
      setMessage({ type: 'success', text: 'Successfully subscribed to absolutely nothing!' });
      setIsSubscribed(true);
      setEmail('');
      playSound('silence');
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to subscribe. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if already subscribed
  if (isSubscribed) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">You're already subscribed to nothing!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Subscribe to Nothing
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Get the latest updates about absolutely nothing, delivered to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full"
            aria-label="Email address"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="w-full"
          variant="primary"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing to Nothing...
            </span>
          ) : (
            'Subscribe to Nothing'
          )}
        </Button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          We promise to send you absolutely nothing of value.
        </p>
      </div>
    </div>
  );
};
