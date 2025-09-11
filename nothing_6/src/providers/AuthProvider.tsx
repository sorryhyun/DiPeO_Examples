// filepath: src/providers/AuthProvider.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for provider)

import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react'
import { User, ApiResult, DEV_MOCK_USERS } from '@/core/contracts'
import { config, shouldUseMockData } from '@/app/config'
import { eventBus } from '@/core/events'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'

/* src/providers/AuthProvider.tsx

   Authentication provider that manages user session state. In dev mode, provides mock authentication with predefined users.
   In production, integrates with real auth service via apiClient.

   Usage:
     <AuthProvider>
       <App />
     </AuthProvider>

     const { user, login, logout, isLoading } = useAuth()
*/

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password?: string) => Promise<ApiResult<User>>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<ApiResult<User>>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionToken, setSessionToken] = useLocalStorage<string | null>('auth_session_token', null)
  const [lastAuthUser, setLastAuthUser] = useLocalStorage<User | null>('auth_last_user', null)

  const isAuthenticated = user !== null

  // Mock authentication for development
  const mockLogin = useCallback(async (email: string): Promise<ApiResult<User>> => {
    setIsLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockUser = DEV_MOCK_USERS.find(u => u.email === email) || DEV_MOCK_USERS[0]
      const sessionUser = {
        ...mockUser,
        id: `${mockUser.id}-${Date.now()}`, // Unique session ID
      }
      
      setUser(sessionUser)
      setSessionToken(`mock_token_${sessionUser.id}`)
      setLastAuthUser(sessionUser)
      
      eventBus.emit('auth:login', { user: sessionUser, timestamp: new Date().toISOString() })
      
      return { ok: true, data: sessionUser }
    } catch (error) {
      const authError = { code: 'MOCK_LOGIN_ERROR', message: 'Mock login failed', details: { error } }
      eventBus.emit('auth:error', authError)
      return { ok: false, error: authError }
    } finally {
      setIsLoading(false)
    }
  }, [setSessionToken, setLastAuthUser])

  // Production authentication (placeholder)
  const prodLogin = useCallback(async (email: string, password: string): Promise<ApiResult<User>> => {
    setIsLoading(true)
    
    try {
      // In production, this would call the real API
      const response = await fetch(`${config.apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response.ok) {
        const error = { code: 'LOGIN_FAILED', message: 'Invalid credentials' }
        return { ok: false, error }
      }
      
      const { user: authUser, token } = await response.json()
      
      setUser(authUser)
      setSessionToken(token)
      setLastAuthUser(authUser)
      
      eventBus.emit('auth:login', { user: authUser, timestamp: new Date().toISOString() })
      
      return { ok: true, data: authUser }
    } catch (error) {
      const authError = { code: 'NETWORK_ERROR', message: 'Login request failed', details: { error } }
      eventBus.emit('auth:error', authError)
      return { ok: false, error: authError }
    } finally {
      setIsLoading(false)
    }
  }, [config.apiBase, setSessionToken, setLastAuthUser])

  const login = useCallback(async (email: string, password?: string): Promise<ApiResult<User>> => {
    if (shouldUseMockData) {
      return mockLogin(email)
    } else {
      if (!password) {
        return { ok: false, error: { code: 'MISSING_PASSWORD', message: 'Password required for production login' } }
      }
      return prodLogin(email, password)
    }
  }, [shouldUseMockData, mockLogin, prodLogin])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    
    try {
      if (!shouldUseMockData && sessionToken) {
        // Call logout endpoint in production
        await fetch(`${config.apiBase}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          },
        })
      }
      
      const loggedOutUser = user
      setUser(null)
      setSessionToken(null)
      
      eventBus.emit('auth:logout', { 
        user: loggedOutUser, 
        timestamp: new Date().toISOString() 
      })
    } catch (error) {
      // Log error but still clear local session
      eventBus.emit('auth:error', { 
        code: 'LOGOUT_ERROR', 
        message: 'Logout request failed', 
        details: { error } 
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, sessionToken, shouldUseMockData, config.apiBase, setSessionToken])

  const refreshSession = useCallback(async (): Promise<void> => {
    if (!sessionToken) return
    
    setIsLoading(true)
    
    try {
      if (shouldUseMockData) {
        // In mock mode, just validate we have a last user
        if (lastAuthUser) {
          setUser(lastAuthUser)
          eventBus.emit('auth:refresh', { user: lastAuthUser })
        } else {
          await logout()
        }
      } else {
        // Production: validate session token
        const response = await fetch(`${config.apiBase}/auth/me`, {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        })
        
        if (response.ok) {
          const authUser = await response.json()
          setUser(authUser)
          setLastAuthUser(authUser)
          eventBus.emit('auth:refresh', { user: authUser })
        } else {
          // Session expired
          await logout()
        }
      }
    } catch (error) {
      eventBus.emit('auth:error', { 
        code: 'REFRESH_ERROR', 
        message: 'Session refresh failed', 
        details: { error } 
      })
      await logout()
    } finally {
      setIsLoading(false)
    }
  }, [sessionToken, shouldUseMockData, lastAuthUser, config.apiBase, logout, setLastAuthUser])

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<ApiResult<User>> => {
    if (!user) {
      return { ok: false, error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } }
    }
    
    setIsLoading(true)
    
    try {
      if (shouldUseMockData) {
        // Mock update
        await new Promise(resolve => setTimeout(resolve, 500))
        const updatedUser = { ...user, ...updates }
        setUser(updatedUser)
        setLastAuthUser(updatedUser)
        
        eventBus.emit('auth:profile_updated', { user: updatedUser, updates })
        
        return { ok: true, data: updatedUser }
      } else {
        // Production update
        const response = await fetch(`${config.apiBase}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })
        
        if (!response.ok) {
          const error = { code: 'UPDATE_FAILED', message: 'Profile update failed' }
          return { ok: false, error }
        }
        
        const updatedUser = await response.json()
        setUser(updatedUser)
        setLastAuthUser(updatedUser)
        
        eventBus.emit('auth:profile_updated', { user: updatedUser, updates })
        
        return { ok: true, data: updatedUser }
      }
    } catch (error) {
      const authError = { 
        code: 'UPDATE_ERROR', 
        message: 'Profile update request failed', 
        details: { error } 
      }
      eventBus.emit('auth:error', authError)
      return { ok: false, error: authError }
    } finally {
      setIsLoading(false)
    }
  }, [user, shouldUseMockData, sessionToken, config.apiBase, setLastAuthUser])

  // Initialize session on mount
  useEffect(() => {
    if (sessionToken) {
      refreshSession()
    } else {
      setIsLoading(false)
    }
  }, []) // Only run on mount

  // Listen for auth events
  useEffect(() => {
    const unsubscribe = eventBus.on('auth:force_logout', () => {
      logout()
    })
    
    return unsubscribe
  }, [logout])

  const contextValue: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshSession,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export default AuthProvider

// Development helper for testing different mock users
export const useDevAuthHelpers = () => {
  const { login } = useAuth()
  
  const loginAsMockUser = useCallback(async (userIndex: number = 0) => {
    if (!shouldUseMockData) {
      console.warn('Dev auth helpers only work in development mode')
      return
    }
    
    const mockUser = DEV_MOCK_USERS[userIndex] || DEV_MOCK_USERS[0]
    return login(mockUser.email)
  }, [login])
  
  return { 
    loginAsMockUser,
    availableMockUsers: DEV_MOCK_USERS,
    isDev: shouldUseMockData 
  }
}
