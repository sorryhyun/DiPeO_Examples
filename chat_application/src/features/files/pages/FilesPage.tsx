import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { filesService } from '../../../services/endpoints/files';
import { FileUploader } from '../../../shared/components/molecules/FileUploader';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { Icon } from '../../../shared/components/atoms/Icon';
import { formatDate } from '../../../utils/formatDate';
import type { FileMeta } from '../../../types';

const FilesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [showUploader, setShowUploader] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: files = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['files'],
    queryFn: filesService.listFiles
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['files'] });
    setShowUploader(false);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = selectedChannel === 'all' || file.channelId === selectedChannel;
    return matchesSearch && matchesChannel;
  });

  const channels = Array.from(new Set(files.map(file => file.channelId)));

  const groupedFiles = filteredFiles.reduce((groups, file) => {
    const date = new Date(file.uploadedAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(file);
    return groups;
  }, {} as Record<string, FileMeta[]>);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'document';
    if (mimeType.includes('text') || mimeType.includes('document')) return 'document';
    return 'file';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 dark:text-red-400">Failed to load files</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['files'] })}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Files</h1>
          <Button onClick={() => setShowUploader(true)}>
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Channels</option>
            {channels.map(channelId => (
              <option key={channelId} value={channelId}>
                #{channelId}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery || selectedChannel !== 'all' ? 'No files match your filters' : 'No files uploaded yet'}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedFiles)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dateFiles]) => (
                <div key={date}>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {date}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dateFiles.map(file => (
                      <div
                        key={file.id}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <Icon
                            name={getFileIcon(file.mimeType)}
                            className="w-8 h-8 text-blue-500 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)} • #{file.channelId}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {formatDate(new Date(file.uploadedAt))}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Icon name="eye" className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.url;
                              link.download = file.name;
                              link.click();
                            }}
                          >
                            <Icon name="download" className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload File
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowUploader(false)}
              >
                <Icon name="x" className="w-5 h-5" />
              </Button>
            </div>
            <FileUploader
              channelId="general" // Default channel, could be made dynamic
              onUploadSuccess={handleUploadSuccess}
              onError={(error) => {
                console.error('Upload failed:', error);
                // Could show toast notification here
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPage;
