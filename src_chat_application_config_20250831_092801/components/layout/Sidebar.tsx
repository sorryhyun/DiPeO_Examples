import { useState, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, HashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { appConfig } from '@/app/config';
import { User } from '@/core/contracts';
import { useAuth } from '@/hooks/useAuth';
import { ChannelList } from '@/components/chat/ChannelList';
import { DMList } from '@/components/chat/DMList';
import { SearchBar } from '@/components/search/SearchBar';
import { storage } from '@/utils/storage';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => storage.getSidebarCollapsed());
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'channels' | 'dms'>('channels');

  const toggleCollapsed = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    storage.setSidebarCollapsed(newCollapsed);
  }, [isCollapsed]);

  const handleCreateChannel = useCallback(() => {
    setShowNewChannelModal(true);
  }, []);

  const handleSearch = useCallback((query: string) => {
    // Search functionality will be handled by SearchBar component
    console.log('Searching for:', query);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <aside 
      className={`
        flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'} 
        ${className}
      `}
      aria-label="Navigation sidebar"
    >
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <HashIcon className="w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg">
              {appConfig.appType === 'messaging' ? 'Chat' : 'DiPeO'}
            </h1>
          </div>
        )}
        
        <button
          onClick={toggleCollapsed}
          className="p-1 hover:bg-gray-700 rounded-md transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search channels, messages..."
            className="w-full"
          />
        </div>
      )}

      {/* Navigation sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Channels section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            {!isCollapsed && (
              <button
                onClick={() => setActiveSection('channels')}
                className={`
                  text-sm font-medium transition-colors
                  ${activeSection === 'channels' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
                `}
              >
                Channels
              </button>
            )}
            
            <button
              onClick={handleCreateChannel}
              className="p-1 hover:bg-gray-700 rounded-md transition-colors group"
              aria-label="Create new channel"
              title={isCollapsed ? 'Create new channel' : undefined}
            >
              <PlusIcon className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </button>
          </div>

          <ChannelList 
            isCollapsed={isCollapsed}
            onChannelSelect={(channelId) => {
              // Channel navigation will be handled by the routing system
              console.log('Selected channel:', channelId);
            }}
          />
        </div>

        {/* Direct Messages section */}
        <div className="p-4 border-t border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setActiveSection('dms')}
                className={`
                  text-sm font-medium transition-colors
                  ${activeSection === 'dms' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
                `}
              >
                Direct Messages
              </button>
            </div>
          )}

          <DMList 
            isCollapsed={isCollapsed}
            onDMSelect={(userId) => {
              // DM navigation will be handled by the routing system
              console.log('Selected DM with user:', userId);
            }}
          />
        </div>
      </div>

      {/* User presence summary */}
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.role}
              </p>
            </div>

            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
                title={`${user.displayName} (${user.role})`}
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile overlay for collapsed state */}
      {isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleCollapsed}
          aria-hidden="true"
        />
      )}
    </aside>
  );
}
