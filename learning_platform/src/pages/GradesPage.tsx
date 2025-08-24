import { Suspense } from 'react';
import { useAuth } from '../shared/hooks/useAuth';
import { useApi } from '../shared/hooks/useApi';
import { GradeBookTable } from '../features/grades/GradeBookTable';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import type { Grade } from '../types';

export const GradesPage = () => {
  const { user } = useAuth();
  const { data: grades, isLoading, error } = useApi<Grade[]>('/api/grades');

  const displayMode = user?.role === 'instructor' ? 'instructor' : 'student';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    throw error;
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Grades
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {displayMode === 'instructor' 
              ? 'View and manage student grades' 
              : 'View your course grades and progress'
            }
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <GradeBookTable 
            grades={grades || []} 
            displayMode={displayMode}
          />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};
