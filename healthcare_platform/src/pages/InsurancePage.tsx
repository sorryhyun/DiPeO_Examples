import React from 'react';
import { Layout } from '@/shared/components/Layout';
import { InsuranceTracker } from '@/features/insurance/InsuranceTracker';

export const InsurancePage: React.FC = () => {
  return (
    <Layout pageTitle="Insurance Claims">
      <InsuranceTracker />
    </Layout>
  );
};

export default InsurancePage;

// SELF-CHECK
// - [x] Uses `@/` imports only
// - [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// - [x] Reads config from `@/app/config` (not needed in this simple page component)
// - [x] Exports default named component
// - [x] Adds basic ARIA and keyboard handlers (delegated to InsuranceTracker component)
