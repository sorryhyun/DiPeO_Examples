import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';

import Routes from '@/routes/Routes';
import ErrorBoundary from '@/components/ErrorBoundary';
import SuspenseFallback from '@/components/SuspenseFallback';
import ThemeProvider from '@/providers/ThemeProvider';
import I18nProvider from '@/providers/I18nProvider';
import AuthProvider from '@/providers/AuthProvider';
import SocketProvider from '@/providers/SocketProvider';
import ReactQueryProvider from '@/providers/ReactQueryProvider';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ReactQueryProvider>
          <I18nProvider>
            <ThemeProvider>
              <AuthProvider>
                <SocketProvider>
                  <Suspense fallback={<SuspenseFallback />}>
                    <div className="App h-full min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <Routes />
                    </div>
                  </Suspense>
                </SocketProvider>
              </AuthProvider>
            </ThemeProvider>
          </I18nProvider>
        </ReactQueryProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
