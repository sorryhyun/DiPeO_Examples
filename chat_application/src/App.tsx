import React, { Suspense } from 'react';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './shared/ErrorBoundary';
import Spinner from './shared/components/atoms/Spinner';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main role="main" className="h-screen flex flex-col">
        <ErrorBoundary>
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-full">
                <Spinner size="large" />
              </div>
            }
          >
            <AppRouter />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default App;
