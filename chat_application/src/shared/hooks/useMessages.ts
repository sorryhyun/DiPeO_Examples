import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMessages, sendMessage as apiSendMessage, SendMessagePayload } from '../../services/endpoints/messages';
import { Message } from '../../types';
import { generateId } from '../../utils/generateId';

interface UseMessagesOptions {
  channelId: string;
}

interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  sendMessage: (content: string, threadId?: string) => Promise<void>;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export const useMessages = ({ channelId }: UseMessagesOptions): UseMessagesReturn => {
  const queryClient = useQueryClient();
  
  const queryKey = ['messages', channelId];

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage = false,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchMessages(channelId, { cursor: pageParam }),
    getNextPageParam: (lastPage: any) => lastPage.nextCursor || undefined,
    initialPageParam: undefined,
    enabled: !!channelId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: SendMessagePayload) => {
      return apiSendMessage(messageData);
    },
    onMutate: async (messageData: SendMessagePayload) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for rollback
      const previousMessages = queryClient.getQueryData(queryKey);

      // Create optimistic message
      const optimisticMessage: Message = {
        id: generateId(),
        content: messageData.content,
        channelId: messageData.channelId,
        senderId: messageData.senderId,
        createdAt: new Date().toISOString(),
        threadId: messageData.threadId,
        reactions: {},
      };

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.pages) return old;
        
        const newPages = [...old.pages];
        if (newPages.length === 0) {
          // Create first page if none exist
          newPages.push({
            messages: [optimisticMessage],
            nextCursor: null,
          });
        } else {
          // Add to the first page (most recent messages)
          newPages[0] = {
            ...newPages[0],
            messages: [optimisticMessage, ...newPages[0].messages],
          };
        }

        return {
          ...old,
          pages: newPages,
        };
      });

      return { previousMessages, optimisticMessage };
    },
    onError: (error, _, context) => {
      // Rollback to previous state
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKey, context.previousMessages);
      }
      console.error('Failed to send message:', error);
    },
    onSuccess: (data, _, context) => {
      // Remove optimistic message and replace with real message
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.pages || !context?.optimisticMessage) return old;

        const newPages = old.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: Message) => 
            msg.id === context.optimisticMessage.id ? data : msg
          ),
        }));

        return {
          ...old,
          pages: newPages,
        };
      });
    },
    onSettled: () => {
      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const sendMessage = async (content: string, threadId?: string) => {
    const messageData: SendMessagePayload = {
      content,
      channelId,
      senderId: 'current-user-id', // This should come from auth context
      threadId,
    };

    await sendMessageMutation.mutateAsync(messageData);
  };

  // Flatten pages into a single messages array
  const messages = data?.pages?.reduce<Message[]>((acc, page) => {
    return [...acc, ...page.messages];
  }, []) || [];

  return {
    messages,
    isLoading,
    isError,
    error: error as Error | null,
    sendMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
