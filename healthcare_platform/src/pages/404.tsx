// Core types and interfaces used across the app
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  error?: string;
}

// User and authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser extends User {
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

// Product and pricing types
export interface NothingProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
  tier: 'basic' | 'premium' | 'ultimate';
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  stripePriceId?: string;
}

// Testimonial types
export interface Testimonial {
  id: string;
  author: string;
  content: string;
  rating: number;
  company?: string;
  position?: string;
  avatar?: string;
  verified?: boolean;
  createdAt: Date;
}

// Support and messaging types
export interface SupportMessage {
  id: string;
  userId?: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  responses?: SupportResponse[];
}

export interface SupportResponse {
  id: string;
  messageId: string;
  content: string;
  isStaff: boolean;
  authorName: string;
  createdAt: Date;
}

// Newsletter types
export interface NewsletterPayload {
  email: string;
  name?: string;
  interests?: string[];
  source?: string;
}

export interface NewsletterSubscription extends NewsletterPayload {
  id: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  confirmedAt?: Date;
  createdAt: Date;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
}

export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  conversions: number;
  revenue: number;
  topPages: Array<{ path: string; views: number }>;
  topEvents: Array<{ event: string; count: number }>;
}

// Team and company types
export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  avatar: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

// Cart and checkout types
export interface CartItem {
  productId: string;
  product: NothingProduct;
  quantity: number;
  selectedTier?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  currency: string;
}

export interface CheckoutSession {
  id: string;
  items: CartItem[];
  total: number;
  currency: string;
  customerEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stripeSessionId?: string;
  createdAt: Date;
}

// FAQ types
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
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
  publishedAt: Date;
}

// Status and health types
export interface ServiceStatus {
  service: string;
  status: 'operational' | 'degraded' | 'outage';
  lastChecked: Date;
  uptime: number;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: ServiceStatus[];
  lastUpdated: Date;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T = unknown> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// API error types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Animation and UI types
export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string;
  repeat?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Search and filtering types
export interface SearchFilters {
  query?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
