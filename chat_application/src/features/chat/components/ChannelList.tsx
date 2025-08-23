import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchChannels } from '../../../services/endpoints/channels';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { Input } from '../../../shared/components/atoms/Input';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { ChannelItem } from '../../../shared/components/organisms/ChannelItem';
import type { Channel } from '../../../types';

interface ChannelListProps {
  selectedChannelId?: string;
  onSelect: (channelId: string) => void;
}

export default function ChannelList({ selectedChannelId, onSelect }: ChannelListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: channels = [], isLoading, error } = useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredChannels = channels.filter((channel: Channel) =>
    channel.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 dark:text-red-400">
          Failed to load channels. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Input
          type="text"
          placeholder="Search channels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredChannels.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {debouncedSearchTerm ? 'No channels found' : 'No channels available'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChannels.map((channel: Channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isSelected={selectedChannelId === channel.id}
                onClick={() => onSelect(channel.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
