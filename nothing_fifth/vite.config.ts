import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/providers': path.resolve(__dirname, './src/providers'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/mocks': path.resolve(__dirname, './src/mocks'),
      '@/plugins': path.resolve(__dirname, './src/plugins'),
      '@/workers': path.resolve(__dirname, './src/workers'),
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
            // Return mock data when backend is not available
            if (res && !res.headersSent) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              if (req.url === '/auth/me') {
                res.end(JSON.stringify({
                  success: true,
                  data: {
                    id: '1',
                    email: 'user@example.com',
                    name: 'Mock User',
                    roles: ['patient'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                }));
              } else {
                res.end(JSON.stringify({ success: false, error: { message: 'Not found' } }));
              }
            }
          });
        }
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
            // Return mock data when backend is not available
            if (res && !res.headersSent) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, data: {} }));
            }
          });
        }
      },
      '/dashboard': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
            // Return mock data when backend is not available
            if (res && !res.headersSent) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              if (req.url === '/dashboard/metrics') {
                res.end(JSON.stringify({
                  success: true,
                  data: {
                    totalPatients: 1250,
                    totalAppointments: 42,
                    revenue: 45678.90,
                    growthRate: 12.5,
                    satisfactionScore: 4.5,
                    totalUsers: 1250,
                    activeUsers: 847
                  }
                }));
              } else {
                res.end(JSON.stringify({ success: true, data: {} }));
              }
            }
          });
        }
      },
      '/analytics': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
            // Return mock data when backend is not available
            if (res && !res.headersSent) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              if (req.url === '/analytics/appointments') {
                res.end(JSON.stringify({
                  success: true,
                  data: {
                    total: 342,
                    completed: 298,
                    cancelled: 23,
                    upcoming: 21,
                    byStatus: [{
                      points: [
                        { x: 0, y: 298, label: 'Completed' },
                        { x: 1, y: 21, label: 'Upcoming' },
                        { x: 2, y: 23, label: 'Cancelled' }
                      ]
                    }],
                    trends: [
                      { date: '2025-01-01', count: 12 },
                      { date: '2025-01-02', count: 15 },
                      { date: '2025-01-03', count: 18 }
                    ]
                  }
                }));
              } else {
                res.end(JSON.stringify({ success: true, data: {} }));
              }
            }
          });
        }
      },
      '/patients': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
            // Return mock data when backend is not available
            if (res && !res.headersSent) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                data: {
                  items: [
                    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
                    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive' }
                  ],
                  total: 3,
                  page: 1,
                  limit: 5
                }
              }));
            }
          });
        }
      },
      '/appointments': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
            // Return mock data when backend is not available
            if (res && !res.headersSent) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                data: {
                  items: [
                    { id: '1', patientName: 'John Doe', date: '2025-01-15', time: '10:00 AM', status: 'scheduled' },
                    { id: '2', patientName: 'Jane Smith', date: '2025-01-15', time: '2:00 PM', status: 'scheduled' },
                    { id: '3', patientName: 'Bob Johnson', date: '2025-01-16', time: '9:00 AM', status: 'confirmed' }
                  ],
                  total: 3,
                  page: 1,
                  limit: 5
                }
              }));
            }
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
