import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create MSW worker with all mock handlers
const worker = setupWorker(...handlers);

// Start the mock service worker
export const start = async (): Promise<void> => {
  try {
    await worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    console.log('🎭 MSW mock server started - Nothing is being served magnificently');
  } catch (error) {
    console.error('Failed to start MSW worker:', error);
  }
};

// Stop the mock service worker
export const stop = async (): Promise<void> => {
  try {
    await worker.stop();
    console.log('🎭 MSW mock server stopped - Back to the void');
  } catch (error) {
    console.error('Failed to stop MSW worker:', error);
  }
};

// Export worker instance for advanced usage if needed
export { worker };
