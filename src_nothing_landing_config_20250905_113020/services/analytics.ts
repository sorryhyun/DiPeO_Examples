// filepath: src/services/analytics.ts
import { eventBus } from '@/core/events';
import { config } from '@/app/config';

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
}

// Analytics provider interface for external integrations
export interface AnalyticsProvider {
  name: string;
  track(event: AnalyticsEvent): Promise<void> | void;
  identify?(userId: string, traits?: Record<string, any>): Promise<void> | void;
  page?(name: string, properties?: Record<string, any>): Promise<void> | void;
  group?(groupId: string, traits?: Record<string, any>): Promise<void> | void;
}

// Built-in console logger provider for development
const consoleProvider: AnalyticsProvider = {
  name: 'console',
  track(event: AnalyticsEvent): void {
    if (config.isDevelopment) {
      console.log('[Analytics]', event);
    }
  },
  identify(userId: string, traits?: Record<string, any>): void {
    if (config.isDevelopment) {
      console.log('[Analytics] Identify:', { userId, traits });
    }
  },
  page(name: string, properties?: Record<string, any>): void {
    if (config.isDevelopment) {
      console.log('[Analytics] Page:', { name, properties });
    }
  },
  group(groupId: string, traits?: Record<string, any>): void {
    if (config.isDevelopment) {
      console.log('[Analytics] Group:', { groupId, traits });
    }
  },
};

// Analytics service class
class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private userId?: string;
  private sessionId: string;
  private isEnabled: boolean;
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = config.analytics?.enabled ?? true;
    
    // Always include console provider in development
    if (config.isDevelopment) {
      this.providers.push(consoleProvider);
    }

    // Initialize session tracking
    this.initializeSession();
  }

  /**
   * Initialize the analytics service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load external providers based on config
      await this.loadProviders();
      
      // Process queued events
      await this.processEventQueue();
      
      this.isInitialized = true;
      
      // Track initialization
      this.track('analytics_initialized', {
        providers: this.providers.map(p => p.name),
        sessionId: this.sessionId,
      });
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
      
      // Emit error event
      eventBus.emit('error:global', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'Analytics initialization',
      });
    }
  }

  /**
   * Add an analytics provider
   */
  addProvider(provider: AnalyticsProvider): void {
    if (!this.providers.find(p => p.name === provider.name)) {
      this.providers.push(provider);
      
      if (config.isDevelopment) {
        console.log(`[Analytics] Added provider: ${provider.name}`);
      }
    }
  }

  /**
   * Remove an analytics provider
   */
  removeProvider(name: string): void {
    const index = this.providers.findIndex(p => p.name === name);
    if (index !== -1) {
      this.providers.splice(index, 1);
      
      if (config.isDevelopment) {
        console.log(`[Analytics] Removed provider: ${name}`);
      }
    }
  }

  /**
   * Track an analytics event
   */
  async track(
    eventName: string, 
    properties?: Record<string, any>,
    options?: { immediate?: boolean }
  ): Promise<void> {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        // Add default context
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      },
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    // Emit to event bus for app-wide listening
    eventBus.emit('analytics:event', {
      name: eventName,
      properties: event.properties,
    });

    // Queue event if not initialized, unless immediate is requested
    if (!this.isInitialized && !options?.immediate) {
      this.eventQueue.push(event);
      return;
    }

    // Send to all providers
    await this.sendToProviders(event);
  }

  /**
   * Identify a user
   */
  async identify(
    userId: string, 
    traits?: Record<string, any>
  ): Promise<void> {
    if (!this.isEnabled) return;

    this.userId = userId;

    // Emit user identification event
    eventBus.emit('auth:login', { userId });

    if (!this.isInitialized) {
      // Queue for later if not initialized
      this.eventQueue.push({
        name: '__identify',
        properties: { userId, traits },
        timestamp: Date.now(),
      });
      return;
    }

    // Send to all providers that support identify
    const promises = this.providers
      .filter(provider => provider.identify)
      .map(provider => {
        try {
          return provider.identify!(userId, traits);
        } catch (error) {
          console.error(`[Analytics] Identify failed for ${provider.name}:`, error);
          return Promise.resolve();
        }
      });

    await Promise.allSettled(promises);
  }

  /**
   * Track a page view
   */
  async page(
    name: string, 
    properties?: Record<string, any>
  ): Promise<void> {
    if (!this.isEnabled) return;

    const pageProperties = {
      ...properties,
      title: typeof document !== 'undefined' ? document.title : undefined,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      search: typeof window !== 'undefined' ? window.location.search : undefined,
      hash: typeof window !== 'undefined' ? window.location.hash : undefined,
    };

    // Track as regular event
    await this.track('page_view', { pageName: name, ...pageProperties });

    if (!this.isInitialized) return;

    // Send to providers that support page tracking
    const promises = this.providers
      .filter(provider => provider.page)
      .map(provider => {
        try {
          return provider.page!(name, pageProperties);
        } catch (error) {
          console.error(`[Analytics] Page failed for ${provider.name}:`, error);
          return Promise.resolve();
        }
      });

    await Promise.allSettled(promises);
  }

  /**
   * Group a user (for B2B analytics)
   */
  async group(
    groupId: string, 
    traits?: Record<string, any>
  ): Promise<void> {
    if (!this.isEnabled || !this.isInitialized) return;

    const promises = this.providers
      .filter(provider => provider.group)
      .map(provider => {
        try {
          return provider.group!(groupId, traits);
        } catch (error) {
          console.error(`[Analytics] Group failed for ${provider.name}:`, error);
          return Promise.resolve();
        }
      });

    await Promise.allSettled(promises);
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (config.isDevelopment) {
      console.log(`[Analytics] ${enabled ? 'Enabled' : 'Disabled'}`);
    }
  }

  /**
   * Reset analytics state (useful for logout)
   */
  reset(): void {
    this.userId = undefined;
    this.sessionId = this.generateSessionId();
    this.eventQueue = [];
    
    // Track session reset
    this.track('session_reset', { 
      newSessionId: this.sessionId,
    }, { immediate: true });
  }

  /**
   * Get current analytics state
   */
  getState() {
    return {
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      userId: this.userId,
      sessionId: this.sessionId,
      providers: this.providers.map(p => p.name),
      queuedEvents: this.eventQueue.length,
    };
  }

  // Private methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession(): void {
    // Track session start
    this.track('session_start', {
      sessionId: this.sessionId,
      timestamp: Date.now(),
    }, { immediate: true });

    // Track session end on page unload
    if (typeof window !== 'undefined') {
      const handleUnload = () => {
        this.track('session_end', {
          sessionId: this.sessionId,
          duration: Date.now() - parseInt(this.sessionId.split('_')[1]),
        }, { immediate: true });
      };

      window.addEventListener('beforeunload', handleUnload);
      window.addEventListener('pagehide', handleUnload);
    }
  }

  private async loadProviders(): Promise<void> {
    const providersConfig = config.analytics?.providers || [];

    for (const providerConfig of providersConfig) {
      try {
        await this.loadProvider(providerConfig);
      } catch (error) {
        console.error(`[Analytics] Failed to load provider ${providerConfig.name}:`, error);
      }
    }
  }

  private async loadProvider(providerConfig: any): Promise<void> {
    // Placeholder for dynamic provider loading
    // In a real implementation, you might load providers like:
    // - Google Analytics
    // - Mixpanel
    // - Amplitude
    // - Segment
    // etc.
    
    if (config.isDevelopment) {
      console.log(`[Analytics] Loading provider: ${providerConfig.name}`);
    }
    
    // Example provider loading logic:
    // switch (providerConfig.name) {
    //   case 'google-analytics':
    //     const gaProvider = await loadGoogleAnalytics(providerConfig);
    //     this.addProvider(gaProvider);
    //     break;
    //   // ... other providers
    // }
  }

  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (config.isDevelopment) {
      console.log(`[Analytics] Processing ${events.length} queued events`);
    }

    for (const event of events) {
      try {
        if (event.name === '__identify' && event.properties) {
          await this.identify(
            event.properties.userId,
            event.properties.traits
          );
        } else {
          await this.sendToProviders(event);
        }
      } catch (error) {
        console.error('[Analytics] Failed to process queued event:', error);
      }
    }
  }

  private async sendToProviders(event: AnalyticsEvent): Promise<void> {
    if (this.providers.length === 0) return;

    const promises = this.providers.map(provider => {
      try {
        return Promise.resolve(provider.track(event));
      } catch (error) {
        console.error(`[Analytics] Track failed for ${provider.name}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

// Convenience function for tracking events
export const trackEvent = (
  name: string, 
  properties?: Record<string, any>
): Promise<void> => {
  return analytics.track(name, properties);
};

// Auto-initialize analytics when module loads
if (typeof window !== 'undefined') {
  // Initialize after a short delay to avoid blocking page load
  setTimeout(() => {
    analytics.initialize().catch(error => {
      console.error('[Analytics] Auto-initialization failed:', error);
    });
  }, 100);
}

// Export the analytics service
export { analytics };
export default analytics;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - only window/document for web analytics context
// [x] Reads config from `@/app/config`
// [x] Exports default named component - exports analytics service as default and named export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for analytics service
