import { apiClient } from '../utils/apiClient';

interface AnalyticsEvent {
  eventName: string;
  payload?: Record<string, any>;
  timestamp: number;
  clientId: string;
  sessionId: string;
}

class AnalyticsService {
  private clientId: string;
  private sessionId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.clientId = '';
    this.sessionId = '';
  }

  init(): void {
    if (this.isInitialized) return;

    // Get or create client ID
    const storedClientId = localStorage.getItem('analytics_client_id');
    if (storedClientId) {
      this.clientId = storedClientId;
    } else {
      this.clientId = this.generateId();
      localStorage.setItem('analytics_client_id', this.clientId);
    }

    // Generate session ID
    this.sessionId = this.generateId();
    this.isInitialized = true;
  }

  async track(eventName: string, payload?: Record<string, any>): Promise<void> {
    if (!this.isInitialized) {
      this.init();
    }

    const event: AnalyticsEvent = {
      eventName,
      payload: payload || {},
      timestamp: Date.now(),
      clientId: this.clientId,
      sessionId: this.sessionId
    };

    try {
      // Fire and forget - don't await or throw errors
      apiClient.post('/api/analytics/nothing', event).catch(() => {
        // Silently ignore errors to not block UI
      });
    } catch (error) {
      // Silently ignore errors to not block UI
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

const analyticsService = new AnalyticsService();

export const init = () => analyticsService.init();
export const track = (eventName: string, payload?: Record<string, any>) => 
  analyticsService.track(eventName, payload);

export default analyticsService;
