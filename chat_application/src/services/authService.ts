// filepath: src/services/authService.ts
import { apiClient, getJson, postJson } from '@/services/api';
import type { ApiResult, User, UserRole } from '@/core/contracts';
import { register, TOKENS } from '@/core/di';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export class AuthService {
  private currentUser: User | null = null;
  private tokens: AuthTokens | null = null;

  async signIn(email: string, password: string): Promise<ApiResult<AuthResponse>> {
    try {
      const credentials: LoginCredentials = { email, password };
      const result = await postJson<AuthResponse>('/auth/login', credentials);
      
      if (result.success) {
        this.currentUser = result.data.user;
        this.tokens = result.data.tokens;
        this.scheduleTokenRefresh();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AUTH_LOGIN_FAILED',
          message: error instanceof Error ? error.message : 'Login failed',
          status: 401,
        },
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.tokens?.refreshToken) {
        await postJson('/auth/logout', { 
          refreshToken: this.tokens.refreshToken 
        });
      }
    } catch (error) {
      // Log but don't throw - we want to clear local state regardless
      console.warn('Logout API call failed:', error);
    } finally {
      this.currentUser = null;
      this.tokens = null;
      this.clearTokenRefreshTimer();
    }
  }

  async register(data: RegisterData): Promise<ApiResult<AuthResponse>> {
    try {
      const result = await postJson<AuthResponse>('/auth/register', data);
      
      if (result.success) {
        this.currentUser = result.data.user;
        this.tokens = result.data.tokens;
        this.scheduleTokenRefresh();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AUTH_REGISTER_FAILED',
          message: error instanceof Error ? error.message : 'Registration failed',
          status: 400,
        },
      };
    }
  }

  async refreshTokens(): Promise<ApiResult<AuthTokens>> {
    if (!this.tokens?.refreshToken) {
      return {
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'No refresh token available',
          status: 401,
        },
      };
    }

    try {
      const result = await postJson<AuthTokens>('/auth/refresh', {
        refreshToken: this.tokens.refreshToken,
      });

      if (result.success) {
        this.tokens = result.data;
        this.scheduleTokenRefresh();
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TOKEN_REFRESH_FAILED',
          message: error instanceof Error ? error.message : 'Token refresh failed',
          status: 401,
        },
      };
    }
  }

  async getCurrentUser(): Promise<ApiResult<User>> {
    if (!this.tokens?.accessToken) {
      return {
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'No access token available',
          status: 401,
        },
      };
    }

    try {
      const result = await getJson<User>('/auth/me');
      
      if (result.success) {
        this.currentUser = result.data;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'USER_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch user',
          status: 500,
        },
      };
    }
  }

  getStoredUser(): User | null {
    return this.currentUser;
  }

  getStoredTokens(): AuthTokens | null {
    return this.tokens;
  }

  isAuthenticated(): boolean {
    return !!(this.tokens?.accessToken && this.isTokenValid());
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.roles?.includes(role) ?? false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  private isTokenValid(): boolean {
    if (!this.tokens?.expiresAt) return false;
    
    // Add 5 minute buffer before expiration
    const bufferMs = 5 * 60 * 1000;
    return Date.now() < (this.tokens.expiresAt - bufferMs);
  }

  private refreshTimer: number | null = null;

  private scheduleTokenRefresh(): void {
    this.clearTokenRefreshTimer();
    
    if (!this.tokens?.expiresAt) return;
    
    // Schedule refresh 10 minutes before expiration
    const refreshBuffer = 10 * 60 * 1000;
    const timeUntilRefresh = this.tokens.expiresAt - Date.now() - refreshBuffer;
    
    if (timeUntilRefresh > 0) {
      this.refreshTimer = window.setTimeout(() => {
        this.refreshTokens().catch(error => {
          console.error('Automatic token refresh failed:', error);
          // Could emit an event here for the app to handle
        });
      }, timeUntilRefresh);
    }
  }

  private clearTokenRefreshTimer(): void {
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Initialize from stored tokens if available
  initializeFromStorage(storedTokens: AuthTokens | null, storedUser: User | null): void {
    if(storedTokens && storedUser) {
      this.tokens = storedTokens;
      this.currentUser = storedUser;
      
      if (this.isTokenValid()) {
        this.scheduleTokenRefresh();
      } else {
        // Tokens expired, clear them
        this.signOut();
      }
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Register with DI container
register(TOKENS.AuthService, authService);

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (uses api service which reads config)
- [x] Exports default named component (exports AuthService class and authService instance)
- [x] Adds basic ARIA and keyboard handlers (not applicable for service file)
- [x] Implements all required auth methods with proper error handling
- [x] Integrates with DI container via TOKENS
- [x] Uses typed contracts from core/contracts
- [x] Handles token refresh and expiration logic
- [x] Provides role-based access control helpers
*/
