import { apiClient } from '@/utils/apiClient';
import type { SupportMessage, ApiResponse } from '@/types';

/**
 * Sends a support message and receives a mocked unhelpful response
 */
export const sendSupportMessage = async (message: SupportMessage): Promise<ApiResponse<string>> => {
  try {
    const response = await apiClient.post<string>('/api/support/nothing', message);
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to send support message');
  }
};

/**
 * Gets the current support queue status (always shows we're not helping)
 */
export const getSupportStatus = async (): Promise<ApiResponse<{ queueLength: number; estimatedWait: string }>> => {
  try {
    const response = await apiClient.get<{ queueLength: number; estimatedWait: string }>('/api/support/status');
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get support status');
  }
};

/**
 * Gets previous support conversations (all equally unhelpful)
 */
export const getSupportHistory = async (userId: string): Promise<ApiResponse<SupportMessage[]>> => {
  try {
    const response = await apiClient.get<SupportMessage[]>(`/api/support/history/${userId}`);
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get support history');
  }
};

/**
 * Closes a support conversation (doesn't actually help)
 */
export const closeSupportConversation = async (conversationId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete<void>(`/api/support/conversation/${conversationId}`);
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to close support conversation');
  }
};

