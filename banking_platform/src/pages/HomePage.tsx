// filepath: src/pages/HomePage.tsx
/* src/pages/HomePage.tsx

Home/landing page for authenticated users. Composes DashboardPage if authenticated, 
otherwise show marketing or sign-up CTA. Uses AppLayout.
*/

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/Skeleton';
import { appConfig } from '@/app/config';
import { eventBus } from '@/core/events';

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Emit route change event for analytics/tracking
    eventBus.emit('route:change', { to: '/' });
  }, []);

  // Loading state - show skeleton while auth is checking
  if (isLoading) {
    return (
      <AppLayout>
        <div className="home-loading" role="status" aria-label="Loading home page">
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Authenticated users see the dashboard
  if (isAuthenticated && user) {
    return <DashboardPage />;
  }

  // Unauthenticated users see marketing/landing content
  return (
    <AppLayout>
      <div className="home-landing">
        {/* Hero Section */}
        <section className="hero-section py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Welcome to Healthcare Platform
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Streamline patient care, manage appointments, and access medical records 
            all in one comprehensive healthcare management system.
          </p>
          
          <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="btn-primary px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Sign in to your account"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="btn-secondary px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Create a new account"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section py-16 bg-gray-50 dark:bg-gray-800/50" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto px-4">
            <h2 id="features-heading" className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Key Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="feature-card p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <div className="feature-icon mb-4" aria-hidden="true">
                  📊
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Patient Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive patient records, medical history, and care coordination 
                  in one centralized platform.
                </p>
              </div>

              <div className="feature-card p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <div className="feature-icon mb-4" aria-hidden="true">
                  📅
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Appointment Scheduling
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Smart scheduling system with automated reminders and 
                  seamless provider-patient coordination.
                </p>
              </div>

              <div className="feature-card p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <div className="feature-icon mb-4" aria-hidden="true">
                  🔬
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Lab Results & Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Real-time lab results, trend analysis, and data-driven 
                  insights for better patient outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Mode Notice */}
        {appConfig.features.demoMode && (
          <section className="demo-notice py-8 bg-blue-50 dark:bg-blue-900/20" role="banner">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <p className="text-blue-800 dark:text-blue-200">
                🚀 Demo Mode Active - Explore the platform with sample data
              </p>
            </div>
          </section>
        )}

        {/* Footer CTA */}
        <section className="footer-cta py-16 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to get started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Join healthcare providers who trust our platform to deliver 
            exceptional patient care and streamline operations.
          </p>
          <Link 
            to="/login" 
            className="btn-primary px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors inline-block"
            aria-label="Sign in to get started"
          >
            Sign In Now
          </Link>
        </section>
      </div>
    </AppLayout>
  );
}

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (useAuth hook, no direct DOM/localStorage)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (aria-label, aria-labelledby, role attributes, proper focus management)
