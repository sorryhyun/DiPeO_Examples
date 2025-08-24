import { apiGet, apiPost } from '@/utils/apiClient';
import type { ApiResponse, NothingProduct, User, LoginCredentials } from '@/types';

/**
 * Get comprehensive overview of the Nothing product offering
 */
export const getNothingOverview = async (): Promise<ApiResponse<NothingProduct>> => {
  try {
    return await apiGet<NothingProduct>('/api/nothing');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nothing overview',
      data: null
    };
  }
};

/**
 * Authenticate user with nothing credentials
 */
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
  try {
    return await apiPost<User>('/api/nothing/login', credentials);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
      data: null
    };
  }
};

/**
 * Get current system status and health metrics
 */
export const getStatus = async (): Promise<ApiResponse<{ status: string; uptime: number; void_level: number }>> => {
  try {
    return await apiGet<{ status: string; uptime: number; void_level: number }>('/api/nothing/status');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch status',
      data: null
    };
  }
};

/**
 * Subscribe user to nothing updates
 */
export const subscribeToNothing = async (email: string): Promise<ApiResponse<{ message: string }>> => {
  try {
    return await apiPost<{ message: string }>('/api/nothing/subscribe', { email });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Subscription failed',
      data: null
    };
  }
};

/**
 * Get nothing analytics for authenticated users
 */
export const getNothingAnalytics = async (): Promise<ApiResponse<{ 
  total_nothing: number; 
  nothing_rate: number; 
  void_efficiency: number;
}>> => {
  try {
    return await apiGet<{ 
      total_nothing: number; 
      nothing_rate: number; 
      void_efficiency: number;
    }>('/api/nothing/analytics');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      data: null
    };
  }
};
