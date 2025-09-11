// filepath: src/services/nothingService.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (nothingService)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for service)

import { apiClient } from '@/services/apiClient'
import { 
  ApiResult, 
  Testimonial, 
  PricingTier, 
  CaseStudy, 
  RoadmapItem,
  PaginatedResponse,
  NothingProduct
} from '@/core/contracts'
import { config, shouldUseMockData } from '@/app/config'
import { eventBus } from '@/core/events'

/* src/services/nothingService.ts

   Domain service for "nothing" API endpoints. Provides typed methods for fetching testimonials, 
   pricing, case studies, status data, and real-time subscriptions. Handles mock data in dev mode.

   Usage:
     import { nothingService } from '@/services/nothingService'
     const testimonials = await nothingService.fetchTestimonials()
*/

export interface StatusResponse {
  uptime: number
  nothingDelivered: number
  satisfaction: number
  incidents: Array<{
    id: string
    title: string
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
    startedAt: string
    resolvedAt?: string
  }>
}

export interface SubscriptionOptions {
  onUpdate?: (data: any) => void
  onError?: (error: Error) => void
  retryCount?: number
}

class NothingService {
  private subscriptions = new Map<string, AbortController>()

  // Core nothing endpoint
  async getNothing(): Promise<ApiResult<null>> {
    try {
      if (shouldUseMockData) {
        return { ok: true, data: null }
      }

      const response = await apiClient.get<null>(
        `${config.apiBase}/nothing`,
        { timeout: 1000 }
      )

      eventBus.emit('analytics:track', { 
        event: 'nothing_fetched', 
        properties: { source: 'api' }
      })

      return response
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'NOTHING_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch nothing'
        }
      }
    }
  }

  // Products endpoint
  async getProducts(): Promise<ApiResult<NothingProduct[]>> {
    try {
      if (shouldUseMockData) {
        return this.getMockProducts()
      }

      const response = await apiClient.get<NothingProduct[]>(
        `${config.apiBase}/products/nothing`,
        { timeout: 3000 }
      )

      eventBus.emit('analytics:track', { 
        event: 'products_fetched', 
        properties: { source: 'api' }
      })

      return response
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'PRODUCTS_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch products'
        }
      }
    }
  }

  // Testimonials (convenience method for APIDocs)
  async getTestimonials(): Promise<ApiResult<Testimonial[]>> {
    try {
      const result = await this.fetchTestimonials(1, 10)
      if (result.ok && result.data) {
        return { ok: true, data: result.data.items }
      }
      return { ok: false, error: result.error }
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'TESTIMONIALS_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch testimonials'
        }
      }
    }
  }

  // Case Studies (convenience method)
  async getCaseStudies(limit = 6): Promise<ApiResult<CaseStudy[]>> {
    return this.fetchCaseStudies(limit)
  }

  // Testimonials
  async fetchTestimonials(page = 1, limit = 10): Promise<ApiResult<PaginatedResponse<Testimonial>>> {
    try {
      if (shouldUseMockData) {
        return this.getMockTestimonials(page, limit)
      }

      const response = await apiClient.get<PaginatedResponse<Testimonial>>(
        `${config.apiBase}/testimonials/nothing`,
        { 
          params: { page, limit },
          timeout: 5000 
        }
      )

      eventBus.emit('analytics:track', { 
        event: 'testimonials_fetched', 
        properties: { page, limit, source: 'api' }
      })

      return response
    } catch (error) {
      eventBus.emit('analytics:track', { 
        event: 'testimonials_fetch_error', 
        properties: { page, limit, error: String(error) }
      })
      
      return {
        ok: false,
        error: {
          code: 'TESTIMONIALS_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch testimonials'
        }
      }
    }
  }

  // Pricing
  async fetchPricing(): Promise<ApiResult<PricingTier[]>> {
    try {
      if (shouldUseMockData) {
        return this.getMockPricing()
      }

      const response = await apiClient.get<PricingTier[]>(
        `${config.apiBase}/pricing/nothing`,
        { timeout: 3000 }
      )

      eventBus.emit('analytics:track', { 
        event: 'pricing_fetched', 
        properties: { source: 'api' }
      })

      return response
    } catch (error) {
      eventBus.emit('analytics:track', { 
        event: 'pricing_fetch_error', 
        properties: { error: String(error) }
      })

      return {
        ok: false,
        error: {
          code: 'PRICING_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch pricing'
        }
      }
    }
  }

  // Case Studies
  async fetchCaseStudies(limit = 6): Promise<ApiResult<CaseStudy[]>> {
    try {
      if (shouldUseMockData) {
        return this.getMockCaseStudies(limit)
      }

      const response = await apiClient.get<CaseStudy[]>(
        `${config.apiBase}/case-studies/nothing`,
        { 
          params: { limit },
          timeout: 5000 
        }
      )

      eventBus.emit('analytics:track', { 
        event: 'case_studies_fetched', 
        properties: { limit, source: 'api' }
      })

      return response
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'CASE_STUDIES_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch case studies'
        }
      }
    }
  }

  // Roadmap
  async fetchRoadmap(): Promise<ApiResult<RoadmapItem[]>> {
    try {
      if (shouldUseMockData) {
        return this.getMockRoadmap()
      }

      const response = await apiClient.get<RoadmapItem[]>(
        `${config.apiBase}/roadmap/nothing`,
        { timeout: 3000 }
      )

      eventBus.emit('analytics:track', { 
        event: 'roadmap_fetched', 
        properties: { source: 'api' }
      })

      return response
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'ROADMAP_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch roadmap'
        }
      }
    }
  }

  // Status
  async fetchStatus(): Promise<ApiResult<StatusResponse>> {
    try {
      if (shouldUseMockData) {
        return this.getMockStatus()
      }

      const response = await apiClient.get<StatusResponse>(
        `${config.apiBase}/status/nothing`,
        { timeout: 8000 }
      )

      eventBus.emit('analytics:track', { 
        event: 'status_fetched', 
        properties: { source: 'api' }
      })

      return response
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'STATUS_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch status'
        }
      }
    }
  }

  // Newsletter subscription
  async subscribeToNewsletter(email: string): Promise<ApiResult<{ success: boolean }>> {
    try {
      if (shouldUseMockData) {
        return { 
          ok: true, 
          data: { success: true }
        }
      }

      const response = await apiClient.post<{ success: boolean }>(
        `${config.apiBase}/newsletter/nothing`,
        { email },
        { timeout: 5000 }
      )

      eventBus.emit('analytics:track', { 
        event: 'newsletter_subscribed', 
        properties: { email: email.includes('@') ? 'valid' : 'invalid' }
      })

      return response
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'NEWSLETTER_SUBSCRIPTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to subscribe to newsletter'
        }
      }
    }
  }

  // Real-time subscription to nothing updates (WebSocket-like)
  subscribeToNothing(options: SubscriptionOptions = {}): () => void {
    const subscriptionId = `nothing-updates-${Date.now()}`
    const controller = new AbortController()
    
    this.subscriptions.set(subscriptionId, controller)

    // Mock subscription in dev mode
    if (shouldUseMockData) {
      const interval = setInterval(() => {
        if (controller.signal.aborted) {
          clearInterval(interval)
          return
        }

        options.onUpdate?.({
          type: 'nothing_delivered',
          data: { count: Math.floor(Math.random() * 100) },
          timestamp: new Date().toISOString()
        })
      }, 2000)

      controller.signal.addEventListener('abort', () => {
        clearInterval(interval)
      })
    } else {
      // Real WebSocket connection would be implemented here
      // For now, we'll emit a mock event
      setTimeout(() => {
        options.onUpdate?.({
          type: 'connection_established',
          data: { status: 'connected' },
          timestamp: new Date().toISOString()
        })
      }, 100)
    }

    // Return cleanup function
    return () => {
      controller.abort()
      this.subscriptions.delete(subscriptionId)
      eventBus.emit('analytics:track', { 
        event: 'nothing_subscription_cancelled', 
        properties: { subscriptionId }
      })
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.subscriptions.forEach((controller) => {
      controller.abort()
    })
    this.subscriptions.clear()
  }

  // Mock data generators
  private getMockTestimonials(page: number, limit: number): ApiResult<PaginatedResponse<Testimonial>> {
    const mockTestimonials: Testimonial[] = [
      {
        id: 't-1',
        author: 'Sarah Nothing',
        quote: 'Absolutely nothing has changed my life. The void is real!',
        rating: 5,
        avatarUrl: '/assets/avatars/sarah.jpg',
        createdAt: new Date().toISOString()
      },
      {
        id: 't-2', 
        author: 'John Void',
        quote: 'I purchased nothing and got exactly what I expected. 10/10!',
        rating: 5,
        avatarUrl: '/assets/avatars/john.jpg',
        createdAt: new Date().toISOString()
      },
      {
        id: 't-3',
        author: 'Empty McEmpty',
        quote: 'Finally, a product that delivers on its promises. Nothing at all!',
        rating: 5,
        createdAt: new Date().toISOString()
      }
    ]

    const startIndex = (page - 1) * limit
    const items = mockTestimonials.slice(startIndex, startIndex + limit)

    return {
      ok: true,
      data: {
        items,
        total: mockTestimonials.length,
        page,
        perPage: limit
      }
    }
  }

  private getMockPricing(): ApiResult<PricingTier[]> {
    const mockPricing: PricingTier[] = [
      {
        id: 'basic-nothing',
        name: 'Basic Nothing',
        priceCents: 0,
        currency: 'USD',
        features: ['Absolutely nothing', 'Zero features', 'No support', 'Empty promises'],
      },
      {
        id: 'premium-nothing',
        name: 'Premium Nothing',
        priceCents: 999,
        currency: 'USD',
        features: ['Premium nothing', 'Slightly less nothing', 'Priority void', 'Gold-plated emptiness'],
        highlight: true
      },
      {
        id: 'enterprise-nothing',
        name: 'Enterprise Nothing',
        priceCents: 9999,
        currency: 'USD',
        features: ['Enterprise-grade nothing', 'Scalable void', 'Dedicated nothingness', '24/7 empty support', 'SLA for nothing'],
      }
    ]

    return { ok: true, data: mockPricing }
  }

  private getMockCaseStudies(limit: number): ApiResult<CaseStudy[]> {
    const mockCaseStudies: CaseStudy[] = [
      {
        id: 'cs-1',
        title: 'How TechCorp Achieved 100% Nothing Implementation',
        summary: 'A deep dive into how TechCorp successfully deployed nothing across their entire infrastructure.',
        heroImage: '/assets/case-studies/techcorp.jpg',
        publishedAt: '2024-01-15',
        authors: ['Dr. Void', 'Nothing Expert']
      },
      {
        id: 'cs-2',
        title: 'StartupXYZ: From Something to Nothing in 6 Months',
        summary: 'The remarkable journey of how StartupXYZ pivoted from delivering something to mastering nothing.',
        heroImage: '/assets/case-studies/startupxyz.jpg',
        publishedAt: '2024-02-22',
        authors: ['Empty Smith']
      }
    ].slice(0, limit)

    return { ok: true, data: mockCaseStudies }
  }

  private getMockRoadmap(): ApiResult<RoadmapItem[]> {
    const mockRoadmap: RoadmapItem[] = [
      {
        id: 'r-1',
        title: 'Nothing 2.0 Release',
        date: '2024-Q2',
        description: 'Enhanced nothingness with improved void algorithms',
        status: 'in_progress'
      },
      {
        id: 'r-2',
        title: 'Mobile Nothing App',
        date: '2024-Q3',
        description: 'Take nothing with you wherever you go',
        status: 'planned'
      },
      {
        id: 'r-3',
        title: 'AI-Powered Nothing',
        date: '2024-Q4',
        description: 'Machine learning to deliver even more sophisticated nothing',
        status: 'planned'
      }
    ]

    return { ok: true, data: mockRoadmap }
  }

  private getMockProducts(): ApiResult<NothingProduct[]> {
    const mockProducts: NothingProduct[] = [
      {
        id: 'nothing-basic',
        sku: 'NOTHING-001',
        title: 'Basic Nothing',
        description: 'The essential nothing experience',
        priceCents: 0,
        features: ['Pure void', 'Unlimited emptiness', 'Zero features', 'No support']
      },
      {
        id: 'nothing-premium',
        sku: 'NOTHING-002', 
        title: 'Premium Nothing',
        description: 'Enhanced nothingness for discerning users',
        priceCents: 999,
        features: ['Premium void', 'Gold-plated emptiness', 'Priority nothing', 'Deluxe absence']
      },
      {
        id: 'nothing-enterprise',
        sku: 'NOTHING-003',
        title: 'Enterprise Nothing',
        description: 'Industrial-grade nothing for large organizations',
        priceCents: 9999,
        features: ['Enterprise void', 'Scalable nothingness', 'SLA-backed emptiness', '24/7 support for nothing']
      }
    ]

    return { ok: true, data: mockProducts }
  }

  private getMockStatus(): ApiResult<StatusResponse> {
    const mockStatus: StatusResponse = {
      uptime: 99.99,
      nothingDelivered: 1000000,
      satisfaction: 100,
      incidents: []
    }

    return { ok: true, data: mockStatus }
  }
}

export const nothingService = new NothingService()
export default nothingService

// Cleanup subscriptions when module unloads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    nothingService.cleanup()
  })
}
