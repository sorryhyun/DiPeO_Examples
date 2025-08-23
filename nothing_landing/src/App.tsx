import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './shared/errors/ErrorBoundary';
import { AppProvider } from './shared/providers/AppProvider';
import { Layout } from './shared/components/Layout';
import { Spinner } from './shared/components/Spinner';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const PressKitPage = React.lazy(() => import('./pages/PressKitPage'));
const APIDocsPage = React.lazy(() => import('./pages/APIDocsPage'));
const StatusPage = React.lazy(() => import('./pages/StatusPage'));

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/press-kit" element={<PressKitPage />} />
                <Route path="/api-docs" element={<APIDocsPage />} />
                <Route path="/status" element={<StatusPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
