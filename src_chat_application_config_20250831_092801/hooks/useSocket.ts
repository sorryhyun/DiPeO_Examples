import { useContext, useCallback } from 'react';
import { SocketEvent } from '@/core/contracts';
import { SocketContext, SocketConnectionState } from '@/providers/SocketProvider';

// Socket hook return interface
interface UseSocketReturn {
  // Connection state
  connectionState: SocketConnectionState;
  isConnected: boolean;
  
  // Connection control
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Event handling
  emit: (event: SocketEvent) => void;
  send: (event: SocketEvent) => void; // Alias for emit
  
  // Error handling
  lastError: Error | null;
  
  // Reconnection info
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

// Custom hook to use socket functionality
export const useSocket = (): UseSocketReturn => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  const {
    connectionState,
    isConnected,
    send,
    connect,
    disconnect,
    lastError,
    reconnectAttempts,
    maxReconnectAttempts,
  } = context;

  // Emit event (alias for send for better semantic naming)
  const emit = useCallback((event: SocketEvent) => {
    send(event);
  }, [send]);

  return {
    connectionState,
    isConnected,
    connect,
    disconnect,
    emit,
    send, // Keep both for flexibility
    lastError,
    reconnectAttempts,
    maxReconnectAttempts,
  };
};

// Helper hook for sending specific message types
export const useSocketEmit = () => {
  const { emit, isConnected } = useSocket();

  // Send message event
  const sendMessage = useCallback((channelId: string, content: string, userId: string) => {
    if (!isConnected) return false;
    
    emit({
      type: 'message:send',
      payload: { channelId, content, userId }
    });
    return true;
  }, [emit, isConnected]);

  // Start typing event
  const startTyping = useCallback((channelId: string, userId: string) => {
    if (!isConnected) return false;
    
    emit({
      type: 'typing:start',
      payload: { channelId, userId }
    });
    return true;
  }, [emit, isConnected]);

  // Stop typing event
  const stopTyping = useCallback((channelId: string, userId: string) => {
    if (!isConnected) return false;
    
    emit({
      type: 'typing:stop',
      payload: { channelId, userId }
    });
    return true;
  }, [emit, isConnected]);

  // Update presence event
  const updatePresence = useCallback((userId: string, status: 'online' | 'away' | 'offline') => {
    if (!isConnected) return false;
    
    emit({
      type: 'presence:update',
      payload: { userId, status }
    });
    return true;
  }, [emit, isConnected]);

  // Add reaction event
  const addReaction = useCallback((messageId: string, emoji: string, userId: string) => {
    if (!isConnected) return false;
    
    emit({
      type: 'reaction:add',
      payload: { messageId, emoji, userId }
    });
    return true;
  }, [emit, isConnected]);

  // Remove reaction event
  const removeReaction = useCallback((messageId: string, emoji: string, userId: string) => {
    if (!isConnected) return false;
    
    emit({
      type: 'reaction:remove',
      payload: { messageId, emoji, userId }
    });
    return true;
  }, [emit, isConnected]);

  return {
    sendMessage,
    startTyping,
    stopTyping,
    updatePresence,
    addReaction,
    removeReaction,
  };
};

// Helper hook for connection status checks
export const useSocketStatus = () => {
  const { connectionState, isConnected, lastError, reconnectAttempts } = useSocket();

  const isConnecting = connectionState === SocketConnectionState.CONNECTING;
  const isReconnecting = connectionState === SocketConnectionState.RECONNECTING;
  const hasError = connectionState === SocketConnectionState.ERROR;
  const isDisconnected = connectionState === SocketConnectionState.DISCONNECTED;

  return {
    connectionState,
    isConnected,
    isConnecting,
    isReconnecting,
    hasError,
    isDisconnected,
    lastError,
    reconnectAttempts,
  };
};

export default useSocket;
