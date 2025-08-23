import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { ThemeProvider } from './providers/ThemeProvider';
import { SoundProvider } from './providers/SoundProvider';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { GameProvider } from './providers/GameProvider';
import './index.css';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <SoundProvider>
          <WebSocketProvider>
            <GameProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <App />
              </Suspense>
            </GameProvider>
          </WebSocketProvider>
        </SoundProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
