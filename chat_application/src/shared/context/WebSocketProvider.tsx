import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { devConfig } from '../../config/devConfig';
import { mockSocket } from '../../services/mock/mockSocket';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: number;
}

export interface WebSocketContextValue {
  isConnected: boolean;
  subscribe: (eventType: string, handler: (payload: any) => void) => () => void;
  unsubscribe: (eventType: string, handler: (payload: any) => void) => void;
  send: (eventType: string, payload: any) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<WebSocketContextValue['connectionStatus']>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;

  const getWebSocketUrl = (): string => {
    // In production, use environment variable or default
    // Vite uses import.meta.env instead of process.env
    return import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  };

  const shouldUseMockSocket = (): boolean => {
    return devConfig.enable_mock_data && devConfig.disable_websocket_in_dev;
  };

  const emitToSubscribers = useCallback((eventType: string, payload: any) => {
    const handlers = subscribersRef.current.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${eventType}:`, error);
        }
      });
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent | { type: string; payload: any }) => {
    try {
      let message: WebSocketMessage;
      
      if ('data' in event) {
        // Real WebSocket message
        message = JSON.parse(event.data);
      } else {
        // Mock socket message
        message = event as WebSocketMessage;
      }

      emitToSubscribers(message.type, message.payload);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [emitToSubscribers]);

  const connectWebSocket = useCallback(() => {
    if (shouldUseMockSocket()) {
      // Use mock socket in development
      setConnectionStatus('connecting');
      
      mockSocket.connect();
      mockSocket.on('message', handleMessage);
      mockSocket.on('connect', () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
      });
      mockSocket.on('disconnect', () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      });
      mockSocket.on('error', () => {
        setConnectionStatus('error');
      });

      return;
    }

    // Real WebSocket connection
    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket connected');
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        wsRef.current = null;
        
        console.log('WebSocket closed:', event.code, event.reason);
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts && !event.wasClean) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;
          
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

      ws.onmessage = handleMessage;

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (shouldUseMockSocket()) {
      mockSocket.disconnect();
      mockSocket.off('message', handleMessage);
      // Note: In a real implementation, you'd pass the handler functions
      // For simplicity in mock, we'll just disconnect
      // mockSocket.off('connect', connectHandler);
      // mockSocket.off('disconnect', disconnectHandler);
      // mockSocket.off('error', errorHandler);
    } else if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, [handleMessage]);

  const subscribe = useCallback((eventType: string, handler: (payload: any) => void) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set());
    }
    subscribersRef.current.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      unsubscribe(eventType, handler);
    };
  }, []);

  const unsubscribe = useCallback((eventType: string, handler: (payload: any) => void) => {
    const handlers = subscribersRef.current.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        subscribersRef.current.delete(eventType);
      }
    }
  }, []);

  const send = useCallback((eventType: string, payload: any) => {
    const message: WebSocketMessage = {
      type: eventType,
      payload,
      timestamp: Date.now()
    };

    if (shouldUseMockSocket()) {
      if (mockSocket.isConnected()) {
        mockSocket.send(message);
      } else {
        console.warn('Mock socket not connected, message not sent:', message);
      }
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    return disconnect;
  }, [connectWebSocket, disconnect]);

  const contextValue: WebSocketContextValue = {
    isConnected,
    subscribe,
    unsubscribe,
    send,
    connectionStatus
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
