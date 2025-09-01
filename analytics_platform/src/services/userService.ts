// src/services/userService.ts
/* src/services/userService.ts
   User-related API calls (fetch profile, update profile, list metrics) used by dashboard features.
   - Provides typed methods for user operations
   - Uses central API client for consistent request handling
   - Returns ApiResult wrapped responses for consistent error handling
   - Includes mock data support for development
*/

import { User, ApiResult, UserProfile, UserMetrics, UpdateProfileRequest } from '@/core/contracts';
import { apiClient } from '@/services/api';
import { shouldUseMockData, mockUser } from '@/app/config';

/**
 * Fetches the current user's profile information
 */
export async function fetchUserProfile(): Promise<ApiResult<UserProfile>> {
  // Return mock data in development if enabled
  if (shouldUseMockData && mockUser) {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const mockProfile: UserProfile = {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      avatar: mockUser.avatar,
      bio: 'Mock user profile for development',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    };
    
    return { data: mockProfile };
  }

  try {
    const response = await apiClient.get<UserProfile>('/user/profile');
    return { data: response.data };
  } catch (error) {
    return apiClient.handleError(error, 'Failed to fetch user profile');
  }
}

/**
 * Updates the current user's profile information
 */
export async function updateUserProfile(updates: UpdateProfileRequest): Promise<ApiResult<UserProfile>> {
  // Return mock data in development if enabled
  if (shouldUseMockData && mockUser) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const mockProfile: UserProfile = {
      id: mockUser.id,
      email: mockUser.email,
      name: updates.name || mockUser.name,
      role: mockUser.role,
      avatar: updates.avatar || mockUser.avatar,
      bio: updates.bio || 'Mock user profile for development',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      preferences: {
        theme: updates.preferences?.theme || 'light',
        notifications: updates.preferences?.notifications ?? true,
        language: updates.preferences?.language || 'en'
      }
    };
    
    return { data: mockProfile };
  }

  try {
    const response = await apiClient.put<UserProfile>('/user/profile', updates);
    return { data: response.data };
  } catch (error) {
    return apiClient.handleError(error, 'Failed to update user profile');
  }
}

/**
 * Fetches user metrics for dashboard display
 */
export async function fetchUserMetrics(): Promise<ApiResult<UserMetrics>> {
  // Return mock data in development if enabled
  if (shouldUseMockData) {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
    
    const mockMetrics: UserMetrics = {
      totalLogins: Math.floor(Math.random() * 100) + 50,
      lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      accountAge: Math.floor(Math.random() * 365) + 30, // days
      activityScore: Math.floor(Math.random() * 100),
      completedTasks: Math.floor(Math.random() * 50) + 10,
      pendingTasks: Math.floor(Math.random() * 20) + 5,
      monthlyActiveHours: Math.floor(Math.random() * 160) + 40,
      preferredWorkingHours: {
        start: '09:00',
        end: '17:00'
      }
    };
    
    return { data: mockMetrics };
  }

  try {
    const response = await apiClient.get<UserMetrics>('/user/metrics');
    return { data: response.data };
  } catch (error) {
    return apiClient.handleError(error, 'Failed to fetch user metrics');
  }
}

/**
 * Fetches a list of users (for admin/management features)
 */
export async function fetchUserList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<ApiResult<{ users: User[]; total: number; page: number; totalPages: number }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.role) queryParams.append('role', params.role);

  // Return mock data in development if enabled
  if (shouldUseMockData) {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
    
    const mockUsers: User[] = Array.from({ length: params?.limit || 10 }, (_, i) => ({
      id: `mock-user-${i + 1}`,
      email: `user${i + 1}@example.com`,
      name: `Mock User ${i + 1}`,
      fullName: `Mock User ${i + 1}`,
      role: i % 3 === 0 ? 'admin' : i % 2 === 0 ? 'doctor' : 'patient',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 1}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 1}`,
      createdAt: new Date().toISOString()
    } as User));
    
    return {
      data: {
        users: mockUsers,
        total: 50,
        page: params?.page || 1,
        totalPages: Math.ceil(50 / (params?.limit || 10))
      }
    };
  }

  try {
    const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<{ users: User[]; total: number; page: number; totalPages: number }>(url);
    return { data: response.data };
  } catch (error) {
    return apiClient.handleError(error, 'Failed to fetch user list');
  }
}

/**
 * Deletes a user account (admin only)
 */
export async function deleteUser(userId: string): Promise<ApiResult<{ success: boolean }>> {
  // In mock mode, simulate success
  if (shouldUseMockData) {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    return { data: { success: true } };
  }

  try {
    const response = await apiClient.delete<{ success: boolean }>(`/users/${userId}`);
    return { data: response.data };
  } catch (error) {
    return apiClient.handleError(error, 'Failed to delete user');
  }
}

/**
 * Updates another user's role (admin only)
 */
export async function updateUserRole(userId: string, role: string): Promise<ApiResult<User>> {
  // In mock mode, return updated user
  if (shouldUseMockData) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const mockUpdatedUser: User = {
      id: userId,
      email: `user@example.com`,
      name: 'Mock User',
      fullName: 'Mock User',
      role: role as any, // Cast to avoid role type issues
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      createdAt: new Date().toISOString()
    } as User;
    
    return { data: mockUpdatedUser };
  }

  try {
    const response = await apiClient.put<User>(`/users/${userId}/role`, { role });
    return { data: response.data };
  } catch (error) {
    return apiClient.handleError(error, 'Failed to update user role');
  }
}

/**
 * Service object for user-related operations
 * Provides centralized access to user API methods
 */
export const userService = {
  fetchUserProfile,
  updateUserProfile,
  fetchUserMetrics,
  fetchUserList,
  deleteUser,
  updateUserRole,
  // Alias for dashboard compatibility
  getDashboardMetrics: fetchUserMetrics
};

/*
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config`
- [x] Exports default named component (exports named functions and service object)
- [x] Adds basic ARIA and keyboard handlers (not relevant for service layer)
*/
