// filepath: src/services/checkout.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (checkoutService)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for service)

import { ApiResult, NothingProduct, User } from '@/core/contracts'
import { config, shouldUseMockData } from '@/app/config'
import { eventBus } from '@/core/events'
import { apiClient } from '@/services/apiClient'
import { analytics } from '@/services/analytics'

/* src/services/checkout.ts

   Checkout service for creating mock checkout sessions for purchasing levels of nothing.
   Integrates with analytics for tracking and apiClient for backend communication.

   Usage:
     import { checkoutService } from '@/services/checkout'
     const session = await checkoutService.createCheckoutSession({ productId: 'basic-nothing' })
*/

// Checkout session request/response types
export interface CheckoutSessionRequest {
  productId: string
  userId?: string
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, string>
  promoCode?: string
}

export interface CheckoutSession {
  id: string
  url: string
  productId: string
  userId?: string
  amountCents: number
  currency: string
  status: 'pending' | 'completed' | 'expired' | 'cancelled'
  expiresAt: string
  createdAt: string
  metadata?: Record<string, string>
}

export interface PaymentIntent {
  id: string
  sessionId: string
  status: 'requires_payment' | 'processing' | 'succeeded' | 'failed'
  clientSecret?: string
  lastError?: string
}

export interface CheckoutAnalyticsData {
  productId: string
  amountCents: number
  currency: string
  promoCode?: string
  source: string
}

// Mock checkout URLs for development
const MOCK_CHECKOUT_URLS = {
  basic: '/mock/checkout/basic-nothing',
  premium: '/mock/checkout/premium-nothing', 
  enterprise: '/mock/checkout/enterprise-nothing',
  void: '/mock/checkout/ultimate-void'
}

// Simulated payment processing delays
const MOCK_PROCESSING_DELAYS = {
  create: 800,
  confirm: 1200,
  cancel: 400
}

export class CheckoutService {
  private readonly baseUrl: string
  private sessionCache = new Map<string, CheckoutSession>()

  constructor() {
    this.baseUrl = config.apiBase
  }

  /**
   * Create a checkout session for purchasing nothing
   */
  async createCheckoutSession(request: CheckoutSessionRequest): Promise<ApiResult<CheckoutSession>> {
    try {
      // Track checkout initiation
      analytics.track('checkout_initiated', {
        product_id: request.productId,
        user_id: request.userId,
        has_promo: !!request.promoCode
      })

      eventBus.emit('checkout:session_creating', { productId: request.productId })

      let result: ApiResult<CheckoutSession>

      if (shouldUseMockData) {
        result = await this.createMockSession(request)
      } else {
        result = await apiClient.post<CheckoutSession>('/checkout/sessions', request)
      }

      if (result.ok && result.data) {
        // Cache successful session
        this.sessionCache.set(result.data.id, result.data)
        
        // Track successful session creation
        analytics.track('checkout_session_created', {
          session_id: result.data.id,
          product_id: result.data.productId,
          amount_cents: result.data.amountCents
        })

        eventBus.emit('checkout:session_created', result.data)
      } else {
        analytics.track('checkout_session_failed', {
          product_id: request.productId,
          error: result.error?.message || 'Unknown error'
        })

        eventBus.emit('checkout:session_error', { 
          productId: request.productId, 
          error: result.error 
        })
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout session creation failed'
      
      analytics.track('checkout_session_error', {
        product_id: request.productId,
        error: errorMessage
      })

      return {
        ok: false,
        error: {
          code: 'CHECKOUT_ERROR',
          message: errorMessage
        }
      }
    }
  }

  /**
   * Retrieve checkout session by ID
   */
  async getCheckoutSession(sessionId: string): Promise<ApiResult<CheckoutSession>> {
    try {
      // Check cache first
      const cached = this.sessionCache.get(sessionId)
      if (cached) {
        return { ok: true, data: cached }
      }

      let result: ApiResult<CheckoutSession>

      if (shouldUseMockData) {
        result = await this.getMockSession(sessionId)
      } else {
        result = await apiClient.get<CheckoutSession>(`/checkout/sessions/${sessionId}`)
      }

      if (result.ok && result.data) {
        // Update cache
        this.sessionCache.set(sessionId, result.data)
      }

      return result
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'SESSION_FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch session'
        }
      }
    }
  }

  /**
   * Cancel an existing checkout session
   */
  async cancelCheckoutSession(sessionId: string): Promise<ApiResult<void>> {
    try {
      eventBus.emit('checkout:session_cancelling', { sessionId })

      let result: ApiResult<void>

      if (shouldUseMockData) {
        result = await this.cancelMockSession(sessionId)
      } else {
        result = await apiClient.post<void>(`/checkout/sessions/${sessionId}/cancel`)
      }

      if (result.ok) {
        // Update cache
        const cached = this.sessionCache.get(sessionId)
        if (cached) {
          cached.status = 'cancelled'
          this.sessionCache.set(sessionId, cached)
        }

        analytics.track('checkout_cancelled', { session_id: sessionId })
        eventBus.emit('checkout:session_cancelled', { sessionId })
      }

      return result
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'CANCEL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to cancel session'
        }
      }
    }
  }

  /**
   * Validate promo code
   */
  async validatePromoCode(code: string, productId: string): Promise<ApiResult<{ valid: boolean; discountPercent?: number }>> {
    try {
      if (shouldUseMockData) {
        return this.validateMockPromoCode(code, productId)
      }

      return await apiClient.post<{ valid: boolean; discountPercent?: number }>('/checkout/promo/validate', {
        code,
        productId
      })
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'PROMO_VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to validate promo code'
        }
      }
    }
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<ApiResult<string[]>> {
    if (shouldUseMockData) {
      return {
        ok: true,
        data: ['void_card', 'nothing_pay', 'empty_wallet', 'zero_bitcoin']
      }
    }

    try {
      return await apiClient.get<string[]>('/checkout/payment-methods')
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'PAYMENT_METHODS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch payment methods'
        }
      }
    }
  }

  // Private mock implementation methods
  private async createMockSession(request: CheckoutSessionRequest): Promise<ApiResult<CheckoutSession>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, MOCK_PROCESSING_DELAYS.create))

    // Mock product pricing
    const mockPricing: Record<string, number> = {
      'basic-nothing': 0,
      'premium-nothing': 999,
      'enterprise-nothing': 9999,
      'ultimate-void': 99999
    }

    const sessionId = `mock_cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mockUrl = MOCK_CHECKOUT_URLS[request.productId as keyof typeof MOCK_CHECKOUT_URLS] || '/mock/checkout/default'

    const session: CheckoutSession = {
      id: sessionId,
      url: `${window.location.origin}${mockUrl}?session_id=${sessionId}`,
      productId: request.productId,
      userId: request.userId,
      amountCents: mockPricing[request.productId] || 0,
      currency: 'USD',
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString(),
      metadata: request.metadata
    }

    return { ok: true, data: session }
  }

  private async getMockSession(sessionId: string): Promise<ApiResult<CheckoutSession>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const cached = this.sessionCache.get(sessionId)
    if (cached) {
      return { ok: true, data: cached }
    }

    return {
      ok: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found'
      }
    }
  }

  private async cancelMockSession(sessionId: string): Promise<ApiResult<void>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, MOCK_PROCESSING_DELAYS.cancel))

    const cached = this.sessionCache.get(sessionId)
    if (!cached) {
      return {
        ok: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      }
    }

    if (cached.status !== 'pending') {
      return {
        ok: false,
        error: {
          code: 'INVALID_SESSION_STATE',
          message: 'Can only cancel pending sessions'
        }
      }
    }

    return { ok: true }
  }

  private validateMockPromoCode(code: string, productId: string): ApiResult<{ valid: boolean; discountPercent?: number }> {
    const mockPromoCodes: Record<string, number> = {
      'NOTHING50': 50,
      'VOID25': 25,
      'EMPTY10': 10,
      'ZERO100': 100
    }

    const discountPercent = mockPromoCodes[code.toUpperCase()]
    
    return {
      ok: true,
      data: {
        valid: !!discountPercent,
        discountPercent
      }
    }
  }

  // Utility methods
  clearCache(): void {
    this.sessionCache.clear()
    eventBus.emit('checkout:cache_cleared', {})
  }

  getCachedSession(sessionId: string): CheckoutSession | undefined {
    return this.sessionCache.get(sessionId)
  }

  getCacheSize(): number {
    return this.sessionCache.size
  }
}

// Export singleton instance
export const checkoutService = new CheckoutService()

// Convenience functions
export const createCheckoutSession = (request: CheckoutSessionRequest) => 
  checkoutService.createCheckoutSession(request)

export const getCheckoutSession = (sessionId: string) => 
  checkoutService.getCheckoutSession(sessionId)

export const cancelCheckoutSession = (sessionId: string) => 
  checkoutService.cancelCheckoutSession(sessionId)

export const validatePromoCode = (code: string, productId: string) => 
  checkoutService.validatePromoCode(code, productId)

// Default export
export default checkoutService

// Development helpers
if (config.isDevelopment) {
  // Expose checkout service for debugging
  ;(window as any).__checkoutService = checkoutService
}
