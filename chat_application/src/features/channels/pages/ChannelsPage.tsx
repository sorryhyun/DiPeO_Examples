import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChannels, createChannel } from '../../../services/endpoints/channels';
import { useToast } from '../../../shared/hooks/useToast';
import Button from '../../../shared/components/atoms/Button';
import Input from '../../../shared/components/atoms/Input';

interface CreateChannelForm {
  name: string;
  isPrivate: boolean;
}

const ChannelsPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateChannelForm>({
    name: '',
    isPrivate: false
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: channels = [], isLoading, error } = useQuery({
    queryKey: ['channels'],
    queryFn: () => fetchChannels()
  });

  const createChannelMutation = useMutation({
    mutationFn: createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      setFormData({ name: '', isPrivate: false });
      setErrors({});
      addToast({ title: 'Channel created successfully', type: 'success' });
    },
    onError: (error: Error) => {
      addToast({ title: `Failed to create channel: ${error.message}`, type: 'error' });
    }
  });

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Channel name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    createChannelMutation.mutate({
      name: formData.name.trim(),
      private: formData.isPrivate
    });
  };

  const handleInputChange = (field: keyof CreateChannelForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (field === 'name' && errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-lg mb-2">Failed to load channels</p>
          <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Channels
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your team channels and create new ones
        </p>
      </div>

      {/* Create Channel Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Create New Channel
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Channel Name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
              placeholder="Enter channel name"
              error={errors.name}
              required
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isPrivate"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Private channel
            </label>
          </div>
          
          {formData.isPrivate && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Only invited members can see and join this channel
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={createChannelMutation.isPending}
              disabled={createChannelMutation.isPending}
            >
              Create Channel
            </Button>
          </div>
        </form>
      </div>

      {/* Channels List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Channels ({(channels as any[]).length})
          </h2>
        </div>

        {(channels as any[]).length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No channels found. Create your first channel above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {(channels as any[]).map((channel: any) => (
              <div key={channel.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {channel.isPrivate ? (
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        # {channel.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {channel.isPrivate ? 'Private' : 'Public'} • {channel.memberCount} members
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(channel.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelsPage;
