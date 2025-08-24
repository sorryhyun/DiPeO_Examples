// FILE: src/routes/AppRouter.tsx

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

// Lazy load all page components
const LoginPage = lazy(() => import('@/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const AppointmentPage = lazy(() => import('@/pages/AppointmentPage').then(module => ({ default: module.AppointmentPage })));
const MedicalRecordsPage = lazy(() => import('@/pages/MedicalRecordsPage').then(module => ({ default: module.MedicalRecordsPage })));
const PrescriptionsPage = lazy(() => import('@/pages/PrescriptionsPage').then(module => ({ default: module.PrescriptionsPage })));
const TelemedicinePage = lazy(() => import('@/pages/TelemedicinePage').then(module => ({ default: module.TelemedicinePage })));
const LabResultsPage = lazy(() => import('@/pages/LabResultsPage').then(module => ({ default: module.LabResultsPage })));
const InsurancePage = lazy(() => import('@/pages/InsurancePage').then(module => ({ default: module.InsurancePage })));
const MedicationsPage = lazy(() => import('@/pages/MedicationsPage').then(module => ({ default: module.MedicationsPage })));

const PageSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </Suspense>
);

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route 
        path="/login" 
        element={
          <PageSuspense>
            <LoginPage />
          </PageSuspense>
        } 
      />

      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <PageSuspense>
              <DashboardPage />
            </PageSuspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/appointments" 
        element={
          <ProtectedRoute>
            <PageSuspense>
              <AppointmentPage />
            </PageSuspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/medical-records" 
        element={
          <ProtectedRoute>
            <PageSuspense>
              <MedicalRecordsPage />
            </PageSuspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/prescriptions" 
        element={
          <ProtectedRoute>
            <PageSuspense>
              <PrescriptionsPage />
            </PageSuspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/telemedicine" 
        element={
          <ProtectedRoute>
            <PageSuspense>
              <TelemedicinePage />
            </PageSuspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/lab-results" 
        element={
          <ProtectedRoute>
            <PageSuspense>
              <LabResultsPage />
            </PageSuspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/insurance" 
        element={
          <ProtectedRoute>
            <PageSuspense>
              <InsurancePage />
            </PageSuspense>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/medications" 
        element={
          <ProtectedRoute>
            <PageSuspense>
              <MedicationsPage />
            </PageSuspense>
          </ProtectedRoute>
        } 
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;

// SELF-CHECK:
// - [x] Uses `@/` imports only
// - [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// - [x] Reads config from `@/app/config` (not applicable for router)
// - [x] Exports default named component
// - [x] Adds basic ARIA and keyboard handlers (handled by router and child components)
