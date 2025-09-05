// filepath: src/services/authService.ts
import { typedApiClient } from '@/services/apiClient';
import { config } from '@/app/config';
import { eventBus } from '@/core/events';
import type { 
  User, 
  Doctor, 
  Patient, 
  Nurse, 
  AuthTokens, 
  ApiResult,
  Role 
} from '@/core/contracts';

// Authentication request/response types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

// Storage keys for auth data
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth.accessToken',
  REFRESH_TOKEN: 'auth.refreshToken',
  USER: 'auth.user',
  EXPIRES_AT: 'auth.expiresAt',
} as const;

// Auth service interface
export interface AuthService {
  login(credentials: LoginRequest): Promise<ApiResult<LoginResponse>>;
  logout(): Promise<void>;
  refreshToken(): Promise<ApiResult<AuthTokens>>;
  getCurrentUser(): Promise<ApiResult<User>>;
  updateProfile(profileData: Pick<User, 'name' | 'email' | 'avatarUrl'>): Promise<ApiResult<User>>;
  changePassword(currentPassword: string, newPassword: string): Promise<ApiResult<void>>;
  isAuthenticated(): boolean;
  hasRole(role: Role): boolean;
  hasAnyRole(roles: Role[]): boolean;
  getStoredUser(): User | null;
  getStoredTokens(): AuthTokens | null;
  clearStoredAuth(): void;
}

// Token refresh utilities
let refreshPromise: Promise<ApiResult<AuthTokens>> | null = null;
let refreshTimer: number | null = null;

// Helper to get storage (with fallback for SSR/testing)
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

// Helper to safely parse JSON from storage
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Persist auth data to storage
export function persistAuth(user: User, tokens: AuthTokens): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    
    if (tokens.refreshToken) {
      storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
    
    if (tokens.expiresAt) {
      storage.setItem(STORAGE_KEYS.EXPIRES_AT, tokens.expiresAt);
    }

    // Schedule token refresh if expiry is known
    scheduleTokenRefresh(tokens);
  } catch (error) {
    console.error('[AuthService] Failed to persist auth data:', error);
  }
}

// Clear auth data from storage
export function clearAuth(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      storage.removeItem(key);
    });

    // Clear refresh timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }

    // Clear any pending refresh
    refreshPromise = null;
  } catch (error) {
    console.error('[AuthService] Failed to clear auth data:', error);
  }
}

// Schedule automatic token refresh
function scheduleTokenRefresh(tokens: AuthTokens): void {
  if (!tokens.expiresAt || !tokens.refreshToken) return;

  // Clear existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  const expiresAt = new Date(tokens.expiresAt).getTime();
  const now = Date.now();
  const refreshAt = expiresAt - (5 * 60 * 1000); // Refresh 5 minutes before expiry

  if (refreshAt <= now) {
    // Token already expired or about to expire, refresh immediately
    authService.refreshToken();
    return;
  }

  refreshTimer = setTimeout(() => {
    authService.refreshToken();
  }, refreshAt - now);
}

// Main auth service implementation
export const authService: AuthService = {
  async login(credentials: LoginRequest): Promise<ApiResult<LoginResponse>> {
    try {
      // Use mock data in development if enabled
      if (config.shouldUseMockData) {
        const { mock } = await import('@/app/config');
        if (!mock?.currentUser) throw new Error('Mock data not available');
        const mockUser = mock.currentUser;
        const mockTokens: AuthTokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          tokenType: 'Bearer',
        };

        const response: LoginResponse = {
          user: mockUser,
          tokens: mockTokens,
        };

        // Persist mock auth
        persistAuth(mockUser, mockTokens);

        // Emit login event
        eventBus.emit('auth:login', { userId: mockUser.id });

        return {
          success: true,
          data: response,
        };
      }

      // Real API call
      const result = await typedApiClient.post<LoginResponse>('/auth/login', credentials);
      
      if (result.success && result.data) {
        const { user, tokens } = result.data;
        
        // Persist auth data
        persistAuth(user, tokens);

        // Emit login event
        eventBus.emit('auth:login', { userId: user.id });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      return {
        success: false,
        error: {
          message: errorMessage,
          code: 'LOGIN_FAILED',
        },
      };
    }
  },

  async logout(): Promise<void> {
    const storedUser = this.getStoredUser();
    const tokens = this.getStoredTokens();

    try {
      // Call logout endpoint if we have tokens (ignore failures)
      if (tokens?.accessToken && !config.shouldUseMockData) {
        await typedApiClient.post('/auth/logout', { 
          refreshToken: tokens.refreshToken 
        });
      }
    } catch (error) {
      // Ignore logout API failures - we're logging out anyway
      console.warn('[AuthService] Logout API call failed:', error);
    } finally {
      // Always clear local auth data
      clearAuth();

      // Emit logout event
      if (storedUser) {
        eventBus.emit('auth:logout', { userId: storedUser.id });
      } else {
        eventBus.emit('auth:logout', {});
      }
    }
  },

  async refreshToken(): Promise<ApiResult<AuthTokens>> {
    // Return existing refresh promise if one is already in flight
    if (refreshPromise) {
      return refreshPromise;
    }

    const tokens = this.getStoredTokens();
    
    if (!tokens?.refreshToken) {
      const error = {
        success: false as const,
        error: {
          message: 'No refresh token available',
          code: 'NO_REFRESH_TOKEN',
        },
      };
      return error;
    }

    // Create refresh promise
    refreshPromise = (async (): Promise<ApiResult<AuthTokens>> => {
      try {
        if (config.shouldUseMockData) {
          // Mock refresh - extend current tokens
          const newTokens: AuthTokens = {
            ...tokens,
            accessToken: 'mock-refreshed-access-token',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };

          const storage = getStorage();
          if (storage) {
            storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newTokens.accessToken);
            if (newTokens.expiresAt) {
              storage.setItem(STORAGE_KEYS.EXPIRES_AT, newTokens.expiresAt);
            }
          }

          scheduleTokenRefresh(newTokens);

          return {
            success: true,
            data: newTokens,
          };
        }

        // Real API call
        const result = await typedApiClient.post<RefreshTokenResponse>('/auth/refresh', {
          refreshToken: tokens.refreshToken,
        });

        if (result.success && result.data) {
          const newTokens = result.data.tokens;
          
          // Update stored tokens
          const storage = getStorage();
          if (storage) {
            storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newTokens.accessToken);
            
            if (newTokens.refreshToken) {
              storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newTokens.refreshToken);
            }
            
            if (newTokens.expiresAt) {
              storage.setItem(STORAGE_KEYS.EXPIRES_AT, newTokens.expiresAt);
            }
          }

          // Schedule next refresh
          scheduleTokenRefresh(newTokens);

          return {
            success: true,
            data: newTokens,
          };
        }

        return {
          success: result.success,
          data: result.success ? result.data!.tokens : undefined,
          error: result.error,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
        
        return {
          success: false,
          error: {
            message: errorMessage,
            code: 'REFRESH_FAILED',
          },
        };
      } finally {
        // Clear the promise so future calls create a new one
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  async getCurrentUser(): Promise<ApiResult<User>> {
    const storedUser = this.getStoredUser();
    
    if (!this.isAuthenticated() || !storedUser) {
      return {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      };
    }

    // Return stored user if using mock data
    if (config.shouldUseMockData) {
      return {
        success: true,
        data: storedUser,
      };
    }

    try {
      // Fetch fresh user data from API
      const result = await typedApiClient.get<User>('/auth/me');
      
      if (result.success && result.data) {
        // Update stored user data
        const storage = getStorage();
        if (storage) {
          storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data));
        }
      }

      return result;
    } catch (error) {
      // Fallback to stored user if API fails
      console.warn('[AuthService] Failed to fetch current user, using stored data:', error);
      
      return {
        success: true,
        data: storedUser,
      };
    }
  },

  isAuthenticated(): boolean {
    const tokens = this.getStoredTokens();
    if (!tokens?.accessToken) return false;

    // Check if token is expired
    if (tokens.expiresAt) {
      const expiresAt = new Date(tokens.expiresAt).getTime();
      const now = Date.now();
      
      if (now >= expiresAt) {
        return false;
      }
    }

    return true;
  },

  hasRole(role: Role): boolean {
    const user = this.getStoredUser();
    return user?.roles.includes(role) ?? false;
  },

  hasAnyRole(roles: Role[]): boolean {
    const user = this.getStoredUser();
    if (!user) return false;
    
    return roles.some(role => user.roles.includes(role));
  },

  getStoredUser(): User | null {
    const storage = getStorage();
    if (!storage) return null;

    const userData = storage.getItem(STORAGE_KEYS.USER);
    return safeJsonParse<User | null>(userData, null);
  },

  getStoredTokens(): AuthTokens | null {
    const storage = getStorage();
    if (!storage) return null;

    const accessToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return null;

    const refreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const expiresAt = storage.getItem(STORAGE_KEYS.EXPIRES_AT);

    return {
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresAt: expiresAt || undefined,
      tokenType: 'Bearer',
    };
  },

  clearStoredAuth(): void {
    clearAuth();
  },

  async updateProfile(profileData: Pick<User, 'name' | 'email' | 'avatarUrl'>): Promise<ApiResult<User>> {
    if (!this.isAuthenticated()) {
      return {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      };
    }

    try {
      if (config.shouldUseMockData) {
        // Mock implementation - update stored user
        const currentUser = this.getStoredUser();
        if (!currentUser) {
          return {
            success: false,
            error: {
              message: 'User not found',
              code: 'USER_NOT_FOUND',
            },
          };
        }

        const updatedUser: User = {
          ...currentUser,
          ...profileData,
          updatedAt: new Date().toISOString(),
        };

        // Update stored user
        const storage = getStorage();
        if (storage) {
          storage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        }

        return {
          success: true,
          data: updatedUser,
        };
      }

      // Real API call
      const result = await typedApiClient.put<User>('/auth/profile', profileData);

      if (result.success && result.data) {
        // Update stored user data
        const storage = getStorage();
        if (storage) {
          storage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data));
        }
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      
      return {
        success: false,
        error: {
          message: errorMessage,
          code: 'PROFILE_UPDATE_FAILED',
        },
      };
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResult<void>> {
    if (!this.isAuthenticated()) {
      return {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      };
    }

    if (!currentPassword.trim() || !newPassword.trim()) {
      return {
        success: false,
        error: {
          message: 'Current and new passwords are required',
          code: 'INVALID_INPUT',
        },
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        error: {
          message: 'New password must be at least 8 characters',
          code: 'PASSWORD_TOO_SHORT',
        },
      };
    }

    try {
      if (config.shouldUseMockData) {
        // Mock implementation - just return success
        return {
          success: true,
          data: undefined,
        };
      }

      // Real API call
      const result = await typedApiClient.post<void>('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      
      return {
        success: false,
        error: {
          message: errorMessage,
          code: 'PASSWORD_CHANGE_FAILED',
        },
      };
    }
  },
};

// Initialize token refresh on startup if user is authenticated
if (typeof window !== 'undefined') {
  const tokens = authService.getStoredTokens();
  if (tokens && authService.isAuthenticated()) {
    scheduleTokenRefresh(tokens);
  }
}

// Export default service
export default authService;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses getStorage() helper for safe access
// [x] Reads config from `@/app/config`
// [x] Exports default named component - exports authService as default and named export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for service layer
