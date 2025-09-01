import { Channel, ChannelCreateDTO, ApiResult, PaginatedResponse } from '@/core/contracts';
import { apiClient } from '@/services/apiClient';
import { debugLog } from '@/core/utils';

// Channel update request
interface UpdateChannelRequest {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

// Channel member request
interface ChannelMemberRequest {
  userId: string;
}

class ChannelsService {
  // Fetch all channels for the current user
  async fetchChannels(): Promise<ApiResult<Channel[]>> {
    debugLog('debug', 'Fetching channels');
    
    const result = await apiClient.get<Channel[]>('/channels');
    
    if (result.ok) {
      debugLog('debug', 'Channels fetched successfully', { count: result.data?.length });
    } else {
      debugLog('error', 'Failed to fetch channels', result.error);
    }
    
    return result;
  }

  // Get channel by ID
  async getChannelById(channelId: string): Promise<ApiResult<Channel>> {
    debugLog('debug', 'Fetching channel by ID', { channelId });
    
    const result = await apiClient.get<Channel>(`/channels/${channelId}`);
    
    if (result.ok) {
      debugLog('debug', 'Channel fetched successfully', { channelId, name: result.data?.name });
    } else {
      debugLog('error', 'Failed to fetch channel', { channelId, error: result.error });
    }
    
    return result;
  }

  // Create a new channel
  async createChannel(request: ChannelCreateDTO): Promise<ApiResult<Channel>> {
    debugLog('debug', 'Creating channel', { name: request.name, type: request.type });
    
    const result = await apiClient.post<Channel>('/channels', request);
    
    if (result.ok) {
      debugLog('info', 'Channel created successfully', { 
        channelId: result.data?.id, 
        name: result.data?.name 
      });
    } else {
      debugLog('error', 'Failed to create channel', { name: request.name, error: result.error });
    }
    
    return result;
  }

  // Update channel metadata
  async updateChannel(channelId: string, request: UpdateChannelRequest): Promise<ApiResult<Channel>> {
    debugLog('debug', 'Updating channel', { channelId, updates: request });
    
    const result = await apiClient.patch<Channel>(`/channels/${channelId}`, request);
    
    if (result.ok) {
      debugLog('info', 'Channel updated successfully', { 
        channelId, 
        name: result.data?.name 
      });
    } else {
      debugLog('error', 'Failed to update channel', { channelId, error: result.error });
    }
    
    return result;
  }

  // Delete a channel
  async deleteChannel(channelId: string): Promise<ApiResult<void>> {
    debugLog('debug', 'Deleting channel', { channelId });
    
    const result = await apiClient.delete<void>(`/channels/${channelId}`);
    
    if (result.ok) {
      debugLog('info', 'Channel deleted successfully', { channelId });
    } else {
      debugLog('error', 'Failed to delete channel', { channelId, error: result.error });
    }
    
    return result;
  }

  // Get channel members
  async getChannelMembers(channelId: string): Promise<ApiResult<string[]>> {
    debugLog('debug', 'Fetching channel members', { channelId });
    
    const result = await apiClient.get<string[]>(`/channels/${channelId}/members`);
    
    if (result.ok) {
      debugLog('debug', 'Channel members fetched successfully', { 
        channelId, 
        count: result.data?.length 
      });
    } else {
      debugLog('error', 'Failed to fetch channel members', { channelId, error: result.error });
    }
    
    return result;
  }

  // Add member to channel
  async addChannelMember(channelId: string, userId: string): Promise<ApiResult<void>> {
    debugLog('debug', 'Adding member to channel', { channelId, userId });
    
    const result = await apiClient.post<void>(
      `/channels/${channelId}/members`, 
      { userId }
    );
    
    if (result.ok) {
      debugLog('info', 'Member added to channel successfully', { channelId, userId });
    } else {
      debugLog('error', 'Failed to add member to channel', { 
        channelId, 
        userId, 
        error: result.error 
      });
    }
    
    return result;
  }

  // Remove member from channel
  async removeChannelMember(channelId: string, userId: string): Promise<ApiResult<void>> {
    debugLog('debug', 'Removing member from channel', { channelId, userId });
    
    const result = await apiClient.delete<void>(`/channels/${channelId}/members/${userId}`);
    
    if (result.ok) {
      debugLog('info', 'Member removed from channel successfully', { channelId, userId });
    } else {
      debugLog('error', 'Failed to remove member from channel', { 
        channelId, 
        userId, 
        error: result.error 
      });
    }
    
    return result;
  }

  // Join a channel (subscribe)
  async joinChannel(channelId: string): Promise<ApiResult<void>> {
    debugLog('debug', 'Joining channel', { channelId });
    
    const result = await apiClient.post<void>(`/channels/${channelId}/join`);
    
    if (result.ok) {
      debugLog('info', 'Joined channel successfully', { channelId });
    } else {
      debugLog('error', 'Failed to join channel', { channelId, error: result.error });
    }
    
    return result;
  }

  // Leave a channel (unsubscribe)
  async leaveChannel(channelId: string): Promise<ApiResult<void>> {
    debugLog('debug', 'Leaving channel', { channelId });
    
    const result = await apiClient.post<void>(`/channels/${channelId}/leave`);
    
    if (result.ok) {
      debugLog('info', 'Left channel successfully', { channelId });
    } else {
      debugLog('error', 'Failed to leave channel', { channelId, error: result.error });
    }
    
    return result;
  }

  // Search channels
  async searchChannels(query: string, type?: string): Promise<ApiResult<Channel[]>> {
    debugLog('debug', 'Searching channels', { query, type });
    
    const params: Record<string, string> = { q: query };
    if (type !== undefined) {
      params.type = type;
    }
    
    const result = await apiClient.get<Channel[]>('/channels/search', params);
    
    if (result.ok) {
      debugLog('debug', 'Channels search completed', { 
        query, 
        count: result.data?.length 
      });
    } else {
      debugLog('error', 'Failed to search channels', { query, error: result.error });
    }
    
    return result;
  }
}

// Export singleton instance
export const channelsService = new ChannelsService();

// Export individual methods for convenience
export const {
  fetchChannels,
  getChannelById,
  createChannel,
  updateChannel,
  deleteChannel,
  getChannelMembers,
  addChannelMember,
  removeChannelMember,
  joinChannel,
  leaveChannel,
  searchChannels,
} = channelsService;

// Export types
export type {
  UpdateChannelRequest,
  ChannelMemberRequest,
};

// Export the class for testing
export { ChannelsService };
