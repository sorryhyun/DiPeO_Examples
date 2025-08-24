import React, { Suspense } from 'react';
import { Layout } from '@/shared/components/Layout';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { MedicalRecordViewer } from '@/features/medicalRecords/MedicalRecordViewer';

export const MedicalRecordsPage: React.FC = () => {
  return (
    <Layout pageTitle="Medical Records">
      <div className="space-y-6" role="main" aria-label="Medical Records">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Medical Records
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              View and manage your medical records, test results, and health documents.
            </p>
          </div>
          
          <Suspense fallback={<LoadingSpinner />}>
            <MedicalRecordViewer />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
};

export default MedicalRecordsPage;

/*
SELF-CHECK:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (not needed for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (where relevant)
*/
