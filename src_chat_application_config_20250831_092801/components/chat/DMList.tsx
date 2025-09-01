import React, { useState, useEffect, useMemo } from 'react';
import { User, Channel, PresenceStatus } from '@/core/contracts';
import { useAuth } from '@/providers/AuthProvider';
import { usersService } from '@/services/users.service';
import { presenceService } from '@/services/presence.service';
import { channelsService } from '@/services/channels.service';
import { PresenceDot } from '@/components/presence/PresenceDot';
import { debugLog } from '@/core/utils';
import { useQuery } from '@tanstack/react-query';

interface DMListProps {
  onSelectDM?: (dmChannel: Channel) => void;
  selectedChannelId?: string | null;
  className?: string;
}

interface UserWithPresence extends User {
  presenceStatus: PresenceStatus;
  lastSeen?: string;
}

interface DMChannel extends Channel {
  otherUser: UserWithPresence;
  lastMessageAt?: string;
  unreadCount?: number;
}

export function DMList({ onSelectDM, selectedChannelId, className = '' }: DMListProps) {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDMModal, setShowNewDMModal] = useState(false);

  // Fetch all users for potential DM creation
  const {
    data: usersResult,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.fetchUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user's DM channels
  const {
    data: channelsResult,
    isLoading: channelsLoading,
    error: channelsError,
    refetch: refetchChannels,
  } = useQuery({
    queryKey: ['channels', 'dm'],
    queryFn: () => channelsService.fetchChannels('dm'),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Fetch presence data for all users
  const {
    data: presenceResult,
    isLoading: presenceLoading,
  } = useQuery({
    queryKey: ['presence'],
    queryFn: () => presenceService.fetchPresence(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });

  // Combine users with their presence status
  const usersWithPresence = useMemo<UserWithPresence[]>(() => {
    if (!usersResult?.ok || !usersResult.data) return [];
    
    const users = usersResult.data;
    const presenceMap = presenceResult?.ok ? presenceResult.data : {};

    return users
      .filter(user => user.id !== currentUser?.id) // Exclude current user
      .map(user => ({
        ...user,
        presenceStatus: presenceMap[user.id]?.status || 'offline',
        lastSeen: presenceMap[user.id]?.lastSeen,
      }));
  }, [usersResult, presenceResult, currentUser?.id]);

  // Convert channels to DM channels with other user info
  const dmChannels = useMemo<DMChannel[]>(() => {
    if (!channelsResult?.ok || !channelsResult.data || !currentUser) return [];

    const channels = channelsResult.data;
    
    return channels
      .filter(channel => channel.type === 'dm')
      .map(channel => {
        // Find the other user in the channel
        const otherUserId = channel.memberIds.find(id => id !== currentUser.id);
        const otherUser = usersWithPresence.find(user => user.id === otherUserId);
        
        if (!otherUser) {
          debugLog('warn', `Could not find other user for DM channel ${channel.id}`);
          return null;
        }

        return {
          ...channel,
          otherUser,
          lastMessageAt: channel.metadata?.lastMessageAt,
          unreadCount: channel.metadata?.unreadCount || 0,
        };
      })
      .filter((channel): channel is DMChannel => channel !== null)
      .sort((a, b) => {
        // Sort by last message time, then by presence status
        if (a.lastMessageAt && b.lastMessageAt) {
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        }
        if (a.lastMessageAt) return -1;
        if (b.lastMessageAt) return 1;
        
        // Sort by presence: online > idle > do-not-disturb > offline
        const presenceOrder = { online: 0, idle: 1, 'do-not-disturb': 2, offline: 3 };
        return presenceOrder[a.otherUser.presenceStatus] - presenceOrder[b.otherUser.presenceStatus];
      });
  }, [channelsResult, usersWithPresence, currentUser]);

  // Filter users for new DM creation (exclude existing DM users and current user)
  const availableUsers = useMemo(() => {
    const existingDMUserIds = new Set(dmChannels.map(dm => dm.otherUser.id));
    return usersWithPresence
      .filter(user => !existingDMUserIds.has(user.id))
      .filter(user => 
        searchQuery === '' || 
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [usersWithPresence, dmChannels, searchQuery]);

  // Handle starting a new DM
  const handleStartDM = async (otherUser: UserWithPresence) => {
    if (!currentUser) return;

    try {
      const result = await channelsService.createChannel({
        name: `${currentUser.displayName}, ${otherUser.displayName}`,
        type: 'dm',
        memberIds: [currentUser.id, otherUser.id],
      });

      if (result.ok && result.data) {
        const newChannel: DMChannel = {
          ...result.data,
          otherUser,
        };
        
        setShowNewDMModal(false);
        setSearchQuery('');
        onSelectDM?.(newChannel);
        refetchChannels();
      } else {
        debugLog('error', 'Failed to create DM channel', result.error);
      }
    } catch (error) {
      debugLog('error', 'Error creating DM channel', error);
    }
  };

  // Handle selecting an existing DM
  const handleSelectDM = (dmChannel: DMChannel) => {
    onSelectDM?.(dmChannel);
  };

  const isLoading = usersLoading || channelsLoading || presenceLoading;
  const hasError = usersError || channelsError;

  if (hasError) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-red-600 text-sm">
          Failed to load direct messages
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Direct Messages
        </h3>
        <button
          onClick={() => setShowNewDMModal(true)}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Start new direct message"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      {/* DM List */}
      <div className="flex-1 overflow-y-auto">
        {dmChannels.length === 0 && !isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            No direct messages yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {dmChannels.map(dmChannel => (
              <button
                key={dmChannel.id}
                onClick={() => handleSelectDM(dmChannel)}
                className={`w-full flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedChannelId === dmChannel.id 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                aria-label={`Direct message with ${dmChannel.otherUser.displayName}`}
              >
                <div className="relative flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {dmChannel.otherUser.avatarUrl ? (
                      <img
                        src={dmChannel.otherUser.avatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {dmChannel.otherUser.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <PresenceDot status={dmChannel.otherUser.presenceStatus} size="sm" />
                  </div>
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {dmChannel.otherUser.displayName}
                    </span>
                    {dmChannel.unreadCount && dmChannel.unreadCount > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {dmChannel.unreadCount > 99 ? '99+' : dmChannel.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {dmChannel.otherUser.presenceStatus === 'online' 
                      ? 'Online'
                      : dmChannel.lastMessageAt
                        ? `Last active ${new Date(dmChannel.lastMessageAt).toLocaleDateString()}`
                        : 'Offline'
                    }
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New DM Modal */}
      {showNewDMModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Start Direct Message
                </h4>
                <button
                  onClick={() => {
                    setShowNewDMModal(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 max-h-64 overflow-y-auto">
              {availableUsers.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                  {searchQuery ? 'No users found' : 'No users available for new DMs'}
                </div>
              ) : (
                <div className="space-y-2">
                  {availableUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleStartDM(user)}
                      className="w-full flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="relative flex-shrink-0 mr-3">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {user.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <PresenceDot status={user.presenceStatus} size="sm" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user.displayName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DMList;
