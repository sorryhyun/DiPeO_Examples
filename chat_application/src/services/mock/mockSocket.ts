import { devConfig } from '../../config/devConfig';

export interface MockSocketEvent {
  type: string;
  payload: any;
  timestamp: number;
}

export interface MockSocketHandler {
  (event: MockSocketEvent): void;
}

export interface IMockSocket {
  subscribe(eventType: string, handler: MockSocketHandler): void;
  unsubscribe(eventType: string, handler: MockSocketHandler): void;
  emit(eventType: string, payload: any): void;
  start(): void;
  stop(): void;
  isConnected(): boolean;
}

class MockSocket implements IMockSocket {
  private handlers: Map<string, Set<MockSocketHandler>> = new Map();
  private connected = false;
  private presenceInterval: NodeJS.Timeout | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupPresenceSimulation();
  }

  subscribe(eventType: string, handler: MockSocketHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: string, handler: MockSocketHandler): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      if (eventHandlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  emit(eventType: string, payload: any): void {
    if (!this.connected) {
      return;
    }

    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers && eventHandlers.size > 0) {
      const event: MockSocketEvent = {
        type: eventType,
        payload,
        timestamp: Date.now()
      };

      // Simulate network delay and jitter
      const delay = Math.random() * 100 + 10; // 10-110ms delay
      setTimeout(() => {
        eventHandlers.forEach(handler => {
          try {
            handler(event);
          } catch (error) {
            console.error(`Error in mock socket handler for ${eventType}:`, error);
          }
        });
      }, delay);
    }
  }

  start(): void {
    if (this.connected) {
      return;
    }

    this.connected = true;
    console.log('[MockSocket] Connected');

    // Emit connection event
    this.emit('connect', { status: 'connected' });

    // Start connection health simulation
    this.connectionCheckInterval = setInterval(() => {
      if (Math.random() < 0.99) { // 99% uptime simulation
        this.emit('ping', { timestamp: Date.now() });
      } else {
        // Simulate brief disconnection
        this.simulateDisconnection();
      }
    }, 30000); // Check every 30 seconds
  }

  stop(): void {
    if (!this.connected) {
      return;
    }

    this.connected = false;
    console.log('[MockSocket] Disconnected');

    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }

    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }

    // Emit disconnect event
    setTimeout(() => {
      this.emit('disconnect', { reason: 'manual' });
    }, 0);
  }

  isConnected(): boolean {
    return this.connected;
  }

  private setupPresenceSimulation(): void {
    // Simulate presence updates every 2-5 minutes
    const presenceUpdateInterval = (Math.random() * 180000) + 120000; // 2-5 minutes
    
    this.presenceInterval = setInterval(() => {
      if (!this.connected) return;

      const users = ['user1', 'user2', 'user3', 'user4'];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const statuses = ['online', 'away', 'offline'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      this.emit('presence', {
        userId: randomUser,
        status: randomStatus,
        lastSeen: Date.now()
      });
    }, presenceUpdateInterval);
  }

  private simulateDisconnection(): void {
    const wasConnected = this.connected;
    this.connected = false;
    
    console.log('[MockSocket] Simulating brief disconnection...');
    this.emit('disconnect', { reason: 'network_error' });

    // Reconnect after 1-3 seconds
    const reconnectDelay = Math.random() * 2000 + 1000;
    setTimeout(() => {
      if (wasConnected) {
        this.connected = true;
        console.log('[MockSocket] Reconnected');
        this.emit('connect', { status: 'reconnected' });
      }
    }, reconnectDelay);
  }

  // Utility method for mock server integration
  broadcastMessage(message: any): void {
    this.emit('message', message);
  }

  broadcastReaction(reaction: any): void {
    this.emit('reaction', reaction);
  }

  broadcastThread(thread: any): void {
    this.emit('thread', thread);
  }

  broadcastTyping(typing: any): void {
    this.emit('typing', typing);
  }
}

// Create singleton instance
const mockSocket = new MockSocket();

export default mockSocket;
export { mockSocket };
