import React, { Suspense } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAuth, ProtectedRoute } from '@/providers/AuthProvider';

// Lazy load page components for better performance
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const ChannelPage = React.lazy(() => import('@/pages/ChannelPage'));
const DirectMessagePage = React.lazy(() => import('@/pages/DirectMessagePage'));
const ThreadPage = React.lazy(() => import('@/pages/ThreadPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const CallPage = React.lazy(() => import('@/pages/CallPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Loading fallback component
function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-600 dark:text-gray-300">Loading...</span>
      </div>
    </div>
  );
}

// Login redirect component for authenticated users
function LoginRedirect() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <LoginPage />
    </Suspense>
  );
}

// Default redirect component for root path
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <RouteLoadingFallback />;
  }
  
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

// Protected route wrapper with suspense
interface ProtectedRouteWrapperProps {
  children: React.ReactElement;
  requireRoles?: Array<'admin' | 'member' | 'guest' | 'patient' | 'doctor' | 'nurse'>;
}

function ProtectedRouteWrapper({ children, requireRoles }: ProtectedRouteWrapperProps) {
  return (
    <ProtectedRoute
      requireRoles={requireRoles}
      fallback={<Navigate to="/login" replace />}
    >
      <Suspense fallback={<RouteLoadingFallback />}>
        {children}
      </Suspense>
    </ProtectedRoute>
  );
}

// Main Routes component
export default function Routes() {
  return (
    <BrowserRouter>
      <RouterRoutes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Public routes */}
        <Route path="/login" element={<LoginRedirect />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRouteWrapper>
              <DashboardPage />
            </ProtectedRouteWrapper>
          }
        />
        
        <Route
          path="/channel/:channelId"
          element={
            <ProtectedRouteWrapper>
              <ChannelPage />
            </ProtectedRouteWrapper>
          }
        />
        
        <Route
          path="/dm/:userId"
          element={
            <ProtectedRouteWrapper>
              <DirectMessagePage />
            </ProtectedRouteWrapper>
          }
        />
        
        <Route
          path="/thread/:threadId"
          element={
            <ProtectedRouteWrapper>
              <ThreadPage />
            </ProtectedRouteWrapper>
          }
        />
        
        <Route
          path="/call/:callId?"
          element={
            <ProtectedRouteWrapper>
              <CallPage />
            </ProtectedRouteWrapper>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRouteWrapper>
              <SettingsPage />
            </ProtectedRouteWrapper>
          }
        />
        
        {/* Admin-only routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRouteWrapper requireRoles={['admin']}>
              <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Admin features coming soon...
                </p>
              </div>
            </ProtectedRouteWrapper>
          }
        />
        
        {/* Healthcare routes (for medical staff and patients) */}
        <Route
          path="/appointments"
          element={
            <ProtectedRouteWrapper requireRoles={['doctor', 'nurse', 'patient', 'admin']}>
              <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Healthcare appointments feature coming soon...
                </p>
              </div>
            </ProtectedRouteWrapper>
          }
        />
        
        <Route
          path="/medical-records"
          element={
            <ProtectedRouteWrapper requireRoles={['doctor', 'nurse', 'patient', 'admin']}>
              <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Records</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Medical records feature coming soon...
                </p>
              </div>
            </ProtectedRouteWrapper>
          }
        />
        
        {/* Catch-all route for 404 */}
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </RouterRoutes>
    </BrowserRouter>
  );
}

// Export route paths as constants for type-safe navigation
export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CHANNEL: (channelId: string) => `/channel/${channelId}`,
  DIRECT_MESSAGE: (userId: string) => `/dm/${userId}`,
  THREAD: (threadId: string) => `/thread/${threadId}`,
  CALL: (callId?: string) => callId ? `/call/${callId}` : '/call',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  APPOINTMENTS: '/appointments',
  MEDICAL_RECORDS: '/medical-records'
} as const;

// Export route parameter types for type-safe params usage
export interface RouteParams {
  channelId?: string;
  userId?: string;
  threadId?: string;
  callId?: string;
}
