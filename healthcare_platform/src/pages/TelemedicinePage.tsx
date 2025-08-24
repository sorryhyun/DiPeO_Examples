import React from 'react';
import { Telemedicine } from '@/features/telemedicine/Telemedicine';
import { Layout } from '@/shared/components/Layout';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useAuth } from '@/shared/hooks/useAuth';

export const TelemedicinePage: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Telemedicine
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connect with healthcare providers through video consultations
          </p>
        </header>
        
        <main role="main" aria-label="Telemedicine consultation interface">
          <Telemedicine />
        </main>
      </div>
    </Layout>
  );
};

export default TelemedicinePage;

// SELF-CHECK
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` - N/A for this page
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
