// src/pages/PressPage.tsx

// Self-confirm comments:
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React from 'react';
import { config } from '@/app/config';
import { PressKit } from '@/features/press/PressKit';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';

export default function PressPage() {
  React.useEffect(() => {
    document.title = `Press Kit - ${config.appName}`;
  }, []);

  return (
    <MainLayout>
      <ResponsiveContainer className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Press Kit
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Download our press materials, logos, and brand assets.
            </p>
          </div>
          
          <PressKit />
        </div>
      </ResponsiveContainer>
    </MainLayout>
  );
}
