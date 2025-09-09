// filepath: src/services/authService.ts
import type { User, ApiResult, AuthService as IAuthService, LoginCredentials, AuthTokens } from '@/core/contracts';
import { config, isDevelopment } from '@/app/config';
import { eventBus } from '@/core/events';
import { apiClient } from '@/services/apiClient';
import { storageService } from '@/services/storageService';

// Storage keys for auth data
const AUTH_STORAGE_KEYS = {
  USER: 'auth_user',
  TOKENS: 'auth_tokens',
  REFRESH_TOKEN: 'auth_refresh_token'
} as const;

// Auth state
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

class AuthService implements IAuthService {
  private state: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false
  };

  private refreshPromise: Promise<ApiResult<string>> | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize auth service by loading persisted auth data
   */
  private initialize(): void {
    try {
      const persistedUser = storageService.get<User>(AUTH_STORAGE_KEYS.USER);
      const persistedTokens = storageService.get<AuthTokens>(AUTH_STORAGE_KEYS.TOKENS);

      if (persistedUser && persistedTokens) {
        this.state.user = persistedUser;
        this.state.tokens = persistedTokens;
        this.state.isAuthenticated = true;

        // Check if tokens are expired and attempt refresh
        this.maybeRefreshTokens();
      }
    } catch (error) {
      // Clear any corrupted auth data
      this.clearPersistedAuth();
      
      eventBus.emit('error:global', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'AuthService.initialize'
      });
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.state.user;
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && this.state.user !== null;
  }

  /**
   * Check if current user has a specific role
   */
  hasRole(role: string): boolean {
    if (!this.state.user) return false;
    return this.state.user.roles.includes(role as any);
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<ApiResult<User>> {
    try {
      const response = await apiClient.post<{
        user: User;
        accessToken: string;
        refreshToken?: string;
        expiresAt?: string;
      }>('/auth/login', credentials);

      if (!response.success || !response.data) {
        return response as ApiResult<User>;
      }

      const { user, accessToken, refreshToken, expiresAt } = response.data;

      // Update internal state
      this.state.user = user;
      this.state.tokens = {
        accessToken,
        refreshToken,
        expiresAt
      };
      this.state.isAuthenticated = true;

      // Persist auth data
      this.persistAuth();

      // Emit login event
      eventBus.emit('auth:login', { userId: user.id });

      return {
        success: true,
        data: user
      };

    } catch (error) {
      const apiError = {
        message: error instanceof Error ? error.message : 'Login failed',
        code: 'LOGIN_ERROR'
      };

      eventBus.emit('error:global', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'AuthService.login'
      });

      return {
        success: false,
        error: apiError
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const currentUser = this.state.user;

    try {
      // Attempt to notify server of logout (best effort)
      if (this.state.tokens?.accessToken) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      // Log error but don't prevent logout
      eventBus.emit('error:global', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'AuthService.logout (server notification)'
      });
    }

    // Clear local state
    this.clearLocalAuth();

    // Emit logout event
    eventBus.emit('auth:logout', { 
      userId: currentUser?.id 
    });
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(): Promise<ApiResult<string>> {
    // Prevent multiple concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.state.tokens?.refreshToken) {
      const error = {
        message: 'No refresh token available',
        code: 'NO_REFRESH_TOKEN'
      };
      return { success: false, error };
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh operation
   */
  private async performTokenRefresh(): Promise<ApiResult<string>> {
    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken?: string;
        expiresAt?: string;
      }>('/auth/refresh', {
        refreshToken: this.state.tokens?.refreshToken
      });

      if (!response.success || !response.data) {
        // Refresh failed, clear auth
        this.clearLocalAuth();
        return response as ApiResult<string>;
      }

      const { accessToken, refreshToken, expiresAt } = response.data;

      // Update tokens
      this.state.tokens = {
        accessToken,
        refreshToken: refreshToken || this.state.tokens?.refreshToken,
        expiresAt
      };

      // Persist updated tokens
      this.persistAuth();

      return {
        success: true,
        data: accessToken
      };

    } catch (error) {
      // Refresh failed, clear auth
      this.clearLocalAuth();

      const apiError = {
        message: error instanceof Error ? error.message : 'Token refresh failed',
        code: 'REFRESH_ERROR'
      };

      eventBus.emit('error:global', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'AuthService.performTokenRefresh'
      });

      return {
        success: false,
        error: apiError
      };
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.state.tokens?.accessToken || null;
  }

  /**
   * Check if access token is expired or about to expire
   */
  isTokenExpired(): boolean {
    if (!this.state.tokens?.expiresAt) {
      return false; // No expiry info, assume valid
    }

    const expiryTime = new Date(this.state.tokens.expiresAt).getTime();
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    return currentTime >= (expiryTime - bufferTime);
  }

  /**
   * Maybe refresh tokens if they're expired
   */
  private async maybeRefreshTokens(): Promise<void> {
    if (this.isTokenExpired() && this.state.tokens?.refreshToken) {
      try {
        await this.refreshToken();
      } catch (error) {
        // Refresh failed, user will need to login again
        this.clearLocalAuth();
      }
    }
  }

  /**
   * Persist auth data to storage
   */
  private persistAuth(): void {
    if (this.state.user) {
      storageService.set(AUTH_STORAGE_KEYS.USER, this.state.user);
    }
    if (this.state.tokens) {
      storageService.set(AUTH_STORAGE_KEYS.TOKENS, this.state.tokens);
    }
  }

  /**
   * Clear auth data from storage
   */
  private clearPersistedAuth(): void {
    storageService.remove(AUTH_STORAGE_KEYS.USER);
    storageService.remove(AUTH_STORAGE_KEYS.TOKENS);
    storageService.remove(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Clear all auth state (local and persisted)
   */
  private clearLocalAuth(): void {
    this.state.user = null;
    this.state.tokens = null;
    this.state.isAuthenticated = false;
    this.clearPersistedAuth();
  }

  /**
   * Get auth state snapshot for debugging
   */
  getAuthState(): Readonly<AuthState> {
    return Object.freeze({ ...this.state });
  }
}

// Create singleton instance
export const authService = new AuthService();

// Utility functions for external auth persistence management
export function persistAuth(user: User, tokens: AuthTokens): void {
  storageService.set(AUTH_STORAGE_KEYS.USER, user);
  storageService.set(AUTH_STORAGE_KEYS.TOKENS, tokens);
}

export function clearAuth(): void {
  storageService.remove(AUTH_STORAGE_KEYS.USER);
  storageService.remove(AUTH_STORAGE_KEYS.TOKENS);
  storageService.remove(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
}

// Development utilities
export const authDevUtils = isDevelopment ? {
  getAuthState: () => authService.getAuthState(),
  forceTokenRefresh: () => authService.refreshToken(),
  clearAuthData: clearAuth
} : null;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/contracts, @/app/config, @/core/events, @/services/apiClient, @/services/storageService)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses storageService abstraction
- [x] Reads config from `@/app/config` (imports isDevelopment from config)
- [x] Exports default named component (exports authService singleton and utility functions)
- [x] Adds basic ARIA and keyboard handlers (N/A for service layer)
*/
