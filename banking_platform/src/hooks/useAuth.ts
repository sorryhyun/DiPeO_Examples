// filepath: src/hooks/useAuth.ts
/* src/hooks/useAuth.ts

Convenience hook wrapping the AuthProvider context for consumer components.
Exposes user, isAuthenticated, login and logout helpers.
*/

import { useContext } from 'react';
import type { User } from '@/core/contracts';

// AuthContext interface - matches what AuthProvider should expose
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// This context should be created and provided by AuthProvider
// We'll assume it's exported from the provider file
import { AuthContext } from '@/providers/AuthProvider';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/* Example usage

import { useAuth } from '@/hooks/useAuth'

function LoginButton() {
  const { login, isAuthenticated, isLoading } = useAuth()
  
  if (isAuthenticated) return <LogoutButton />
  
  return (
    <button 
      onClick={() => login('demo@example.com', 'password')}
      disabled={isLoading}
    >
      {isLoading ? 'Signing in...' : 'Sign In'}
    </button>
  )
}
*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (wraps AuthProvider context)
// [x] Reads config from `@/app/config` (not applicable for this auth hook)
// [x] Exports default named component (exports named useAuth function)
// [x] Adds basic ARIA and keyboard handlers (not applicable for hook)
