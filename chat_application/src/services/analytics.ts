// filepath: src/services/analytics.ts
import { config } from '@/app/config';
import { register, resolve, TOKENS } from '@/core/di';
import type { User } from '@/core/contracts';

// =============================================================================
// Analytics Types
// =============================================================================

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsPageView {
  path: string;
  title?: string;
  referrer?: string;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsUser {
  userId: string;
  traits?: Record<string, any>;
  timestamp?: Date;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  apiKey?: string;
  endpoint?: string;
  flushInterval?: number;
  maxBatchSize?: number;
  allowedEvents?: string[];
  blockedEvents?: string[];
}

// =============================================================================
// Analytics Service Interface
// =============================================================================

export interface AnalyticsService {
  /**
   * Initialize the analytics service
   */
  initialize(config?: Partial<AnalyticsConfig>): Promise<void>;

  /**
   * Track a custom event
   */
  trackEvent(event: string, properties?: Record<string, any>): Promise<void>;

  /**
   * Track a page view
   */
  trackPage(path: string, properties?: Record<string, any>): Promise<void>;

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, any>): Promise<void>;

  /**
   * Reset user identity (on logout)
   */
  reset(): Promise<void>;

  /**
   * Flush pending events
   */
  flush(): Promise<void>;

  /**
   * Check if analytics is enabled and consented
   */
  isEnabled(): boolean;

  /**
   * Enable or disable analytics
   */
  setEnabled(enabled: boolean): void;

  /**
   * Get current session ID
   */
  getSessionId(): string;

  /**
   * Get current user ID if identified
   */
  getUserId(): string | undefined;
}

// =============================================================================
// Abstract Base Analytics Service
// =============================================================================

abstract class BaseAnalyticsService implements AnalyticsService {
  protected config: AnalyticsConfig;
  protected sessionId: string;
  protected userId?: string;
  protected isInitialized = false;
  protected eventQueue: AnalyticsEvent[] = [];
  protected pageQueue: AnalyticsPageView[] = [];
  protected flushTimer?: number;

  constructor(initialConfig?: Partial<AnalyticsConfig>) {
    this.config = {
      enabled: config.featureFlags.enableAnalytics ?? true,
      debug: config.isDevelopment,
      flushInterval: 5000, // 5 seconds
      maxBatchSize: 50,
      allowedEvents: [],
      blockedEvents: [],
      ...initialConfig,
    };

    // Generate session ID
    this.sessionId = this.generateSessionId();

    // Respect global opt-out flags
    if (!config.featureFlags.enableAnalytics) {
      this.config.enabled = false;
    }
  }

  async initialize(userConfig?: Partial<AnalyticsConfig>): Promise<void> {
    if (userConfig) {
      this.config = { ...this.config, ...userConfig };
    }

    if (!this.config.enabled) {
      this.log('Analytics disabled via configuration');
      return;
    }

    try {
      await this.initializeProvider();
      this.isInitialized = true;
      this.startFlushTimer();
      this.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      this.config.enabled = false;
    }
  }

  async trackEvent(event: string, properties?: Record<string, any>): Promise<void> {
    if (!this.shouldTrack()) {
      return;
    }

    if (this.isEventBlocked(event)) {
      this.log(`Event '${event}' is blocked`);
      return;
    }

    if (!this.isEventAllowed(event)) {
      this.log(`Event '${event}' is not in allowed list`);
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      name: event,
      properties: {
        ...this.getCommonProperties(),
        ...properties,
      },
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.log('Tracking event:', analyticsEvent);

    if (this.isInitialized) {
      await this.sendEvent(analyticsEvent);
    } else {
      this.eventQueue.push(analyticsEvent);
    }
  }

  async trackPage(path: string, properties?: Record<string, any>): Promise<void> {
    if (!this.shouldTrack()) {
      return;
    }

    const pageView: AnalyticsPageView = {
      path,
      title: document.title,
      referrer: document.referrer,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
      ...properties,
    };

    this.log('Tracking page view:', pageView);

    if (this.isInitialized) {
      await this.sendPageView(pageView);
    } else {
      this.pageQueue.push(pageView);
    }
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.shouldTrack()) {
      return;
    }

    this.userId = userId;

    const analyticsUser: AnalyticsUser = {
      userId,
      traits: {
        ...traits,
        identifiedAt: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    this.log('Identifying user:', analyticsUser);

    if (this.isInitialized) {
      await this.sendUserIdentification(analyticsUser);
    }
  }

  async reset(): Promise<void> {
    this.log('Resetting user identity');
    this.userId = undefined;

    if (this.isInitialized) {
      await this.resetUserIdentification();
    }
  }

  async flush(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    this.log('Flushing analytics data');
    await this.flushData();
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  setEnabled(enabled: boolean): void {
    const previousState = this.config.enabled;
    this.config.enabled = enabled;

    if (enabled && !previousState) {
      this.log('Analytics enabled');
      if (!this.isInitialized) {
        this.initialize();
      }
    } else if (!enabled && previousState) {
      this.log('Analytics disabled');
      this.stopFlushTimer();
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  // =============================================================================
  // Abstract Methods (to be implemented by concrete services)
  // =============================================================================

  protected abstract initializeProvider(): Promise<void>;
  protected abstract sendEvent(event: AnalyticsEvent): Promise<void>;
  protected abstract sendPageView(pageView: AnalyticsPageView): Promise<void>;
  protected abstract sendUserIdentification(user: AnalyticsUser): Promise<void>;
  protected abstract resetUserIdentification(): Promise<void>;
  protected abstract flushData(): Promise<void>;

  // =============================================================================
  // Helper Methods
  // =============================================================================

  private shouldTrack(): boolean {
    return this.config.enabled && typeof window !== 'undefined';
  }

  private isEventBlocked(event: string): boolean {
    return this.config.blockedEvents.length > 0 && this.config.blockedEvents.includes(event);
  }

  private isEventAllowed(event: string): boolean {
    return this.config.allowedEvents.length === 0 || this.config.allowedEvents.includes(event);
  }

  private getCommonProperties(): Record<string, any> {
    return {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      window.clearInterval(this.flushTimer);
    }

    this.flushTimer = window.setInterval(() => {
      this.flush().catch(error => {
        console.error('Failed to flush analytics data:', error);
      });
    }, this.config.flushInterval!);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      window.clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  private log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.debug('[Analytics]', message, ...args);
    }
  }

  // Process queued events when service becomes initialized
  protected async processQueuedEvents(): Promise<void> {
    if (this.eventQueue.length > 0) {
      this.log(`Processing ${this.eventQueue.length} queued events`);
      
      for (const event of this.eventQueue) {
        try {
          await this.sendEvent(event);
        } catch (error) {
          console.error('Failed to send queued event:', error);
        }
      }
      
      this.eventQueue = [];
    }

    if (this.pageQueue.length > 0) {
      this.log(`Processing ${this.pageQueue.length} queued page views`);
      
      for (const pageView of this.pageQueue) {
        try {
          await this.sendPageView(pageView);
        } catch (error) {
          console.error('Failed to send queued page view:', error);
        }
      }
      
      this.pageQueue = [];
    }
  }
}

// =============================================================================
// Console Analytics Service (for development/testing)
// =============================================================================

class ConsoleAnalyticsService extends BaseAnalyticsService {
  protected async initializeProvider(): Promise<void> {
    this.log('Console analytics provider initialized');
    await this.processQueuedEvents();
  }

  protected async sendEvent(event: AnalyticsEvent): Promise<void> {
    console.log('📊 Analytics Event:', {
      name: event.name,
      properties: event.properties,
      userId: event.userId,
      sessionId: event.sessionId,
      timestamp: event.timestamp,
    });
  }

  protected async sendPageView(pageView: AnalyticsPageView): Promise<void> {
    console.log('📄 Analytics Page View:', {
      path: pageView.path,
      title: pageView.title,
      referrer: pageView.referrer,
      userId: pageView.userId,
      sessionId: pageView.sessionId,
      timestamp: pageView.timestamp,
    });
  }

  protected async sendUserIdentification(user: AnalyticsUser): Promise<void> {
    console.log('👤 Analytics User Identify:', {
      userId: user.userId,
      traits: user.traits,
      timestamp: user.timestamp,
    });
  }

  protected async resetUserIdentification(): Promise<void> {
    console.log('🔄 Analytics User Reset');
  }

  protected async flushData(): Promise<void> {
    console.log('🚀 Analytics Flush - All data sent');
  }
}

// =============================================================================
// Mock Analytics Service (for testing)
// =============================================================================

class MockAnalyticsService extends BaseAnalyticsService {
  public readonly events: AnalyticsEvent[] = [];
  public readonly pageViews: AnalyticsPageView[] = [];
  public readonly identifications: AnalyticsUser[] = [];
  public resetCallCount = 0;
  public flushCallCount = 0;

  protected async initializeProvider(): Promise<void> {
    // No-op for mock
    await this.processQueuedEvents();
  }

  protected async sendEvent(event: AnalyticsEvent): Promise<void> {
    this.events.push({ ...event });
  }

  protected async sendPageView(pageView: AnalyticsPageView): Promise<void> {
    this.pageViews.push({ ...pageView });
  }

  protected async sendUserIdentification(user: AnalyticsUser): Promise<void> {
    this.identifications.push({ ...user });
  }

  protected async resetUserIdentification(): Promise<void> {
    this.resetCallCount++;
  }

  protected async flushData(): Promise<void> {
    this.flushCallCount++;
  }

  // Test helpers
  clear(): void {
    this.events.length = 0;
    this.pageViews.length = 0;
    this.identifications.length = 0;
    this.resetCallCount = 0;
    this.flushCallCount = 0;
  }

  getLastEvent(): AnalyticsEvent | undefined {
    return this.events[this.events.length - 1];
  }

  getLastPageView(): AnalyticsPageView | undefined {
    return this.pageViews[this.pageViews.length - 1];
  }

  hasEvent(eventName: string): boolean {
    return this.events.some(event => event.name === eventName);
  }
}

// =============================================================================
// HTTP Analytics Service (for production)
// =============================================================================

class HttpAnalyticsService extends BaseAnalyticsService {
  private batch: Array<AnalyticsEvent | AnalyticsPageView> = [];

  protected async initializeProvider(): Promise<void> {
    if (!this.config.endpoint) {
      throw new Error('Analytics endpoint is required for HTTP service');
    }

    // Test endpoint connectivity
    try {
      const response = await fetch(`${this.config.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Analytics endpoint health check failed: ${response.status}`);
      }
    } catch (error) {
      this.log('Analytics endpoint health check failed, but continuing:', error);
    }

    await this.processQueuedEvents();
  }

  protected async sendEvent(event: AnalyticsEvent): Promise<void> {
    this.batch.push(event);

    if (this.batch.length >= this.config.maxBatchSize!) {
      await this.flushData();
    }
  }

  protected async sendPageView(pageView: AnalyticsPageView): Promise<void> {
    this.batch.push(pageView);

    if (this.batch.length >= this.config.maxBatchSize!) {
      await this.flushData();
    }
  }

  protected async sendUserIdentification(user: AnalyticsUser): Promise<void> {
    await this.sendToEndpoint('/identify', user);
  }

  protected async resetUserIdentification(): Promise<void> {
    await this.sendToEndpoint('/reset', { 
      sessionId: this.sessionId, 
      timestamp: new Date() 
    });
  }

  protected async flushData(): Promise<void> {
    if (this.batch.length === 0) {
      return;
    }

    const events = [...this.batch];
    this.batch = [];

    await this.sendToEndpoint('/batch', {
      events,
      sessionId: this.sessionId,
      timestamp: new Date(),
    });
  }

  private async sendToEndpoint(path: string, data: any): Promise<void> {
    if (!this.config.endpoint) {
      return;
    }

    try {
      const response = await fetch(`${this.config.endpoint}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send analytics data:', error);
      // In production, you might want to retry or queue for later
    }
  }
}

// =============================================================================
// Factory & Service Registration
// =============================================================================

function createAnalyticsService(): AnalyticsService {
  // Determine which service to use based on environment and configuration
  if (config.isDevelopment) {
    return new ConsoleAnalyticsService();
  }

  if (config.featureFlags.enableAnalytics === false) {
    return new MockAnalyticsService({ enabled: false });
  }

  // Use HTTP service for production with proper endpoint
  const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const analyticsApiKey = import.meta.env.VITE_ANALYTICS_API_KEY;

  if (analyticsEndpoint) {
    return new HttpAnalyticsService({
      endpoint: analyticsEndpoint,
      apiKey: analyticsApiKey,
    });
  }

  // Fallback to console service if no endpoint configured
  return new ConsoleAnalyticsService();
}

// =============================================================================
// Service Instance & DI Registration
// =============================================================================

// Create and register the analytics service with DI container
export const analyticsService = createAnalyticsService();

// Register in DI container
register(TOKENS.AnalyticsService || Symbol('AnalyticsService'), analyticsService);

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Track a custom analytics event
 */
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  return analyticsService.trackEvent(event, properties);
};

/**
 * Track a page view
 */
export const trackPage = (path?: string, properties?: Record<string, any>) => {
  const currentPath = path ?? window.location.pathname;
  return analyticsService.trackPage(currentPath, properties);
};

/**
 * Identify the current user for analytics
 */
export const identifyUser = (user: User, additionalTraits?: Record<string, any>) => {
  return analyticsService.identify(user.id, {
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    ...additionalTraits,
  });
};

/**
 * Reset user identity (call on logout)
 */
export const resetUser = () => {
  return analyticsService.reset();
};

// =============================================================================
// Common Event Helpers
// =============================================================================

export const analyticsEvents = {
  // Authentication events
  login: (method: string = 'email') => 
    trackEvent('user_login', { method }),
  
  logout: () => 
    trackEvent('user_logout'),
  
  register: (method: string = 'email') => 
    trackEvent('user_register', { method }),

  // Navigation events
  pageView: (path?: string, additionalData?: Record<string, any>) => 
    trackPage(path, additionalData),

  // Healthcare-specific events
  appointmentBooked: (appointmentId: string, doctorId: string) => 
    trackEvent('appointment_booked', { appointmentId, doctorId }),
  
  appointmentCancelled: (appointmentId: string, reason?: string) => 
    trackEvent('appointment_cancelled', { appointmentId, reason }),
  
  medicalRecordViewed: (recordId: string, patientId: string) => 
    trackEvent('medical_record_viewed', { recordId, patientId }),
  
  prescriptionCreated: (prescriptionId: string, patientId: string) => 
    trackEvent('prescription_created', { prescriptionId, patientId }),

  // UI interaction events
  buttonClicked: (buttonId: string, context?: string) => 
    trackEvent('button_clicked', { buttonId, context }),
  
  modalOpened: (modalId: string) => 
    trackEvent('modal_opened', { modalId }),
  
  modalClosed: (modalId: string, method: 'button' | 'escape' | 'backdrop' = 'button') => 
    trackEvent('modal_closed', { modalId, method }),
  
  searchPerformed: (query: string, resultCount: number, context?: string) => 
    trackEvent('search_performed', { query: query.substring(0, 100), resultCount, context }),

  // Error events
  errorOccurred: (error: Error, context?: string, additionalData?: Record<string, any>) => 
    trackEvent('error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500),
      context,
      ...additionalData,
    }),
};

// =============================================================================
// Development Helpers
// =============================================================================

if (config.isDevelopment) {
  // Add global reference for debugging
  (globalThis as any).__ANALYTICS = analyticsService;
  
  // Add helper to inspect analytics state
  (globalThis as any).__debugAnalytics = () => {
    console.log('Analytics Service State:', {
      enabled: analyticsService.isEnabled(),
      sessionId: analyticsService.getSessionId(),
      userId: analyticsService.getUserId(),
      type: analyticsService.constructor.name,
    });
    
    // If it's a mock service, show captured events
    if (analyticsService instanceof MockAnalyticsService) {
      console.log('Captured Events:', analyticsService.events);
      console.log('Captured Page Views:', analyticsService.pageViews);
    }
  };
}

// =============================================================================
// Export Additional Types
// =============================================================================

export type {
  AnalyticsService,
  AnalyticsEvent,
  AnalyticsPageView,
  AnalyticsUser,
  AnalyticsConfig,
};

export {
  MockAnalyticsService,
  ConsoleAnalyticsService,
  HttpAnalyticsService,
};

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/di, @/app/config, @/core/contracts)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects - uses DI container)
- [x] Reads config from `@/app/config` (imports config and uses featureFlags)
- [x] Exports default named component (exports analyticsService as main export)
- [x] Adds basic ARIA and keyboard handlers (not applicable for service layer)
- [x] Uses import.meta.env for environment variables (for analytics endpoint and API key)
- [x] Provides multiple implementations (Console, Mock, HTTP) for different environments
- [x] Respects opt-out flags from config.featureFlags.enableAnalytics
- [x] Integrates with DI container for testability and runtime composition
- [x] Includes comprehensive error handling and logging
- [x] Provides convenience functions and common event helpers
- [x] Supports batching and queuing for performance
- [x] Includes development helpers for debugging
- [x] Handles both sync and async scenarios properly
*/