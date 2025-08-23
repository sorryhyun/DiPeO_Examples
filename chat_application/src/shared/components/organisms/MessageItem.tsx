import React from 'react';
import { Message } from '../../../types';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';
import EmojiPicker from '../molecules/EmojiPicker';
import PresenceIndicator from '../molecules/PresenceIndicator';
import { formatDate } from '../../../utils/formatDate';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onReact: (emoji: string) => void;
  onOpenThread: (messageId: string) => void;
  onReply?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  onReact,
  onOpenThread,
  onReply
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onReact(emoji);
    setShowEmojiPicker(false);
  };

  const handleThreadClick = () => {
    onOpenThread(message.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className={`flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0 relative">
        <Avatar
          src={message.sender.avatar}
          alt={message.sender.name}
          size="md"
        />
        <PresenceIndicator 
          status={message.sender.status}
          className="absolute -bottom-1 -right-1"
        />
      </div>

      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
        {/* Header */}
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {message.sender.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(message.timestamp)}
          </span>
        </div>

        {/* Content */}
        <div className={`mb-2 ${isOwn ? 'text-right' : ''}`}>
          <div className={`inline-block p-3 rounded-lg max-w-prose ${
            isOwn 
              ? 'bg-blue-500 text-white rounded-br-sm' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
          }`}>
            <p className="whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={`mb-2 ${isOwn ? 'text-right' : ''}`}>
            <div className="space-y-1">
              {message.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon name="paperclip" className="w-4 h-4" />
                  <span className="truncate max-w-xs">{attachment.name}</span>
                  <span className="text-xs text-gray-500">
                    {attachment.size ? `(${Math.round(attachment.size / 1024)}KB)` : ''}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mb-2 ${isOwn ? 'justify-end' : ''}`}>
            {message.reactions.map((reaction) => (
              <button
                key={`${reaction.emoji}-${reaction.count}`}
                onClick={() => onReact(reaction.emoji)}
                onKeyDown={(e) => handleKeyDown(e, () => onReact(reaction.emoji))}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`React with ${reaction.emoji}, ${reaction.count} reaction${reaction.count !== 1 ? 's' : ''}`}
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-600 dark:text-gray-300">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className={`flex items-center gap-2 ${isOwn ? 'justify-end' : ''}`}>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              onKeyDown={(e) => handleKeyDown(e, () => setShowEmojiPicker(!showEmojiPicker))}
              aria-label="Add reaction"
              aria-expanded={showEmojiPicker}
              className="p-1"
            >
              <Icon name="smile" className="w-4 h-4" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 z-10">
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          {message.threadCount && message.threadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleThreadClick}
              onKeyDown={(e) => handleKeyDown(e, handleThreadClick)}
              aria-label={`Open thread, ${message.threadCount} repl${message.threadCount !== 1 ? 'ies' : 'y'}`}
              className="p-1 text-xs"
            >
              <Icon name="message-circle" className="w-4 h-4" />
              <span>{message.threadCount}</span>
            </Button>
          )}

          {!message.threadCount && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleThreadClick}
              onKeyDown={(e) => handleKeyDown(e, handleThreadClick)}
              aria-label="Start thread"
              className="p-1"
            >
              <Icon name="message-circle" className="w-4 h-4" />
            </Button>
          )}

          {onReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReply}
              onKeyDown={(e) => handleKeyDown(e, onReply)}
              aria-label="Reply to message"
              className="p-1"
            >
              <Icon name="reply" className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
