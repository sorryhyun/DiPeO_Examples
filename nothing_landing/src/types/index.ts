// Theme enum for consistent theme values
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

// Auth role enum
export enum AuthRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: AuthRole;
  createdAt: string;
  lastActive?: string;
}

// Testimonial interface
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  featured?: boolean;
  createdAt: string;
}

// Pricing tier interface
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year' | 'lifetime';
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
  comingSoon?: boolean;
}

// FAQ item interface
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

// Team member interface
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  featured?: boolean;
}

// Case study interface
export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  client: string;
  industry: string;
  results: string[];
  image?: string;
  featured?: boolean;
  createdAt: string;
}

// Roadmap item interface
export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned' | 'cancelled';
  quarter?: string;
  year: number;
  estimatedCompletion?: string;
}

// Nothing API response interface
export interface NothingAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  requestId: string;
}

// App providers context type
export interface AppProviders {
  theme: Theme;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Generic API response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Newsletter subscription interface
export interface NewsletterSubscription {
  email: string;
  preferences?: {
    updates: boolean;
    marketing: boolean;
    announcements: boolean;
  };
}

// Support ticket interface
export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  email: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

// Analytics event interface
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

// Modal context interface
export interface ModalContextType {
  isOpen: boolean;
  content: React.ReactNode | null;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

// Sound preferences interface
export interface SoundPreferences {
  enabled: boolean;
  volume: number;
  mutedSounds: string[];
}

// Export utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
