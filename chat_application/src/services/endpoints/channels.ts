import { apiClient } from '../apiClient';
import type { Channel, CreateChannelPayload, UpdateChannelPayload } from '../../types';

export interface FetchChannelsOptions {
  memberId?: string;
}

export const fetchChannels = async (options?: FetchChannelsOptions): Promise<Channel[]> => {
  const params = new URLSearchParams();
  
  if (options?.memberId) {
    params.append('memberId', options.memberId);
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/api/channels?${queryString}` : '/api/channels';
  
  const response = await apiClient.get<{channels: Channel[], nextCursor?: string}>(endpoint);
  return response.data.channels || response.data;
};

export const createChannel = async (payload: CreateChannelPayload): Promise<Channel> => {
  const response = await apiClient.post<Channel>('/api/channels', payload);
  return response.data;
};

export const updateChannel = async (
  channelId: string,
  patch: UpdateChannelPayload
): Promise<Channel> => {
  const response = await apiClient.put<Channel>(`/api/channels/${channelId}`, patch);
  return response.data;
};

export const joinChannel = async (channelId: string, userId: string): Promise<void> => {
  await apiClient.post<void>(`/api/channels/${channelId}/join`, { userId });
};
