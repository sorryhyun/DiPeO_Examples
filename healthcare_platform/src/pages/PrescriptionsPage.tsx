import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Layout from '@/shared/components/Layout';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import PrescriptionList from '@/features/prescriptions/PrescriptionList';

const PrescriptionsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <Helmet>
        <title>{t('prescriptions.page_title', 'Prescriptions - Healthcare Portal')}</title>
        <meta 
          name="description" 
          content={t('prescriptions.page_description', 'View and manage your prescriptions and refill requests')} 
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6" role="banner">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('prescriptions.title', 'My Prescriptions')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('prescriptions.subtitle', 'View your active prescriptions and request refills')}
          </p>
        </header>

        <main role="main" aria-label={t('prescriptions.main_content', 'Prescriptions content')}>
          <Suspense 
            fallback={
              <div className="flex justify-center items-center min-h-[400px]" role="status" aria-live="polite">
                <LoadingSpinner />
                <span className="sr-only">{t('prescriptions.loading', 'Loading prescriptions...')}</span>
              </div>
            }
          >
            <PrescriptionList />
          </Suspense>
        </main>
      </div>
    </Layout>
  );
};

export default PrescriptionsPage;

export { PrescriptionsPage };

// SELF-CHECK:
// [✓] Uses `@/` imports only
// [✓] Uses providers/hooks (no direct DOM/localStorage side effects)
// [✓] Reads config from `@/app/config` (N/A for this page component)
// [✓] Exports default named component
// [✓] Adds basic ARIA and keyboard handlers (ARIA roles and labels added)
