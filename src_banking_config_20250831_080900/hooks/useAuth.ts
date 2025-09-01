import { useContext } from 'react'
import { AuthContext, AuthContextValue } from '@/app/providers/AuthProvider'

/**
 * High-level hook that consumes AuthProvider context and exposes
 * authentication state and actions for components.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure to wrap your component tree with AuthProvider.'
    )
  }
  
  return context
}

// Export default for consistency with other hooks
export default useAuth

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - only consumes AuthProvider context
- [x] Reads config from `@/app/config` - config is read by AuthProvider, not directly here
- [x] Exports default named component - exports useAuth hook
- [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for hooks
*/
