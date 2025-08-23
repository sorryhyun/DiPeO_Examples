import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from './Button';

export const CookieBanner: React.FC = () => {
  const [cookieAccepted, setCookieAccepted] = useLocalStorage('cookieAccepted', false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner with slight delay for better UX
    if (!cookieAccepted) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [cookieAccepted]);

  const handleAccept = () => {
    setCookieAccepted(true);
    setIsVisible(false);
  };

  const handleMoreInfo = () => {
    window.location.href = '/press-kit';
  };

  if (cookieAccepted || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-gray-800 p-4 md:p-6 transform transition-transform duration-500 ease-out"
      role="banner"
      aria-label="Cookie consent banner"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm md:text-base text-gray-300 leading-relaxed">
            We use absolutely nothing cookies to track absolutely nothing about your absolutely nothing experience. 
            By continuing, you agree to our policy of doing nothing with nothing data.{' '}
            <span className="text-purple-400 font-medium">It's beautifully meaningless.</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMoreInfo}
            className="w-full sm:w-auto text-gray-300 border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 transition-colors"
          >
            More nothing
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAccept}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
          >
            Accept nothing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
