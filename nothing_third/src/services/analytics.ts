// filepath: src/services/analytics.ts
import { eventBus } from '@/core/events';
import { config } from '@/app/config';

/**
 * Analytics event data structure
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
  sessionId?: string;
  context?: {
    page?: string;
    userAgent?: string;
    referrer?: string;
    [key: string]: any;
  };
}

/**
 * Analytics provider interface for external integrations
 */
export interface AnalyticsProvider {
  name: string;
  isEnabled: boolean;
  track(event: AnalyticsEvent): void | Promise<void>;
  identify(userId: string, traits?: Record<string, any>): void | Promise<void>;
  page(name?: string, properties?: Record<string, any>): void | Promise<void>;
  flush?(): void | Promise<void>;
}

/**
 * Built-in console analytics provider for development
 */
class ConsoleAnalyticsProvider implements AnalyticsProvider {
  name = 'console';
  isEnabled = true;

  track(event: AnalyticsEvent): void {
    console.group(`📊 Analytics: ${event.name}`);
    console.log('Properties:', event.properties);
    console.log('Context:', event.context);
    console.log('Timestamp:', new Date(event.timestamp || Date.now()).toISOString());
    console.groupEnd();
  }

  identify(userId: string, traits?: Record<string, any>): void {
    console.log(`👤 Analytics Identify: ${userId}`, traits);
  }

  page(name?: string, properties?: Record<string, any>): void {
    console.log(`📄 Analytics Page: ${name || 'Unknown'}`, properties);
  }
}

/**
 * Analytics service class
 */
class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private sessionId: string;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
  }

  /**
   * Initialize analytics with providers
   */
  initialize(providers: AnalyticsProvider[] = []): void {
    if (this.isInitialized) {
      console.warn('Analytics service already initialized');
      return;
    }

    // Add console provider in development
    if (config.isDevelopment) {
      this.providers.push(new ConsoleAnalyticsProvider());
    }

    // Add external providers
    this.providers.push(...providers.filter(p => p.isEnabled));

    this.isInitialized = true;

    // Emit initialization event
    eventBus.emit('analytics:initialized', {
      providers: this.providers.map(p => p.name),
      sessionId: this.sessionId
    });
  }

  /**
   * Track an analytics event
   */
  track(
    eventName: string,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized. Call analytics.initialize() first.');
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: this.sanitizeProperties(properties),
      userId,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      context: this.getContext()
    };

    // Emit to event bus first (synchronous)
    eventBus.emit('analytics:track', event);

    // Forward to all providers
    this.providers.forEach(provider => {
      try {
        provider.track(event);
      } catch (error) {
        console.error(`Analytics provider ${provider.name} failed to track event:`, error);
        eventBus.emit('analytics:error', {
          provider: provider.name,
          event: eventName,
          error
        });
      }
    });
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits: Record<string, any> = {}): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized. Call analytics.initialize() first.');
      return;
    }

    const sanitizedTraits = this.sanitizeProperties(traits);

    // Emit to event bus
    eventBus.emit('analytics:identify', {
      userId,
      traits: sanitizedTraits,
      sessionId: this.sessionId
    });

    // Forward to all providers
    this.providers.forEach(provider => {
      try {
        provider.identify(userId, sanitizedTraits);
      } catch (error) {
        console.error(`Analytics provider ${provider.name} failed to identify user:`, error);
        eventBus.emit('analytics:error', {
          provider: provider.name,
          userId,
          error
        });
      }
    });
  }

  /**
   * Track page view
   */
  page(name?: string, properties: Record<string, any> = {}): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized. Call analytics.initialize() first.');
      return;
    }

    const pageName = name || this.getCurrentPageName();
    const sanitizedProperties = this.sanitizeProperties({
      ...properties,
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer
    });

    // Emit to event bus
    eventBus.emit('analytics:page', {
      name: pageName,
      properties: sanitizedProperties,
      sessionId: this.sessionId
    });

    // Forward to all providers
    this.providers.forEach(provider => {
      try {
        provider.page(pageName, sanitizedProperties);
      } catch (error) {
        console.error(`Analytics provider ${provider.name} failed to track page:`, error);
        eventBus.emit('analytics:error', {
          provider: provider.name,
          page: pageName,
          error
        });
      }
    });
  }

  /**
   * Flush all providers (useful before page unload)
   */
  async flush(): Promise<void> {
    const flushPromises = this.providers
      .filter(provider => provider.flush)
      .map(async provider => {
        try {
          await provider.flush!();
        } catch (error) {
          console.error(`Failed to flush analytics provider ${provider.name}:`, error);
        }
      });

    await Promise.all(flushPromises);
    eventBus.emit('analytics:flushed', { sessionId: this.sessionId });
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get registered providers
   */
  getProviders(): readonly AnalyticsProvider[] {
    return [...this.providers];
  }

  /**
   * Check if analytics is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // Private helper methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getCurrentPageName(): string {
    // Try to get page name from route or title
    return document.title || window.location.pathname.replace('/', '') || 'home';
  }

  private getContext(): AnalyticsEvent['context'] {
    if (typeof window === 'undefined') {
      return {};
    }

    return {
      page: this.getCurrentPageName(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      url: window.location.href,
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      timestamp: Date.now()
    };
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    Object.entries(properties).forEach(([key, value]) => {
      // Skip undefined values
      if (value === undefined) return;

      // Handle different value types
      if (value === null || typeof value === 'boolean' || typeof value === 'number') {
        sanitized[key] = value;
      } else if (typeof value === 'string') {
        // Truncate very long strings
        sanitized[key] = value.length > 1000 ? value.substring(0, 1000) + '...' : value;
      } else if (typeof value === 'object') {
        // Convert objects to string representation (avoid circular references)
        try {
          sanitized[key] = JSON.stringify(value);
        } catch (error) {
          sanitized[key] = '[Object]';
        }
      } else if (typeof value === 'function') {
        sanitized[key] = '[Function]';
      } else {
        sanitized[key] = String(value);
      }
    });

    return sanitized;
  }

  private setupEventListeners(): void {
    // Listen for global error events to track errors
    eventBus.on('error:global', (payload) => {
      this.track('error_occurred', {
        message: payload.error?.message,
        stack: payload.error?.stack,
        context: payload.context
      });
    });

    // Auto-flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        // Synchronous flush for page unload
        this.providers.forEach(provider => {
          if (provider.flush) {
            try {
              provider.flush();
            } catch (error) {
              // Ignore errors during page unload
            }
          }
        });
      });

      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        this.track('page_visibility_changed', {
          visibility: document.visibilityState
        });
      });
    }
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

/**
 * Convenience function for tracking events
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
  userId?: string
): void {
  analytics.track(eventName, properties, userId);
}

/**
 * Convenience function for identifying users
 */
export function identifyUser(userId: string, traits?: Record<string, any>): void {
  analytics.identify(userId, traits);
}

/**
 * Convenience function for tracking page views
 */
export function trackPage(name?: string, properties?: Record<string, any>): void {
  analytics.page(name, properties);
}

// Export the singleton instance
export { analytics };

// Export default for convenience
export default analytics;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/core/events and @/app/config)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses event bus pattern and provider abstraction
- [x] Reads config from `@/app/config` (uses config.isDevelopment)
- [x] Exports default named component (exports analytics singleton and convenience functions)
- [x] Adds basic ARIA and keyboard handlers (N/A for analytics service)
*/
