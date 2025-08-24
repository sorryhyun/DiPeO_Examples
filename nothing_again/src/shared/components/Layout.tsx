import React, { Suspense } from 'react';
import { Header } from '@/shared/components/Header';
import { Footer } from '@/shared/components/Footer';
import { CookieBanner } from '@/shared/components/CookieBanner';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

interface LayoutProps {
  children: React.ReactNode;
  hero?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hero = false }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <ErrorBoundary>
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main 
          className={`flex-1 ${hero ? '' : 'pt-16'}`}
          role="main"
          aria-label="Main content"
        >
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
        
        {/* Footer */}
        <Footer />
        
        {/* Cookie Banner positioned at bottom */}
        <CookieBanner />
      </ErrorBoundary>
    </div>
  );
};

export default Layout;
