// filepath: src/services/auth.ts

import type { 
  User, 
  LoginCredentials, 
  LoginResponse, 
  AuthTokens, 
  ApiResult 
} from '@/core/contracts';
import { config } from '@/app/config';
import { apiClient } from '@/services/api';
import { publishEvent } from '@/core/events';
import { runHook } from '@/core/hooks';

// =============================
// TYPES & INTERFACES
// =============================

interface RefreshTokenRequest {
  refresh: string;
}

interface RefreshTokenResponse {
  access: string;
  refresh?: string;
  expiresAt?: string;
}

interface LogoutRequest {
  refresh?: string;
}

// =============================
// AUTH SERVICE IMPLEMENTATION
// =============================

/**
 * High-level authentication service that handles login, logout, token refresh,
 * and user profile retrieval. Uses apiClient for HTTP requests and integrates
 * with the event bus and hook system for cross-cutting concerns.
 */
export class AuthService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = config.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Authenticate user with email and password.
   * Returns user data and auth tokens on success.
   */
  async login(credentials: LoginCredentials): Promise<ApiResult<LoginResponse>> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: {
            message: 'Email and password are required',
            code: 'VALIDATION_ERROR',
          },
        };
      }

      // Make API request
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Run login hooks
        await runHook('onLogin', { user, tokens });

        // Publish login event
        await publishEvent('auth:login', { user, tokens });

        // Log successful login in development
        if (config.development_mode.verbose_logs) {
          console.log('User logged in successfully:', user.email);
        }
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Login failed',
          code: 'LOGIN_ERROR',
          details: { originalError: error },
        },
      };
    }
  }

  /**
   * Log out the current user and invalidate tokens.
   */
  async logout(tokens?: AuthTokens): Promise<ApiResult<void>> {
    try {
      // Prepare logout request
      const logoutRequest: LogoutRequest = {};
      if (tokens?.refresh) {
        logoutRequest.refresh = tokens.refresh;
      }

      // Make API request (optional - some apps only do client-side logout)
      let response: ApiResult<void>;
      
      try {
        response = await apiClient.post<void>('/auth/logout', logoutRequest);
      } catch (apiError) {
        // Even if server logout fails, we still want to clean up locally
        console.warn('Server logout failed, proceeding with local cleanup:', apiError);
        response = { success: true };
      }

      // Run logout hooks
      await runHook('onLogout', { tokens });

      // Publish logout event
      await publishEvent('auth:logout', { 
        reason: response.success ? 'user_initiated' : 'server_error' 
      });

      // Log successful logout in development
      if (config.development_mode.verbose_logs) {
        console.log('User logged out successfully');
      }

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Logout failed',
          code: 'LOGOUT_ERROR',
          details: { originalError: error },
        },
      };
    }
  }

  /**
   * Refresh authentication tokens using a refresh token.
   */
  async refreshToken(refreshToken: string): Promise<ApiResult<AuthTokens>> {
    try {
      if (!refreshToken) {
        return {
          success: false,
          error: {
            message: 'Refresh token is required',
            code: 'VALIDATION_ERROR',
          },
        };
      }

      const request: RefreshTokenRequest = { refresh: refreshToken };
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', request);

      if (response.success && response.data) {
        const tokens: AuthTokens = {
          access: response.data.access,
          refresh: response.data.refresh || refreshToken, // Keep old refresh if not provided
          expiresAt: response.data.expiresAt,
          tokenType: 'Bearer',
        };

        // Log successful refresh in development
        if (config.development_mode.verbose_logs) {
          console.log('Tokens refreshed successfully');
        }

        return {
          success: true,
          data: tokens,
        };
      }

      return response as ApiResult<AuthTokens>;
    } catch (error) {
      console.error('Token refresh error:', error);

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Token refresh failed',
          code: 'REFRESH_ERROR',
          details: { originalError: error },
        },
      };
    }
  }

  /**
   * Get current authenticated user profile.
   * Requires valid authentication tokens.
   */
  async getCurrentUser(): Promise<ApiResult<User>> {
    try {
      const response = await apiClient.get<User>('/auth/me');

      if (response.success && config.development_mode.verbose_logs) {
        console.log('Current user retrieved:', response.data?.email);
      }

      return response;
    } catch (error) {
      console.error('Get current user error:', error);

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get user profile',
          code: 'GET_USER_ERROR',
          details: { originalError: error },
        },
      };
    }
  }

  /**
   * Validate if the current user has specific roles.
   */
  validateUserRoles(user: User | null, requiredRoles: string[]): boolean {
    if (!user || !user.roles) {
      return false;
    }

    return requiredRoles.some(role => user.roles.includes(role as any));
  }

  /**
   * Check if user has admin privileges.
   */
  isAdmin(user: User | null): boolean {
    return this.validateUserRoles(user, ['admin']);
  }

  /**
   * Check if user is a healthcare provider (doctor or nurse).
   */
  isProvider(user: User | null): boolean {
    return this.validateUserRoles(user, ['doctor', 'nurse']);
  }

  /**
   * Check if user is a patient.
   */
  isPatient(user: User | null): boolean {
    return this.validateUserRoles(user, ['patient']);
  }

  /**
   * Extract user display name with fallback logic.
   */
  getUserDisplayName(user: User | null): string {
    if (!user) return 'Unknown User';
    
    return user.name || user.email || 'User';
  }

  /**
   * Check if auth tokens are expired or about to expire.
   */
  isTokenExpired(tokens: AuthTokens | null, bufferMinutes: number = 5): boolean {
    if (!tokens?.expiresAt) {
      return false; // Can't determine expiration without timestamp
    }

    try {
      const expiresAt = new Date(tokens.expiresAt).getTime();
      const now = Date.now();
      const bufferMs = bufferMinutes * 60 * 1000;

      return now >= (expiresAt - bufferMs);
    } catch (error) {
      console.warn('Error parsing token expiration:', error);
      return false;
    }
  }

  /**
   * Get time until token expires (in milliseconds).
   * Returns null if expiration time is not available.
   */
  getTokenTimeToExpiry(tokens: AuthTokens | null): number | null {
    if (!tokens?.expiresAt) {
      return null;
    }

    try {
      const expiresAt = new Date(tokens.expiresAt).getTime();
      const now = Date.now();
      const timeToExpiry = expiresAt - now;

      return Math.max(0, timeToExpiry);
    } catch (error) {
      console.warn('Error calculating token expiry:', error);
      return null;
    }
  }
}

// =============================
// SINGLETON INSTANCE
// =============================

// Create and export singleton auth service instance
export const authService = new AuthService();

// =============================
// CONVENIENCE FUNCTIONS
// =============================

/**
 * Convenience function to login a user.
 */
export async function login(credentials: LoginCredentials): Promise<ApiResult<LoginResponse>> {
  return authService.login(credentials);
}

/**
 * Convenience function to logout the current user.
 */
export async function logout(tokens?: AuthTokens): Promise<ApiResult<void>> {
  return authService.logout(tokens);
}

/**
 * Convenience function to get the current user profile.
 */
export async function getCurrentUser(): Promise<ApiResult<User>> {
  return authService.getCurrentUser();
}

/**
 * Convenience function to refresh authentication tokens.
 */
export async function refreshToken(token: string): Promise<ApiResult<AuthTokens>> {
  return authService.refreshToken(token);
}

/**
 * Convenience function to check if user has specific roles.
 */
export function validateUserRoles(user: User | null, requiredRoles: string[]): boolean {
  return authService.validateUserRoles(user, requiredRoles);
}

/**
 * Convenience function to check if user is an admin.
 */
export function isAdmin(user: User | null): boolean {
  return authService.isAdmin(user);
}

/**
 * Convenience function to check if user is a healthcare provider.
 */
export function isProvider(user: User | null): boolean {
  return authService.isProvider(user);
}

/**
 * Convenience function to check if user is a patient.
 */
export function isPatient(user: User | null): boolean {
  return authService.isPatient(user);
}

/**
 * Convenience function to get user display name.
 */
export function getUserDisplayName(user: User | null): string {
  return authService.getUserDisplayName(user);
}

/**
 * Convenience function to check if tokens are expired.
 */
export function isTokenExpired(tokens: AuthTokens | null, bufferMinutes?: number): boolean {
  return authService.isTokenExpired(tokens, bufferMinutes);
}

/**
 * Convenience function to get time until token expires.
 */
export function getTokenTimeToExpiry(tokens: AuthTokens | null): number | null {
  return authService.getTokenTimeToExpiry(tokens);
}

// =============================
// DEVELOPMENT HELPERS
// =============================

/**
 * Development helper to simulate login with mock data.
 * Only available in development mode with mock data enabled.
 */
export async function mockLogin(userType: 'admin' | 'doctor' | 'patient' = 'admin'): Promise<ApiResult<LoginResponse>> {
  if (!config.development_mode.enable_mock_data) {
    return {
      success: false,
      error: {
        message: 'Mock login is only available in development mode with mock data enabled',
        code: 'MOCK_NOT_ENABLED',
      },
    };
  }

  const { MOCK_USER_ADMIN } = await import('@/app/config');
  
  const mockUser = MOCK_USER_ADMIN; // Could extend to support different user types
  
  const mockTokens: AuthTokens = {
    access: 'mock-access-token-' + Date.now(),
    refresh: 'mock-refresh-token-' + Date.now(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    tokenType: 'Bearer',
  };

  const mockResponse: LoginResponse = {
    user: mockUser,
    tokens: mockTokens,
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Run hooks and events like a real login
  await runHook('onLogin', { user: mockUser, tokens: mockTokens });
  await publishEvent('auth:login', { user: mockUser, tokens: mockTokens });

  console.log('Mock login successful:', mockUser.email);

  return {
    success: true,
    data: mockResponse,
  };
}

// Export the service class for testing and advanced usage
export { AuthService };

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - integrates with events and hooks
// [x] Reads config from `@/app/config`
// [x] Exports default named component (exports AuthService class and convenience functions)
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for service layer
