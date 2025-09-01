Looking at the generated output, it contains some issues that need to be fixed:

1. References `appConfig.routerBasename` which doesn't exist in the config
2. Incorrect import path for ProtectedRoute (should be from routing, not providers)
3. Missing some features and proper structure

Here's the corrected implementation:

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Page imports
import { DashboardPage } from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { TransferPage } from '@/pages/TransferPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { InvestmentsPage } from '@/pages/InvestmentsPage';
import { BudgetPage } from '@/pages/BudgetPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { CardManagementPage } from '@/pages/CardManagementPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Auth wrapper
import { ProtectedRoute } from '@/app/routing/ProtectedRoute';

export interface AppRouterProps {
  basename?: string;
}

export const AppRouter: React.FC<AppRouterProps> = ({ 
  basename 
}) => {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <TransferPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/investments"
          element={
            <ProtectedRoute>
              <InvestmentsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <BudgetPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/cards"
          element={
            <ProtectedRoute>
              <CardManagementPage />
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
