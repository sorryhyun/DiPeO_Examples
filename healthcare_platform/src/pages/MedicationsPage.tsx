import React from 'react';
import { Layout } from '@/shared/components/Layout';
import { MedicationReminders } from '@/features/medications/MedicationReminders';
import { useAuth } from '@/shared/hooks/useAuth';
import { useI18n } from '@/providers/I18nProvider';

export const MedicationsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('medications.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('medications.subtitle')}
          </p>
        </header>

        <main role="main" aria-label={t('medications.main_content')}>
          <section 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            aria-labelledby="medication-reminders-heading"
          >
            <h2 
              id="medication-reminders-heading" 
              className="sr-only"
            >
              {t('medications.reminders_section')}
            </h2>
            
            <MedicationReminders />
          </section>

          <div 
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            role="region"
            aria-label={t('medications.help_info')}
          >
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">{t('medications.tip')}:</span>{' '}
              {t('medications.tip_description')}
            </p>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default MedicationsPage;

// SELF-CHECK
// - [x] Uses `@/` imports only
// - [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// - [x] Reads config from `@/app/config` (not needed for this component)
// - [x] Exports default named component
// - [x] Adds basic ARIA and keyboard handlers (where relevant)
