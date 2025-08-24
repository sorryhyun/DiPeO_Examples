import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import supportService from '@/services/supportService';
import { trackEvent } from '@/utils/analytics';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SupportChatBotProps {
  className?: string;
}

export const SupportChatBot: React.FC<SupportChatBotProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useLocalStorage<Message[]>('support-chat-messages', []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      trackEvent({
        event: 'support_chat_opened',
        category: 'interaction',
        properties: { user_id: user?.id },
        sessionId: 'session-' + Date.now(),
        timestamp: new Date().toISOString(),
        page: 'support'
      });
    } else {
      trackEvent({
        event: 'support_chat_closed',
        category: 'interaction',
        properties: { user_id: user?.id },
        sessionId: 'session-' + Date.now(),
        timestamp: new Date().toISOString(),
        page: 'support'
      });
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    trackEvent({
      event: 'support_message_sent',
      category: 'interaction',
      properties: { 
        user_id: user?.id,
        message_length: userMessage.text.length
      },
      sessionId: 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      page: 'support'
    });

    try {
      const response = await supportService.sendMessage(userMessage.text);
      
      // Simulate typing delay
      setTimeout(() => {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: response.message,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000 + Math.random() * 2000); // 1-3 second delay
    } catch (error) {
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        text: "I'm having trouble connecting right now. But honestly, I probably couldn't help anyway. 🤷‍♀️",
        sender: 'bot',
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    trackEvent({
      event: 'support_chat_cleared',
      category: 'interaction',
      properties: { user_id: user?.id },
      sessionId: 'session-' + Date.now(),
      timestamp: new Date().toISOString(),
      page: 'support'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        variant="primary"
        className={`rounded-full w-14 h-14 shadow-lg transition-all duration-300 ${
          isOpen ? 'rotate-45' : 'hover:scale-110'
        }`}
        aria-label="Toggle support chat"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
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
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Support chat"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                "Support" Chat
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Definitely not helpful since 2024
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={clearChat}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2"
                aria-label="Clear chat history"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
</Button>
              <Button
                onClick={toggleChat}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2"
                aria-label="Close chat"
              >
                ×
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                <p className="mb-2">👋 Hi there!</p>
                <p>I'm here to provide absolutely no assistance whatsoever.</p>
                <p className="text-xs mt-2 opacity-75">Go ahead, try me!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 opacity-70 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 max-w-[80%]">
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

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything (and get nothing)..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                aria-label="Type your message"
              />
              <Button
                onClick={sendMessage}
                variant="primary"
                size="sm"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
