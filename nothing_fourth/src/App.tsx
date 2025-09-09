// filepath: src/App.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { AppRouter } from '@/app/router';
import { pageTransition, fadeInUp } from '@/theme/animations';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { config, isDevelopment } from '@/app/config';

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800"
      role="alert"
      aria-live="assertive"
    >
      <motion.div 
        className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-gray-300 mb-6">
          {isDevelopment ? error.message : 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          aria-label="Try again"
        >
          Try again
        </button>
      </motion.div>
    </div>
  );
}

// Loading fallback component
function AppLoading() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800"
      aria-live="polite"
      aria-label="Loading application"
    >
      <motion.div 
        className="text-center"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto" />
        <p className="text-gray-300">{config.appName} is loading...</p>
      </motion.div>
    </div>
  );
}

// Main App component
export function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        if (isDevelopment) {
          console.error('App Error:', error);
        }
      }}
    >
      <ToastProvider>
        <motion.div 
          className="min-h-screen"
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Suspense fallback={<AppLoading />}>
            <AppRouter />
          </Suspense>
        </motion.div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

// Self-Check Comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
