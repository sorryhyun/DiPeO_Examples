import { User, AuthToken } from '@/core/contracts';

// Generic token helper for type-safe DI
export interface Token<T> {
  readonly __token: unique symbol;
  readonly name: string;
}

export function createToken<T>(name: string): Token<T> {
  return {
    __token: Symbol(name) as unknown as unique symbol,
    name
  };
}

// Predefined service tokens with typed interfaces
export const ApiClientToken = createToken<{
  request<T>(opts: {
    url: string;
    method?: string;
    data?: any;
    headers?: Record<string, string>;
  }): Promise<T>;
}>('ApiClient');

export const AuthServiceToken = createToken<{
  login(email: string, password: string): Promise<{ user: User; token: AuthToken }>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
}>('AuthService');

export const StorageServiceToken = createToken<{
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}>('StorageService');

export const WebSocketServiceToken = createToken<{
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(event: any): void;
  on(eventName: string, cb: (payload: any) => void): void;
  off(eventName: string, cb: (payload: any) => void): void;
}>('WebSocketService');

export const LoggerToken = createToken<{
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}>('Logger');

// Dependency injection container class
class Container {
  private services = new Map<Token<any>, any>();

  register<T>(token: Token<T>, impl: T): void {
    this.services.set(token, impl);
  }

  resolve<T>(token: Token<T>): T {
    const impl = this.services.get(token);
    
    if (impl === undefined) {
      const registeredTokens = Array.from(this.services.keys())
        .map(t => t.name)
        .join(', ');
      
      throw new Error(
        `Service '${token.name}' not found in container. ` +
        `Registered services: [${registeredTokens}]. ` +
        `Make sure to register the service before resolving it.`
      );
    }
    
    return impl;
  }

  override<T>(token: Token<T>, impl: T): void {
    this.services.set(token, impl);
  }

  has<T>(token: Token<T>): boolean {
    return this.services.has(token);
  }

  reset(): void {
    this.services.clear();
  }
}

// Default container instance
export const di = new Container();
