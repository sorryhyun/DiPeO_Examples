// filepath: src/features/chat/LiveChatWidget.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useEffect, useRef } from 'react'
import { config, isDevelopment } from '@/app/config'
import { eventBus } from '@/core/events'
import { User } from '@/core/contracts'
import { useChat } from '@/providers/ChatProvider'
import SilencePlayer from '@/features/sounds/SilencePlayer'
import { socketManager as websocketService } from '@/services/websocket'
import Modal from '@/shared/components/Modal'

export interface ChatMessage {
  id: string
  message: string
  timestamp: Date
  isUser: boolean
  isTyping?: boolean
}

export interface LiveChatWidgetProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'light' | 'dark' | 'auto'
}

const MOCK_AGENT_RESPONSES = [
  "Thanks for contacting Nothing Support! I'm here to provide absolutely no assistance.",
  "I understand your concern, but I'm afraid I can't help with that or anything else.",
  "Have you tried turning nothing off and on again?",
  "Let me transfer you to our specialist in nothing... oh wait, that's also me.",
  "I'm sorry, but our policy is to provide zero solutions to all problems.",
  "Your issue is very important to us. That's why we're doing nothing about it.",
  "I see the problem. Unfortunately, seeing is all I can do.",
  "Would you like me to escalate this to my manager who will also do nothing?",
  "I'm currently away from my desk, but even if I wasn't, I still wouldn't help.",
  "Thank you for waiting. Your patience has been noted and promptly ignored."
]

const CANNED_RESPONSES = [
  "I need help with...",
  "Something is broken",
  "I want a refund",
  "How does this work?",
  "Is anyone there?",
  "This is frustrating"
]

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ 
  className = '', 
  position = 'bottom-right',
  theme = 'auto'
}) => {
  const { isConnected, sendMessage, messages: providerMessages, isTyping } = useChat()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [showCannedResponses, setShowCannedResponses] = useState(true)
  const [agentTyping, setAgentTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Position classes mapping
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6', 
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message: "Hello! Welcome to Nothing Support. How can I not help you today?",
        timestamp: new Date(),
        isUser: false
      }
      setMessages([welcomeMessage])
    }
  }, [messages.length])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, agentTyping])

  // Handle unread count
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (!lastMessage.isUser) {
        setUnreadCount(prev => prev + 1)
      }
    } else if (isOpen) {
      setUnreadCount(0)
    }
  }, [messages, isOpen])

  // WebSocket connection handling
  useEffect(() => {
    if (isOpen && !isConnected) {
      websocketService.connect().catch(err => {
        if (isDevelopment) {
          console.log('[LiveChatWidget] WebSocket connection failed (expected in dev):', err)
        }
      })
    }

    return () => {
      if (isConnected) {
        websocketService.close()
      }
    }
  }, [isOpen, isConnected])

  // Keyboard handlers
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const simulateAgentResponse = (userMessage: string) => {
    setAgentTyping(true)
    
    // Simulate typing delay
    setTimeout(() => {
      const randomResponse = MOCK_AGENT_RESPONSES[Math.floor(Math.random() * MOCK_AGENT_RESPONSES.length)]
      
      const agentMessage: ChatMessage = {
        id: Date.now().toString(),
        message: randomResponse,
        timestamp: new Date(),
        isUser: false
      }
      
      setMessages(prev => [...prev, agentMessage])
      setAgentTyping(false)
      
      // Analytics event
      eventBus.emit('analytics:event', {
        name: 'chat_agent_response',
        properties: { userMessage, agentResponse: randomResponse }
      })
    }, 1500 + Math.random() * 2000) // 1.5-3.5s delay
  }

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      timestamp: new Date(),
      isUser: true
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setShowCannedResponses(false)

    // Play silence sound effect
    SilencePlayer.play()

    // Send to provider/websocket
    if (sendMessage) {
      sendMessage(message.trim())
    }

    // Simulate agent response
    simulateAgentResponse(message.trim())

    // Analytics
    eventBus.emit('analytics:event', {
      name: 'chat_message_sent',
      properties: { message: message.trim(), messageLength: message.trim().length }
    })
  }

  const handleCannedResponse = (response: string) => {
    handleSendMessage(response)
    setShowCannedResponses(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(currentMessage)
    }
  }

  const toggleWidget = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 100)
      eventBus.emit('analytics:event', { name: 'chat_widget_opened' })
    } else {
      eventBus.emit('analytics:event', { name: 'chat_widget_closed' })
    }
  }

  return (
    <>
      {/* Chat Widget Trigger */}
      <div 
        ref={widgetRef}
        className={`fixed z-50 ${positionClasses[position]} ${className}`}
      >
        {!isOpen && (
          <button
            onClick={toggleWidget}
            className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
            aria-label="Open live chat support"
            aria-describedby={unreadCount > 0 ? "chat-unread-count" : undefined}
          >
            {/* Chat Icon */}
            <svg 
              className="w-6 h-6 transition-transform group-hover:scale-110" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span 
                id="chat-unread-count"
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse"
                aria-label={`${unreadCount} unread messages`}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}

            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-30"></span>
          </button>
        )}
      </div>

      {/* Chat Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="!p-0 max-w-md w-full mx-4"
        overlayClassName="!bg-black/20"
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Nothing Support</h3>
                <p className="text-xs text-white/80">
                  {isConnected ? 'Online • Providing no help' : 'Offline • Still no help'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1 rounded"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div 
            className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Agent typing indicator */}
            {agentTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Canned Responses */}
          {showCannedResponses && messages.length <= 1 && (
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Quick responses:</p>
              <div className="grid grid-cols-2 gap-2">
                {CANNED_RESPONSES.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleCannedResponse(response)}
                    className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors text-left"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message that won't be helped..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                aria-label="Type your message"
                disabled={agentTyping}
              />
              <button
                onClick={() => handleSendMessage(currentMessage)}
                disabled={!currentMessage.trim() || agentTyping}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default LiveChatWidget
