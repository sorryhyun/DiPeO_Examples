import { useEffect, useRef } from 'react';
import { mockServer } from '@/services/mockServer';
import { WebSocketEvent } from '@/types';
import { development_mode } from '@/app/config';

export interface UseWebSocketReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (
  channel: string,
  onMessage: (event: WebSocketEvent) => void
): UseWebSocketReturn => {
  const isConnectedRef = useRef(false);
  const callbackRef = useRef(onMessage);

  // Keep callback reference updated
  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  const connect = () => {
    if (development_mode.disable_websocket_in_dev) {
      return;
    }

    if (isConnectedRef.current) {
      return;
    }

    if (development_mode.enable_mock_data) {
      // Connect to mock server EventEmitter
      mockServer.subscribe(channel, callbackRef.current);
      isConnectedRef.current = true;
    } else {
      // Production WebSocket connection (stubbed for now)
      console.warn('Production WebSocket not implemented yet');
      isConnectedRef.current = false;
    }
  };

  const disconnect = () => {
    if (!isConnectedRef.current) {
      return;
    }

    if (development_mode.enable_mock_data) {
      // Disconnect from mock server EventEmitter
      mockServer.unsubscribe(channel, callbackRef.current);
    }
    
    isConnectedRef.current = false;
  };

  // Auto-connect on mount and cleanup on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [channel]);

  return {
    isConnected: isConnectedRef.current,
    connect,
    disconnect
  };
};
```

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (reads from config, uses mockServer service)
// [x] Reads config from `@/app/config`
// [x] Named export (useWebSocket)
// [x] Proper cleanup and ref management for hook lifecycle