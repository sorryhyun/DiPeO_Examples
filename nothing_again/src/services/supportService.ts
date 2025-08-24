import { apiGet, apiPost } from '@/utils/apiClient';
import type { SupportMessage, ApiResponse } from '@/types';

/**
 * Sends a support message and receives a mocked unhelpful response
 */
export const sendSupportMessage = async (message: SupportMessage): Promise<ApiResponse<string>> => {
  try {
    const response = await apiPost<string>('/api/support/nothing', message);
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
    const response = await apiGet<{ queueLength: number; estimatedWait: string }>('/api/support/status');
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
    const response = await apiGet<SupportMessage[]>(`/api/support/history/${userId}`);
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
    const response = await apiPost<void>(`/api/support/conversation/${conversationId}/close`, {});
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to close support conversation');
  }
};

// Alternative method for sending messages that matches component expectations
export const sendMessage = async (_text: string): Promise<{ message: string }> => {
  const mockResponses = [
    "I understand you need help, but I'm professionally trained to be unhelpful.",
    "Have you tried turning your expectations off and on again?",
    "I'd love to help, but that would go against everything we stand for here.",
    "Let me transfer you to someone who cares... oh wait, we don't have anyone like that.",
    "Your issue is very important to us. That's why we're ignoring it.",
    "I'm sorry, but our policy is to provide absolutely no assistance whatsoever.",
    "Have you considered that maybe your problem is the solution?",
    "I'm here 24/7 to not help you with anything at all."
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  return { message: randomResponse };
};

// Export as default object for easier consumption
const supportService = {
  sendSupportMessage,
  getSupportStatus,
  getSupportHistory,
  closeSupportConversation,
  sendMessage
};

export default supportService;

