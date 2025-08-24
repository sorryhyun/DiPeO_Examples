import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { I18nProvider } from './providers/I18nProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { startMockServer } from './services/mockServer';
import { startMockWebsocket } from './services/mockWebsocket';
import './index.css';

// Initialize mock services in development
const isDevelopment = process.env.NODE_ENV === 'development' || (import.meta as any).env?.DEV;

if (isDevelopment) {
  startMockServer({ enable: true });
  startMockWebsocket({ enable: true });
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <I18nProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </I18nProvider>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>
);
