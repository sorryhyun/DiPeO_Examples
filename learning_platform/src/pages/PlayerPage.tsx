import { useParams } from 'react-router-dom';
import { useState, useCallback, useRef } from 'react';
import { VideoPlayer } from '../features/video/VideoPlayer';
import { useApi } from '../shared/hooks/useApi';
import { apiClient } from '../services/apiClient';
import { Layout } from '../shared/components/Layout';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { Card } from '../shared/components/Card';
import type { Lesson } from '../types';

export function PlayerPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [savedIndicator, setSavedIndicator] = useState(false);
  const progressTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    data: lesson,
    isLoading,
    error
  } = useApi<Lesson>(`/api/lessons/${lessonId}`, {
    enabled: !!lessonId
  });

  const saveProgress = useCallback(async (progress: number) => {
    if (!lessonId) return;
    
    try {
      await apiClient.post('/api/lessons/progress', {
        lessonId,
        progress,
        timestamp: new Date().toISOString()
      });
      
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [lessonId]);

  const handleProgress = useCallback((progress: number) => {
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
    
    progressTimeoutRef.current = setTimeout(() => {
      saveProgress(progress);
    }, 2000);
  }, [saveProgress]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error || !lesson) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Error Loading Lesson
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error?.message || 'Lesson not found'}
            </p>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {lesson.description}
            </p>
          )}
        </div>

        <Card className="relative">
          {savedIndicator && (
            <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Progress saved
            </div>
          )}
          
          <VideoPlayer
            src={lesson.videoUrl}
            title={lesson.title}
            onProgress={handleProgress}
            className="w-full"
          />
        </Card>

        {lesson.content && (
          <Card className="mt-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-4">Lesson Notes</h2>
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </div>
          </Card>
        )}

        {lesson.resources && lesson.resources.length > 0 && (
          <Card className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Resources</h2>
            <ul className="space-y-2">
              {lesson.resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {resource.title}
                  </a>
                  {resource.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {resource.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </Layout>
  );
}
