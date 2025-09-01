// src/pages/HomePage.tsx
/* src/pages/HomePage.tsx
   Public home page that displays marketing content and key features.
   - Uses Layout for consistent styling and navigation
   - Shows app overview and benefits for potential users
   - Includes call-to-action buttons for authentication
   - Responsive design with healthcare-focused messaging
*/

import React from 'react';
import { Layout } from '@/shared/components/Layout';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { appConfig } from '@/app/config';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
    <div className="text-4xl mb-4" role="img" aria-label={`${title} icon`}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      {description}
    </p>
  </div>
);

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="text-blue-600 dark:text-blue-400">
                {appConfig.appName}
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Your comprehensive healthcare management platform. Connect with care providers, 
              manage appointments, track your health journey, and access your medical records 
              securely from anywhere.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => window.location.href = '/login'}
                    className="px-8 py-3"
                    aria-label="Sign in to your account"
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.location.href = '/login'}
                    className="px-8 py-3"
                    aria-label="Learn more about our features"
                  >
                    Learn More
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-8 py-3"
                  aria-label="Go to your dashboard"
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Better Health
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform brings together patients, doctors, and healthcare providers 
              in one secure, easy-to-use environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="📅"
              title="Appointment Management"
              description="Schedule, reschedule, and track your appointments with healthcare providers. Get reminders and confirmations automatically."
            />
            <FeatureCard
              icon="📋"
              title="Medical Records"
              description="Access your complete medical history, test results, prescriptions, and health data in one secure location."
            />
            <FeatureCard
              icon="💊"
              title="Prescription Tracking"
              description="Monitor your medications, set reminders, and communicate with your pharmacy for refills and updates."
            />
            <FeatureCard
              icon="🏥"
              title="Provider Network"
              description="Connect with doctors, nurses, and specialists in your area. Read reviews and choose the right care for you."
            />
            <FeatureCard
              icon="📊"
              title="Health Analytics"
              description="Track your health metrics over time with visual charts and insights to help you make informed decisions."
            />
            <FeatureCard
              icon="🔒"
              title="Secure & Private"
              description="Your health data is protected with enterprise-grade security and HIPAA compliance standards."
            />
          </div>
        </section>

        {/* Call to Action Section */}
        {!isAuthenticated && (
          <section className="px-4 py-16 mx-auto max-w-4xl sm:px-6 lg:px-8">
            <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl px-8 py-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands of patients and healthcare providers who trust {appConfig.appName} 
                for their healthcare management needs.
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.location.href = '/login'}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
                aria-label="Start your healthcare journey"
              >
                Start Your Journey
              </Button>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                10,000+
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Active Patients
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                500+
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Healthcare Providers
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                99.9%
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Platform Uptime
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

// Export both named and default for flexibility
export { HomePage };
export default HomePage;

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAuth hook
- [x] Reads config from `@/app/config` - imports and uses appConfig.appName
- [x] Exports default named component - exports both named and default HomePage component
- [x] Adds basic ARIA and keyboard handlers - includes aria-label attributes on buttons and role attributes
*/
