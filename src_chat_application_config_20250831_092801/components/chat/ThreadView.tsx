import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Thread, Message, MessageCreateDTO } from '@/core/contracts';
import { useAuth } from '@/hooks/useAuth';
import { createThread, fetchThread, fetchThreadMessages, postToThread, findThreadByParentMessage } from '@/services/threads.service';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatShortDate } from '@/core/utils';
import { debugLog } from '@/core/utils';
import { events } from '@/core/events';

interface ThreadViewProps {
  threadId: string | null;
  parentMessage?: Message;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ThreadView({ 
  threadId, 
  parentMessage, 
  isOpen, 
  onClose, 
  className = '' 
}: ThreadViewProps) {
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load thread data when threadId changes
  useEffect(() => {
    if (!threadId || !isOpen) {
      setThread(null);
      setMessages([]);
      return;
    }

    const loadThread = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load thread details
        const threadResult = await fetchThread(threadId);
        if (!threadResult.ok) {
          throw new Error(threadResult.error?.message || 'Failed to load thread');
        }

        setThread(threadResult.data);

        // Load thread messages
        const messagesResult = await fetchThreadMessages(threadId);
        if (!messagesResult.ok) {
          throw new Error(messagesResult.error?.message || 'Failed to load thread messages');
        }

        setMessages(messagesResult.data?.items || []);
        debugLog('debug', 'Thread loaded successfully', { threadId, messageCount: messagesResult.data?.items?.length });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load thread';
        setError(errorMessage);
        debugLog('error', 'Failed to load thread', { threadId, error: err });
      } finally {
        setIsLoading(false);
      }
    };

    loadThread();
  }, [threadId, isOpen]);

  // Listen for new thread messages via events
  useEffect(() => {
    if (!threadId || !isOpen) return;

    const handleThreadMessage = (payload: { message: Message }) => {
      const { message } = payload;
      if (message.threadId === threadId) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;
          
          return [...prev, message].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    };

    const subscription = events.on('message:created', handleThreadMessage);
    return () => subscription.unsubscribe();
  }, [threadId, isOpen]);

  // Handle thread reply submission
  const handleReply = useCallback(async (content: string, files?: File[]) => {
    if (!threadId || !user || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const messageDto: MessageCreateDTO = {
        channelId: thread?.channelId || parentMessage?.channelId || '',
        text: content.trim(),
        type: 'text',
        metadata: {
          isThreadReply: true
        }
      };

      // Handle file uploads if present
      if (files && files.length > 0) {
        messageDto.metadata = {
          ...messageDto.metadata,
          hasFiles: true,
          fileCount: files.length
        };
      }

      const result = await postToThread({ threadId, ...messageDto });
      
      if (!result.ok) {
        throw new Error(result.error?.message || 'Failed to send reply');
      }

      debugLog('info', 'Thread reply sent successfully', { threadId, messageId: result.data?.id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reply';
      setError(errorMessage);
      debugLog('error', 'Failed to send thread reply', { threadId, error: err });
    } finally {
      setIsSubmitting(false);
    }
  }, [threadId, thread?.channelId, parentMessage?.channelId, user]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Computed thread info
  const threadInfo = useMemo(() => {
    if (!thread && !parentMessage) return null;

    const replyCount = messages.length;
    const participants = thread?.participants || [];
    const lastReplyDate = messages.length > 0 ? messages[messages.length - 1].createdAt : null;

    return {
      replyCount,
      participants,
      lastReplyDate
    };
  }, [thread, parentMessage, messages]);

  // Don't render if not open
  if (!isOpen || !threadId) {
    return null;
  }

  return (
    <div 
      className={`flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 ${className}`}
      role="dialog"
      aria-labelledby="thread-title"
      aria-describedby="thread-description"
    >
      {/* Thread Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 
              id="thread-title"
              className="text-lg font-semibold text-gray-900 dark:text-white truncate"
            >
              Thread
            </h2>
            {threadInfo && (
              <p 
                id="thread-description"
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {threadInfo.replyCount} {threadInfo.replyCount === 1 ? 'reply' : 'replies'}
                {threadInfo.lastReplyDate && (
                  <> • Last reply {formatShortDate(threadInfo.lastReplyDate)}</>
                )}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-2"
            aria-label="Close thread"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Parent Message Context */}
      {parentMessage && (
        <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Original message
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {parentMessage.userId?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {parentMessage.userId}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatShortDate(parentMessage.createdAt)}
              </span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {parentMessage.text || 'No text content'}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-shrink-0 p-4 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      )}

      {/* Thread Messages */}
      {!isLoading && (
        <div className="flex-1 flex flex-col min-h-0">
          {messages.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <MessageList 
                messages={messages}
                showChannelIndicator={false}
                className="p-4"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.347-.306c-.584.296-1.925.864-3.653.864 1.5-1.172 2-2.345 2-3.558 0-.865-.15-1.693-.425-2.465A8.001 8.001 0 0121 12z" />
                </svg>
                <p className="text-sm">No replies yet</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            </div>
          )}

          {/* Thread Reply Input */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
            <MessageInput
              onSendMessage={handleReply}
              disabled={isSubmitting}
              placeholder="Reply to thread..."
              className="border-0 rounded-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ThreadView;
