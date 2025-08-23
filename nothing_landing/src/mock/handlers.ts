import { rest } from 'msw'
import { mockTestimonials } from './data/mockTestimonials'
import { mockPricing } from './data/mockPricing'
import { mockTeam } from './data/mockTeam'
import { mockCaseStudies } from './data/mockCaseStudies'

export const handlers = [
  // Nothing API - returns void essence data
  rest.get('/api/nothing', (req, res, ctx) => {
    return res(
      ctx.delay(300),
      ctx.status(200),
      ctx.json({
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
    )
  }),

  // Testimonials API
  rest.get('/api/testimonials/nothing', (req, res, ctx) => {
    return res(
      ctx.delay(250),
      ctx.status(200),
      ctx.json({
        testimonials: mockTestimonials,
        total: mockTestimonials.length,
        page: 1,
        limit: 50
      })
    )
  }),

  // Pricing API
  rest.get('/api/pricing/nothing', (req, res, ctx) => {
    return res(
      ctx.delay(200),
      ctx.status(200),
      ctx.json({
        plans: mockPricing,
        currency: 'USD',
        updated: new Date().toISOString()
      })
    )
  }),

  // Support API
  rest.post('/api/support/nothing', (req, res, ctx) => {
    return res(
      ctx.delay(500),
      ctx.status(200),
      ctx.json({
        id: `ticket-${Date.now()}`,
        status: 'received',
        message: 'Your support request about nothing has been received. Our void specialists will respond with nothing shortly.',
        estimatedResponse: '24 hours',
        priority: 'normal'
      })
    )
  }),

  // Newsletter API
  rest.post('/api/newsletter/nothing', (req, res, ctx) => {
    return res(
      ctx.delay(400),
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Successfully subscribed to absolutely nothing!',
        subscriberId: `sub-${Date.now()}`,
        nextEmail: 'never'
      })
    )
  }),

  // Analytics API
  rest.post('/api/analytics/nothing', (req, res, ctx) => {
    return res(
      ctx.delay(100),
      ctx.status(200),
      ctx.json({
        tracked: true,
        event: 'nothing_interaction',
        timestamp: new Date().toISOString()
      })
    )
  }),

  // Checkout API
  rest.post('/api/checkout/nothing', (req, res, ctx) => {
    const body = req.body as any
    
    return res(
      ctx.delay(800),
      ctx.status(200),
      ctx.json({
        sessionId: `checkout-${Date.now()}`,
        status: 'pending',
        amount: body?.amount || 0,
        currency: 'USD',
        product: 'Premium Nothing™',
        paymentUrl: '#',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        message: 'Preparing to charge you for absolutely nothing...'
      })
    )
  }),

  // Team API
  rest.get('/api/team/nothing', (req, res, ctx) => {
    return res(
      ctx.delay(350),
      ctx.status(200),
      ctx.json({
        team: mockTeam,
        department: 'Nothing Development',
        total: mockTeam.length
      })
    )
  }),

  // Case Studies API
  rest.get('/api/case-studies/nothing', (req, res, ctx) => {
    return res(
      ctx.delay(300),
      ctx.status(200),
      ctx.json({
        studies: mockCaseStudies,
        total: mockCaseStudies.length,
        featured: mockCaseStudies.filter(study => study.featured)
      })
    )
  }),

  // Status API
  rest.get('/api/status/nothing', (req, res, ctx) => {
    return res(
      ctx.delay(150),
      ctx.status(200),
      ctx.json({
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
    )
  })
]
