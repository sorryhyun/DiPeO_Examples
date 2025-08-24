import { useEffect, useRef, useCallback } from 'react';
import { mockWebsocket } from '../../services/mockWebsocket';

interface UseWebSocketReturn {
  isConnected: boolean;
  send: (eventName: string, payload: any) => void;
}

export function useWebSocket(
  eventName: string,
  handler: (payload: any) => void
): UseWebSocketReturn {
  const handlerRef = useRef(handler);
  const isConnectedRef = useRef(true); // Mock websocket is always "connected" in dev

  // Keep handler ref current
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  // Subscribe/unsubscribe effect
  useEffect(() => {
    const stableHandler = (payload: any) => {
      handlerRef.current(payload);
    };

    // Subscribe to the event
    mockWebsocket.subscribe(eventName, stableHandler);

    // Cleanup subscription on unmount or eventName change
    return () => {
      mockWebsocket.unsubscribe(eventName, stableHandler);
    };
  }, [eventName]);

  // Manual send function for emitting events
  const send = useCallback((eventName: string, payload: any) => {
    // Type cast since emit expects strict event names but send is more flexible
    (mockWebsocket.emit as any)(eventName, payload);
  }, []);

  return {
    isConnected: isConnectedRef.current,
    send,
  };
}
