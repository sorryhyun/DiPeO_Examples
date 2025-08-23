import { useContext, useEffect, useCallback, useRef } from 'react';
import { WebSocketContext } from '../context/WebSocketProvider';

// WebSocket event types using discriminated unions
export type WebSocketEvent = 
  | { type: 'message'; data: { id: string; content: string; channelId: string; userId: string; timestamp: string; } }
  | { type: 'message_updated'; data: { id: string; content: string; updatedAt: string; } }
  | { type: 'message_deleted'; data: { id: string; channelId: string; } }
  | { type: 'presence_update'; data: { userId: string; status: 'online' | 'away' | 'offline'; lastSeen?: string; } }
  | { type: 'reaction_added'; data: { messageId: string; reaction: string; userId: string; } }
  | { type: 'reaction_removed'; data: { messageId: string; reaction: string; userId: string; } }
  | { type: 'thread_created'; data: { id: string; messageId: string; channelId: string; } }
  | { type: 'thread_updated'; data: { id: string; messageCount: number; lastReply: string; } }
  | { type: 'user_typing'; data: { userId: string; channelId: string; } }
  | { type: 'user_stopped_typing'; data: { userId: string; channelId: string; } }
  | { type: 'channel_updated'; data: { id: string; name?: string; description?: string; } };

export type WebSocketEventHandler = (event: WebSocketEvent) => void;
export type WebSocketEventType = WebSocketEvent['type'];

interface UseWebSocketReturn {
  subscribe: (eventType: WebSocketEventType, handler: WebSocketEventHandler) => void;
  unsubscribe: (eventType: WebSocketEventType, handler: WebSocketEventHandler) => void;
  send: (event: WebSocketEvent) => void;
  isConnected: boolean;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }

  const { subscribe, unsubscribe, send, isConnected } = context;
  
  // Track subscriptions for cleanup
  const subscriptionsRef = useRef<Map<WebSocketEventType, Set<WebSocketEventHandler>>>(new Map());

  // Stable subscribe function that tracks handlers for cleanup
  const stableSubscribe = useCallback((eventType: WebSocketEventType, handler: WebSocketEventHandler) => {
    // Track subscription
    if (!subscriptionsRef.current.has(eventType)) {
      subscriptionsRef.current.set(eventType, new Set());
    }
    subscriptionsRef.current.get(eventType)!.add(handler);
    
    // Subscribe through context
    subscribe(eventType, handler);
  }, [subscribe]);

  // Stable unsubscribe function
  const stableUnsubscribe = useCallback((eventType: WebSocketEventType, handler: WebSocketEventHandler) => {
    // Remove from tracking
    const handlers = subscriptionsRef.current.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        subscriptionsRef.current.delete(eventType);
      }
    }
    
    // Unsubscribe through context
    unsubscribe(eventType, handler);
  }, [unsubscribe]);

  // Stable send function
  const stableSend = useCallback((event: WebSocketEvent) => {
    send(event);
  }, [send]);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      // Unsubscribe all tracked handlers
      subscriptionsRef.current.forEach((handlers, eventType) => {
        handlers.forEach(handler => {
          unsubscribe(eventType, handler);
        });
      });
      subscriptionsRef.current.clear();
    };
  }, [unsubscribe]);

  return {
    subscribe: stableSubscribe,
    unsubscribe: stableUnsubscribe,
    send: stableSend,
    isConnected
  };
};
