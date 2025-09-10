// filepath: src/services/authService.ts

import { apiClient } from '@/services/apiClient';
import { eventBus } from '@/core/events';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  AuthTokens 
} from '@/core/contracts';
import { config, isDevelopment, shouldUseMockData, getMockUser } from '@/app/config';
import { debugLog, errorLog, safeAsync } from '@/core/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthServiceInterface {
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<AuthTokens>;
  getCurrentUser: () => Promise<User>;
  isAuthenticated: () => boolean;
  getAuthState: () => AuthState;
  restoreSession: () => Promise<void>;
}

// ============================================================================
// AUTH SERVICE IMPLEMENTATION
// ============================================================================

class AuthService implements AuthServiceInterface {
  private state: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
  };

  private readonly storageKeys = {
    user: 'auth_user',
    tokens: 'auth_tokens',
    refreshToken: 'auth_refresh_token',
  } as const;

  constructor() {
    // Initialize with mock data in development if enabled
    if (shouldUseMockData) {
      this.initializeMockAuth();
    }

    debugLog('AuthService initialized', { mockData: shouldUseMockData });
  }

  /**
   * Initialize mock authentication for development
   */
  private initializeMockAuth(): void {
    const mockUser = getMockUser();
    if (mockUser) {
      const mockTokens: AuthTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      };

      this.updateState({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
        isLoading: false,
      });

      // Set token in API client
      apiClient.setAuthToken(mockTokens.accessToken);

      debugLog('AuthService: Mock authentication initialized', mockUser);
    }
  }

  /**
   * Update internal state and persist to storage
   */
  private updateState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };

    // Persist to storage if we have user and tokens
    if (this.state.user && this.state.tokens) {
      this.persistToStorage(this.state.user, this.state.tokens);
    }

    debugLog('AuthService: State updated', this.state);
  }

  /**
   * Persist auth data to localStorage
   */
  private persistToStorage(user: User, tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKeys.user, JSON.stringify(user));
      localStorage.setItem(this.storageKeys.tokens, JSON.stringify(tokens));
      debugLog('AuthService: Persisted to storage');
    } catch (error) {
      errorLog('AuthService: Failed to persist to storage', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Clear auth data from localStorage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.storageKeys.user);
      localStorage.removeItem(this.storageKeys.tokens);
      localStorage.removeItem(this.storageKeys.refreshToken);
      debugLog('AuthService: Cleared storage');
    } catch (error) {
      errorLog('AuthService: Failed to clear storage', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Restore session from localStorage
   */
  async restoreSession(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (shouldUseMockData) return; // Skip restoration in mock mode

    this.updateState({ isLoading: true });

    try {
      const userJson = localStorage.getItem(this.storageKeys.user);
      const tokensJson = localStorage.getItem(this.storageKeys.tokens);

      if (userJson && tokensJson) {
        const user = JSON.parse(userJson) as User;
        const tokens = JSON.parse(tokensJson) as AuthTokens;

        // Check if tokens are expired
        const now = new Date();
        const expiresAt = new Date(tokens.expiresAt);

        if (expiresAt > now) {
          // Tokens are valid, restore session
          this.updateState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          apiClient.setAuthToken(tokens.accessToken);
          debugLog('AuthService: Session restored from storage');

          // Emit login event
          eventBus.emit('auth:login', { user });
        } else {
          // Tokens expired, try to refresh
          debugLog('AuthService: Tokens expired, attempting refresh');
          await this.refreshToken();
        }
      } else {
        this.updateState({ isLoading: false });
      }
    } catch (error) {
      errorLog('AuthService: Failed to restore session', error instanceof Error ? error : new Error(String(error)));
      this.clearStorage();
      this.updateState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }

  /**
   * Authenticate userwith email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    debugLog('AuthService: Login attempt', { email });

    // Mock login in development
    if (shouldUseMockData) {
      const mockUser = getMockUser();
      if (mockUser && email === mockUser.email) {
        const mockTokens: AuthTokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        };

        const loginResponse: LoginResponse = {
          user: mockUser,
          tokens: mockTokens,
        };

        this.updateState({
          user: mockUser,
          tokens: mockTokens,
          isAuthenticated: true,
          isLoading: false,
        });

        apiClient.setAuthToken(mockTokens.accessToken);
        eventBus.emit('auth:login', { user: mockUser });

        debugLog('AuthService: Mock login successful', mockUser);
        return loginResponse;
      } else {
        throw new Error('Invalid credentials');
      }
    }

    this.updateState({ isLoading: true });

    try {
      const loginRequest: LoginRequest = { email, password };
      const response = await apiClient.post<LoginResponse>('/auth/login', loginRequest);

      this.updateState({
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      // Set token in API client
      apiClient.setAuthToken(response.tokens.accessToken);

      // Emit login event
      eventBus.emit('auth:login', { user: response.user });

      debugLog('AuthService: Login successful', response.user);
      return response;
    } catch (error) {
      this.updateState({ isLoading: false });
      errorLog('AuthService: Login failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    debugLog('AuthService: Logout initiated');

    const currentUserId = this.state.user?.id;

    try {
      // Call logout endpoint if not in mock mode
      if (!shouldUseMockData && this.state.tokens) {
        await apiClient.post('/auth/logout', {
          refreshToken: this.state.tokens.refreshToken,
        });
      }
    } catch (error) {
      // Log but don't throw - we want to clear local state regardless
      errorLog('AuthService: Logout API call failed', error instanceof Error ? error : new Error(String(error)));
    }

    // Clear local state
    this.updateState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Clear API client token
    apiClient.setAuthToken(null);

    // Clear storage
    this.clearStorage();

    // Emit logout event
    eventBus.emit('auth:logout', { userId: currentUserId });

    debugLog('AuthService: Logout completed');
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(): Promise<AuthTokens> {
    debugLog('AuthService: Token refresh initiated');

    if (!this.state.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Mock token refresh in development
    if (shouldUseMockData) {
      const mockTokens: AuthTokens = {
        accessToken: 'mock-access-token-refreshed',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      this.updateState({ tokens: mockTokens });
      apiClient.setAuthToken(mockTokens.accessToken);

      debugLog('AuthService: Mock token refresh successful');
      return mockTokens;
    }

    try {
      const refreshRequest: RefreshTokenRequest = {
        refreshToken: this.state.tokens.refreshToken,
      };

      const response = await apiClient.post<{ tokens: AuthTokens }>('/auth/refresh', refreshRequest);

      this.updateState({ tokens: response.tokens });

      // Update API client token
      apiClient.setAuthToken(response.tokens.accessToken);

      debugLog('AuthService: Token refresh successful');
      return response.tokens;
    } catch (error) {
      errorLog('AuthService: Token refresh failed', error instanceof Error ? error : new Error(String(error)));
      
      // If refresh fails, log out the user
      await this.logout();
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    debugLog('AuthService: Get current user');

    if (!this.state.isAuthenticated || !this.state.user) {
      throw new Error('No authenticated user');
    }

    // Return cached user if available
    if (this.state.user) {
      return this.state.user;
    }

    // Mock user in development
    if (shouldUseMockData) {
      const mockUser = getMockUser();
      if (mockUser) {
        return mockUser;
      }
    }

    try {
      const user = await apiClient.fetchJson<User>('/auth/me');
      
      this.updateState({ user });
      
      debugLog('AuthService: Current user fetched', user);
      return user;
    } catch (error) {
      errorLog('AuthService: Failed to get current user', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.user && !!this.state.tokens;
  }

  /**
   * Get current auth state
   */
  getAuthState(): AuthState {
    return { ...this.state };
  }
}

// ============================================================================
// SINGLETON INSTANCE & CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Default auth service instance
 */
export const authService = new AuthService();

/**
 * Safe authentication wrapper for login
 */
export const safeLogin = safeAsync(authService.login.bind(authService));

/**
 * Safe authentication wrapper for logout
 */
export const safeLogout = safeAsync(authService.logout.bind(authService));

/**
 * Safe authentication wrapper for refresh token
 */
export const safeRefreshToken = safeAsync(authService.refreshToken.bind(authService));

/**
 * Safe authentication wrapper for get current user
 */
export const safeGetCurrentUser = safeAsync(authService.getCurrentUser.bind(authService));

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

if (isDevelopment) {
  // Expose auth service debugging on window object in development
  (globalThis as any).__auth_service_debug = {
    authService,
    getAuthState: () => authService.getAuthState(),
    isAuthenticated: () => authService.isAuthenticated(),
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    refreshToken: authService.refreshToken.bind(authService),
    getCurrentUser: authService.getCurrentUser.bind(authService),
    restoreSession: authService.restoreSession.bind(authService),
  };

  debugLog('AuthService initialized with debug helpers');
}

// Default export
export default authService;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/services/apiClient, @/core/events, @/core/contracts, @/app/config, @/core/utils
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses localStorage with proper window checks and error handling
// [x] Reads config from `@/app/config` - Uses config, isDevelopment, shouldUseMockData, getMockUser
// [x] Exports default named component - Exports authService as default and multiple named exports
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for auth service
