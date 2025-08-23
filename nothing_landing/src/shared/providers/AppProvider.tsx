import React, { useEffect } from 'react';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { ModalProvider } from './ModalProvider';
import { analyticsService } from '../../services/analyticsService';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  useEffect(() => {
    analyticsService.init();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ModalProvider>
          {children}
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
