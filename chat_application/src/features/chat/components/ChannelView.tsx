import React, { useRef, useEffect } from 'react';
import { useInfiniteQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import MessageList from '../../../shared/components/organisms/MessageList';
import Composer, { type ComposerPayload } from '../../../shared/components/organisms/Composer';
import { fetchMessages, sendMessage } from '../../../services/endpoints/messages';
import { generateId } from '../../../utils/generateId';
import { useToast } from '../../../shared/hooks/useToast';
import type { Message } from '../../../types';

interface ChannelViewProps {
  channelId: string;
  onThreadSelect?: (threadId: string) => void;
}

const ChannelView: React.FC<ChannelViewProps> = ({ channelId }) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);

  // Fetch messages for the channel
  const {
    data: messagesData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', channelId],
    queryFn: ({ pageParam }) => fetchMessages(channelId, { 
      cursor: pageParam,
      pageSize: 50 
    }),
    getNextPageParam: (lastPage: any, allPages: any) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!channelId,
  });

  // Flatten paginated messages
  const messages = messagesData?.pages.flatMap((page: any) => page.messages) || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { content: string }) => 
      sendMessage({
        channelId,
        content: messageData.content,
        senderId: 'current-user', // This would come from auth context in real app
      }),
    onMutate: async (messageData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', channelId] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(['messages', channelId]);

      // Create optimistic message
      const optimisticMessage: Message = {
        id: generateId(),
        content: messageData.content,
        senderId: 'current-user', // This would come from auth context in real app
        channelId,
        createdAt: new Date().toISOString(),
      };

      // Optimistically update cache
      queryClient.setQueryData(['messages', channelId], (old: any) => {
        if (!old) return { pages: [{ messages: [optimisticMessage], hasMore: false }], pageParams: [0] };
        
        const newPages = [...old.pages];
        if (newPages.length > 0) {
          newPages[newPages.length - 1] = {
            ...newPages[newPages.length - 1],
            messages: [...newPages[newPages.length - 1].messages, optimisticMessage]
          };
        }
        
        return { ...old, pages: newPages };
      });

      return { previousMessages, optimisticMessage };
    },
    onError: (_error, _variables, context) => {
      // Revert optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', channelId], context.previousMessages);
      }
      addToast({ title: 'Failed to send message. Please try again.', type: 'error' });
    },
    onSuccess: (realMessage, _variables, context) => {
      // Replace optimistic message with real message
      queryClient.setQueryData(['messages', channelId], (old: any) => {
        if (!old) return old;
        
        const newPages = old.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: Message) => 
            msg.id === context?.optimisticMessage.id ? realMessage : msg
          )
        }));
        
        return { ...old, pages: newPages };
      });
    },
  });

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      isUserScrolledUp.current = !isAtBottom;
    }
  };

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (!isUserScrolledUp.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Handle infinite scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleInfiniteScroll = () => {
      if (container.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleInfiniteScroll);
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleInfiniteScroll);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSendMessage = async (payload: ComposerPayload) => {
    if (!payload.content.trim()) return;
    
    sendMessageMutation.mutate({ content: payload.content });
    // TODO: Handle attachments if needed
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-red-500 dark:text-red-400">
          Failed to load messages. Please try again.
        </div>
      </div>
    );
  }

  if (!channelId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">
          Select a channel to start messaging
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2"
      >
        {isFetchingNextPage && (
          <div className="text-center py-2 text-gray-500 dark:text-gray-400">
            Loading more messages...
          </div>
        )}
        
        <MessageList messages={messages} />
        
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <Composer
          onSend={handleSendMessage}
          disabled={sendMessageMutation.isPending}
          placeholder="Type a message..."
        />
      </div>
    </div>
  );
};

export default ChannelView;
