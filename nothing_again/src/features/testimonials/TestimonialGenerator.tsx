// Core TypeScript types and interfaces for the Absolutely Nothing™ app
// Single source of truth for all type definitions

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

// User and Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthUser extends User {
  token: string;
  refreshToken?: string;
  permissions: string[];
}

// Testimonial types
export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
  verified: boolean;
  createdAt: Date;
  featured: boolean;
}

// Pricing and Product types
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  interval: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  popular: boolean;
  nothingLevel: 'basic' | 'premium' | 'ultimate';
  maxNothingness: number;
}

export interface NothingProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: 'void' | 'emptiness' | 'nothingness' | 'silence';
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  weight: number; // Always 0
  color: 'transparent' | 'invisible' | 'clear';
  inStock: boolean; // Always true - infinite nothing
  shipping: {
    free: boolean;
    instant: boolean;
  };
}

// Support and Communication types
export interface SupportMessage {
  id: string;
  userId?: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'existential';
  status: 'open' | 'in-progress' | 'resolved' | 'void';
  createdAt: Date;
  updatedAt: Date;
  responses: SupportResponse[];
}

export interface SupportResponse {
  id: string;
  messageId: string;
  content: string;
  isStaff: boolean;
  createdAt: Date;
}

// Newsletter types
export interface NewsletterPayload {
  email: string;
  name?: string;
  interests: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  source: string;
}

export interface NewsletterSubscriber extends NewsletterPayload {
  id: string;
  subscribed: boolean;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
}

// Analytics types
export interface AnalyticsEvent {
  id?: string;
  event: string;
  category: 'user' | 'product' | 'marketing' | 'void';
  properties: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  page: string;
  userAgent?: string;
}

export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  nothingPurchases: number;
  voidInteractions: number;
  existentialCrises: number;
  timeSpentInVoid: number;
}

// Team and Company types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    void?: string;
  };
  joinedAt: Date;
  nothingExpertise: string[];
}

// Shopping Cart types
export interface CartItem {
  productId: string;
  product: NothingProduct;
  quantity: number;
  customization?: {
    nothingIntensity: number;
    voidDimensions: string;
    emptinessLevel: string;
  };
}

export interface ShoppingCart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// Status and System types
export interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'partial' | 'major' | 'void';
  uptime: number;
  lastChecked: Date;
  incidents: StatusIncident[];
}

export interface StatusIncident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical' | 'existential';
  createdAt: Date;
  resolvedAt?: Date;
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  message: string;
  status: string;
  createdAt: Date;
}

// FAQ types
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  unhelpful: number;
  order: number;
}

// Roadmap types
export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'void';
  priority: 'low' | 'medium' | 'high' | 'existential';
  estimatedCompletion?: Date;
  completedAt?: Date;
  votes: number;
  category: string;
}

// Review types
export interface Review extends Testimonial {
  productId: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  verifiedPurchase: boolean;
  helpfulVotes: number;
}

// Case Study types
export interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: {
    label: string;
    value: string;
    improvement: string;
  }[];
  testimonial: Testimonial;
  featured: boolean;
  createdAt: Date;
}

// Affiliate Program types
export interface AffiliateLink {
  id: string;
  userId: string;
  code: string;
  commissionRate: number;
  clicks: number;
  conversions: number;
  earnings: number;
  createdAt: Date;
}

// Press Kit types
export interface PressAsset{
  id: string;
  title: string;
  description: string;
  type: 'logo' | 'screenshot' | 'video' | 'document';
  url: string;
  size?: string;
  format: string;
  category: string;
}

// API Documentation types
export interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: APIParameter[];
  responses: APIResponse[];
  examples: APIExample[];
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: any;
}

export interface APIExample {
  title: string;
  request?: any;
  response: any;
}

// Theme and UI types
export type Theme = 'light' | 'dark' | 'void' | 'auto';

export interface TooltipProps {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

// Form types
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: { value: string; label: string }[];
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  path?: string;
  userId?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'void';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  createdAt: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}
