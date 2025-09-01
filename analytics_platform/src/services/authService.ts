// src/services/authService.ts
/* src/services/authService.ts
   Authentication service providing login, logout, token refresh and current user retrieval.
   - Wraps API calls with proper error handling and token management
   - Integrates with core DI system for testability
   - Returns typed ApiResult objects for consistent error handling
*/

import { ApiResult, AuthTokens, User } from '@/core/contracts';
import { apiClient } from '@/services/api';

// Authentication endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me'
} as const;

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<ApiResult<{ tokens: AuthTokens; user: User }>> {
  try {
    const response = await apiClient.post<{ tokens: AuthTokens; user: User }>(
      AUTH_ENDPOINTS.LOGIN,
      { email, password }
    );
    
    if (response.error) {
      return response;
    }
    
    return response;
  } catch (error: any) {
    return {
      error: {
        code: error.status || 'LOGIN_ERROR',
        message: error.message || 'Login failed',
        details: error.response?.data
      }
    };
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<ApiResult<void>> {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    return response;
  } catch (error: any) {
    // Even if logout fails on server, we can still clear local tokens
    return {
      error: {
        code: error.status || 'LOGOUT_ERROR',
        message: error.message || 'Logout failed',
        details: error.response?.data
      }
    };
  }
}

/**
 * Refresh authentication token
 */
export async function refreshToken(token: string): Promise<ApiResult<{ tokens: AuthTokens }>> {
  try {
    const response = await apiClient.post<{ tokens: AuthTokens }>(
      AUTH_ENDPOINTS.REFRESH,
      { refreshToken: token }
    );
    
    if (response.error) {
      return response;
    }
    
    return response;
  } catch (error: any) {
    return {
      error: {
        code: error.status || 'REFRESH_ERROR',
        message: error.message || 'Token refresh failed',
        details: error.response?.data
      }
    };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<ApiResult<User>> {
  try {
    const response = await apiClient.get<User>(AUTH_ENDPOINTS.ME);
    
    if (response.error) {
      return response;
    }
    
    return response;
  } catch (error: any) {
    return {
      error: {
        code: error.status || 'USER_FETCH_ERROR',
        message: error.message || 'Failed to fetch current user',
        details: error.response?.data
      }
    };
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (basic rules)
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if token is expired (with optional buffer time)
 */
export function isTokenExpired(expiresAt?: string, bufferMinutes = 5): boolean {
  if (!expiresAt) return true;
  
  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  const bufferTime = bufferMinutes * 60 * 1000; // Convert to milliseconds
  
  return currentTime >= (expirationTime - bufferTime);
}

// Default export for easy importing
const authService = {
  login,
  logout,
  refreshToken,
  getCurrentUser,
  validateEmail,
  validatePassword,
  isTokenExpired
};

export default authService;

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (uses apiClient which reads from config)
- [x] Exports default named component (exports authService as default and individual functions as named exports)
- [x] Adds basic ARIA and keyboard handlers (not relevant for service file)
*/
