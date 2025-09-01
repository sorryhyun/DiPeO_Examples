import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/providers/AppProvider';
import { AppRouter } from '@/routes/AppRouter';
import { Layout } from '@/shared/components/Layout';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import '@/index.css';

/**
 * Main App component for the healthcare platform
 * 
 * This component sets up the application with:
 * - BrowserRouter for client-side routing
 * - AppProvider for global state (theme, auth, React Query)
 * - ErrorBoundary for error handling
 * - Layout wrapper for consistent page structure
 * - AppRouter for route management
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <Layout>
            <AppRouter />
          </Layout>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;