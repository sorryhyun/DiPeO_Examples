import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../shared/hooks/useApi';
import { useWebSocket } from '../../shared/hooks/useWebSocket';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { ForumPost } from '../../types';

interface ForumThreadProps {
  threadId: string;
  initialPosts?: ForumPost[];
}

export const ForumThread = ({ threadId, initialPosts }: ForumThreadProps) => {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts || []);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: fetchedPosts, isLoading } = useApi<ForumPost[]>(
    ['forum-posts', threadId],
    () => fetch(`/api/forums/${threadId}/posts`).then(res => res.json()),
    {
      enabled: !initialPosts && !!threadId,
    }
  );

  // Update posts when fetched data is available
  useEffect(() => {
    if (fetchedPosts && !initialPosts) {
      setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : []);
    }
  }, [fetchedPosts, initialPosts]);

  // Handle WebSocket updates for new posts
  const handleNewPost = useCallback((data: any) => {
    if (data.threadId === threadId && data.post) {
      setPosts(prev => [...prev, data.post]);
    }
  }, [threadId]);

  useWebSocket('forum:newPost', handleNewPost);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReply.trim()) return;

    setIsSubmitting(true);
    
    try {
      const optimisticPost: ForumPost = {
        id: `temp-${Date.now()}`,
        courseId: '',
        authorId: 'current-user',
        author: {
          id: 'current-user',
          name: 'You', 
          email: 'user@example.com',
          firstName: 'Current',
          lastName: 'User',
          password: '',
          role: 'student' as const,
          enrolledCourses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        authorName: 'You',
        title: '',
        content: newReply.trim(),
        replies: [],
        tags: [],
        isPinned: false,
        isResolved: false,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Optimistic update
      setPosts(prev => [...prev, optimisticPost]);
      setNewReply('');

      // Make API call
      const response = await fetch(`/api/forums/${threadId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          content: newReply.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post reply');
      }

      const actualPost = await response.json();
      
      // Replace optimistic post with actual post
      setPosts(prev => 
        prev.map(post => 
          post.id === optimisticPost.id ? actualPost : post
        )
      );
    } catch (error) {
      // Remove optimistic post on error
      setPosts(prev => prev.slice(0, -1)); // Remove the last (optimistic) post
      setNewReply(newReply); // Restore the reply text
      console.error('Failed to post reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading && !initialPosts) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {post.author.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Nested replies */}
            {post.replies && post.replies.length > 0 && (
              <div className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {reply.author.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add a Reply
        </h3>
        
        <form onSubmit={handleSubmitReply} className="space-y-4">
          <div>
            <Input
              type="textarea"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              required
              disabled={isSubmitting}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newReply.trim() || isSubmitting}
              className="px-6"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Posting...
                </>
              ) : (
                'Post Reply'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
