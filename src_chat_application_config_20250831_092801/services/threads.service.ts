import { 
  Thread, 
  Message, 
  MessageCreateDTO, 
  ApiResult, 
  PaginatedResponse
} from '@/core/contracts';
import { apiClient } from './apiClient';

// Thread creation payload
interface ThreadCreateDTO {
  parentMessageId: string;
  channelId: string;
  initialMessage?: string;
}

// Thread query parameters
interface ThreadQueryParams {
  limit?: number;
  before?: string;
  after?: string;
}

// Thread message creation payload
interface ThreadMessageCreateDTO extends Omit<MessageCreateDTO, 'channelId'> {
  threadId: string;
}

/**
 * Create a new thread from a parent message
 */
export async function createThread(data: ThreadCreateDTO): Promise<ApiResult<Thread>> {
  try {
    const response = await apiClient.post<Thread>('/threads', data);
    
    if (!response.success) {
      return {
        ok: false,
        error: {
          code: 'THREAD_CREATE_FAILED',
          message: response.error?.message || 'Failed to create thread'
        }
      };
    }

    return {
      ok: true,
      data: response.data
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'THREAD_CREATE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error creating thread'
      }
    };
  }
}

/**
 * Fetch thread details by ID
 */
export async function fetchThread(threadId: string): Promise<ApiResult<Thread>> {
  try {
    const response = await apiClient.get<Thread>(`/threads/${threadId}`);
    
    if (!response.success) {
      return {
        ok: false,
        error: {
          code: 'THREAD_FETCH_FAILED',
          message: response.error?.message || 'Failed to fetch thread'
        }
      };
    }

    return {
      ok: true,
      data: response.data
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'THREAD_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error fetching thread'
      }
    };
  }
}

/**
 * Fetch messages in a thread with pagination
 */
export async function fetchThreadMessages(
  threadId: string, 
  params: ThreadQueryParams = {}
): Promise<ApiResult<PaginatedResponse<Message>>> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.limit) {
      queryParams.set('limit', params.limit.toString());
    }
    if (params.before) {
      queryParams.set('before', params.before);
    }
    if (params.after) {
      queryParams.set('after', params.after);
    }

    const queryString = queryParams.toString();
    const url = `/threads/${threadId}/messages${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<PaginatedResponse<Message>>(url);
    
    if (!response.success) {
      return {
        ok: false,
        error: {
          code: 'THREAD_MESSAGES_FETCH_FAILED',
          message: response.error?.message || 'Failed to fetch thread messages'
        }
      };
    }

    return {
      ok: true,
      data: response.data
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'THREAD_MESSAGES_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error fetching thread messages'
      }
    };
  }
}

/**
 * Post a message to a thread
 */
export async function postToThread(data: ThreadMessageCreateDTO): Promise<ApiResult<Message>> {
  try {
    const { threadId, ...messageData } = data;
    
    const response = await apiClient.post<Message>(`/threads/${threadId}/messages`, messageData);
    
    if (!response.success) {
      return {
        ok: false,
        error: {
          code: 'THREAD_MESSAGE_SEND_FAILED',
          message: response.error?.message || 'Failed to send message to thread'
        }
      };
    }

    return {
      ok: true,
      data: response.data
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'THREAD_MESSAGE_SEND_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error sending message to thread'
      }
    };
  }
}

/**
 * Update thread (e.g., add/remove participants)
 */
export async function updateThread(
  threadId: string, 
  updates: { participants?: string[] }
): Promise<ApiResult<Thread>> {
  try {
    const response = await apiClient.patch<Thread>(`/threads/${threadId}`, updates);
    
    if (!response.success) {
      return {
        ok: false,
        error: {
          code: 'THREAD_UPDATE_FAILED',
          message: response.error?.message || 'Failed to update thread'
        }
      };
    }

    return {
      ok: true,
      data: response.data
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'THREAD_UPDATE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error updating thread'
      }
    };
  }
}

/**
 * Find thread by parent message ID
 */
export async function findThreadByParentMessage(parentMessageId: string): Promise<ApiResult<Thread | null>> {
  try {
    const response = await apiClient.get<Thread>(`/messages/${parentMessageId}/thread`);
    
    if (!response.success) {
      // If it's a 404, return null (no thread exists)
      if (response.error?.status === 404) {
        return {
          ok: true,
          data: null
        };
      }
      
      return {
        ok: false,
        error: {
          code: 'THREAD_FIND_FAILED',
          message: response.error?.message || 'Failed to find thread'
        }
      };
    }

    return {
      ok: true,
      data: response.data
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'THREAD_FIND_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error finding thread'
      }
    };
  }
}

/**
 * Mark thread as read for current user
 */
export async function markThreadAsRead(threadId: string): Promise<ApiResult<void>> {
  try {
    const response = await apiClient.post<void>(`/threads/${threadId}/mark-read`);
    
    if (!response.success) {
      return {
        ok: false,
        error: {
          code: 'THREAD_MARK_READ_FAILED',
          message: response.error?.message || 'Failed to mark thread as read'
        }
      };
    }

    return {
      ok: true,
      data: undefined
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'THREAD_MARK_READ_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error marking thread as read'
      }
    };
  }
}

// Export types for use in components
export type { ThreadCreateDTO, ThreadQueryParams, ThreadMessageCreateDTO };
