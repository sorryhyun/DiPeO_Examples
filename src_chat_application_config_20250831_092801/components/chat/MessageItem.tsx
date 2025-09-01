import React, { useState, useCallback, useMemo } from 'react';
import { Message, User, MessageReaction, FileAttachment, ApiResult } from '@/core/contracts';
import { appConfig } from '@/app/config';
import { events } from '@/core/events';
import { debugLog, formatTimeAgo, generateId } from '@/core/utils';
import { Avatar } from '@/components/ui/Avatar';
import { ReactionPicker } from '@/components/chat/ReactionPicker';
import { useAuth } from '@/providers/AuthProvider';
import { useSocket } from '@/hooks/useSocket';
import { reactionsService } from '@/services/reactions.service';

interface MessageItemProps {
  message: Message;
  isThreaded?: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onOpenThread?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isThreaded = false,
  showAvatar = true,
  showTimestamp = true,
  onOpenThread,
  onReply,
  onEdit,
  onDelete,
  className = ''
}) => {
  const { user: currentUser } = useAuth();
  const { emit } = useSocket();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isOwnMessage = currentUser?.id === message.authorId;
  const hasReactions = message.reactions && message.reactions.length > 0;
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasThread = message.threadCount && message.threadCount > 0;

  // Format message timestamp
  const formattedTime = useMemo(() => {
    return formatTimeAgo(new Date(message.createdAt));
  }, [message.createdAt]);

  // Handle reaction addition
  const handleAddReaction = useCallback(async (emoji: string) => {
    if (!currentUser) {
      debugLog('warn', 'Cannot add reaction: user not authenticated');
      return;
    }

    setIsLoading(true);
    setShowReactionPicker(false);

    try {
      const result = await reactionsService.addReaction({
        messageId: message.id,
        emoji
      });
      
      if (result.ok) {
        // Emit socket event for real-time updates
        emit({
          type: 'reaction:add',
          payload: {
            messageId: message.id,
            emoji,
            userId: currentUser.id
          }
        });

        // Emit local event
        events.emit('reaction:added', {
          messageId: message.id,
          emoji,
          userId: currentUser.id
        });

        debugLog('info', 'Reaction added', { messageId: message.id, emoji });
      } else {
        debugLog('error', 'Failed to add reaction', result.error);
      }
    } catch (error) {
      debugLog('error', 'Error adding reaction', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, message.id, emit]);

  // Handle reaction removal
  const handleRemoveReaction = useCallback(async (emoji: string) => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      const result = await reactionsService.removeReaction({
        messageId: message.id,
        emoji,
        userId: currentUser.id
      });
      
      if (result.ok) {
        // Emit socket event for real-time updates
        emit({
          type: 'reaction:remove',
          payload: {
            messageId: message.id,
            emoji,
            userId: currentUser.id
          }
        });

        // Emit local event
        events.emit('reaction:removed', {
          messageId: message.id,
          emoji,
          userId: currentUser.id
        });

        debugLog('info', 'Reaction removed', { messageId: message.id, emoji });
      } else {
        debugLog('error', 'Failed to remove reaction', result.error);
      }
    } catch (error) {
      debugLog('error', 'Error removing reaction', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, message.id, emit]);

  // Handle thread opening
  const handleOpenThread = useCallback(() => {
    if (onOpenThread) {
      onOpenThread(message.id);
      events.emit('thread:opened', { messageId: message.id });
    }
  }, [message.id, onOpenThread]);

  // Handle message actions
  const handleReply = useCallback(() => {
    if (onReply) {
      onReply(message);
    }
  }, [message, onReply]);

  const handleEdit = useCallback(() => {
    if (onEdit && isOwnMessage) {
      onEdit(message);
    }
  }, [message, onEdit, isOwnMessage]);

  const handleDelete = useCallback(() => {
    if (onDelete && isOwnMessage) {
      if (window.confirm('Are you sure you want to delete this message?')) {
        onDelete(message.id);
      }
    }
  }, [message.id, onDelete, isOwnMessage]);

  // Render message content with mentions highlighting
  const renderMessageContent = useCallback((content: string) => {
    if (!content) return null;

    // Simple mention detection and highlighting
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return (
      <span className="text-gray-900 dark:text-gray-100 leading-relaxed">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            // This is a mention
            return (
              <span
                key={index}
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded font-medium"
                role="button"
                tabIndex={0}
              >
                @{part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  }, []);

  // Render file attachments
  const renderAttachments = useCallback((attachments: FileAttachment[]) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border"
          >
            <div className="flex-shrink-0">
              {attachment.type.startsWith('image/') ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-16 h-16 object-cover rounded"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {attachment.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {attachment.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(attachment.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <a
              href={attachment.url}
              download={attachment.name}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              aria-label={`Download ${attachment.name}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    );
  }, []);

  // Render reactions
  const renderReactions = useCallback((reactions: MessageReaction[]) => {
    if (!reactions || reactions.length === 0) return null;

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {} as Record<string, MessageReaction[]>);

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(groupedReactions).map(([emoji, reactionGroup]) => {
          const userReacted = currentUser && reactionGroup.some(r => r.userId === currentUser.id);
          const count = reactionGroup.length;
          
          return (
            <button
              key={emoji}
              onClick={() => userReacted ? handleRemoveReaction(emoji) : handleAddReaction(emoji)}
              disabled={isLoading}
              className={`
                flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors
                ${userReacted 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ring-1 ring-blue-300 dark:ring-blue-700' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
              aria-label={`${userReacted ? 'Remove' : 'Add'} ${emoji} reaction. ${count} user${count !== 1 ? 's' : ''} reacted.`}
            >
              <span>{emoji}</span>
              <span>{count}</span>
            </button>
          );
        })}
        
        {/* Add reaction button */}
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Add reaction"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 z-10">
              <ReactionPicker
                onEmojiSelect={handleAddReaction}
                onClose={() => setShowReactionPicker(false)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }, [currentUser, isLoading, showReactionPicker, handleAddReaction, handleRemoveReaction]);

  return (
    <div
      className={`
        group flex space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
        ${isThreaded ? 'pl-12' : ''}
        ${className}
      `}
      role="article"
      aria-labelledby={`message-${message.id}-author`}
      data-message-id={message.id}
    >
      {/* Avatar */}
      {showAvatar && !isThreaded && (
        <div className="flex-shrink-0">
          <Avatar 
            user={message.author} 
            size="sm"
            showStatus={false}
          />
        </div>
      )}
      
      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Message header */}
        <div className="flex items-center space-x-2 mb-1">
          <h4 
            id={`message-${message.id}-author`}
            className="text-sm font-semibold text-gray-900 dark:text-gray-100"
          >
            {message.author.displayName || message.author.email}
          </h4>
          
          {showTimestamp && (
            <time 
              className="text-xs text-gray-500 dark:text-gray-400"
              dateTime={message.createdAt}
              title={new Date(message.createdAt).toLocaleString()}
            >
              {formattedTime}
            </time>
          )}
          
          {message.isEdited && (
            <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
          )}
        </div>
        
        {/* Message body */}
        <div className="text-sm">
          {renderMessageContent(message.content)}
        </div>
        
        {/* Attachments */}
        {hasAttachments && renderAttachments(message.attachments!)}
        
        {/* Reactions */}
        {hasReactions && renderReactions(message.reactions!)}
        
        {/* Thread preview */}
        {hasThread && !isThreaded && (
          <button
            onClick={handleOpenThread}
            className="mt-2 flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            aria-label={`Open thread with ${message.threadCount} repl${message.threadCount !== 1 ? 'ies' : 'y'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{message.threadCount} repl{message.threadCount !== 1 ? 'ies' : 'y'}</span>
          </button>
        )}
        
        {/* Message actions (visible on hover) */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2 mt-2 transition-opacity">
          {onReply && (
            <button
              onClick={handleReply}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Reply to message"
            >
              Reply
            </button>
          )}
          
          {!isThreaded && onOpenThread && (
            <button
              onClick={handleOpenThread}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Start thread"
            >
              Thread
            </button>
          )}
          
          {isOwnMessage && onEdit && (
            <button
              onClick={handleEdit}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Edit message"
            >
              Edit
            </button>
          )}
          
          {isOwnMessage && onDelete && (
            <button
              onClick={handleDelete}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              aria-label="Delete message"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
