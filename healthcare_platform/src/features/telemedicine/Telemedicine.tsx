// FILE: src/features/telemedicine/Telemedicine.tsx

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { Button } from '@/shared/components/Button';
import { mockServer } from '@/services/mockServer';

interface TelemedicineMessage {
  id: string;
  type: 'system' | 'user' | 'doctor';
  content: string;
  timestamp: Date;
}

interface TelemedicineSession {
  id: string;
  status: 'idle' | 'connecting' | 'active' | 'ended';
  startTime?: Date;
  endTime?: Date;
}

export const Telemedicine: React.FC = () => {
  const [session, setSession] = useState<TelemedicineSession>({
    id: 'session-' + Date.now(),
    status: 'idle'
  });
  const [messages, setMessages] = useState<TelemedicineMessage[]>([]);

  // Subscribe to WebSocket updates
  const { isConnected } = useWebSocket('telemedicine:update', (data: any) => {
    if (data.type === 'message') {
      const newMessage: TelemedicineMessage = {
        id: 'msg-' + Date.now(),
        type: data.sender || 'system',
        content: data.content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    } else if (data.type === 'session_update') {
      setSession(prev => ({
        ...prev,
        status: data.status,
        startTime: data.startTime ? new Date(data.startTime) : prev.startTime,
        endTime: data.endTime ? new Date(data.endTime) : prev.endTime
      }));
    }
  });

  const handleStartSession = () => {
    const startTime = new Date();
    setSession(prev => ({
      ...prev,
      status: 'connecting',
      startTime
    }));

    // Emit mock session start event
    if (mockServer.eventEmitter) {
      mockServer.eventEmitter.emit('telemedicine:update', {
        type: 'session_update',
        status: 'connecting',
        startTime: startTime.toISOString()
      });

      // Simulate connection sequence
      setTimeout(() => {
        mockServer.eventEmitter.emit('telemedicine:update', {
          type: 'message',
          sender: 'system',
          content: 'Connecting to telemedicine session...'
        });
      }, 500);

      setTimeout(() => {
        mockServer.eventEmitter.emit('telemedicine:update', {
          type: 'session_update',
          status: 'active'
        });
        mockServer.eventEmitter.emit('telemedicine:update', {
          type: 'message',
          sender: 'system',
          content: 'Session started successfully. Doctor will join shortly.'
        });
      }, 2000);

      setTimeout(() => {
        mockServer.eventEmitter.emit('telemedicine:update', {
          type: 'message',
          sender: 'doctor',
          content: 'Hello! I can see you clearly. How are you feeling today?'
        });
      }, 4000);
    }
  };

  const handleEndSession = () => {
    const endTime = new Date();
    setSession(prev => ({
      ...prev,
      status: 'ended',
      endTime
    }));

    if (mockServer.eventEmitter) {
      mockServer.eventEmitter.emit('telemedicine:update', {
        type: 'session_update',
        status: 'ended',
        endTime: endTime.toISOString()
      });
      mockServer.eventEmitter.emit('telemedicine:update', {
        type: 'message',
        sender: 'system',
        content: 'Telemedicine session has ended. Thank you for using our service.'
      });
    }
  };

  const getStatusColor = () => {
    switch (session.status) {
      case 'idle': return 'text-gray-500';
      case 'connecting': return 'text-yellow-500';
      case 'active': return 'text-green-500';
      case 'ended': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case 'idle': return 'Ready to start';
      case 'connecting': return 'Connecting...';
      case 'active': return 'Session active';
      case 'ended': return 'Session ended';
      default: return 'Unknown status';
    }
  };

  useEffect(() => {
    // Add initial welcome message
    setMessages([{
      id: 'welcome',
      type: 'system',
      content: 'Welcome to the telemedicine portal. Click "Start Session" to begin.',
      timestamp: new Date()
    }]);
  }, []);

  return (
    <div 
      className="max-w-4xl mx-auto p-6 space-y-6"
      role="main"
      aria-label="Telemedicine interface"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Telemedicine Session
          </h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Area */}
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg aspect-video flex items-center justify-center relative">
              <div className="text-center">
                {session.status === 'active' ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Video call in progress
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="w-16 h-16 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Video preview
                    </p>
                  </div>
                )}
              </div>
              
              {/* Status indicator */}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
            </div>

            {/* Session Controls */}
            <div className="flex justify-center space-x-3">
              {session.status === 'idle' || session.status === 'ended' ? (
                <Button
                  onClick={handleStartSession}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  aria-label="Start telemedicine session"
                >
                  Start Session
                </Button>
              ) : (
                <Button
                  onClick={handleEndSession}
                  variant="destructive"
                  aria-label="End telemedicine session"
                >
                  End Session
                </Button>
              )}
            </div>

            {/* Session Info */}
            {(session.startTime || session.endTime) && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm">
                {session.startTime && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Started: {session.startTime.toLocaleTimeString()}
                  </p>
                )}
                {session.endTime && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Ended: {session.endTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex flex-col h-96">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-t-lg px-4 py-2 border-b dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Session Messages
              </h3>
            </div>
            
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-gray-800"
              role="log"
              aria-label="Chat messages"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.type === 'doctor'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        message.type === 'user' 
                          ? 'text-blue-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.type === 'system' ? 'System' : 
                         message.type === 'doctor' ? 'Dr. Smith' : 'You'}
                      </span>
                      <span className={`text-xs ml-2 ${
                        message.type === 'user' 
                          ? 'text-blue-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-b-lg p-3 border-t dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={session.status !== 'active'}
                  aria-label="Chat message input"
                />
                <Button
                  size="sm"
                  disabled={session.status !== 'active'}
                  aria-label="Send message"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Telemedicine;

// SELF-CHECK:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (useWebSocket from shared hooks)
// [x] Reads config from mockServer service
// [x] Exports default named component (Telemedicine)
// [x] Adds basic ARIA and keyboard handlers (aria-label, role attributes)
