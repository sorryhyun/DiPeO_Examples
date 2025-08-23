import React from 'react';
import { Message } from '../../../types';
import MessageItem from './MessageItem';
import Button from '../atoms/Button';
import Spinner from '../atoms/Spinner';

interface MessageListProps {
  messages: Message[];
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  highlightMessageId?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onLoadMore,
  isLoadingMore = false,
  highlightMessageId
}) => {
  // Limit rendered messages for performance (simple virtualization)
  const MAX_RENDERED_MESSAGES = 200;
  const renderedMessages = messages.slice(-MAX_RENDERED_MESSAGES);
  const hasMoreMessages = messages.length > MAX_RENDERED_MESSAGES;

  return (
    <div className="flex flex-col h-full">
      {/* Load more section at top */}
      {(onLoadMore && (hasMoreMessages || messages.length > 0)) && (
        <div className="flex justify-center py-4 border-b border-gray-200 dark:border-gray-700">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Spinner size="sm" />
              <span className="text-sm">Loading more messages...</span>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={onLoadMore}
              className="text-sm"
            >
              Load more messages
            </Button>
          )}
        </div>
      )}

      {/* Messages list */}
      <div
        role="list"
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
        aria-label="Messages"
      >
        {renderedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-center">
              No messages yet.<br />
              <span className="text-sm">Start the conversation!</span>
            </p>
          </div>
        ) : (
          renderedMessages.map((message) => (
            <div
              key={message.id}
              role="listitem"
              className={`${
                highlightMessageId === message.id
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 rounded-md -mx-2 px-2'
                  : ''
              }`}
            >
              <MessageItem
                message={message}
                isHighlighted={highlightMessageId === message.id}
              />
            </div>
          ))
        )}

        {/* Scroll anchor for auto-scroll to bottom */}
        <div id="messages-bottom" aria-hidden="true" />
      </div>
    </div>
  );
};

export default MessageList;
