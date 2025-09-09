// filepath: src/core/di.ts
import type { User, Patient, Doctor, Appointment, ApiResult } from '@/core/contracts';

export interface InjectionToken<T> {
  readonly key: symbol;
  readonly name?: string;
}

export function createToken<T>(name?: string): InjectionToken<T> {
  return { key: Symbol(name), name };
}

export interface ServiceProvider<T> {
  useValue?: T;
  useFactory?: (container: Container) => T;
  singleton?: boolean;
}

export class Container {
  private providers = new Map<symbol, ServiceProvider<any>>();
  private singletonInstances = new Map<symbol, any>();

  register<T>(token: InjectionToken<T>, provider: ServiceProvider<T>): void {
    this.providers.set(token.key, provider);
    
    // Clear cached singleton if re-registering
    if (this.singletonInstances.has(token.key)) {
      this.singletonInstances.delete(token.key);
    }
  }

  resolve<T>(token: InjectionToken<T>): T {
    const provider = this.providers.get(token.key);
    
    if (!provider) {
      throw new Error(
        `No provider registered for token: ${token.name || token.key.toString()}`
      );
    }

    // Return direct value if provided
    if (provider.useValue !== undefined) {
      return provider.useValue;
    }

    // Handle factory provider
    if (provider.useFactory) {
      // Return cached singleton if available
      if (provider.singleton && this.singletonInstances.has(token.key)) {
        return this.singletonInstances.get(token.key);
      }

      const instance = provider.useFactory(this);
      
      // Cache singleton instance
      if (provider.singleton) {
        this.singletonInstances.set(token.key, instance);
      }
      
      return instance;
    }

    throw new Error(
      `Invalid provider configuration for token: ${token.name || token.key.toString()}`
    );
  }

  unregister(token: InjectionToken<any>): void {
    this.providers.delete(token.key);
    this.singletonInstances.delete(token.key);
  }

  has(token: InjectionToken<any>): boolean {
    return this.providers.has(token.key);
  }

  clear(): void {
    this.providers.clear();
    this.singletonInstances.clear();
  }
}

// Default container singleton
export const container = new Container();

// Predefined tokens for common services
export const ApiClientToken = createToken<ApiClient>('ApiClient');
export const AuthServiceToken = createToken<AuthService>('AuthService');
export const StorageServiceToken = createToken<StorageService>('StorageService');
export const WebSocketServiceToken = createToken<WebSocketService>('WebSocketService');
export const AnalyticsServiceToken = createToken<AnalyticsService>('AnalyticsService');
export const NotificationServiceToken = createToken<NotificationService>('NotificationService');

// Generic service interfaces (implementations defined in services layer)
export interface ApiClient {
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResult<T>>;
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResult<T>>;
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResult<T>>;
  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResult<T>>;
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResult<T>>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface AuthService {
  getCurrentUser(): User | null;
  login(credentials: LoginCredentials): Promise<ApiResult<User>>;
  logout(): Promise<void>;
  refreshToken(): Promise<ApiResult<string>>;
  isAuthenticated(): boolean;
  hasRole(role: string): boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StorageService {
  get<T = any>(key: string): T | null;
  set<T = any>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
}

export interface WebSocketService {
  connect(url: string): Promise<void>;
  disconnect(): void;
  send(message: any): void;
  subscribe<T = any>(event: string, handler: (data: T) => void): () => void;
  isConnected(): boolean;
}

export interface AnalyticsService {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
  page(name?: string, properties?: Record<string, any>): void;
}

export interface NotificationService {
  show(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void;
  showSuccess(message: string): void;
  showError(message: string): void;
  showWarning(message: string): void;
  clear(): void;
}

// Convenience functions for default container
export function registerService<T>(
  token: InjectionToken<T>, 
  provider: ServiceProvider<T>
): void {
  container.register(token, provider);
}

export function resolveService<T>(token: InjectionToken<T>): T {
  return container.resolve(token);
}

export function hasService(token: InjectionToken<any>): boolean {
  return container.has(token);
}

export function unregisterService(token: InjectionToken<any>): void {
  container.unregister(token);
}

// Factory helpers for common registration patterns
export function singleton<T>(factory: (container: Container) => T): ServiceProvider<T> {
  return { useFactory: factory, singleton: true };
}

export function factory<T>(factory: (container: Container) => T): ServiceProvider<T> {
  return { useFactory: factory, singleton: false };
}

export function value<T>(instance: T): ServiceProvider<T> {
  return { useValue: instance };
}

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/contracts)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure DI container
- [x] Reads config from `@/app/config` (N/A for DI container)
- [x] Exports default named component (exports Container class and utilities)
- [x] Adds basic ARIA and keyboard handlers (N/A for DI container)
*/
