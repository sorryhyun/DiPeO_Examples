import { DEFAULT_APP_CONFIG } from '@/constants/appConfig';
import type { 
  ApiResponse, 
  User, 
  Testimonial, 
  PricingTier, 
  SupportMessage, 
  NewsletterPayload, 
  AnalyticsEvent,
  NothingProduct 
} from '@/types/index';

// Track original fetch for restoration
let originalFetch: typeof window.fetch | null = null;
export let isMocking = false;

// Mock data for responses
const mockNothingProduct: NothingProduct = {
  id: 'nothing-ultimate',
  name: 'Absolutely Nothing™',
  description: 'The ultimate void experience. Zero features, infinite possibilities.',
  version: '∞.0.0',
  price: 0,
  features: []
};

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    author: 'Jane Void',
    role: 'Chief Nothing Officer',
    company: 'Void Corp',
    content: 'Nothing has transformed our business by providing exactly what we needed: absolutely nothing.',
    rating: 5,
    avatar: '/generated/avatar-placeholder.jpg'
  },
  {
    id: '2',
    author: 'John Empty',
    role: 'Emptiness Consultant',
    company: 'Blank Solutions',
    content: 'I was skeptical at first, but Nothing delivered exactly what was promised. Nothing.',
    rating: 5,
    avatar: '/generated/avatar-placeholder.jpg'
  },
  {
    id: '3',
    author: 'Sarah Zero',
    role: 'Minimalism Expert',
    company: 'Less Is More Ltd',
    content: 'After using Nothing for months, I can confidently say it has given me nothing but satisfaction.',
    rating: 5,
    avatar: '/generated/avatar-placeholder.jpg'
  }
];

const mockPricingTiers: PricingTier[] = [
  {
    id: 'basic-nothing',
    name: 'Basic Nothing',
    price: 0,
    description: 'Perfect for individuals who want nothing',
    features: ['0 features', '0 support', '0 guarantees', 'Infinite emptiness'],
    popular: false
  },
  {
    id: 'pro-nothing',
    name: 'Pro Nothing',
    price: 0,
    description: 'Advanced nothing for professionals',
    features: ['0 premium features', '0 priority support', '0 advanced tools', 'Professional-grade emptiness'],
    popular: true
  },
  {
    id: 'enterprise-nothing',
    name: 'Enterprise Nothing',
    price: 0,
    description: 'Nothing at scale for enterprises',
    features: ['0 enterprise features', '0 dedicated support', '0 compliance tools', 'Enterprise-level void'],
    popular: false
  }
];

// Create mock response helper
function createMockResponse<T>(data: T, status = 200): Response {
  const apiResponse: ApiResponse<T> = {
    data,
    status,
    error: status >= 400 ? 'Mock error' : undefined
  };

  return new Response(JSON.stringify(apiResponse), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Mock fetch implementation
function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const method = init?.method || 'GET';

  // Add artificial delay to simulate network
  const delay = Math.random() * 500 + 100;

  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Route mock endpoints
        if (url.includes('/api/nothing/login')) {
          const mockUsers = DEFAULT_APP_CONFIG.development_mode.mock_auth_users;
          if (method === 'POST' && mockUsers.length > 0) {
            resolve(createMockResponse<User>(mockUsers[0]));
          } else {
            resolve(createMockResponse<null>(null, 401));
          }
          return;
        }

        if (url.includes('/api/nothing') && method === 'GET') {
          resolve(createMockResponse<NothingProduct>(mockNothingProduct));
          return;
        }

        if (url.includes('/api/testimonials/nothing')) {
          resolve(createMockResponse<Testimonial[]>(mockTestimonials));
          return;
        }

        if (url.includes('/api/pricing/nothing')) {
          resolve(createMockResponse<PricingTier[]>(mockPricingTiers));
          return;
        }

        if (url.includes('/api/support/nothing')) {
          const supportResponse: SupportMessage = {
            id: Date.now().toString(),
            message: 'Thank you for contacting Nothing support. We are unable to help you with anything, as we specialize in nothing.',
            userId: 'support-bot',
            timestamp: new Date().toISOString(),
            type: 'response'
          };
          resolve(createMockResponse<SupportMessage>(supportResponse));
          return;
        }

        if (url.includes('/api/newsletter/nothing')) {
          if (method === 'POST') {
            resolve(createMockResponse<{ success: boolean }>({ success: true }));
          }
          return;
        }

        if (url.includes('/api/analytics/nothing')) {
          if (method === 'POST') {
            // Log analytics event in dev
            if (init?.body) {
              const event = JSON.parse(init.body as string) as AnalyticsEvent;
              console.log('🔍 Mock Analytics Event:', event);
            }
            resolve(createMockResponse<{ success: boolean }>({ success: true }));
          }
          return;
        }

        if (url.includes('/api/checkout/nothing')) {
          if (method === 'POST') {
            resolve(createMockResponse<{ checkoutUrl: string }>({ 
              checkoutUrl: 'https://nothing.example.com/checkout/nothing' 
            }));
          }
          return;
        }

        // If no mock endpoint matches, fall back to original fetch
        if (originalFetch) {
          resolve(originalFetch(input, init));
        } else {
          resolve(new Response('Mock endpoint not found', { status: 404 }));
        }
      } catch (error) {
        console.error('Mock server error:', error);
        resolve(new Response('Mock server error', { status: 500 }));
      }
    }, delay);
  });
}

export function startMockServer(): void {
  if (!DEFAULT_APP_CONFIG.development_mode.enable_mock_data) {
    console.log('🚫 Mock server disabled by config');
    return;
  }

  if (isMocking) {
    console.log('⚠️ Mock server already started');
    return;
  }

  if (typeof window === 'undefined') {
    console.log('⚠️ Mock server requires browser environment');
    return;
  }

  // Store original fetch
  originalFetch = window.fetch;
  
  // Replace with mock fetch
  window.fetch = mockFetch;
  isMocking = true;

  console.log('🎭 Mock server started - intercepting API calls');
  console.log('📍 Mock endpoints:', DEFAULT_APP_CONFIG.development_mode.mock_api_endpoints);
}

export function stopMockServer(): void {
  if (!isMocking || !originalFetch) {
    console.log('⚠️ Mock server not running');
    return;
  }

  // Restore original fetch
  window.fetch = originalFetch;
  originalFetch = null;
  isMocking = false;

  console.log('🛑 Mock server stopped - restored original fetch');
}

// Utility to check if a URL should be mocked
export function shouldMockUrl(url: string): boolean {
  if (!isMocking || !DEFAULT_APP_CONFIG.development_mode.enable_mock_data) {
    return false;
  }

  return DEFAULT_APP_CONFIG.development_mode.mock_api_endpoints.some(endpoint => 
    url.includes(endpoint)
  );
}
