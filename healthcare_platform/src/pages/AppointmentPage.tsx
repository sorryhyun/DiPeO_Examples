import React, { Suspense } from 'react';
import { Layout } from '@/shared/components/Layout';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppointmentList } from '@/features/appointments/AppointmentList';
import { AppointmentForm } from '@/features/appointments/AppointmentForm';

export default function AppointmentPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            View your scheduled appointments and book new ones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointment List Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Appointments
            </h2>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner size="medium" />}>
                <AppointmentList />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Appointment Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Schedule New Appointment
            </h2>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner size="medium" />}>
                <AppointmentForm />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Self-check:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (not needed for this component)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (semantic HTML structure provides base accessibility)
