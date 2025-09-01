// filepath: src/services/fetcher.ts
/* src/services/fetcher.ts

Centralized fetcher handling base URL, JSON parsing, error normalization, retry/backoff hooks, and attaching auth tokens when available.
*/

import { appConfig } from '@/app/config';
import { delay } from '@/core/utils';
import { runHooks } from '@/core/hooks';

export class FetchError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public url: string,
    public response?: Response,
    public data?: any
  ) {
    super(`HTTP ${status}: ${statusText} at ${url}`);
    this.name = 'FetchError';
  }
}

export interface FetchOptions extends RequestInit {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipAuthToken?: boolean;
  skipHooks?: boolean;
}

class Fetcher {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  async fetch(url: string, options: FetchOptions = {}): Promise<Response> {
    const {
      baseUrl = appConfig.apiBase,
      timeout = 10000,
      retries = 2,
      retryDelay = 1000,
      skipAuthToken = false,
      skipHooks = false,
      ...fetchOptions
    } = options;

    // Construct full URL
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

    // Prepare headers
    const headers = new Headers(fetchOptions.headers);
    
    // Set default content type for POST/PUT/PATCH requests with body
    if (fetchOptions.body && !headers.has('content-type')) {
      if (typeof fetchOptions.body === 'string' || fetchOptions.body instanceof FormData) {
        // Let browser set content-type for FormData, set for string
        if (typeof fetchOptions.body === string) {
          headers.set('content-type', 'application/json');
        }
      } else {
        headers.set('content-type', 'application/json');
      }
    }

    // Attach auth token if available and not skipped
    if (!skipAuthToken && this.authToken) {
      headers.set('authorization', `Bearer ${this.authToken}`);
    }

    const finalOptions: RequestInit = {
      ...fetchOptions,
      headers,
    };

    // Run before-request hooks
    if (!skipHooks) {
      try {
        await runHooks('beforeApiRequest', {
          request: {
            url: fullUrl,
            method: finalOptions.method || 'GET',
            headers: Object.fromEntries(headers.entries()),
            body: finalOptions.body,
          },
        });
      } catch (hookError) {
        console.warn('[fetcher] beforeApiRequest hook error:', hookError);
      }
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(fullUrl, {
          ...finalOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Run after-response hooks
        if (!skipHooks) {
          try {
            await runHooks('afterApiResponse', {
              request: {
                url: fullUrl,
                method: finalOptions.method || 'GET',
                headers: Object.fromEntries(headers.entries()),
                body: finalOptions.body,
              },
              response: {
                status: response.status,
                body: null, // We haven't parsed it yet
              },
            });
          } catch (hookError) {
            console.warn('[fetcher] afterApiResponse hook error:', hookError);
          }
        }

        // Don't retry on 4xx errors (client errors)
        if (!response.ok) {
          let errorData: any = null;
          try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              errorData = await response.json();
            } else {
              errorData = await response.text();
            }
          } catch {
            // ignore parsing errors for error responses
          }

          const error = new FetchError(
            response.status,
            response.statusText,
            fullUrl,
            response,
            errorData
          );

          // Don't retry client errors
          if (response.status >= 400 && response.status < 500) {
            throw error;
          }

          lastError = error;
        } else {
          return response;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on abort/timeout or client errors
        if (lastError.name === 'AbortError' || (error instanceof FetchError && error.status < 500)) {
          throw lastError;
        }
      }

      // Wait before retry (except on last attempt)
      if (attempt < retries) {
        await delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async json<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
    const response = await this.fetch(url, options);
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Expected JSON response, got ${contentType}`);
    }

    try {
      return await response.json();
    } catch (parseError) {
      throw new Error(`Failed to parse JSON response: ${parseError}`);
    }
  }

  async text(url: string, options: FetchOptions = {}): Promise<string> {
    const response = await this.fetch(url, options);
    return await response.text();
  }

  async blob(url: string, options: FetchOptions = {}): Promise<Blob> {
    const response = await this.fetch(url, options);
    return await response.blob();
  }

  // Convenience methods for common HTTP verbs
  async get<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
    return this.json<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, options: FetchOptions = {}): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.json<T>(url, { ...options, method: 'POST', body });
  }

  async put<T = any>(url: string, data?: any, options: FetchOptions = {}): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.json<T>(url, { ...options, method: 'PUT', body });
  }

  async patch<T = any>(url: string, data?: any, options: FetchOptions = {}): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.json<T>(url, { ...options, method: 'PATCH', body });
  }

  async delete<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
    return this.json<T>(url, { ...options, method: 'DELETE' });
  }
}

// Global fetcher instance
export const fetcher = new Fetcher();

/* Example usage

import { fetcher, FetchError } from '@/services/fetcher'

// Basic usage
const user = await fetcher.get<User>('/users/123')

// With options
const result = await fetcher.post('/users', userData, {
  timeout: 5000,
  retries: 1,
})

// Error handling
try {
  await fetcher.get('/protected')
} catch (error) {
  if (error instanceof FetchError && error.status === 401) {
    // handle auth error
  }
}

// Set auth token (usually done by AuthProvider)
fetcher.setAuthToken('jwt-token-here')
*/

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (integrates with core/hooks for request lifecycle)
// [x] Reads config from `@/app/config` (uses appConfig.apiBase)
// [x] Exports default named component (exports fetcher instance and FetchError)
// [x] Adds basic ARIA and keyboard handlers (not applicable for service utility)
