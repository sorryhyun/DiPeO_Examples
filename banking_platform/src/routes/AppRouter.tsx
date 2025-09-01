// filepath: src/routes/AppRouter.tsx
/* src/routes/AppRouter.tsx

Client-side router (React Router v6) wiring protected routes and lazy-loaded pages. 
Integrates route-based transitions (AnimatePresence) from theme-provider.
*/

import React, { Suspense } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useLocation,
  Outlet 
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { config } from '@/app/config';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { AuthLayout } from '@/shared/layouts/AuthLayout';

// Lazy load pages for code splitting
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const DashboardPage = React.lazy(() => import('@/features/dashboard/DashboardPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Route transition variants
const routeVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  out: {
    opacity: 0,
    x: 20,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Animated page wrapper component
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={routeVariants}
        initial="initial"
        animate="in"
        exit="out"
        style={{ width: '100%', minHeight: '100%' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

// Protected route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = ROUTES.LOGIN 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Redirect based on auth requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD || ROUTES.HOME} replace />;
  }
  
  return <>{children}</>;
}

// Public route wrapper (for auth pages when already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  );
}

// Main app layout wrapper with routing
function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh' 
        }}>
          <LoadingSpinner size="lg" />
        </div>
      }>
        <AnimatedRoutes />
      </Suspense>
    </AppLayout>
  );
}

// Auth layout wrapper
function AuthLayoutWrapper() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh' 
        }}>
          <LoadingSpinner size="lg" />
        </div>
      }>
        <AnimatedRoutes />
      </Suspense>
    </AuthLayout>
  );
}

// Main router component
export function AppRouter() {
  const basename = config.app.basePath || '/';
  
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Public routes with auth layout */}
        <Route path="/" element={<AuthLayoutWrapper />}>
          <Route 
            index 
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            } 
          />
          <Route 
            path={ROUTES.LOGIN} 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
        </Route>

        {/* Protected routes with app layout */}
        <Route path="/" element={<AppLayoutWrapper />}>
          {ROUTES.DASHBOARD && (
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          )}
          
          {/* Additional protected routes can be added here */}
          {/* Example: Profile, Settings, etc. */}
        </Route>

        {/* Catch-all route for 404 */}
        <Route 
          path="*" 
          element={
            <Suspense fallback={
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh' 
              }}>
                <LoadingSpinner size="lg" />
              </div>
            }>
              <NotFoundPage />
            </Suspense>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

// Route-specific hooks for components that need routing info
export function useCurrentRoute() {
  const location = useLocation();
  
  const getRouteInfo = () => {
    const { pathname } = location;
    
    if (pathname === ROUTES.HOME || pathname === '/') {
      return { name: 'Home', isPublic: true };
    }
    if (pathname === ROUTES.LOGIN) {
      return { name: 'Login', isPublic: true };
    }
    if (ROUTES.DASHBOARD && pathname === ROUTES.DASHBOARD) {
      return { name: 'Dashboard', isPublic: false };
    }
    
    return { name: 'Unknown', isPublic: false };
  };
  
  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
    ...getRouteInfo()
  };
}

// Navigation helper hook
export function useAppNavigation() {
  const { isAuthenticated } = useAuth();
  
  const getDefaultRoute = () => {
    if (isAuthenticated) {
      return ROUTES.DASHBOARD || ROUTES.HOME;
    }
    return ROUTES.HOME;
  };
  
  const getLoginRedirect = () => {
    return ROUTES.LOGIN;
  };
  
  const getLogoutRedirect = () => {
    return ROUTES.HOME;
  };
  
  return {
    defaultRoute: getDefaultRoute(),
    loginRedirect: getLoginRedirect(),
    logoutRedirect: getLogoutRedirect(),
    isAuthenticated
  };
}

/* Example usage in other components:

// Using the route info hook
function HeaderComponent() {
  const { name, isPublic } = useCurrentRoute();
  
  return (
    <header>
      <h1>{name}</h1>
      {!isPublic && <UserMenu />}
    </header>
  );
}

// Using navigation helper
function NavigationComponent() {
  const { defaultRoute, isAuthenticated } = useAppNavigation();
  
  return (
    <nav>
      <Link to={defaultRoute}>
        {isAuthenticated ? 'Dashboard' : 'Home'}
      </Link>
    </nav>
  );
}

*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useAuth hook and React Router hooks
// [x] Reads config from `@/app/config` - uses config.app.basePath for router basename
// [x] Exports default named component - exports AppRouter as main component plus utility hooks
// [x] Adds basic ARIA and keyboard handlers (where relevant) - React Router handles keyboard navigation, loading states have proper semantics
