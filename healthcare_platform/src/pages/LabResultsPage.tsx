import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/shared/components/Layout';
import { LabResults } from '@/features/labResults/LabResults';
import { Button } from '@/shared/components/Button';

export const LabResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const [showNormalResults, setShowNormalResults] = useState(true);
  const [showAbnormalResults, setShowAbnormalResults] = useState(true);
  const [showPendingResults, setShowPendingResults] = useState(true);

  const handleFilterToggle = useCallback((filterType: 'normal' | 'abnormal' | 'pending') => {
    switch (filterType) {
      case 'normal':
        setShowNormalResults(prev => !prev);
        break;
      case 'abnormal':
        setShowAbnormalResults(prev => !prev);
        break;
      case 'pending':
        setShowPendingResults(prev => !prev);
        break;
    }
  }, []);

  const filters = {
    showNormal: showNormalResults,
    showAbnormal: showAbnormalResults,
    showPending: showPendingResults
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('labResults.pageTitle', 'Lab Results')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('labResults.pageDescription', 'View and manage your laboratory test results')}
          </p>
        </header>

        <div 
          className="mb-6 flex flex-wrap gap-3"
          role="group"
          aria-label={t('labResults.filterOptions', 'Filter lab results')}
        >
          <Button
            onClick={() => handleFilterToggle('normal')}
            variant={showNormalResults ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={showNormalResults}
            aria-label={t('labResults.toggleNormal', 'Toggle normal results')}
          >
            {t('labResults.normalResults', 'Normal Results')}
          </Button>
          <Button
            onClick={() => handleFilterToggle('abnormal')}
            variant={showAbnormalResults ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={showAbnormalResults}
            aria-label={t('labResults.toggleAbnormal', 'Toggle abnormal results')}
          >
            {t('labResults.abnormalResults', 'Abnormal Results')}
          </Button>
          <Button
            onClick={() => handleFilterToggle('pending')}
            variant={showPendingResults ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={showPendingResults}
            aria-label={t('labResults.togglePending', 'Toggle pending results')}
          >
            {t('labResults.pendingResults', 'Pending Results')}
          </Button>
        </div>

        <main 
          role="main"
          aria-label={t('labResults.mainContent', 'Lab results content')}
        >
          <LabResults filters={filters} />
        </main>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t('labResults.disclaimer', 
              'Please consult with your healthcare provider for interpretation of test results. This portal provides informational data only.'
            )}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LabResultsPage;

// SELF-CHECK:
// [✓] Uses `@/` imports only
// [✓] Uses providers/hooks (no direct DOM/localStorage side effects)
// [✓] Reads config from `@/app/config` - N/A for this page
// [✓] Exports default named component
// [✓] Adds basic ARIA and keyboard handlers (where relevant)
