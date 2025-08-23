import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';

// WebSocket connection states
export enum WebSocketReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

interface WebSocketContextValue {
  sendMessage: (message: WebSocketMessage) => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => () => void;
  readyState: WebSocketReadyState;
  reconnect: () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
}

// Mock WebSocket implementation for development
class MockWebSocket {
  readyState = WebSocketReadyState.OPEN;
  private messageHandlers: Set<(event: MessageEvent) => void> = new Set();
  private mockEventEmitter: any;

  constructor() {
    // Import mock event emitter from services
    import('../services/mockServer').then(({ mockWebSocket }) => {
      this.mockEventEmitter = mockWebSocket;
      if (this.mockEventEmitter) {
        this.mockEventEmitter.on('message', (data: any) => {
          const event = new MessageEvent('message', { data: JSON.stringify(data) });
          this.messageHandlers.forEach(handler => handler(event));
        });
      }
    });
  }

  addEventListener(event: string, handler: (event: MessageEvent) => void) {
    if (event === 'message') {
      this.messageHandlers.add(handler);
    }
  }

  removeEventListener(event: string, handler: (event: MessageEvent) => void) {
    if (event === 'message') {
      this.messageHandlers.delete(handler);
    }
  }

  send(data: string) {
    if (this.mockEventEmitter) {
      try {
        const message = JSON.parse(data);
        this.mockEventEmitter.emit('clientMessage', message);
      } catch (error) {
        console.warn('Failed to parse WebSocket message:', error);
      }
    }
  }

  close() {
    this.readyState = WebSocketReadyState.CLOSED;
    this.messageHandlers.clear();
  }
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url = 'ws://localhost:8000/ws',
  autoReconnect = true,
  maxReconnectAttempts = 5,
  reconnectInterval = 3000,
}) => {
  const [readyState, setReadyState] = useState<WebSocketReadyState>(WebSocketReadyState.CONNECTING);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef<WebSocket | MockWebSocket | null>(null);
  const messageHandlersRef = useRef<Set<(message: WebSocketMessage) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const shouldUseMockWS = process.env.NODE_ENV === 'development' && 
    (process.env.REACT_APP_USE_MOCK_WS === 'true' || process.env.REACT_APP_DISABLE_WEBSOCKET_IN_DEV === 'true');

  const connect = useCallback(() => {
    try {
      if (shouldUseMockWS) {
        wsRef.current = new MockWebSocket();
        setReadyState(WebSocketReadyState.OPEN);
        setReconnectAttempts(0);
        return;
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setReadyState(WebSocketReadyState.OPEN);
        setReconnectAttempts(0);
        console.log('WebSocket connected');
      };

      ws.onclose = (event) => {
        setReadyState(WebSocketReadyState.CLOSED);
        console.log('WebSocket disconnected:', event.code, event.reason);

        if (autoReconnect && reconnectAttempts < maxReconnectAttempts && !event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setReadyState(WebSocketReadyState.CLOSED);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const message: WebSocketMessage = {
            type: data.type || 'unknown',
            payload: data.payload || data,
            timestamp: Date.now(),
          };

          messageHandlersRef.current.forEach(handler => {
            try {
              handler(message);
            } catch (error) {
              console.error('Error in WebSocket message handler:', error);
            }
          });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      // Update ready state based on WebSocket state
      const updateReadyState = () => {
        if (ws.readyState !== undefined) {
          setReadyState(ws.readyState as WebSocketReadyState);
        }
      };

      ws.addEventListener('open', updateReadyState);
      ws.addEventListener('close', updateReadyState);
      ws.addEventListener('error', updateReadyState);

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setReadyState(WebSocketReadyState.CLOSED);
    }
  }, [url, autoReconnect, maxReconnectAttempts, reconnectInterval, reconnectAttempts, shouldUseMockWS]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!wsRef.current) {
      console.warn('WebSocket not connected. Cannot send message:', message);
      return;
    }

    if (readyState !== WebSocketReadyState.OPEN) {
      console.warn('WebSocket not ready. Ready state:', readyState);
      return;
    }

    try {
      const serialized = JSON.stringify({
        ...message,
        timestamp: message.timestamp || Date.now(),
      });
      wsRef.current.send(serialized);
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }, [readyState]);

  const onMessage = useCallback((callback: (message: WebSocketMessage) => void) => {
    messageHandlersRef.current.add(callback);

    // Return unsubscribe function
    return () => {
      messageHandlersRef.current.delete(callback);
    };
  }, []);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      if ('close' in wsRef.current) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setReconnectAttempts(0);
    setReadyState(WebSocketReadyState.CONNECTING);
    connect();
  }, [connect]);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        if ('close' in wsRef.current) {
          wsRef.current.close();
        }
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      messageHandlersRef.current.clear();
    };
  }, [connect]);

  const contextValue: WebSocketContextValue = {
    sendMessage,
    onMessage,
    readyState,
    reconnect,
    isConnected: readyState === WebSocketReadyState.OPEN,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook for consuming the WebSocket context
export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Export types for external use
export type { WebSocketMessage, WebSocketContextValue };
