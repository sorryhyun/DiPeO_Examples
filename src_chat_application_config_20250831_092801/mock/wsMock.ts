import { SocketEvent, User, Message, Channel, Reaction } from '@/core/contracts';
import { appConfig, shouldUseMockData, isDevelopment } from '@/app/config';
import { events } from '@/core/events';
import { debugLog, generateId } from '@/core/utils';
import { 
  mockUserOperations,
  mockChannelOperations, 
  mockMessageOperations,
  mockCurrentUser
} from './mockData';

// Mock WebSocket state
interface MockSocketState {
  isConnected: boolean;
  eventListeners: Map<string, Set<(event: any) => void>>;
  activeUsers: Set<string>;
  typingUsers: Map<string, Set<string>>; // channelId -> Set<userId>
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

// Mock WebSocket interface to match real WebSocket API
export interface MockSocket {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(event: SocketEvent): void;
  on(eventName: string, callback: (payload: any) => void): void;
  off(eventName: string, callback: (payload: any) => void): void;
  isConnected(): boolean;
}

class MockWebSocketService implements MockSocket {
  private state: MockSocketState = {
    isConnected: false,
    eventListeners: new Map(),
    activeUsers: new Set(),
    typingUsers: new Map(),
    reconnectAttempts: 0,
    maxReconnectAttempts: 3,
  };

  private simulationIntervals: NodeJS.Timeout[] = [];

  constructor() {
    // Initialize with some active users
    const users = mockUserOperations.findAll();
    users.slice(0, 3).forEach(user => {
      this.state.activeUsers.add(user.id);
    });
  }

  async connect(): Promise<void> {
    if (this.state.isConnected) {
      debugLog('warn', 'Mock WebSocket already connected');
      return;
    }

    if (!shouldUseMockData || appConfig.flags.disable_websocket_in_dev) {
      debugLog('info', 'Mock WebSocket disabled by config');
      return;
    }

    debugLog('info', 'Connecting to mock WebSocket...');

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));

    this.state.isConnected = true;
    this.state.reconnectAttempts = 0;

    // Emit connection event
    this.emit('connect', { timestamp: new Date().toISOString() });

    // Start background simulations
    this.startSimulations();

    debugLog('info', 'Mock WebSocket connected');
  }

  async disconnect(): Promise<void> {
    if (!this.state.isConnected) {
      debugLog('warn', 'Mock WebSocket already disconnected');
      return;
    }

    debugLog('info', 'Disconnecting from mock WebSocket...');

    this.state.isConnected = false;

    // Stop all simulations
    this.stopSimulations();

    // Clear all listeners
    this.state.eventListeners.clear();

    // Emit disconnect event
    this.emit('disconnect', { timestamp: new Date().toISOString() });

    debugLog('info', 'Mock WebSocket disconnected');
  }

  send(event: SocketEvent): void {
    if (!this.state.isConnected) {
      debugLog('warn', 'Cannot send event: Mock WebSocket not connected', event);
      return;
    }

    debugLog('debug', 'Mock WebSocket sending event', event);

    // Handle different event types
    switch (event.type) {
      case 'message:send':
        this.handleSendMessage(event.payload);
        break;
      case 'typing:start':
        this.handleTypingStart(event.payload);
        break;
      case 'typing:stop':
        this.handleTypingStop(event.payload);
        break;
      case 'presence:update':
        this.handlePresenceUpdate(event.payload);
        break;
      case 'reaction:add':
        this.handleAddReaction(event.payload);
        break;
      case 'reaction:remove':
        this.handleRemoveReaction(event.payload);
        break;
      default:
        debugLog('warn', 'Unknown event type', event.type);
    }
  }

  on(eventName: string, callback: (payload: any) => void): void {
    if (!this.state.eventListeners.has(eventName)) {
      this.state.eventListeners.set(eventName, new Set());
    }
    
    this.state.eventListeners.get(eventName)!.add(callback);
    debugLog('debug', `Mock WebSocket: Added listener for ${eventName}`);
  }

  off(eventName: string, callback: (payload: any) => void): void {
    const listeners = this.state.eventListeners.get(eventName);
    if (listeners) {
      listeners.delete(callback);
      debugLog('debug', `Mock WebSocket: Removed listener for ${eventName}`);
    }
  }

  isConnected(): boolean {
    return this.state.isConnected;
  }

  // Private methods
  private emit(eventName: string, payload: any): void {
    const listeners = this.state.eventListeners.get(eventName);
    if (listeners && listeners.size > 0) {
      listeners.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          debugLog('error', `Error in mock WebSocket listener for ${eventName}`, error);
        }
      });
    }

    // Also emit to global event bus for integration with app
    events.emit(`socket:${eventName}` as any, payload);
  }

  private handleSendMessage(payload: { channelId: string; text: string; authorId?: string }): void {
    const currentUser = mockCurrentUser.get();
    if (!currentUser) return;

    // Create mock message
    const message = mockMessageOperations.create({
      channelId: payload.channelId,
      authorId: payload.authorId || currentUser.id,
      type: 'text',
      text: payload.text,
      files: [],
      reactions: [],
      editedAt: null,
      metadata: {}
    });

    // Emit message created event with slight delay to simulate server processing
    setTimeout(() => {
      this.emit('message:created', { message });
    }, 50);
  }

  private handleTypingStart(payload: { channelId: string; userId: string }): void {
    if (!this.state.typingUsers.has(payload.channelId)) {
      this.state.typingUsers.set(payload.channelId, new Set());
    }
    
    this.state.typingUsers.get(payload.channelId)!.add(payload.userId);
    
    this.emit('typing:start', payload);

    // Auto-stop typing after 3 seconds
    setTimeout(() => {
      this.handleTypingStop(payload);
    }, 3000);
  }

  private handleTypingStop(payload: { channelId: string; userId: string }): void {
    const typingInChannel = this.state.typingUsers.get(payload.channelId);
    if (typingInChannel) {
      typingInChannel.delete(payload.userId);
    }
    
    this.emit('typing:stop', payload);
  }

  private handlePresenceUpdate(payload: { userId: string; status: 'online' | 'away' | 'offline' }): void {
    if (payload.status === 'offline') {
      this.state.activeUsers.delete(payload.userId);
    } else {
      this.state.activeUsers.add(payload.userId);
    }
    
    this.emit('presence:updated', payload);
  }

  private handleAddReaction(payload: { messageId: string; emoji: string; userId: string }): void {
    const reaction: Reaction = {
      emoji: payload.emoji,
      userId: payload.userId,
      createdAt: new Date().toISOString()
    };

    const updatedMessage = mockMessageOperations.addReaction(payload.messageId, reaction);
    if (updatedMessage) {
      this.emit('reaction:added', { message: updatedMessage, reaction });
    }
  }

  private handleRemoveReaction(payload: { messageId: string; emoji: string; userId: string }): void {
    const updatedMessage = mockMessageOperations.removeReaction(
      payload.messageId, 
      payload.userId, 
      payload.emoji
    );
    
    if (updatedMessage) {
      this.emit('reaction:removed', { message: updatedMessage, ...payload });
    }
  }

  private startSimulations(): void {
    if (!isDevelopment || !shouldUseMockData) return;

    // Simulate random messages every 10-30 seconds
    const messageInterval = setInterval(() => {
      this.simulateRandomMessage();
    }, Math.random() * 20000 + 10000);

    // Simulate presence changes every 30-60 seconds  
    const presenceInterval = setInterval(() => {
      this.simulatePresenceChange();
    }, Math.random() * 30000 + 30000);

    // Simulate random reactions every 20-40 seconds
    const reactionInterval = setInterval(() => {
      this.simulateRandomReaction();
    }, Math.random() * 20000 + 20000);

    this.simulationIntervals = [messageInterval, presenceInterval, reactionInterval];
  }

  private stopSimulations(): void {
    this.simulationIntervals.forEach(interval => clearInterval(interval));
    this.simulationIntervals = [];
  }

  private simulateRandomMessage(): void {
    if (!this.state.isConnected) return;

    const channels = mockChannelOperations.findAll();
    const users = mockUserOperations.findAll();
    
    if (channels.length === 0 || users.length === 0) return;

    const randomChannel = channels[Math.floor(Math.random() * channels.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    const sampleMessages = [
      'Hey everyone! 👋',
      'Working on the new feature',
      'Anyone free for a quick call?',
      'Just pushed the latest changes',
      'Coffee break? ☕',
      'Great work on the last sprint!',
      'Found a bug, investigating...',
      'Documentation updated 📝',
    ];

    const randomContent = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

    this.handleSendMessage({
      channelId: randomChannel.id,
      text: randomContent,
      authorId: randomUser.id,
    });
  }

  private simulatePresenceChange(): void {
    if (!this.state.isConnected) return;

    const users = mockUserOperations.findAll();
    if (users.length === 0) return;

    const randomUser = users[Math.floor(Math.random() * users.length)];
    const statuses = ['online', 'away', 'offline'] as const;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    this.handlePresenceUpdate({
      userId: randomUser.id,
      status: randomStatus,
    });
  }

  private simulateRandomReaction(): void {
    if (!this.state.isConnected) return;

    const users = mockUserOperations.findAll();
    const channels = mockChannelOperations.findAll();
    
    if (users.length === 0 || channels.length === 0) return;

    // Get messages from a random channel
    const randomChannel = channels[Math.floor(Math.random() * channels.length)];
    const messages = mockMessageOperations.findByChannelId(randomChannel.id, 10);
    
    if (messages.length === 0) return;

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    const emojis = ['👍', '❤️', '😂', '😊', '🎉', '👏', '🔥', '💯'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    this.handleAddReaction({
      messageId: randomMessage.id,
      emoji: randomEmoji,
      userId: randomUser.id,
    });
  }
}

// Singleton instance
let mockSocketInstance: MockWebSocketService | null = null;

// Factory function to create or get existing mock socket
export function createMockSocket(): MockSocket {
  if (!mockSocketInstance) {
    mockSocketInstance = new MockWebSocketService();
  }
  
  return mockSocketInstance;
}

// Initialize the mock WebSocket system
export async function startWsMock(): Promise<MockSocket | null> {
  if (!shouldUseMockData || appConfig.flags.disable_websocket_in_dev) {
    debugLog('info', 'Mock WebSocket disabled by configuration');
    return null;
  }

  if (!isDevelopment) {
    debugLog('warn', 'Mock WebSocket should only be used in development');
    return null;
  }

  debugLog('info', 'Starting mock WebSocket system...');

  const socket = createMockSocket();
  
  try {
    await socket.connect();
    debugLog('info', 'Mock WebSocket system started successfully');
    return socket;
  } catch (error) {
    debugLog('error', 'Failed to start mock WebSocket system', error);
    return null;
  }
}

// Cleanup function
export async function stopWsMock(): Promise<void> {
  if (mockSocketInstance) {
    await mockSocketInstance.disconnect();
    mockSocketInstance = null;
    debugLog('info', 'Mock WebSocket system stopped');
  }
}

// Export for testing
export { MockWebSocketService };
