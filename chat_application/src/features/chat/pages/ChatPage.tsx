import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ChannelList from '../components/ChannelList';
import ChannelView from '../components/ChannelView';
import ThreadView from '../components/ThreadView';
import Button from '../../../shared/components/atoms/Button';
import Icon from '../../../shared/components/atoms/Icon';
import { useQuery } from '@tanstack/react-query';
import { fetchChannels } from '../../../services/endpoints/channels';
import { useAuth } from '../../../shared/context/AuthProvider';

const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [selectedChannelId, setSelectedChannelId] = useState<string | undefined>(
    searchParams.get('channel') || undefined
  );
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isChannelListOpen, setIsChannelListOpen] = useState(false);
  const [isThreadViewOpen, setIsThreadViewOpen] = useState(false);

  // Fetch channels to get default channel if none selected
  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: () => fetchChannels(),
  });

  // Set default channel if none selected and channels are loaded
  useEffect(() => {
    if (!selectedChannelId && channels && channels.length > 0) {
      setSelectedChannelId(channels[0].id);
    }
  }, [selectedChannelId, channels]);

  // Update URL when channel changes
  useEffect(() => {
    if (selectedChannelId) {
      setSearchParams({ channel: selectedChannelId });
    }
  }, [selectedChannelId, setSearchParams]);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    setSelectedThreadId(null); // Clear thread when changing channels
    setIsChannelListOpen(false); // Close mobile drawer
  };

  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
    setIsThreadViewOpen(true);
  };

  const handleCloseThread = () => {
    setSelectedThreadId(null);
    setIsThreadViewOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Application</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.displayName || user?.email}
            </span>
            <Button
              onClick={handleSignOut}
              variant="secondary"
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
      {/* Mobile channel list toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsChannelListOpen(!isChannelListOpen)}
          variant="secondary"
          size="sm"
          className="bg-white dark:bg-gray-800 shadow-lg"
          aria-label="Toggle channel list"
        >
          <Icon name="menu" size="sm" />
        </Button>
      </div>

      {/* Channel List - Left Panel */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 lg:w-72 
          transform transition-transform duration-300 ease-in-out
          ${isChannelListOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        `}
      >
        <ChannelList
          selectedChannelId={selectedChannelId}
          onSelect={handleChannelSelect}
        />
      </div>

      {/* Mobile overlay */}
      {isChannelListOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsChannelListOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0">
        {/* Channel View - Center Panel */}
        <div
          className={`
            flex-1 flex flex-col min-w-0
            ${isThreadViewOpen ? 'lg:max-w-none xl:max-w-2xl' : ''}
          `}
        >
          {selectedChannelId ? (
            <ChannelView
              channelId={selectedChannelId}
              onThreadSelect={handleThreadSelect}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Icon name="message-circle" size="lg" className="mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Welcome to Chat</h3>
                <p>Select a channel to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Thread View - Right Panel */}
        {selectedThreadId && (
          <div
            className={`
              fixed lg:static inset-y-0 right-0 z-40
              w-full lg:w-80 xl:w-96
              transform transition-transform duration-300 ease-in-out
              ${isThreadViewOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
              bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700
            `}
          >
            <ThreadView
              threadId={selectedThreadId}
              onClose={handleCloseThread}
            />
          </div>
        )}

        {/* Mobile thread overlay */}
        {selectedThreadId && isThreadViewOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={handleCloseThread}
            aria-hidden="true"
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default ChatPage;
