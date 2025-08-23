import { http, delay } from 'msw'
import { mockTestimonials } from './data/mockTestimonials'
import { mockPricing } from '../mock/data/mockPricing'
import { mockTeam } from './data/mockTeam'
import { mockCaseStudies } from './data/mockCaseStudies'

export const handlers = [
  // Nothing API - returns void essence data
  http.get('/api/nothing', async () => {
    await delay(300)
    return Response.json({
      id: 'nothing-001',
      name: 'Premium Nothing™',
      description: 'The highest quality nothing money can buy',
      properties: {
        emptiness: 99.9,
        void: true,
        substance: null,
        weight: 0,
        color: 'transparent',
        dimensions: '0x0x0'
      },
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0',
        certification: 'ISO-9001 Certified Nothing'
      }
    })
  }),

  // Testimonials API
  http.get('/api/testimonials/nothing', async () => {
    await delay(250)
    return Response.json({
      testimonials: mockTestimonials,
      total: mockTestimonials.length,
      page: 1,
      limit: 50
    })
  }),

  // Pricing API
  http.get('/api/pricing/nothing', async () => {
    await delay(200)
    return Response.json({
      plans: mockPricing,
      currency: 'USD',
      updated: new Date().toISOString()
    })
  }),

  // Support API
  http.post('/api/support/nothing', async () => {
    await delay(500)
    return Response.json({
      id: `ticket-${Date.now()}`,
      status: 'received',
      message: 'Your support request about nothing has been received. Our void specialists will respond with nothing shortly.',
      estimatedResponse: '24 hours',
      priority: 'normal'
    })
  }),

  // Newsletter API
  http.post('/api/newsletter/nothing', async () => {
    await delay(400)
    return Response.json({
      success: true,
      message: 'Successfully subscribed to absolutely nothing!',
      subscriberId: `sub-${Date.now()}`,
      nextEmail: 'never'
    })
  }),

  // Analytics API
  http.post('/api/analytics/nothing', async () => {
    await delay(100)
    return Response.json({
      tracked: true,
      event: 'nothing_interaction',
      timestamp: new Date().toISOString()
    })
  }),

  // Checkout API
  http.post('/api/checkout/nothing', async ({ request }: { request: Request }) => {
    const body = await request.json().catch(() => ({})) as any
    
    await delay(800)
    return Response.json({
      sessionId: `checkout-${Date.now()}`,
      status: 'pending',
      amount: body?.amount || 0,
      currency: 'USD',
      product: 'Premium Nothing™',
      paymentUrl: '#',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      message: 'Preparing to charge you for absolutely nothing...'
    })
  }),

  // Team API
  http.get('/api/team/nothing', async () => {
    await delay(350)
    return Response.json({
      team: mockTeam,
      department: 'Nothing Development',
      total: mockTeam.length
    })
  }),

  // Case Studies API
  http.get('/api/case-studies/nothing', async () => {
    await delay(300)
    return Response.json({
      studies: mockCaseStudies,
      total: mockCaseStudies.length,
      featured: mockCaseStudies.filter(study => study.featured)
    })
  }),

  // Status API
  http.get('/api/status/nothing', async () => {
    await delay(150)
    return Response.json({
      status: 'operational',
      services: {
        nothing: 'operational',
        void: 'operational',
        emptiness: 'operational',
        absence: 'degraded'
      },
      uptime: 99.9,
      lastIncident: null,
      message: 'All nothing systems are functioning perfectly'
    })
  })
]
