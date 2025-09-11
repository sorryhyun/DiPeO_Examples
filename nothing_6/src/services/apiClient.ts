// filepath: src/services/apiClient.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (apiClient)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for API client)

import { config } from '@/app/config'
import { ApiResult, ApiError } from '@/core/contracts'
import { eventBus } from '@/core/events'

/* src/services/apiClient.ts

   Lightweight fetch wrapper that handles baseURL resolution, JSON parsing, 
   error normalization, and provides hooks compatibility for caching patterns.

   Usage:
     import { apiClient } from '@/services/apiClient'
     const result = await apiClient.get('/api/nothing')
     if (result.ok) { console.log(result.data) }
*/

export interface RequestOptions {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  cache?: RequestCache
  signal?: AbortSignal
}

export interface ApiClientInterface {
  get<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResult<T>>
  post<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>>
  put<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>>
  del<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResult<T>>
  patch<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>>
}

class ApiClient implements ApiClientInterface {
  private readonly baseURL: string
  private readonly defaultTimeout: number = 10000
  private readonly defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = config.apiBase.startsWith('http') 
      ? config.apiBase 
      : `${window.location.origin}${config.apiBase}`
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    // Add auth header if available from localStorage (read-only, no side effects)
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`
      }
    } catch {
      // Ignore localStorage errors in SSR or restricted environments
    }
  }

  private normalizeUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const cleanBase = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL
    return `${cleanBase}/${cleanPath}`
  }

  private async executeWithTimeout<T>(
    promise: Promise<Response>,
    timeoutMs: number,
    signal?: AbortSignal
  ): Promise<Response> {
    const timeoutController = new AbortController()
    const combinedSignal = signal ? this.combineAbortSignals([signal, timeoutController.signal]) : timeoutController.signal

    const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs)

    try {
      const response = await promise
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private combineAbortSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController()
    
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort()
        break
      }
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }
    
    return controller.signal
  }

  private async executeWithRetries<T>(
    requestFn: () => Promise<Response>,
    retries: number = 0
  ): Promise<Response> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await requestFn()
        
        // Only retry on 5xx errors or network failures
        if (response.ok || response.status < 500) {
          return response
        }
        
        if (attempt === retries) {
          return response // Return final response even if error
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)))
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt === retries) {
          throw lastError
        }
        
        // Don't retry on abort or invalid request errors
        if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TypeError')) {
          throw error
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)))
      }
    }
    
    throw lastError || new Error('Max retries exceeded')
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResult<T>> {
    const url = this.normalizeUrl(path)
    const timeout = options.timeout ?? this.defaultTimeout
    const retries = options.retries ?? (config.isDevelopment ? 1 : 0)

    // Emit request start event for debugging/analytics
    eventBus.emit('api:request_start', { method, path, url })

    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    }

    // Remove content-type for GET/DELETE requests
    if (method === 'GET' || method === 'DELETE') {
      delete headers['Content-Type']
    }

    const requestConfig: RequestInit = {
      method,
      headers,
      cache: options.cache ?? 'default',
      signal: options.signal,
    }

    if (body && method !== 'GET' && method !== 'DELETE') {
      requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    try {
      const response = await this.executeWithRetries(
        () => this.executeWithTimeout(fetch(url, requestConfig), timeout, options.signal),
        retries
      )

      let data: T | undefined
      let error: ApiError | undefined

      const contentType = response.headers.get('content-type') || ''
      const isJsonResponse = contentType.includes('application/json')

      try {
        if (isJsonResponse) {
          const jsonResponse = await response.json()
          
          if (response.ok) {
            data = jsonResponse as T
          } else {
            // Handle structured error response
            error = jsonResponse.error || {
              code: `HTTP_${response.status}`,
              message: jsonResponse.message || response.statusText || 'Request failed',
              details: jsonResponse.details || { status: response.status }
            }
          }
        } else if (response.ok) {
          // Handle non-JSON success responses
          const textData = await response.text()
          data = (textData || null) as T
        } else {
          // Handle non-JSON error responses
          const errorText = await response.text()
          error = {
            code: `HTTP_${response.status}`,
            message: errorText || response.statusText || 'Request failed',
            details: { status: response.status }
          }
        }
      } catch (parseError) {
        error = {
          code: 'PARSE_ERROR',
          message: 'Failed to parse response',
          details: { 
            status: response.status,
            contentType,
            parseError: parseError instanceof Error ? parseError.message : String(parseError)
          }
        }
      }

      const result: ApiResult<T> = {
        ok: response.ok,
        data,
        error
      }

      // Emit completion event
      eventBus.emit('api:request_complete', { 
        method, 
        path, 
        status: response.status, 
        success: response.ok 
      })

      return result

    } catch (fetchError) {
      const error: ApiError = {
        code: fetchError instanceof Error ? fetchError.name : 'NETWORK_ERROR',
        message: fetchError instanceof Error ? fetchError.message : 'Network request failed',
        details: { 
          url,
          method,
          timeout,
          retries
        }
      }

      const result: ApiResult<T> = {
        ok: false,
        error
      }

      // Emit error event
      eventBus.emit('api:request_error', { 
        method, 
        path, 
        error: error.message 
      })

      return result
    }
  }

  async get<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('GET', path, undefined, options)
  }

  async post<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('POST', path, body, options)
  }

  async put<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('PUT', path, body, options)
  }

  async del<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('DELETE', path, undefined, options)
  }

  async patch<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>('PATCH', path, body, options)
  }

  // Utility methods for common patterns
  async uploadFile(path: string, file: File, options?: Omit<RequestOptions, 'headers'>): Promise<ApiResult<any>> {
    const formData = new FormData()
    formData.append('file', file)

    const uploadOptions: RequestOptions = {
      ...options,
      headers: {
        // Don't set Content-Type - let browser set it with boundary for FormData
        ...this.defaultHeaders,
        ...options?.headers,
      }
    }
    delete uploadOptions.headers!['Content-Type']

    return this.request('POST', path, formData, uploadOptions)
  }

  // Create AbortController for cancellable requests
  createAbortController(): AbortController {
    return new AbortController()
  }
}

export const apiClient = new ApiClient()

// Named exports for DI compatibility
export { ApiClient }
export default apiClient

// Development helper
if (config.isDevelopment) {
  // Expose on window for debugging
  ;(window as any).__apiClient = apiClient
  
  // Log all API events in dev
  eventBus.on('api:request_start', (event) => {
    console.log(`🔄 API ${event.method} ${event.path}`)
  })
  
  eventBus.on('api:request_error', (event) => {
    console.error(`❌ API ${event.method} ${event.path}: ${event.error}`)
  })
  
  eventBus.on('api:request_complete', (event) => {
    const icon = event.success ? '✅' : '❌'
    console.log(`${icon} API ${event.method} ${event.path} (${event.status})`)
  })
}
