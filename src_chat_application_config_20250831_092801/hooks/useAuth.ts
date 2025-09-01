import { useContext } from 'react';
import { User, Role } from '@/core/contracts';

// Import AuthContext from the provider (assuming it's exported)
interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// This should be imported from AuthProvider, but defining here for completeness
const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

/**
 * Custom hook to access authentication context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook for role-based access control
 */
export function useRole() {
  const { user } = useAuth();
  
  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };
  
  const hasAnyRole = (roles: Role[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };
  
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };
  
  const isPatient = (): boolean => {
    return hasRole('patient');
  };
  
  const isDoctor = (): boolean => {
    return hasRole('doctor');
  };
  
  const isNurse = (): boolean => {
    return hasRole('nurse');
  };
  
  const isHealthcareProvider = (): boolean => {
    return hasAnyRole(['doctor', 'nurse']);
  };
  
  const canAccess = (allowedRoles: Role[]): boolean => {
    return user ? allowedRoles.includes(user.role) : false;
  };
  
  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isPatient,
    isDoctor,
    isNurse,
    isHealthcareProvider,
    canAccess,
    currentRole: user?.role || null
  };
}

/**
 * Hook for authentication guards
 */
export function useAuthGuards() {
  const { isAuthenticated, user } = useAuth();
  const { hasRole, hasAnyRole } = useRole();
  
  const requireAuth = (): boolean => {
    return isAuthenticated;
  };
  
  const requireRole = (role: Role): boolean => {
    return isAuthenticated && hasRole(role);
  };
  
  const requireAnyRole = (roles: Role[]): boolean => {
    return isAuthenticated && hasAnyRole(roles);
  };
  
  const requireUser = (): User | null => {
    return isAuthenticated ? user : null;
  };
  
  const getUserOrThrow = (): User => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated');
    }
    return user;
  };
  
  return {
    requireAuth,
    requireRole,
    requireAnyRole,
    requireUser,
    getUserOrThrow
  };
}
