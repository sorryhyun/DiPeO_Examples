import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { User, AuthToken, ApiResponse, ApiError } from '@/core/contracts'
import { authService } from '@/services/authService'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { appConfig, shouldUseMockData } from '@/app/config'
import { defaultEventBus } from '@/core/events'

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  user: User
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: ApiError | null
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: ApiError }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State management
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  // Local storage hooks for persistence in development
  const [storedTokens, setStoredTokens] = useLocalStorage<AuthTokens | null>(
    'auth_tokens',
    null,
    { enabled: shouldUseMockData() }
  )
  const [storedUser, setStoredUser] = useLocalStorage<User | null>(
    'auth_user', 
    null,
    { enabled: shouldUseMockData() }
  )

  // Refs for token refresh management
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Derived state
  const isAuthenticated = !!(user && tokens?.accessToken)

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback((expiresAt: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    // Refresh 5 minutes before expiry
    const refreshTime = expiresAt - Date.now() - 5 * 60 * 1000
    
    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshToken()
      }, refreshTime)
    }
  }, [])

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent refresh attempts
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current
    }

    if (!tokens?.refreshToken) {
      return false
    }

    const refreshPromise = (async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await authService.refreshToken(tokens.refreshToken)
        
        if (response.error) {
          throw response.error
        }

        const newTokens = response.data!
        const newUser = response.data!.user

        setTokens(newTokens)
        setUser(newUser)

        // Persist to localStorage in dev mode
        if (shouldUseMockData()) {
          setStoredTokens(newTokens)
          setStoredUser(newUser)
        }

        // Schedule next refresh
        if (newTokens.expiresAt) {
          scheduleTokenRefresh(newTokens.expiresAt)
        }

        // Emit success event
        defaultEventBus.emit('auth.login', { user: newUser })

        return true
      } catch (err) {
        const authError = err as ApiError
        
        // If refresh fails, logout user
        await logout()

        defaultEventBus.emit('error.reported', {
          error: authError,
          context: { action: 'token_refresh' }
        })

        return false
      } finally {
        setIsLoading(false)
        refreshPromiseRef.current = null
      }
    })()

    refreshPromiseRef.current = refreshPromise
    return refreshPromise
  }, [tokens, scheduleTokenRefresh, setStoredTokens, setStoredUser])

  // Login function
  const login = useCallback(async (
    credentials: LoginRequest
  ): Promise<{ success: boolean; error?: ApiError }> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authService.login(credentials)
      
      if (response.error) {
        setError(response.error)
        
        defaultEventBus.emit('error.reported', {
          error: response.error,
          context: { action: 'login', email: credentials.email }
        })

        return { success: false, error: response.error }
      }

      const authTokens = response.data!
      const authUser = response.data!.user

      setTokens(authTokens)
      setUser(authUser)

      // Persist to localStorage in dev mode
      if (shouldUseMockData()) {
        setStoredTokens(authTokens)
        setStoredUser(authUser)
      }

      // Schedule token refresh
      if (authTokens.expiresAt) {
        scheduleTokenRefresh(authTokens.expiresAt)
      }

      // Emit success event
      defaultEventBus.emit('auth.login', { user: authUser })

      return { success: true }
    } catch (err) {
      const authError = err as ApiError
      setError(authError)

      defaultEventBus.emit('error.reported', {
        error: authError,
        context: { action: 'login', email: credentials.email }
      })

      return { success: false, error: authError }
    } finally {
      setIsLoading(false)
    }
  }, [scheduleTokenRefresh, setStoredTokens, setStoredUser])

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)

      const currentUserId = user?.id

      // Call logout service if we have a token
      if (tokens?.accessToken) {
        await authService.logout(tokens.accessToken)
      }

      // Clear all auth state
      setUser(null)
      setTokens(null)
      setError(null)

      // Clear localStorage in dev mode
      if (shouldUseMockData()) {
        setStoredTokens(null)
        setStoredUser(null)
      }

      // Clear refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }

      // Clear refresh promise
      refreshPromiseRef.current = null

      // Emit logout event
      defaultEventBus.emit('auth.logout', { userId: currentUserId })
    } catch (err) {
      // Even if logout service fails, clear local state
      setUser(null)
      setTokens(null)
      setError(null)

      if (shouldUseMockData()) {
        setStoredTokens(null)
        setStoredUser(null)
      }

      defaultEventBus.emit('error.reported', {
        error: err as Error,
        context: { action: 'logout' }
      })
    } finally {
      setIsLoading(false)
    }
  }, [tokens, user, setStoredTokens, setStoredUser])

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)

        // In dev mode, restore from localStorage
        if (shouldUseMockData() && storedTokens && storedUser) {
          // Check if stored tokens are still valid
          const now = Date.now()
          if (storedTokens.expiresAt && storedTokens.expiresAt > now) {
            setTokens(storedTokens)
            setUser(storedUser)

            // Schedule refresh for stored tokens
            scheduleTokenRefresh(storedTokens.expiresAt)

            defaultEventBus.emit('auth.login', { user: storedUser })
          } else if (storedTokens.refreshToken) {
            // Try to refresh expired token
            const success = await refreshToken()
            if (!success) {
              // Clear invalid stored tokens
              setStoredTokens(null)
              setStoredUser(null)
            }
          } else {
            // Clear invalid stored tokens
            setStoredTokens(null)
            setStoredUser(null)
          }
        }
        
      } catch (err) {
        setError(err as ApiError)

        // Clear potentially corrupted stored data
        if (shouldUseMockData()) {
          setStoredTokens(null)
          setStoredUser(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [storedTokens, storedUser, scheduleTokenRefresh, refreshToken, setStoredTokens, setStoredUser])

  // Listen for auth events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_tokens' && shouldUseMockData()) {
        if (e.newValue === null) {
          // Logout detected in another tab
          setUser(null)
          setTokens(null)
          setError(null)
        }
      }
    }

    if (shouldUseMockData()) {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Context value
  const contextValue: AuthContextValue = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    clearError
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}

// Export alias for easier imports
export const useAuth = useAuthContext
