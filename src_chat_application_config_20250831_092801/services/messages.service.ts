import { 
  Message, 
  MessageCreateDTO, 
  ApiResult, 
  PaginatedResponse,
  Thread 
} from '@/core/contracts';
import { apiClient } from './apiClient';
import { debugLog } from '@/core/utils';

// Fetch messages for a channel with pagination
export async function fetchMessages(
  channelId: string,
  cursor?: string | null,
  limit = 50
): Promise<ApiResult<PaginatedResponse<Message>>> {
  debugLog('debug', 'Fetching messages', { channelId, cursor, limit });

  const params: Record<string, string> = {
    limit: limit.toString()
  };

  if (cursor) {
    params.cursor = cursor;
  }

  const result = await apiClient.get<PaginatedResponse<Message>>(
    `/channels/${channelId}/messages`,
    params
  );

  if (!result.ok) {
    debugLog('error', 'Failed to fetch messages', { channelId, error: result.error });
  }

  return result;
}

// Send a new message to a channel
export async function sendMessage(
  messageData: MessageCreateDTO
): Promise<ApiResult<Message>> {
  debugLog('debug', 'Sending message', { channelId: messageData.channelId });

  const result = await apiClient.post<Message>('/messages', messageData);

  if (!result.ok) {
    debugLog('error', 'Failed to send message', { messageData, error: result.error });
  }

  return result;
}

// Edit an existing message
export async function editMessage(
  messageId: string,
  updates: { text?: string; metadata?: Record<string, any> }
): Promise<ApiResult<Message>> {
  debugLog('debug', 'Editing message', { messageId, updates });

  const result = await apiClient.patch<Message>(`/messages/${messageId}`, updates);

  if (!result.ok) {
    debugLog('error', 'Failed to edit message', { messageId, updates, error: result.error });
  }

  return result;
}

// Delete a message
export async function deleteMessage(
  messageId: string
): Promise<ApiResult<void>> {
  debugLog('debug', 'Deleting message', { messageId });

  const result = await apiClient.delete<void>(`/messages/${messageId}`);

  if (!result.ok) {
    debugLog('error', 'Failed to delete message', { messageId, error: result.error });
  }

  return result;
}

// Fetch messages in a thread
export async function fetchThreadMessages(
  threadId: string,
  cursor?: string | null,
  limit = 50
): Promise<ApiResult<PaginatedResponse<Message>>> {
  debugLog('debug', 'Fetching thread messages', { threadId, cursor, limit });

  const params: Record<string, string> = {
    limit: limit.toString()
  };

  if (cursor) {
    params.cursor = cursor;
  }

  const result = await apiClient.get<PaginatedResponse<Message>>(
    `/threads/${threadId}/messages`,
    params
  );

  if (!result.ok) {
    debugLog('error', 'Failed to fetch thread messages', { threadId, error: result.error });
  }

  return result;
}

// Create a new thread from a message
export async function createThread(
  parentMessageId: string
): Promise<ApiResult<Thread>> {
  debugLog('debug', 'Creating thread', { parentMessageId });

  const result = await apiClient.post<Thread>('/threads', { parentMessageId });

  if (!result.ok) {
    debugLog('error', 'Failed to create thread', { parentMessageId, error: result.error });
  }

  return result;
}

// Search messages within a channel
export async function searchMessages(
  channelId: string,
  query: string,
  cursor?: string | null,
  limit = 20
): Promise<ApiResult<PaginatedResponse<Message>>> {
  debugLog('debug', 'Searching messages', { channelId, query, cursor, limit });

  const params: Record<string, string> = {
    q: query,
    limit: limit.toString()
  };

  if (cursor) {
    params.cursor = cursor;
  }

  const result = await apiClient.get<PaginatedResponse<Message>>(
    `/channels/${channelId}/messages/search`,
    params
  );

  if (!result.ok) {
    debugLog('error', 'Failed to search messages', { channelId, query, error: result.error });
  }

  return result;
}

// Get a single message by ID
export async function getMessage(
  messageId: string
): Promise<ApiResult<Message>> {
  debugLog('debug', 'Fetching single message', { messageId });

  const result = await apiClient.get<Message>(`/messages/${messageId}`);

  if (!result.ok) {
    debugLog('error', 'Failed to fetch message', { messageId, error: result.error });
  }

  return result;
}

// Mark messages as read up to a certain message
export async function markMessagesAsRead(
  channelId: string,
  lastReadMessageId: string
): Promise<ApiResult<void>> {
  debugLog('debug', 'Marking messages as read', { channelId, lastReadMessageId });

  const result = await apiClient.post<void>(
    `/channels/${channelId}/read`,
    { lastReadMessageId }
  );

  if (!result.ok) {
    debugLog('error', 'Failed to mark messages as read', { 
      channelId, 
      lastReadMessageId, 
      error: result.error 
    });
  }

  return result;
}

// Export a messages service object for convenience
export const messagesService = {
  fetchMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  fetchThreadMessages,
  createThread,
  searchMessages,
  getMessage,
  markMessagesAsRead
};
