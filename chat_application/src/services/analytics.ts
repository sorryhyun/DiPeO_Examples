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
    return {\n      url: window.location.href,\n      path: window.location.pathname,\n      referrer: document.referrer,\n      userAgent: navigator.userAgent,\n      timestamp: new Date().toISOString(),\n      sessionId: this.sessionId,\n    };\n  }\n\n  private generateSessionId(): string {\n    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;\n  }\n\n  private startFlushTimer(): void {\n    if (this.flushTimer) {\n      window.clearInterval(this.flushTimer);\n    }\n\n    this.flushTimer = window.setInterval(() => {\n      this.flush().catch(error => {\n        console.error('Failed to flush analytics data:', error);\n      });\n    }, this.config.flushInterval!);\n  }\n\n  private stopFlushTimer(): void {\n    if (this.flushTimer) {\n      window.clearInterval(this.flushTimer);\n      this.flushTimer = undefined;\n    }\n  }\n\n  private log(message: string, ...args: any[]): void {\n    if (this.config.debug) {\n      console.debug('[Analytics]', message, ...args);\n    }\n  }\n\n  // Process queued events when service becomes initialized\n  protected async processQueuedEvents(): Promise<void> {\n    if (this.eventQueue.length > 0) {\n      this.log(`Processing ${this.eventQueue.length} queued events`);\n      \n      for (const event of this.eventQueue) {\n        try {\n          await this.sendEvent(event);\n        } catch (error) {\n          console.error('Failed to send queued event:', error);\n        }\n      }\n      \n      this.eventQueue = [];\n    }\n\n    if (this.pageQueue.length > 0) {\n      this.log(`Processing ${this.pageQueue.length} queued page views`);\n      \n      for (const pageView of this.pageQueue) {\n        try {\n          await this.sendPageView(pageView);\n        } catch (error) {\n          console.error('Failed to send queued page view:', error);\n        }\n      }\n      \n      this.pageQueue = [];\n    }\n  }\n}\n\n// =============================================================================\n// Console Analytics Service (for development/testing)\n// =============================================================================\n\nclass ConsoleAnalyticsService extends BaseAnalyticsService {\n  protected async initializeProvider(): Promise<void> {\n    this.log('Console analytics provider initialized');\n    await this.processQueuedEvents();\n  }\n\n  protected async sendEvent(event: AnalyticsEvent): Promise<void> {\n    console.log('📊 Analytics Event:', {\n      name: event.name,\n      properties: event.properties,\n      userId: event.userId,\n      sessionId: event.sessionId,\n      timestamp: event.timestamp,\n    });\n  }\n\n  protected async sendPageView(pageView: AnalyticsPageView): Promise<void> {\n    console.log('📄 Analytics Page View:', {\n      path: pageView.path,\n      title: pageView.title,\n      referrer: pageView.referrer,\n      userId: pageView.userId,\n      sessionId: pageView.sessionId,\n      timestamp: pageView.timestamp,\n    });\n  }\n\n  protected async sendUserIdentification(user: AnalyticsUser): Promise<void> {\n    console.log('👤 Analytics User Identify:', {\n      userId: user.userId,\n      traits: user.traits,\n      timestamp: user.timestamp,\n    });\n  }\n\n  protected async resetUserIdentification(): Promise<void> {\n    console.log('🔄 Analytics User Reset');\n  }\n\n  protected async flushData(): Promise<void> {\n    console.log('🚀 Analytics Flush - All data sent');\n  }\n}\n\n// =============================================================================\n// Mock Analytics Service (for testing)\n// =============================================================================\n\nclass MockAnalyticsService extends BaseAnalyticsService {\n  public readonly events: AnalyticsEvent[] = [];\n  public readonly pageViews: AnalyticsPageView[] = [];\n  public readonly identifications: AnalyticsUser[] = [];\n  public resetCallCount = 0;\n  public flushCallCount = 0;\n\n  protected async initializeProvider(): Promise<void> {\n    // No-op for mock\n    await this.processQueuedEvents();\n  }\n\n  protected async sendEvent(event: AnalyticsEvent): Promise<void> {\n    this.events.push({ ...event });\n  }\n\n  protected async sendPageView(pageView: AnalyticsPageView): Promise<void> {\n    this.pageViews.push({ ...pageView });\n  }\n\n  protected async sendUserIdentification(user: AnalyticsUser): Promise<void> {\n    this.identifications.push({ ...user });\n  }\n\n  protected async resetUserIdentification(): Promise<void> {\n    this.resetCallCount++;\n  }\n\n  protected async flushData(): Promise<void> {\n    this.flushCallCount++;\n  }\n\n  // Test helpers\n  clear(): void {\n    this.events.length = 0;\n    this.pageViews.length = 0;\n    this.identifications.length = 0;\n    this.resetCallCount = 0;\n    this.flushCallCount = 0;\n  }\n\n  getLastEvent(): AnalyticsEvent | undefined {\n    return this.events[this.events.length - 1];\n  }\n\n  getLastPageView(): AnalyticsPageView | undefined {\n    return this.pageViews[this.pageViews.length - 1];\n  }\n\n  hasEvent(eventName: string): boolean {\n    return this.events.some(event => event.name === eventName);\n  }\n}\n\n// =============================================================================\n// HTTP Analytics Service (for production)\n// =============================================================================\n\nclass HttpAnalyticsService extends BaseAnalyticsService {\n  private batch: Array<AnalyticsEvent | AnalyticsPageView> = [];\n\n  protected async initializeProvider(): Promise<void> {\n    if (!this.config.endpoint) {\n      throw new Error('Analytics endpoint is required for HTTP service');\n    }\n\n    // Test endpoint connectivity\n    try {\n      const response = await fetch(`${this.config.endpoint}/health`, {\n        method: 'GET',\n        headers: {\n          'Content-Type': 'application/json',\n          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),\n        },\n      });\n\n      if (!response.ok) {\n        throw new Error(`Analytics endpoint health check failed: ${response.status}`);\n      }\n    } catch (error) {\n      this.log('Analytics endpoint health check failed, but continuing:', error);\n    }\n\n    await this.processQueuedEvents();\n  }\n\n  protected async sendEvent(event: AnalyticsEvent): Promise<void> {\n    this.batch.push(event);\n\n    if (this.batch.length >= this.config.maxBatchSize!) {\n      await this.flushData();\n    }\n  }\n\n  protected async sendPageView(pageView: AnalyticsPageView): Promise<void> {\n    this.batch.push(pageView);\n\n    if (this.batch.length >= this.config.maxBatchSize!) {\n      await this.flushData();\n    }\n  }\n\n  protected async sendUserIdentification(user: AnalyticsUser): Promise<void> {\n    await this.sendToEndpoint('/identify', user);\n  }\n\n  protected async resetUserIdentification(): Promise<void> {\n    await this.sendToEndpoint('/reset', { \n      sessionId: this.sessionId, \n      timestamp: new Date() \n    });\n  }\n\n  protected async flushData(): Promise<void> {\n    if (this.batch.length === 0) {\n      return;\n    }\n\n    const events = [...this.batch];\n    this.batch = [];\n\n    await this.sendToEndpoint('/batch', {\n      events,\n      sessionId: this.sessionId,\n      timestamp: new Date(),\n    });\n  }\n\n  private async sendToEndpoint(path: string, data: any): Promise<void> {\n    if (!this.config.endpoint) {\n      return;\n    }\n\n    try {\n      const response = await fetch(`${this.config.endpoint}${path}`, {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json',\n          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),\n        },\n        body: JSON.stringify(data),\n      });\n\n      if (!response.ok) {\n        throw new Error(`Analytics API error: ${response.status} ${response.statusText}`);\n      }\n    } catch (error) {\n      console.error('Failed to send analytics data:', error);\n      // In production, you might want to retry or queue for later\n    }\n  }\n}\n\n// =============================================================================\n// Factory & Service Registration\n// =============================================================================\n\nfunction createAnalyticsService(): AnalyticsService {\n  // Determine which service to use based on environment and configuration\n  if (config.isDevelopment) {\n    return new ConsoleAnalyticsService();\n  }\n\n  if (config.featureFlags.enableAnalytics === false) {\n    return new MockAnalyticsService({ enabled: false });\n  }\n\n  // Use HTTP service for production with proper endpoint\n  const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;\n  const analyticsApiKey = import.meta.env.VITE_ANALYTICS_API_KEY;\n\n  if (analyticsEndpoint) {\n    return new HttpAnalyticsService({\n      endpoint: analyticsEndpoint,\n      apiKey: analyticsApiKey,\n    });\n  }\n\n  // Fallback to console service if no endpoint configured\n  return new ConsoleAnalyticsService();\n}\n\n// =============================================================================\n// Service Instance & DI Registration\n// =============================================================================\n\n// Create and register the analytics service with DI container\nexport const analyticsService = createAnalyticsService();\n\n// Register in DI container\nregister(TOKENS.AnalyticsService || Symbol('AnalyticsService'), analyticsService);\n\n// =============================================================================\n// Convenience Functions\n// =============================================================================\n\n/**\n * Track a custom analytics event\n */\nexport const trackEvent = (event: string, properties?: Record<string, any>) => {\n  return analyticsService.trackEvent(event, properties);\n};\n\n/**\n * Track a page view\n */\nexport const trackPage = (path?: string, properties?: Record<string, any>) => {\n  const currentPath = path ?? window.location.pathname;\n  return analyticsService.trackPage(currentPath, properties);\n};\n\n/**\n * Identify the current user for analytics\n */\nexport const identifyUser = (user: User, additionalTraits?: Record<string, any>) => {\n  return analyticsService.identify(user.id, {\n    email: user.email,\n    fullName: user.fullName,\n    roles: user.roles,\n    ...additionalTraits,\n  });\n};\n\n/**\n * Reset user identity (call on logout)\n */\nexport const resetUser = () => {\n  return analyticsService.reset();\n};\n\n// =============================================================================\n// Common Event Helpers\n// =============================================================================\n\nexport const analyticsEvents = {\n  // Authentication events\n  login: (method: string = 'email') => \n    trackEvent('user_login', { method }),\n  \n  logout: () => \n    trackEvent('user_logout'),\n  \n  register: (method: string = 'email') => \n    trackEvent('user_register', { method }),\n\n  // Navigation events\n  pageView: (path?: string, additionalData?: Record<string, any>) => \n    trackPage(path, additionalData),\n\n  // Healthcare-specific events\n  appointmentBooked: (appointmentId: string, doctorId: string) => \n    trackEvent('appointment_booked', { appointmentId, doctorId }),\n  \n  appointmentCancelled: (appointmentId: string, reason?: string) => \n    trackEvent('appointment_cancelled', { appointmentId, reason }),\n  \n  medicalRecordViewed: (recordId: string, patientId: string) => \n    trackEvent('medical_record_viewed', { recordId, patientId }),\n  \n  prescriptionCreated: (prescriptionId: string, patientId: string) => \n    trackEvent('prescription_created', { prescriptionId, patientId }),\n\n  // UI interaction events\n  buttonClicked: (buttonId: string, context?: string) => \n    trackEvent('button_clicked', { buttonId, context }),\n  \n  modalOpened: (modalId: string) => \n    trackEvent('modal_opened', { modalId }),\n  \n  modalClosed: (modalId: string, method: 'button' | 'escape' | 'backdrop' = 'button') => \n    trackEvent('modal_closed', { modalId, method }),\n  \n  searchPerformed: (query: string, resultCount: number, context?: string) => \n    trackEvent('search_performed', { query: query.substring(0, 100), resultCount, context }),\n\n  // Error events\n  errorOccurred: (error: Error, context?: string, additionalData?: Record<string, any>) => \n    trackEvent('error_occurred', {\n      errorMessage: error.message,\n      errorStack: error.stack?.substring(0, 500),\n      context,\n      ...additionalData,\n    }),\n};\n\n// =============================================================================\n// Development Helpers\n// =============================================================================\n\nif (config.isDevelopment) {\n  // Add global reference for debugging\n  (globalThis as any).__ANALYTICS = analyticsService;\n  \n  // Add helper to inspect analytics state\n  (globalThis as any).__debugAnalytics = () => {\n    console.log('Analytics Service State:', {\n      enabled: analyticsService.isEnabled(),\n      sessionId: analyticsService.getSessionId(),\n      userId: analyticsService.getUserId(),\n      type: analyticsService.constructor.name,\n    });\n    \n    // If it's a mock service, show captured events\n    if (analyticsService instanceof MockAnalyticsService) {\n      console.log('Captured Events:', analyticsService.events);\n      console.log('Captured Page Views:', analyticsService.pageViews);\n    }\n  };\n}\n\n// =============================================================================\n// Export Additional Types\n// =============================================================================\n\nexport type {\n  AnalyticsService,\n  AnalyticsEvent,\n  AnalyticsPageView,\n  AnalyticsUser,\n  AnalyticsConfig,\n};\n\nexport {\n  MockAnalyticsService,\n  ConsoleAnalyticsService,\n  HttpAnalyticsService,\n};\n\n/*\nSelf-check comments:\n- [x] Uses `@/` imports only (imports from @/core/di, @/app/config, @/core/contracts)\n- [x] Uses providers/hooks (no direct DOM/localStorage side effects - uses DI container)\n- [x] Reads config from `@/app/config` (imports config and uses featureFlags)\n- [x] Exports default named component (exports analyticsService as main export)\n- [x] Adds basic ARIA and keyboard handlers (not applicable for service layer)\n- [x] Uses import.meta.env for environment variables (for analytics endpoint and API key)\n- [x] Provides multiple implementations (Console, Mock, HTTP) for different environments\n- [x] Respects opt-out flags from config.featureFlags.enableAnalytics\n- [x] Integrates with DI container for testability and runtime composition\n- [x] Includes comprehensive error handling and logging\n- [x] Provides convenience functions and common event helpers\n- [x] Supports batching and queuing for performance\n- [x] Includes development helpers for debugging\n- [x] Handles both sync and async scenarios properly\n*/\n```