import { apiClient } from './apiClient';
import { UserPresence, ApiResult } from '@/core/contracts';
import { debugLog } from '@/core/utils';
import { shouldUseMockData } from '@/app/config';

// Mock presence data for development
const mockPresenceData: UserPresence[] = [
  {
    userId: 'user-1',
    status: 'online',
    lastSeen: new Date().toISOString(),
    customMessage: 'Working on the new feature',
  },
  {
    userId: 'user-2',
    status: 'away',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    customMessage: 'In a meeting',
  },
  {
    userId: 'user-3',
    status: 'offline',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    customMessage: null,
  },
  {
    userId: 'user-4',
    status: 'do-not-disturb',
    lastSeen: new Date().toISOString(),
    customMessage: 'Focus time - deep work',
  },
];

// Fetch current presence list for all users
export async function fetchPresence(): Promise<ApiResult<UserPresence[]>> {
  try {
    debugLog('debug', 'Fetching user presence data');

    if (shouldUseMockData) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        ok: true,
        data: mockPresenceData,
      };
    }

    const response = await apiClient.get<UserPresence[]>('/presence');
    
    if (response.ok && response.data) {
      debugLog('debug', 'Presence data fetched successfully', { 
        count: response.data.length 
      });
      
      return response;
    }

    return {
      ok: false,
      error: {
        code: 'FETCH_PRESENCE_FAILED',
        message: 'Failed to fetch presence data',
        details: response.error,
      },
    };
  } catch (error) {
    debugLog('error', 'Error fetching presence data', error);
    
    return {
      ok: false,
      error: {
        code: 'FETCH_PRESENCE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
      },
    };
  }
}

// Fetch presence for a specific user
export async function fetchUserPresence(userId: string): Promise<ApiResult<UserPresence>> {
  try {
    debugLog('debug', 'Fetching user presence', { userId });

    if (shouldUseMockData) {
      // Find mock user presence
      const userPresence = mockPresenceData.find(p => p.userId === userId);
      
      if (userPresence) {
        return {
          ok: true,
          data: userPresence,
        };
      }

      return {
        ok: false,
        error: {
          code: 'USER_PRESENCE_NOT_FOUND',
          message: 'User presence not found',
        },
      };
    }

    const response = await apiClient.get<UserPresence>(`/presence/${userId}`);
    
    if (response.ok && response.data) {
      debugLog('debug', 'User presence fetched successfully', { 
        userId,
        status: response.data.status 
      });
      
      return response;
    }

    return {
      ok: false,
      error: {
        code: 'FETCH_USER_PRESENCE_FAILED',
        message: 'Failed to fetch user presence',
        details: response.error,
      },
    };
  } catch (error) {
    debugLog('error', 'Error fetching user presence', { userId, error });
    
    return {
      ok: false,
      error: {
        code: 'FETCH_USER_PRESENCE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
      },
    };
  }
}

// Update current user's presence status
export async function setPresence(
  status: UserPresence['status'],
  customMessage?: string | null
): Promise<ApiResult<UserPresence>> {
  try {
    debugLog('debug', 'Updating presence status', { status, customMessage });

    const payload = {
      status,
      customMessage,
      lastSeen: new Date().toISOString(),
    };

    if (shouldUseMockData) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // In mock mode, we'll assume current user is user-1
      const currentUserId = 'user-1';
      const updatedPresence: UserPresence = {
        userId: currentUserId,
        status,
        customMessage,
        lastSeen: payload.lastSeen,
      };

      // Update mock data
      const existingIndex = mockPresenceData.findIndex(p => p.userId === currentUserId);
      if (existingIndex >= 0) {
        mockPresenceData[existingIndex] = updatedPresence;
      } else {
        mockPresenceData.push(updatedPresence);
      }

      debugLog('info', 'Mock presence updated', updatedPresence);

      return {
        ok: true,
        data: updatedPresence,
      };
    }

    const response = await apiClient.put<UserPresence>('/presence', payload);
    
    if (response.ok && response.data) {
      debugLog('info', 'Presence status updated successfully', { 
        status: response.data.status,
        customMessage: response.data.customMessage 
      });
      
      return response;
    }

    return {
      ok: false,
      error: {
        code: 'UPDATE_PRESENCE_FAILED',
        message: 'Failed to update presence status',
        details: response.error,
      },
    };
  } catch (error) {
    debugLog('error', 'Error updating presence status', { status, error });
    
    return {
      ok: false,
      error: {
        code: 'UPDATE_PRESENCE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
      },
    };
  }
}

// Set user as online (helper function)
export async function setOnline(customMessage?: string): Promise<ApiResult<UserPresence>> {
  return setPresence('online', customMessage);
}

// Set user as away (helper function)
export async function setAway(customMessage?: string): Promise<ApiResult<UserPresence>> {
  return setPresence('away', customMessage);
}

// Set user as do-not-disturb (helper function)
export async function setDoNotDisturb(customMessage?: string): Promise<ApiResult<UserPresence>> {
  return setPresence('do-not-disturb', customMessage);
}

// Set user as offline (helper function)
export async function setOffline(): Promise<ApiResult<UserPresence>> {
  return setPresence('offline', null);
}

// Update last seen timestamp (typically called on user activity)
export async function updateLastSeen(): Promise<ApiResult<UserPresence>> {
  try {
    debugLog('debug', 'Updating last seen timestamp');

    if (shouldUseMockData) {
      // In mock mode, find current user and update last seen
      const currentUserId = 'user-1';
      const userPresence = mockPresenceData.find(p => p.userId === currentUserId);
      
      if (userPresence) {
        userPresence.lastSeen = new Date().toISOString();
        
        return {
          ok: true,
          data: userPresence,
        };
      }

      // If user not found, create new presence entry
      const newPresence: UserPresence = {
        userId: currentUserId,
        status: 'online',
        lastSeen: new Date().toISOString(),
        customMessage: null,
      };
      
      mockPresenceData.push(newPresence);
      
      return {
        ok: true,
        data: newPresence,
      };
    }

    const response = await apiClient.patch<UserPresence>('/presence/last-seen', {
      lastSeen: new Date().toISOString(),
    });
    
    if (response.ok && response.data) {
      debugLog('debug', 'Last seen timestamp updated successfully');
      return response;
    }

    return {
      ok: false,
      error: {
        code: 'UPDATE_LAST_SEEN_FAILED',
        message: 'Failed to update last seen timestamp',
        details: response.error,
      },
    };
  } catch (error) {
    debugLog('error', 'Error updating last seen timestamp', error);
    
    return {
      ok: false,
      error: {
        code: 'UPDATE_LAST_SEEN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
      },
    };
  }
}

// Get presence status by user IDs (bulk fetch)
export async function fetchPresenceByUserIds(userIds: string[]): Promise<ApiResult<UserPresence[]>> {
  try {
    debugLog('debug', 'Fetching presence for specific users', { userIds });

    if (shouldUseMockData) {
      const filteredPresence = mockPresenceData.filter(p => userIds.includes(p.userId));
      
      return {
        ok: true,
        data: filteredPresence,
      };
    }

    const response = await apiClient.post<UserPresence[]>('/presence/bulk', {
      userIds,
    });
    
    if (response.ok && response.data) {
      debugLog('debug', 'Bulk presence data fetched successfully', { 
        requested: userIds.length,
        found: response.data.length 
      });
      
      return response;
    }

    return {
      ok: false,
      error: {
        code: 'FETCH_BULK_PRESENCE_FAILED',
        message: 'Failed to fetch bulk presence data',
        details: response.error,
      },
    };
  } catch (error) {
    debugLog('error', 'Error fetching bulk presence data', { userIds, error });
    
    return {
      ok: false,
      error: {
        code: 'FETCH_BULK_PRESENCE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
      },
    };
  }
}

// Check if user is currently online
export function isUserOnline(presence: UserPresence): boolean {
  if (presence.status === 'offline') {
    return false;
  }

  // Consider user online if they were last seen within the last 5 minutes
  const lastSeenTime = new Date(presence.lastSeen).getTime();
  const currentTime = Date.now();
  const fiveMinutesInMs = 5 * 60 * 1000;

  return currentTime - lastSeenTime < fiveMinutesInMs;
}

// Get display text for presence status
export function getPresenceStatusText(status: UserPresence['status']): string {
  switch (status) {
    case 'online':
      return 'Online';
    case 'away':
      return 'Away';
    case 'do-not-disturb':
      return 'Do not disturb';
    case 'offline':
      return 'Offline';
    default:
      return 'Unknown';
  }
}

// Get CSS color class for presence status
export function getPresenceStatusColor(status: UserPresence['status']): string {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'do-not-disturb':
      return 'bg-red-500';
    case 'offline':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
}
