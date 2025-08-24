import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Layout } from './shared/components/Layout';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { LoadingSpinner } from './shared/components/LoadingSpinner';
import { LoginPage } from './pages/LoginPage';
import { CoursesPage } from './pages/CoursesPage';
import { CoursePage } from './pages/CoursePage';
import { PlayerPage } from './pages/PlayerPage';
import { QuizPage } from './pages/QuizPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForumPage } from './pages/ForumPage';
import { AssignmentPage } from './pages/AssignmentPage';
import { GradesPage } from './pages/GradesPage';
import { CertificatePage } from './pages/CertificatePage';

export const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <LoginPage />
              </Suspense>
            } 
          />
          
          {/* Protected routes wrapped with Layout */}
          <Route 
            element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }
          >
            <Route 
              path="/dashboard" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <DashboardPage />
                </Suspense>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CoursesPage />
                </Suspense>
              } 
            />
            <Route 
              path="/courses/:courseId" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CoursePage />
                </Suspense>
              } 
            />
            <Route 
              path="/courses/:courseId/player/:lessonId" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <PlayerPage />
                </Suspense>
              } 
            />
            <Route 
              path="/courses/:courseId/quiz/:quizId" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <QuizPage />
                </Suspense>
              } 
            />
            <Route 
              path="/forum" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ForumPage />
                </Suspense>
              } 
            />
            <Route 
              path="/assignments" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AssignmentPage />
                </Suspense>
              } 
            />
            <Route 
              path="/grades" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <GradesPage />
                </Suspense>
              } 
            />
            <Route 
              path="/certificates" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CertificatePage />
                </Suspense>
              } 
            />
          </Route>
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
