import React, { useState, useCallback } from 'react';
import { Button } from '@/shared/components/Button';
import { SilentSound } from '@/shared/components/SilentSound';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { newsletterService } from '@/services/newsletterService';
import { trackEvent } from '@/utils/analytics';

interface NewsletterFormProps {
  className?: string;
  onSuccess?: () => void;
  variant?: 'inline' | 'modal' | 'footer';
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  className = '',
  onSuccess,
  variant = 'inline'
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailError, setEmailError] = useState('');
  const [playSuccess, setPlaySuccess] = useState(false);
  
  const [isSubscribed, setIsSubscribed] = useLocalStorage('newsletter_subscribed', false);

  const validateEmail = useCallback((email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await newsletterService.subscribe(email);
      
      if (response.success) {
        setIsSubscribed(true);
        setMessage({
          type: 'success',
          text: 'Successfully subscribed to absolutely nothing! You will receive exactly zero emails about our non-existent updates.'
        });
        setEmail('');
        setPlaySuccess(true);
        
        trackEvent('newsletter_signup', {
          email_domain: email.split('@')[1],
          variant,
          timestamp: new Date().toISOString()
        });
        
        onSuccess?.();
      } else {
        throw new Error(response.error || 'Subscription failed');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to subscribe to nothing. Even our failures are meaningless. Please try again.'
      });
      
      trackEvent('newsletter_signup_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        variant,
        email_domain: email.split('@')[1]
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, validateEmail, setIsSubscribed, variant, onSuccess]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (emailError && value) {
      validateEmail(value);
    }
  }, [emailError, validateEmail]);

  if (isSubscribed && variant !== 'modal') {
    return (
      <div className={`text-center ${className}`}>
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200 font-medium">
            ✓ Already subscribed to the void
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            You're all set to receive absolutely nothing!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`newsletter-form ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email for nothing"
              className={`
                w-full px-4 py-3 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${emailError ? 'border-red-500 focus:ring-red-500' : ''}
              `}
              disabled={isSubmitting}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {emailError}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="px-6 py-3 min-w-[120px]"
            aria-label="Subscribe to newsletter"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Joining...
              </span>
            ) : (
              'Join the Void'
            )}
          </Button>
        </div>

        {message && (
<div
            className={`
              p-3 rounded-lg text-sm
              ${message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              }
            `}
            role="alert"
            aria-live="polite"
          >
            {message.text}
          </div>
        )}
      </form>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        By subscribing, you agree to receive absolutely nothing. 
        <br />
        No spam, no emails, no content. Perfect silence guaranteed.
      </div>

      {/* Silent sound effect on successful subscription */}
      {playSuccess && (
        <SilentSound 
          onComplete={() => setPlaySuccess(false)}
          duration={1000}
        />
      )}
    </div>
  );
};

export default NewsletterForm;
