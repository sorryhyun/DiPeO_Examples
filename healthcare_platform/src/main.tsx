import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Get the root element from the DOM
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

// Create React 18 root and render the app
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);