import { PricingTier } from '../../types';

export const mockPricingTiers: PricingTier[] = [
  {
    id: 'basic-nothing',
    name: 'Basic Nothing',
    price: 0,
    interval: 'lifetime',
    period: 'forever',
    description: 'The essential void experience for nothing enthusiasts',
    features: [
      'Unlimited access to nothing',
      'Basic emptiness features',
      'Standard void quality',
      'Email support (we won\'t respond)',
      'Nothing documentation',
      'Community access to discuss nothing'
    ],
    cta: 'Get Nothing Free',
    popular: false,
    badge: undefined
  },
  {
    id: 'pro-nothing',
    name: 'Pro Nothing',
    price: 0,
    interval: 'lifetime',
    period: 'forever',
    description: 'Enhanced nothingness for serious void practitioners',
    features: [
      'Everything in Basic Nothing',
      'Premium emptiness algorithms',
      'Advanced void analytics',
      'Priority non-support',
      'Custom nothing configurations',
      'API access to nothing endpoints',
      'Nothing backup & restore',
      'Dark mode nothing (extra dark)'
    ],
    cta: 'Upgrade to Pro Nothing',
    popular: true,
    badge: 'Most Popular'
  },
  {
    id: 'enterprise-nothing',
    name: 'Enterprise Nothing',
    price: 0,
    interval: 'lifetime',
    period: 'forever',
    description: 'Industrial-grade nothing solutions for large organizations',
    features: [
      'Everything in Pro Nothing',
      'Enterprise-grade void infrastructure',
      'Dedicated nothing account manager',
      'White-label nothing solutions',
      'SSO integration with your nothing',
      'Custom SLA for nothing delivery',
      'On-premise nothing deployment',
      'Nothing compliance & security',
      '24/7 nothing monitoring',
      'Unlimited nothing seats'
    ],
    cta: 'Contact Nothing Sales',
    popular: false,
    badge: 'Enterprise'
  }
];

// Export as mockPricing for backward compatibility
export const mockPricing = mockPricingTiers;
