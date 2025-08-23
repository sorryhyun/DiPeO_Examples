import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { X, MessageCircle, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Avatar } from '../../shared/components/Avatar';
import { Spinner } from '../../shared/components/Spinner';
import { useLocalStorage } from '../../shared/hooks/useLocalStorage';
import { supportService } from '../../services/supportService';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface SupportChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({
  isOpen = false,
  onClose = () => {}
}) => {
  const [isWidgetOpen, setIsWidgetOpen] = useState(isOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useLocalStorage<Message[]>('support-chat-messages', [
    {
      id: '1',
      content: "Hi! I'm here to provide absolutely no help with your questions about Nothing™. How can I not assist you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await supportService.sendMessage(inputValue.trim());
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message || "I'm sorry, but I can't help you with that. That's kind of the point of Nothing™.",
        isBot: true,
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 800); // Simulate typing delay
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing technical difficulties providing no help. Please try not getting help again later.",
        isBot: true,
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
      }, 800);
    }
  }, [inputValue, isLoading, setMessages]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const toggleWidget = useCallback(() => {
    setIsWidgetOpen(!isWidgetOpen);
    if (isWidgetOpen) {
      onClose();
    }
  }, [isWidgetOpen, onClose]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: "Chat cleared. I'm still here to not help you with anything!",
        isBot: true,
        timestamp: new Date()
      }
    ]);
  }, [setMessages]);

  useEffect(() => {
    setIsWidgetOpen(isOpen);
  }, [isOpen]);

  // Floating Action Button
  if (!isWidgetOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleWidget}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-96'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Avatar 
              src="/api/placeholder/32/32" 
              alt="Support Bot"
              className="w-8 h-8"
            />
            <div>
              <h3 className="text-white font-semibold text-sm">Nothing™ Support</h3>
              <p className="text-purple-100 text-xs">Online (not helping)</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              onClick={toggleMinimize}
              className="p-1 hover:bg-white/20 rounded text-white"
              variant="ghost"
              size="sm"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              onClick={toggleWidget}
              className="p-1 hover:bg-white/20 rounded text-white"
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        {!isMinimized && (
          <>
            <div className="flex-1 p-4 space-y-4 h-64 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isBot ? 'text-gray-500 dark:text-gray-400' : 'text-purple-100'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center space-x-2">
                    <Spinner size="sm" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Not typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask for help (you won't get any)..."
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />
<Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={clearMessages}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear chat
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Powered by Nothing™
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportChatWidget;
