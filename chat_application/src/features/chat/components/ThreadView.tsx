import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { fetchThread, sendMessage } from '../../../services/endpoints/messages';
import MessageList from '../../../shared/components/organisms/MessageList';
import Composer from '../../../shared/components/organisms/Composer';
import Button from '../../../shared/components/atoms/Button';
import type { ComposerPayload } from '../../../shared/components/organisms/Composer';

interface ThreadViewProps {
  threadId: string;
  onClose: () => void;
}

export default function ThreadView({ 
  threadId, 
  onClose 
}: ThreadViewProps) {

  const {
    data: threadData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => fetchThread(threadId!),
    enabled: !!threadId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // For now, return empty messages until we implement proper message fetching from thread
  const threadMessages = threadData ? [] : [];

  const handleSendReply = useCallback(async (payload: ComposerPayload) => {
    if (!threadId) return;

    await sendMessage({
      channelId: 'current-channel', // This would come from context in real app
      content: payload.content,
      threadId,
      senderId: 'current-user', // This would come from auth context in real app
    });
    // TODO: Handle attachments if needed
  }, [threadId]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!threadId) {
    return null;
  }

  return (
    <div 
      className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Thread
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-2"
          aria-label="Close thread"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Thread Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">
                Failed to load thread
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && threadMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-gray-500 dark:text-gray-400">
              No messages in this thread yet
            </p>
          </div>
        )}

        {!isLoading && !error && threadMessages.length > 0 && (
          <div className="flex-1 overflow-hidden">
            <MessageList
              messages={threadMessages}
              isLoadingMore={false}
              onLoadMore={() => {}}
            />
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Composer
            onSend={handleSendReply}
            placeholder="Reply to thread..."
            disabled={isLoading || !!error}
          />
        </div>
      </div>
    </div>
  );
}
