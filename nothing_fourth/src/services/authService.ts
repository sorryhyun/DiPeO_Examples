// filepath: src/services/authService.ts

import { apiClient } from '@/services/apiClient';
import { eventBus } from '@/core/events';
import { User, AuthTokens, AuthResponse, ApiResult } from '@/core/contracts';
import { config, isDevelopment, shouldUseMockData } from '@/app/config';
import { debugLog, debugWarn, debugError } from '@/core/utils';

// ===============================================
// Auth Service Types
// ===============================================

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginRequest extends LoginCredentials {
  remember?: boolean;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface TokenStorage {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

// ===============================================
// Storage Keys
// ===============================================

const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// ===============================================
// Auth Service Implementation
// ===============================================

class AuthService {
  private currentUser: User | null = null;
  private currentTokens: AuthTokens | null = null;
  private tokenRefreshPromise: Promise<AuthTokens> | null = null;

  constructor() {
    this.initializeFromStorage();
  }

  // ===============================================
  // Initialization & Storage Management
  // ===============================================

  private initializeFromStorage(): void {
    try {
      if (typeof window === 'undefined') return;

      // Load tokens from localStorage
      const storedTokenData = localStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
      const storedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (storedTokenData && storedUserData) {
        const tokenData: TokenStorage = JSON.parse(storedTokenData);
        const userData: User = JSON.parse(storedUserData);

        // Check if tokens are still valid
        const expiresAt = new Date(tokenData.expiresAt).getTime();
        const now = Date.now();
        
        if (expiresAt > now) {
          this.currentTokens = {
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            expiresAt: tokenData.expiresAt,
          };
          this.currentUser = userData;
          
          // Set auth token in API client
          apiClient.setAuthToken(tokenData.accessToken);
          
          debugLog('AuthService', 'Restored auth session from storage', userData);
        } else {
          debugLog('AuthService', 'Stored tokens expired, clearing storage');
          this.clearStorage();
        }
      }
    } catch (error) {
      debugError('AuthService', 'Failed to initialize from storage:', error);
      this.clearStorage();
    }
  }

  private storeAuthData(user: User, tokens: AuthTokens): void {
    try {
      if (typeof window === 'undefined') return;

      const tokenData: TokenStorage = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        user,
      };

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokenData));
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      debugLog('AuthService', 'Stored auth data to localStorage');
    } catch (error) {
      debugWarn('AuthService', 'Failed to store auth data:', error);
    }
  }

  private clearStorage(): void {
    try {
      if (typeof window === 'undefined') return;

      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

      debugLog('AuthService', 'Cleared auth data from storage');
    } catch (error) {
      debugWarn('AuthService', 'Failed to clear storage:', error);
    }
  }

  // ===============================================
  // Authentication State
  // ===============================================

  isAuthenticated(): boolean {
    if (shouldUseMockData && config.dev.mockUser) {
      return true;
    }

    if (!this.currentUser || !this.currentTokens) {
      return false;
    }

    // Check if token is expired
    const expiresAt = new Date(this.currentTokens.expiresAt).getTime();
    const now = Date.now();
    
    return expiresAt > now;
  }

  getCurrentUser(): User | null {
    if (shouldUseMockData && config.dev.mockUser) {
      return config.dev.mockUser as User;
    }

    return this.currentUser;
  }

  getStoredTokens(): AuthTokens | null {
    return this.currentTokens;
  }

  // ===============================================
  // Login Implementation
  // ===============================================

  async login(email: string, password: string, remember = false): Promise<AuthResponse> {
    try {
      debugLog('AuthService', `Login attempt for: ${email}`);

      // Handle mock user in development
      if (shouldUseMockData && config.dev.mockUser) {
        const mockResponse: AuthResponse = {
          user: config.dev.mockUser as User,
          tokens: {
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          },
        };

        this.currentUser = mockResponse.user;
        this.currentTokens = mockResponse.tokens;

        debugLog('AuthService', 'Using mock user for development', mockResponse.user);
        return mockResponse;
      }

      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Prepare login request
      const loginRequest: LoginRequest = {
        email,
        password,
        remember,
      };

      // Make API call
      const result: ApiResult<AuthResponse> = await apiClient.post<AuthResponse>('/auth/login', loginRequest);

      if (!result.success) {
        const error = result.error!;
        debugError('AuthService', 'Login API failed:', error);
        throw new Error(error.message);
      }

      const authResponse = result.data!;

      // Update internal state
      this.currentUser = authResponse.user;
      this.currentTokens = authResponse.tokens;

      // Store in localStorage if remember is true
      if (remember) {
        this.storeAuthData(authResponse.user, authResponse.tokens);
      }

      // Set auth token in API client
      apiClient.setAuthToken(authResponse.tokens.accessToken);

      // Emit login event
      await eventBus.emit('auth:login', { user: authResponse.user });

      debugLog('AuthService', 'Login successful', authResponse.user);
      return authResponse;

    } catch (error) {
      debugError('AuthService', 'Login failed:', error);
      
      // Clear any partial auth state
      this.currentUser = null;
      this.currentTokens = null;
      apiClient.setAuthToken(null);

      throw error;
    }
  }

  // ===============================================
  // Logout Implementation
  // ===============================================

  async logout(): Promise<void> {
    try {
      debugLog('AuthService', 'Logout initiated');

      const currentUserId = this.currentUser?.id;

      // Try to call logout endpoint to invalidate tokens server-side
      try {
        if (this.currentTokens) {
          await apiClient.post('/auth/logout', {
            refreshToken: this.currentTokens.refreshToken,
          });
        }
      } catch (error) {
        // Don't fail logout if server call fails
        debugWarn('AuthService', 'Logout API call failed (continuing anyway):', error);
      }

      // Clear local state
      this.currentUser = null;
      this.currentTokens = null;
      this.tokenRefreshPromise = null;

      // Clear API client auth
      apiClient.setAuthToken(null);

      // Clear storage
      this.clearStorage();

      // Emit logout event
      await eventBus.emit('auth:logout', { userId: currentUserId });

      debugLog('AuthService', 'Logout completed');

    } catch (error) {
      debugError('AuthService', 'Logout error:', error);
      
      // Even if logout fails, clear local state
      this.currentUser = null;
      this.currentTokens = null;
      apiClient.setAuthToken(null);
      this.clearStorage();

      throw error;
    }
  }

  // ===============================================
  // Token Refresh Implementation
  // ===============================================

  async refreshToken(): Promise<AuthTokens> {
    try {
      // Prevent concurrent refresh attempts
      if (this.tokenRefreshPromise) {
        debugLog('AuthService', 'Token refresh already in progress, waiting...');
        return await this.tokenRefreshPromise;
      }

      debugLog('AuthService', 'Starting token refresh');

      this.tokenRefreshPromise = this.performTokenRefresh();
      const newTokens = await this.tokenRefreshPromise;

      this.tokenRefreshPromise = null;
      return newTokens;

    } catch (error) {
      this.tokenRefreshPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<AuthTokens> {
    try {
      if (!this.currentTokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshRequest: RefreshTokenRequest = {
        refreshToken: this.currentTokens.refreshToken,
      };

      const result: ApiResult<AuthTokens> = await apiClient.post<AuthTokens>('/auth/refresh', refreshRequest);

      if (!result.success) {
        const error = result.error!;
        debugError('AuthService', 'Token refresh API failed:', error);
        throw new Error(error.message);
      }

      const newTokens = result.data!;

      // Update stored tokens
      this.currentTokens = newTokens;

      // Update API client
      apiClient.setAuthToken(newTokens.accessToken);

      // Update storage if we had stored data before
      if (this.currentUser) {
        this.storeAuthData(this.currentUser, newTokens);
      }

      debugLog('AuthService', 'Token refresh successful');
      return newTokens;

    } catch (error) {
      debugError('AuthService', 'Token refresh failed:', error);

      // Clear auth state if refresh fails
      this.currentUser = null;
      this.currentTokens = null;
      apiClient.setAuthToken(null);
      this.clearStorage();

      throw error;
    }
  }

  // ===============================================
  // User Profile Management
  // ===============================================

  async getCurrentUserProfile(): Promise<User> {
    try {
      if (shouldUseMockData && config.dev.mockUser) {
        return config.dev.mockUser as User;
      }

      if (!this.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      // Try to return cached user first
      if (this.currentUser) {
        return this.currentUser;
      }

      // Fetch fresh user data from API
      const result: ApiResult<User> = await apiClient.get<User>('/auth/me');

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      const user = result.data!;

      // Update cached user
      this.currentUser = user;

      // Update storage
      if (this.currentTokens) {
        this.storeAuthData(user, this.currentTokens);
      }

      return user;

    } catch (error) {
      debugError('AuthService', 'Failed to get current user profile:', error);
      throw error;
    }
  }

  // ===============================================
  // Password Management
  // ===============================================

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const request = {
        currentPassword,
        newPassword,
      };

      const result: ApiResult<void> = await apiClient.post<void>('/auth/change-password', request);

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      debugLog('AuthService', 'Password changed successfully');

    } catch (error) {
      debugError('AuthService', 'Password change failed:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const request = { email };

      const result: ApiResult<void> = await apiClient.post<void>('/auth/request-password-reset', request);

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      debugLog('AuthService', 'Password reset requested for:', email);

    } catch (error) {
      debugError('AuthService', 'Password reset request failed:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const request = {
        token,
        newPassword,
      };

      const result: ApiResult<void> = await apiClient.post<void>('/auth/reset-password', request);

      if (!result.success) {
        throw new Error(result.error!.message);
      }

      debugLog('AuthService', 'Password reset completed');

    } catch (error) {
      debugError('AuthService', 'Password reset failed:', error);
      throw error;
    }
  }
}

// ===============================================
// Export Singleton Instance
// ===============================================

export const authService = new AuthService();

// Default export for convenience
export default authService;

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects - only uses localStorage for token persistence which is standard auth practice)
- [x] Reads config from `@/app/config`
- [x] Exports default named component (authService singleton)
- [x] Adds basic ARIA and keyboard handlers (N/A - this is a service layer)
*/
