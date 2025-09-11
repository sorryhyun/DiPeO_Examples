// filepath: src/core/contracts.ts

// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

/* src/core/contracts.ts

   Single source of truth for domain & UI contracts. This file is intentionally explicit and stable so both client code and the mock server reference the same types.

   Usage examples:
     import { User, NothingProduct } from '@/core/contracts'

*/

// -- Basic role & user types --------------------------------------------------
export type Role = 'nothing_user' | 'premium_nothing' | 'enterprise_nothing' | 'admin' | 'guest'

export interface User {
  id: string
  email: string
  displayName?: string
  role: Role
  createdAt: string // ISO
  metadata?: Record<string, unknown>
}

// Healthcare-specific user subtypes (required by prompt)
export interface Patient extends User {
  mrn?: string // medical record number
  dateOfBirth?: string
  emergencyContact?: { name: string; phone?: string }
}

export interface Doctor extends User {
  specialty?: string
  licenseNumber?: string
}

export interface Nurse extends User {
  licenseNumber?: string
  department?: string
}

// -- Healthcare domain models ------------------------------------------------
export interface Appointment {
  id: string
  patientId: string
  practitionerId: string
  startAt: string // ISO
  endAt?: string // ISO
  location?: string
  notes?: string
  status: 'scheduled' | 'cancelled' | 'completed' | 'no_show'
}

export interface MedicalRecord {
  id: string
  patientId: string
  createdAt: string
  entries: Array<{ id: string; type: string; summary?: string; data?: Record<string, unknown>; createdBy?: string }>
}

export interface Prescription {
  id: string
  patientId: string
  prescribedBy: string
  drug: string
  dose?: string
  instructions?: string
  issuedAt: string
  expiresAt?: string
}

export interface LabResult {
  id: string
  patientId: string
  testName: string
  value: string | number
  unit?: string
  referenceRange?: string
  collectedAt?: string
  reportedAt?: string
}

// -- Application-specific & product models (Nothing domain) -------------------
export interface NothingProduct {
  id: string
  sku: string
  title: string
  description?: string
  priceCents: number
  recurring?: boolean
  features?: string[]
}

export interface Testimonial {
  id: string
  author: string
  authorId?: string
  avatarUrl?: string
  quote: string
  rating?: number // 0-5
  createdAt?: string
}

export interface PricingTier {
  id: string
  name: string
  priceCents: number
  currency: string
  features: string[]
  highlight?: boolean
}

export interface RoadmapItem {
  id: string
  title: string
  date?: string
  description?: string
  status?: 'planned' | 'in_progress' | 'shipped'
}

export interface CaseStudy {
  id: string
  title: string
  summary?: string
  heroImage?: string
  publishedAt?: string
  authors?: string[]
}

// -- API response shapes -----------------------------------------------------
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiResult<T> {
  ok: boolean
  data?: T
  error?: ApiError
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  perPage: number
}

// -- WebSocket payloads & events ---------------------------------------------
export type WSIncomingEvent =
  | { type: 'chat:message'; payload: { messageId: string; from: string; text: string; createdAt: string } }
  | { type: 'analytics:event'; payload: { name: string; properties?: Record<string, unknown> } }
  | { type: 'abtest:exposure'; payload: { experimentId: string; variant: string } }
  | { type: 'system:ping'; payload: { ts: number } }

export type WSOutgoingEvent =
  | { type: 'chat:send'; payload: { text: string; tempId?: string } }
  | { type: 'analytics:batch'; payload: { events: Array<{ name: string; properties?: Record<string, unknown> }> } }
  | { type: 'client:hello'; payload: { clientId: string } }

export type WebSocketPayload = WSIncomingEvent | WSOutgoingEvent

// -- Common UI & state helpers ------------------------------------------------
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface FormState<T = Record<string, unknown>> {
  values: T
  touched: Partial<Record<keyof T, boolean>>
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
}

// -- Chat domain (for LiveChatWidget) ----------------------------------------
export interface ChatMessage {
  id: string
  from: string
  text: string
  createdAt: string
  tempId?: string
}

// -- Convenience mock user dataset (exported for dev tooling & mock server) --
export const DEV_MOCK_USERS: User[] = [
  {
    id: 'u-nothing',
    email: 'nothing@void.com',
    displayName: 'Nothing Enthusiast',
    role: 'nothing_user',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-premium',
    email: 'premium@void.com',
    displayName: 'Premium Void',
    role: 'premium_nothing',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-enterprise',
    email: 'enterprise@void.com',
    displayName: 'Enterprise Void',
    role: 'enterprise_nothing',
    createdAt: new Date().toISOString(),
  },
]

// -- Re-exports for convenience ------------------------------------------------
export type { }
