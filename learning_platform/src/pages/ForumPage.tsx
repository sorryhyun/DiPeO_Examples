import React, { useState, useEffect } from 'react';
import { Card } from '../shared/components/Card';
import { Button } from '../shared/components/Button';
import { Input } from '../shared/components/Input';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { ForumThread } from '../features/forum/ForumThread';
import { useApi } from '../shared/hooks/useApi';
import { useWebSocket } from '../shared/hooks/useWebSocket';
import { Thread, CreateThreadRequest } from '../types';

export const ForumPage: React.FC = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');

  const {
    data: threads,
    isLoading,
    error,
    refetch: refetchThreads
  } = useApi<Thread[]>({
    endpoint: '/api/forums',
    method: 'GET'
  });

  const { mutateAsync: createThread, isPending: isCreating } = useApi<Thread, CreateThreadRequest>({
    endpoint: '/api/forums',
    method: 'POST'
  });

  // Listen for real-time thread updates
  const { lastMessage } = useWebSocket('/ws/forums');

  useEffect(() => {
    if (lastMessage?.type === 'thread_created' || lastMessage?.type === 'thread_updated') {
      refetchThreads();
    }
  }, [lastMessage, refetchThreads]);

  const handleThreadClick = (threadId: string) => {
    setSelectedThreadId(threadId);
  };

  const handleBackToList = () => {
    setSelectedThreadId(null);
  };

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      return;
    }

    try {
      await createThread({
        title: newThreadTitle,
        content: newThreadContent
      });

      setNewThreadTitle('');
      setNewThreadContent('');
      setShowCreateForm(false);
      refetchThreads();
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const handleCancelCreate = () => {
    setNewThreadTitle('');
    setNewThreadContent('');
    setShowCreateForm(false);
  };

  if (selectedThreadId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <Button
            onClick={handleBackToList}
            variant="outline"
            className="mb-4"
          >
            ← Back to Forum
          </Button>
          <ForumThread threadId={selectedThreadId} />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Failed to load forum threads
          </p>
          <Button onClick={() => refetchThreads()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Discussion Forum
          </h1>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            New Thread
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Thread
            </h2>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Thread title"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="w-full"
              />
              <textarea
                placeholder="Thread content"
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateThread}
                  disabled={isCreating || !newThreadTitle.trim() || !newThreadContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? 'Creating...' : 'Create Thread'}
                </Button>
                <Button
                  onClick={handleCancelCreate}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {threads && threads.length > 0 ? (
            threads.map((thread) => (
              <Card
                key={thread.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleThreadClick(thread.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {thread.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                      {thread.content}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 space-x-4">
                      <span>By {thread.author}</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                      <span>{thread.replyCount} replies</span>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end text-sm text-gray-500 dark:text-gray-500">
                    {thread.lastReply && (
                      <>
                        <span>Last reply by {thread.lastReply.author}</span>
                        <span>{new Date(thread.lastReply.createdAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No forum threads yet
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start the first discussion
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
