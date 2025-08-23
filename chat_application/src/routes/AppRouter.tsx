import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '../shared/context/AuthProvider';
import Spinner from '../shared/components/atoms/Spinner';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const ChatPage = lazy(() => import('../features/chat/pages/ChatPage'));
const ChannelsPage = lazy(() => import('../features/channels/pages/ChannelsPage'));
const FilesPage = lazy(() => import('../features/files/pages/FilesPage'));

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <Spinner size="large" />
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/channels" element={<ChannelsPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/calls" element={<div className="p-4">Calls Page - Coming Soon</div>} />
            <Route path="/search" element={<div className="p-4">Search Page - Coming Soon</div>} />
            <Route path="/settings" element={<div className="p-4">Settings Page - Coming Soon</div>} />
          </Route>
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
