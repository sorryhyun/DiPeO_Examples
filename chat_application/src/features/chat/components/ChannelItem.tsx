import React from 'react';
import { Avatar } from '../../../shared/components/atoms/Avatar';
import { formatDate } from '../../../utils/formatDate';

interface Channel {
  id: string;
  name: string;
  type: 'dm' | 'group';
  lastMessage?: {
    content: string;
    timestamp: string;
    sender?: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  unreadCount?: number;
  members?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

interface ChannelItemProps {
  channel: Channel;
  active: boolean;
  onSelect: (id: string) => void;
}

export const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  active,
  onSelect,
}) => {
  const handleClick = () => {
    onSelect(channel.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(channel.id);
    }
  };

  const getChannelAvatar = () => {
    if (channel.type === 'dm' && channel.members?.[0]) {
      return channel.members[0].avatar;
    }
    return undefined;
  };

  const getChannelName = () => {
    if (channel.type === 'dm' && channel.members?.[0]) {
      return channel.members[0].name;
    }
    return channel.name;
  };

  const getLastMessagePreview = () => {
    if (!channel.lastMessage) return 'No messages';
    
    const content = channel.lastMessage.content;
    const maxLength = 50;
    return content.length > maxLength 
      ? `${content.substring(0, maxLength)}...`
      : content;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`
        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
        hover:bg-gray-100 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${active 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
          : 'border-l-4 border-transparent'
        }
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-selected={active}
    >
      <Avatar
        src={getChannelAvatar()}
        alt={getChannelName()}
        size="md"
        fallback={getChannelName().charAt(0).toUpperCase()}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`
            font-medium text-sm truncate
            ${active 
              ? 'text-blue-700 dark:text-blue-300' 
              : 'text-gray-900 dark:text-gray-100'
            }
          `}>
            {getChannelName()}
          </h3>
          
          {channel.lastMessage && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
              {formatDate(channel.lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
            {getLastMessagePreview()}
          </p>
          
          {channel.unreadCount && channel.unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2 flex-shrink-0">
              {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
