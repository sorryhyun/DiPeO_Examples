import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Channel, ChannelType, Message } from '@/core/contracts';
import { fetchChannels } from '@/services/channels.service';
import { fetchMessages } from '@/services/messages.service';
import { useAuth } from '@/hooks/useAuth';
import { events } from '@/core/events';
import { formatTimestamp } from '@/core/utils';
import Avatar from '@/components/ui/Avatar';

interface ChannelWithLastMessage extends Channel {
  lastMessage?: Message;
  unreadCount: number;
}

interface ChannelListProps {
  onChannelSelect?: (channel: Channel) => void;
  className?: string;
}

const ChannelList: React.FC<ChannelListProps> = ({ onChannelSelect, className = '' }) => {
  const { user } = useAuth();
  const { channelId: activeChannelId } = useParams<{ channelId: string }>();
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Fetch channels
  const {
    data: channels = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['channels', user?.id],
    queryFn: fetchChannels,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch last messages for each channel
  const { data: lastMessages = {} } = useQuery({
    queryKey: ['channels', 'lastMessages', channels.map(c => c.id).join(',')],
    queryFn: async (): Promise<Record<string, Message>> => {
      if (!channels.length) return {};
      
      const messagePromises = channels.map(async (channel) => {
        try {
          const result = await fetchMessages(channel.id, { limit: 1 });
          return { channelId: channel.id, message: result.items[0] };
        } catch {
          return { channelId: channel.id, message: null };
        }
      });

      const results = await Promise.all(messagePromises);
      return results.reduce((acc, { channelId, message }) => {
        if (message) acc[channelId] = message;
        return acc;
      }, {} as Record<string, Message>);
    },
    enabled: channels.length > 0,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Combine channels with last messages and unread counts
  const channelsWithLastMessage: ChannelWithLastMessage[] = channels.map(channel => ({
    ...channel,
    lastMessage: lastMessages[channel.id],
    unreadCount: unreadCounts[channel.id] || 0,
  }));

  // Sort channels by last message time, then by creation time
  const sortedChannels = [...channelsWithLastMessage].sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || a.createdAt;
    const bTime = b.lastMessage?.createdAt || b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!sortedChannels.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % sortedChannels.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + sortedChannels.length) % sortedChannels.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < sortedChannels.length) {
          const channel = sortedChannels[focusedIndex];
          onChannelSelect?.(channel);
        }
        break;
      case 'Escape':
        setFocusedIndex(-1);
        break;
    }
  }, [sortedChannels, focusedIndex, onChannelSelect]);

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Listen for real-time updates
  useEffect(() => {
    const handleMessageCreated = ({ message }: { message: Message }) => {
      // Update unread count if message is not from current user and not in active channel
      if (message.authorId !== user?.id && message.channelId !== activeChannelId) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.channelId]: (prev[message.channelId] || 0) + 1,
        }));
      }
      
      // Invalidate last messages query to update preview
      refetch();
    };

    const handleChannelUpdated = () => {
      refetch();
    };

    const subscription1 = events.on('message:created', handleMessageCreated);
    const subscription2 = events.on('channel:updated', handleChannelUpdated);

    return () => {
      subscription1.unsubscribe();
      subscription2.unsubscribe();
    };
  }, [user?.id, activeChannelId, refetch]);

  // Clear unread count when channel becomes active
  useEffect(() => {
    if (activeChannelId && unreadCounts[activeChannelId]) {
      setUnreadCounts(prev => ({
        ...prev,
        [activeChannelId]: 0,
      }));
    }
  }, [activeChannelId, unreadCounts]);

  const getChannelIcon = (channel: Channel) => {
    switch (channel.type) {
      case 'public':
        return '#';
      case 'private':
        return '🔒';
      case 'dm':
        return '@';
      default:
        return '#';
    }
  };

  const getChannelName = (channel: Channel) => {
    if (channel.type === 'dm' && user) {
      // For DMs, show the other user's name
      const otherUserId = channel.memberIds.find(id => id !== user.id);
      return `DM with ${otherUserId}`; // This would ideally resolve to username
    }
    return channel.name;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="p-4" role="status" aria-label="Loading channels">
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400" role="alert">
        <p>Failed to load channels</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!sortedChannels.length) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
        <p>No channels available</p>
        <p className="text-sm mt-1">Create a channel to get started</p>
      </div>
    );
  }

  return (
    <div className={`channel-list ${className}`}>
      <ul
        ref={listRef}
        role="listbox"
        aria-label="Channel list"
        className="space-y-1"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {sortedChannels.map((channel, index) => {
          const isActive = channel.id === activeChannelId;
          const isFocused = index === focusedIndex;
          const hasUnread = channel.unreadCount > 0;

          return (
            <li
              key={channel.id}
              ref={el => itemRefs.current[index] = el}
              role="option"
              aria-selected={isActive}
              tabIndex={isFocused ? 0 : -1}
              className={`
                relative rounded-lg transition-colors duration-150 cursor-pointer
                ${isActive 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }
                ${isFocused ? 'ring-2 ring-blue-500 ring-inset' : ''}
                ${hasUnread ? 'font-semibold' : ''}
              `}
              onClick={() => onChannelSelect?.(channel)}
              onFocus={() => setFocusedIndex(index)}
            >
              <Link
                to={`/channels/${channel.id}`}
                className="flex items-center p-3 w-full text-left focus:outline-none"
                aria-describedby={hasUnread ? `channel-${channel.id}-unread` : undefined}
              >
                <div className="flex items-center flex-1 min-w-0">
                  {/* Channel icon/avatar */}
                  <div className="flex-shrink-0 mr-3">
                    {channel.type === 'dm' ? (
                      <Avatar
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.id}`}
                        alt={`${getChannelName(channel)} avatar`}
                        size="sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold">
                        {getChannelIcon(channel)}
                      </div>
                    )}
                  </div>

                  {/* Channel info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium truncate">
                        {getChannelName(channel)}
                      </h3>
                      {channel.lastMessage && (
                        <time
                          className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2"
                          dateTime={channel.lastMessage.createdAt}
                        >
                          {formatTimestamp(channel.lastMessage.createdAt)}
                        </time>
                      )}
                    </div>
                    
                    {channel.lastMessage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {channel.lastMessage.text 
                          ? truncateText(channel.lastMessage.text, 50)
                          : channel.lastMessage.files?.length 
                            ? `📎 ${channel.lastMessage.files.length} file(s)`
                            : 'Message'
                        }
                      </p>
                    )}
                  </div>

                  {/* Unread indicator */}
                  {hasUnread && (
                    <div
                      id={`channel-${channel.id}-unread`}
                      className="flex-shrink-0 ml-2"
                      aria-label={`${channel.unreadCount} unread messages`}
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChannelList;
