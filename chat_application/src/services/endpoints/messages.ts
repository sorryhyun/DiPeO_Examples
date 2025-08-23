import { apiClient } from '../apiClient';
import { Message, MessagePayload, Thread, ReactionPayload, PaginationOptions, SearchOptions } from '../../types';
import { generateId } from '../../utils/generateId';

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

  // Create optimistic message with generated ID
  const optimisticMessage: MessagePayload = {
    id: generateId(),
    channelId: payload.channelId,
    content: payload.content.trim(),
    senderId: payload.senderId,
    timestamp: new Date().toISOString(),
    attachments: payload.attachments || [],
    threadId: payload.threadId,
    reactions: [],
    isOptimistic: true
  };

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
  userId: string
): Promise<void> => {
  if (!messageId || !emoji || !userId) {
    throw new Error('Message ID, emoji, and user ID are required');
  }

  const payload: ReactionPayload = {
    messageId,
    emoji,
    userId
  };

  await apiClient.post('/api/reactions', payload);
};

/**
 * Search messages
 */
export const searchMessages = async (
  query: string,
  options: SearchMessagesOptions = {}
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
