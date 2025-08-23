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
  
  return apiClient.get<Channel[]>(endpoint);
};

export const createChannel = async (payload: CreateChannelPayload): Promise<Channel> => {
  return apiClient.post<Channel>('/api/channels', payload);
};

export const updateChannel = async (
  channelId: string,
  patch: UpdateChannelPayload
): Promise<Channel> => {
  return apiClient.put<Channel>(`/api/channels/${channelId}`, patch);
};

export const joinChannel = async (channelId: string, userId: string): Promise<void> => {
  return apiClient.post<void>(`/api/channels/${channelId}/join`, { userId });
};
