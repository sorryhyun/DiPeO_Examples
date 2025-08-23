import { apiClient } from '../apiClient';
import { Message, Thread, ReactionPayload, PaginationOptions, SearchOptions } from '../../types';

export interface FetchMessagesOptions extends PaginationOptions {
  cursor?: string;
  pageSize?: number;
}

export interface SendMessagePayload {
  channelId: string;
  content: string;
  attachments?: string[];
  threadId?: string;
  senderId: string;
}

export interface SearchMessagesOptions extends SearchOptions {
  channelId?: string;
  limit?: number;
}

/**
 * Fetch messages for a specific channel
 */
export const fetchMessages = async (
  channelId: string,
  options: FetchMessagesOptions = {}
): Promise<{ messages: Message[]; hasMore: boolean; nextCursor?: string }> => {
  if (!channelId) {
    throw new Error('Channel ID is required');
  }

  const params = new URLSearchParams({
    channelId,
    ...(options.cursor && { cursor: options.cursor }),
    ...(options.pageSize && { pageSize: options.pageSize.toString() })
  });

  const response = await apiClient.get(`/api/messages?${params.toString()}`);
  return response.data;
};

/**
 * Send a new message
 */
export const sendMessage = async (payload: SendMessagePayload): Promise<Message> => {
  if (!payload.channelId || !payload.content?.trim()) {
    throw new Error('Channel ID and content are required');
  }

  // Note: In a real implementation, you might want to return an optimistic message

  try {
    const response = await apiClient.post('/api/messages', payload);
    return response.data;
  } catch (error) {
    // Return optimistic message on failure for better UX
    // The calling code should handle retry logic
    throw error;
  }
};

/**
 * Fetch thread messages
 */
export const fetchThread = async (threadId: string): Promise<Thread> => {
  if (!threadId) {
    throw new Error('Thread ID is required');
  }

  const response = await apiClient.get(`/api/threads/${threadId}`);
  return response.data;
};

/**
 * React to a message
 */
export const reactToMessage = async (
  messageId: string,
  emoji: string,
  action: 'add' | 'remove' = 'add'
): Promise<void> => {
  if (!messageId || !emoji) {
    throw new Error('Message ID and emoji are required');
  }

  const payload: ReactionPayload = {
    messageId,
    emoji,
    action
  };

  await apiClient.post('/api/reactions', payload);
};

/**
 * Search messages
 */
export const searchMessages = async (
  query: string,
  options: Omit<SearchMessagesOptions, 'query'> = {}
): Promise<{ messages: Message[]; total: number }> => {
  if (!query?.trim()) {
    throw new Error('Search query is required');
  }

  const params = new URLSearchParams({
    q: query.trim(),
    ...(options.channelId && { channelId: options.channelId }),
    ...(options.limit && { limit: options.limit.toString() })
  });

  const response = await apiClient.get(`/api/messages/search?${params.toString()}`);
  return response.data;
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  if (!messageId) {
    throw new Error('Message ID is required');
  }

  await apiClient.delete(`/api/messages/${messageId}`);
};

/**
 * Edit a message
 */
export const editMessage = async (
  messageId: string,
  content: string
): Promise<Message> => {
  if (!messageId || !content?.trim()) {
    throw new Error('Message ID and content are required');
  }

  const response = await apiClient.put(`/api/messages/${messageId}`, {
    content: content.trim()
  });
  return response.data;
};
