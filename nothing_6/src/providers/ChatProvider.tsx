// filepath: src/providers/ChatProvider.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { eventBus } from '@/core/events'
import { config } from '@/app/config'
import { WebSocketService } from '@/services/websocket'

// Chat message types
export interface ChatMessage {
  id: string
  content: string
  timestamp: Date
  sender: 'user' | 'support' | 'system'
  type: 'text' | 'typing' | 'status'
  metadata?: Record<string, unknown>
}

export interface ChatUser {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  role: 'user' | 'support' | 'admin'
}

export type ChatStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// Chat context interface
export interface ChatContextValue {
  // State
  messages: ChatMessage[]
  isConnected: boolean
  status: ChatStatus
  currentUser: ChatUser | null
  typingUsers: ChatUser[]
  unreadCount: number
  isMinimized: boolean
  
  // Actions
  sendMessage: (content: string) => Promise<void>
  connect: () => Promise<void>
  disconnect: () => void
  markAsRead: () => void
  toggleMinimized: () => void
  clearMessages: () => void
  
  // Typing indicators
  startTyping: () => void
  stopTyping: () => void
  
  // User management
  setCurrentUser: (user: ChatUser) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export interface ChatProviderProps {
  children: ReactNode
  autoConnect?: boolean
  maxMessages?: number
  typingTimeout?: number
}

export function ChatProvider({ 
  children, 
  autoConnect = false, 
  maxMessages = 100,
  typingTimeout = 3000 
}: ChatProviderProps) {
  // Core state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('disconnected')
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null)
  const [typingUsers, setTypingUsers] = useState<ChatUser[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMinimized, setIsMinimized] = useState(true)
  
  // Refs for cleanup and state management
  const wsServiceRef = useRef<WebSocketService | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messageIdCounterRef = useRef(0)
  
  // Derived state
  const isConnected = status === 'connected'
  
  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    messageIdCounterRef.current += 1
    return `msg_${Date.now()}_${messageIdCounterRef.current}`
  }, [])
  
  // Add message to chat
  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
    }
    
    setMessages(prev => {
      const updated = [...prev, newMessage]
      // Keep only last N messages for performance
      return updated.length > maxMessages 
        ? updated.slice(-maxMessages)
        : updated
    })
    
    // Increment unread count if not from current user and chat is minimized
    if (message.sender !== 'user' && isMinimized) {
      setUnreadCount(prev => prev + 1)
    }
    
    // Emit analytics event
    eventBus.emit('analytics:event', {
      name: 'chat:message_received',
      properties: {
        sender: message.sender,
        type: message.type,
        hasMetadata: !!message.metadata,
      }
    })
  }, [generateMessageId, maxMessages, isMinimized])
  
  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !isConnected) return
    
    try {
      // Add user message immediately for optimistic UI
      const userMessage: Omit<ChatMessage, 'id'> = {
        content: content.trim(),
        timestamp: new Date(),
        sender: 'user',
        type: 'text',
      }
      addMessage(userMessage)
      
      // Send via websocket if available
      if (wsServiceRef.current) {
        await wsServiceRef.current.send({
          type: 'chat:message',
          payload: {
            content: content.trim(),
            timestamp: new Date().toISOString(),
          }
        })
      }
      
      // Mock response in development mode
      if (config.shouldUseMockData) {
        setTimeout(() => {
          const responses = [
            "Thanks for your message! Our support team will get back to you shortly.",
            "I understand your concern. Let me help you with that.",
            "That's a great question! Here's what I can tell you...",
            "I'm here to help. Could you provide a bit more detail?",
            "Absolutely! That feature is something we're working on.",
          ]
          
          const mockResponse: Omit<ChatMessage, 'id'> = {
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
            sender: 'support',
            type: 'text',
            metadata: { automated: true }
          }
          addMessage(mockResponse)
        }, 1000 + Math.random() * 2000) // Random delay 1-3s
      }
      
      eventBus.emit('analytics:event', {
        name: 'chat:message_sent',
        properties: { contentLength: content.length }
      })
      
    } catch (error) {
      console.error('[ChatProvider] Failed to send message:', error)
      
      // Add error message
      addMessage({
        content: 'Failed to send message. Please try again.',
        timestamp: new Date(),
        sender: 'system',
        type: 'status',
        metadata: { error: true }
      })
      
      eventBus.emit('analytics:event', {
        name: 'chat:message_error',
        properties: { error: String(error) }
      })
    }
  }, [isConnected, addMessage, config.shouldUseMockData])
  
  // Connect to chat service
  const connect = useCallback(async () => {
    if (status === 'connecting' || status === 'connected') return
    
    setStatus('connecting')
    
    try {
      if (config.shouldUseMockData) {
        // Mock connection in development
        setTimeout(() => {
          setStatus('connected')
          addMessage({
            content: 'Connected to support chat (mock mode)',
            timestamp: new Date(),
            sender: 'system',
            type: 'status',
          })
        }, 500)
      } else {
        // Real websocket connection
        if (!wsServiceRef.current) {
          wsServiceRef.current = new WebSocketService()
        }
        
        await wsServiceRef.current.connect()
        setStatus('connected')
        
        // Set up message handlers
        wsServiceRef.current.onMessage((data) => {
          if (data.type === 'chat:message') {
            addMessage({
              content: data.payload.content,
              timestamp: new Date(data.payload.timestamp),
              sender: data.payload.sender || 'support',
              type: 'text',
              metadata: data.payload.metadata,
            })
          } else if (data.type === 'chat:typing') {
            // Handle typing indicators
            const user = data.payload.user
            if (data.payload.isTyping) {
              setTypingUsers(prev => [...prev.filter(u => u.id !== user.id), user])
            } else {
              setTypingUsers(prev => prev.filter(u => u.id !== user.id))
            }
          }
        })
        
        wsServiceRef.current.onDisconnect(() => {
          setStatus('disconnected')
          setTypingUsers([])
        })
      }
      
      eventBus.emit('analytics:event', {
        name: 'chat:connected',
        properties: { mockMode: config.shouldUseMockData }
      })
      
    } catch (error) {
      console.error('[ChatProvider] Failed to connect:', error)
      setStatus('error')
      
      addMessage({
        content: 'Failed to connect to support chat. Please try again later.',
        timestamp: new Date(),
        sender: 'system',
        type: 'status',
        metadata: { error: true }
      })
      
      eventBus.emit('analytics:event', {
        name: 'chat:connection_error',
        properties: { error: String(error) }
      })
    }
  }, [status, addMessage, config.shouldUseMockData])
  
  // Disconnect from chat service
  const disconnect = useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect()
      wsServiceRef.current = null
    }
    
    setStatus('disconnected')
    setTypingUsers([])
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    
    eventBus.emit('analytics:event', {
      name: 'chat:disconnected',
      properties: {}
    })
  }, [])
  
  // Mark messages as read
  const markAsRead = useCallback(() => {
    setUnreadCount(0)
    
    eventBus.emit('analytics:event', {
      name: 'chat:messages_read',
      properties: { previousUnreadCount: unreadCount }
    })
  }, [unreadCount])
  
  // Toggle minimized state
  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => {
      const newState = !prev
      
      // Mark as read when opening
      if (!newState) {
        setUnreadCount(0)
      }
      
      eventBus.emit('analytics:event', {
        name: 'chat:toggled',
        properties: { minimized: newState }
      })
      
      return newState
    })
  }, [])
  
  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([])
    setUnreadCount(0)
    
    eventBus.emit('analytics:event', {
      name: 'chat:messages_cleared',
      properties: { previousMessageCount: messages.length }
    })
  }, [messages.length])
  
  // Start typing indicator
  const startTyping = useCallback(() => {
    if (!isConnected || !wsServiceRef.current) return
    
    wsServiceRef.current.send({
      type: 'chat:typing',
      payload: {
        isTyping: true,
        user: currentUser,
      }
    })
    
    // Auto-stop typing after timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, typingTimeout)
  }, [isConnected, currentUser, typingTimeout])
  
  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (!isConnected || !wsServiceRef.current) return
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    
    wsServiceRef.current.send({
      type: 'chat:typing',
      payload: {
        isTyping: false,
        user: currentUser,
      }
    })
  }, [isConnected, currentUser])
  
  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect()
    }
    
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])
  
  const contextValue: ChatContextValue = {
    // State
    messages,
    isConnected,
    status,
    currentUser,
    typingUsers,
    unreadCount,
    isMinimized,
    
    // Actions
    sendMessage,
    connect,
    disconnect,
    markAsRead,
    toggleMinimized,
    clearMessages,
    
    // Typing indicators
    startTyping,
    stopTyping,
    
    // User management
    setCurrentUser,
  }
  
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook for consuming chat context
export function useChat(): ChatContextValue {
  const context = useContext(ChatContext)
  
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  
  return context
}

// Default export
export default ChatProvider

// Development helpers
if (config.isDevelopment && typeof window !== 'undefined') {
  (window as any).__CHAT_DEBUG__ = {
    getMessages: () => {
      // This would need to be implemented with a ref or global state
      // For now, just a placeholder for debugging
      console.log('Chat messages would be logged here')
    },
  }
}
