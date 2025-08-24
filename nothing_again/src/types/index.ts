// Core API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  error?: string;
}

// Base error type for API client
export interface BaseError extends Error {
  status?: number;
  code?: string;
}

// User and authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  subscription?: 'basic' | 'pro' | 'enterprise';
}

export interface AuthUser extends User {
  token: string;
  refreshToken?: string;
}

// Nothing product types
export interface NothingProduct {
  id: string;
  name: string;
  description: string;
  version: string;
  features: string[];
  benefits: string[];
  uptime: number;
  deliveredFeatures: number;
}

// Testimonial types
export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
  createdAt: string;
  verified: boolean;
}

// Pricing types
export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  features: string[];
  limitations: string[];
  popular?: boolean;
  description: string;
  ctaText: string;
}

// Support and chat types
export interface SupportMessage {
  id: string;
  userId?: string;
  content: string;
  timestamp: string;
  isFromUser: boolean;
  status: 'pending' | 'delivered' | 'failed';
}

export interface SupportConversation {
  id: string;
  messages: SupportMessage[];
  userId?: string;
  status: 'active' | 'closed';
  createdAt: string;
}

// Newsletter types
export interface NewsletterPayload {
  email: string;
  name?: string;
  preferences?: {
    nothingUpdates: boolean;
    voidNews: boolean;
    existentialInsights: boolean;
  };
  source?: string;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  category: 'interaction' | 'conversion' | 'navigation' | 'error';
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  page?: string;
  referrer?: string;
}

export interface AnalyticsData {
  totalEvents: number;
  uniqueUsers: number;
  conversions: number;
  uptime: number;
  nothingDelivered: number;
  satisfactionScore: number;
  timeline: Array<{
    date: string;
    events: number;
    conversions: number;
  }>;
}

// Team types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  expertise: string[];
  yearsOfNothing: number;
}

// Shopping cart types
export interface CartItem {
  id: string;
  tierId: string;
  name: string;
  price: number;
  quantity: number;
  features: string[];
}

export interface CartState {
  items: CartItem[];
  total: number;
  currency: string;
}

// Checkout types
export interface CheckoutSession {
  id: string;
  checkoutUrl?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  tierId: string;
  amount: number;
  currency: string;
}

// FAQ types
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

// Case study types
export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  testimonial?: Testimonial;
  image?: string;
  publishedAt: string;
}

// Roadmap types
export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned' | 'cancelled';
  quarter: string;
  year: number;
  features?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Status page types
export interface StatusIncident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'minor' | 'major' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  updates: Array<{
    timestamp: string;
    status: string;
    message: string;
  }>;
}

export interface SystemStatus {
  overall: 'operational' | 'degraded' | 'outage';
  services: Array<{
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    uptime: number;
  }>;
  uptime: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
  incidents: StatusIncident[];
}

// 3D and animation types
export interface VoidSettings {
  intensity: number;
  particleCount: number;
  rotationSpeed: number;
  glitchEnabled: boolean;
  colorScheme: 'void' | 'matrix' | 'cosmic';
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay: number;
  loop: boolean;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// API endpoint types for mock server configuration
export interface MockEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  response: any;
  delay?: number;
  status?: number;
}

// Development configuration types
export interface DevelopmentMode {
  enable_mock_data: boolean;
  mock_api_endpoints: MockEndpoint[];
  mock_auth_users: AuthUser[];
  disable_websocket_in_dev: boolean;
  use_localstorage_persistence: boolean;
}
