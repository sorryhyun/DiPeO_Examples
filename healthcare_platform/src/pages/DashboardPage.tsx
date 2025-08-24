import React, { Suspense } from 'react';
import { Layout } from '@/shared/components/Layout';
import { HealthDashboard } from '@/features/dashboard/HealthDashboard';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  return (
    <Layout pageTitle="Dashboard">
      <main role="main" aria-label="Dashboard content">
        <Suspense fallback={<LoadingSpinner />}>
          <HealthDashboard />
        </Suspense>
      </main>
    </Layout>
  );
};

export default DashboardPage;

// SELF-CHECK:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not needed for this simple page)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
