import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Message } from '@/core/contracts';
import { events } from '@/core/events';
import { useInfiniteMessages } from '@/hooks/useInfiniteMessages';
import { MessageItem } from '@/components/chat/MessageItem';
import { SuspenseFallback } from '@/components/SuspenseFallback';

interface MessageListProps {
  channelId: string;
  threadId?: string;
  className?: string;
  'aria-label'?: string;
}

interface DateGroup {
  date: string;
  messages: Message[];
}

export function MessageList({ 
  channelId, 
  threadId, 
  className = '',
  'aria-label': ariaLabel = 'Messages'
}: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteMessages(channelId, threadId);

  // Flatten all pages into a single message array
  const messages = data?.pages.flatMap(page => page.items) || [];

  // Group messages by date for better readability
  const messageGroups = React.useMemo(() => {
    const groups: DateGroup[] = [];
    let currentGroup: DateGroup | null = null;

    messages.forEach(message => {
      const messageDate = new Date(message.createdAt).toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          messages: [message]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  // Format date for display
  const formatDateHeader = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Check if user is at bottom of scroll container
  const checkIfAtBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const threshold = 100;
    const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    setIsAtBottom(isBottom);

    if (isBottom) {
      setNewMessageCount(0);
    }
  }, []);

  // Scroll to bottom of container
  const scrollToBottom = useCallback((smooth = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  // Handle infinite scroll - load more messages when scrolling up
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkIfAtBottom();

    // Check if scrolled to top and can load more
    if (container.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      const previousScrollHeight = container.scrollHeight;
      
      fetchNextPage().then(() => {
        // Maintain scroll position after loading new messages
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          }
        });
      });
    }
  }, [checkIfAtBottom, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Listen for new messages via event bus
  useEffect(() => {
    const subscription = events.on('message:created', ({ message }) => {
      // Only handle messages for this channel/thread
      if (message.channelId !== channelId) return;
      if (threadId && message.threadId !== threadId) return;
      if (!threadId && message.threadId) return;

      if (isAtBottom) {
        // Scroll to show new message if already at bottom
        requestAnimationFrame(() => scrollToBottom(true));
      } else {
        // Increment counter for new messages while not at bottom
        setNewMessageCount(prev => prev + 1);
      }
    });

    return () => subscription.unsubscribe();
  }, [channelId, threadId, isAtBottom, scrollToBottom]);

  // Scroll to bottom on initial load or channel change
  useEffect(() => {
    if (messages.length > 0 && !hasNextPage) {
      scrollToBottom();
    }
  }, [channelId, threadId, messages.length, hasNextPage, scrollToBottom]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Home':
        event.preventDefault();
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'End':
        event.preventDefault();
        scrollToBottom(true);
        break;
      case 'PageUp':
        event.preventDefault();
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollBy({ 
            top: -scrollContainerRef.current.clientHeight * 0.8, 
            behavior: 'smooth' 
          });
        }
        break;
      case 'PageDown':
        event.preventDefault();
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollBy({ 
            top: scrollContainerRef.current.clientHeight * 0.8, 
            behavior: 'smooth' 
          });
        }
        break;
    }
  }, [scrollToBottom]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <SuspenseFallback />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-600 dark:text-red-400 mb-2">
            Failed to load messages
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 relative ${className}`}>
      {/* Main message container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="log"
        aria-label={ariaLabel}
        aria-live="polite"
        className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        {/* Loading indicator for fetching older messages */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Loading older messages...
            </div>
          </div>
        )}

        {/* Message groups */}
        <div className="px-4 pb-4">
          {messageGroups.map(group => (
            <div key={group.date} className="mb-6">
              {/* Date separator */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                  {formatDateHeader(group.date)}
                </div>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              {/* Messages for this date */}
              {group.messages.map((message, index) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  showAvatar={
                    index === 0 || 
                    group.messages[index - 1].authorId !== message.authorId ||
                    new Date(message.createdAt).getTime() - 
                    new Date(group.messages[index - 1].createdAt).getTime() > 300000 // 5 minutes
                  }
                  className="mb-1"
                />
              ))}
            </div>
          ))}

          {/* Empty state */}
          {messageGroups.length === 0 && (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  No messages yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Start the conversation!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New message indicator */}
      {newMessageCount > 0 && !isAtBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg transition-colors duration-200 flex items-center text-sm font-medium"
          aria-label={`${newMessageCount} new messages. Click to scroll to bottom`}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          {newMessageCount} new
        </button>
      )}
    </div>
  );
}
