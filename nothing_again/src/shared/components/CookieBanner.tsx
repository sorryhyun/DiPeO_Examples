import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/Button';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { trackEvent } from '@/utils/analytics';

interface CookieBannerProps {
  className?: string;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ className = '' }) => {
  const [cookieAccepted, setCookieAccepted] = useLocalStorage('cookieAccepted', false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner only if cookies haven't been accepted
    if (!cookieAccepted) {
      setIsVisible(true);
    }
  }, [cookieAccepted]);

  const handleAccept = () => {
    setCookieAccepted(true);
    setIsVisible(false);
    trackEvent({
      event: 'cookie_banner_accepted',
      category: 'interaction',
      properties: {
        timestamp: new Date().toISOString(),
        action: 'accept'
      },
      sessionId: 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
    trackEvent({
      event: 'cookie_banner_dismissed',
      category: 'interaction',
      properties: {
        timestamp: new Date().toISOString(),
        action: 'dismiss'
      },
      sessionId: 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    });
  };

  if (!isVisible || cookieAccepted) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 border-t border-gray-700 ${className}`}
      role="banner"
      aria-label="Cookie consent banner"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm sm:text-base">
          <p>
            We use cookies to enhance your experience with absolutely nothing. 
            These cookies contain{' '}
            <span className="font-semibold text-purple-400">zero data</span> and 
            provide{' '}
            <span className="font-semibold text-purple-400">zero functionality</span>.
          </p>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-300 hover:text-white"
            aria-label="Dismiss cookie banner"
          >
            Maybe Later
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleAccept}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6"
            aria-label="Accept cookies"
          >
            Accept Nothing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
