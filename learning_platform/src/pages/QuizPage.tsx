import { useParams, useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { QuizForm } from '../features/quiz/QuizForm';
import { useApi, useMutationApi } from '../shared/hooks/useApi';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { Card } from '../shared/components/Card';
import { Button } from '../shared/components/Button';
import { Quiz, QuizSubmission } from '../types/index';

interface QuizPageContentProps {
  quiz: Quiz;
  onSubmit: (submission: QuizSubmission) => void;
}

function QuizPageContent({ quiz, onSubmit }: QuizPageContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {quiz.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Time Limit: {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No limit'}</span>
              <span>Questions: {quiz.questions.length}</span>
              <span>Total Points: {quiz.totalPoints}</span>
            </div>
          </div>
          
          <QuizForm 
            quiz={quiz}
            onSubmitComplete={onSubmit}
          />
        </Card>
      </div>
    </div>
  );
}

interface QuizResultsProps {
  submission: QuizSubmission;
  quiz: Quiz;
  onViewGrades: () => void;
  onReturnToCourse: () => void;
}

function QuizResults({ submission, quiz, onViewGrades, onReturnToCourse }: QuizResultsProps) {
  const score = submission.score || 0;
  const scorePercentage = Math.round((score / quiz.totalPoints) * 100);
  const passed = scorePercentage >= (quiz.passingScore || 70);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            {passed ? (
              <div className="text-green-600 dark:text-green-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h2 className="text-2xl font-bold">Congratulations!</h2>
                <p className="text-lg">You passed the quiz!</p>
              </div>
            ) : (
              <div className="text-red-600 dark:text-red-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h2 className="text-2xl font-bold">Quiz Complete</h2>
                <p className="text-lg">You need {quiz.passingScore || 70}% to pass.</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="text-4xl font-bold mb-2">
              <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {scorePercentage}%
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {score} out of {quiz.totalPoints} points
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {submission.submittedAt && `Submitted at ${new Date(submission.submittedAt).toLocaleString()}`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              onClick={onViewGrades}
              className="w-full sm:w-auto"
            >
              View Detailed Grades
            </Button>
            <Button 
              variant="secondary" 
              onClick={onReturnToCourse}
              className="w-full sm:w-auto"
            >
              Return to Course
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function QuizPage() {
  const { quizId, courseId } = useParams<{ quizId: string; courseId: string }>();
  const navigate = useNavigate();
  
  const { data: quiz, isLoading, error } = useApi<Quiz>(
    ['quiz', quizId],
    () => fetch(`/api/quizzes/${quizId}`).then(res => res.json()),
    { enabled: !!quizId }
  );

  const { mutate: submitQuiz, data: submission, isPending: isSubmitting } = useMutationApi<QuizSubmission, QuizSubmission>(
    async (submissionData: QuizSubmission) => {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      return response.json();
    }
  );

  const handleSubmit = (submissionData: QuizSubmission) => {
    submitQuiz(submissionData);
  };

  const handleViewGrades = () => {
navigate('/grades');
  };

  const handleReturnToCourse = () => {
    if (courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      navigate('/courses');
    }
  };

  if (error) {
    throw new Error('Failed to load quiz');
  }

  if (isLoading || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show results if quiz has been submitted
  if (submission) {
    return (
      <QuizResults 
        submission={submission}
        quiz={quiz}
        onViewGrades={handleViewGrades}
        onReturnToCourse={handleReturnToCourse}
      />
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <QuizPageContent 
          quiz={quiz}
          onSubmit={handleSubmit}
        />
        
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="text-center">
                <LoadingSpinner size="md" className="mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Submitting your quiz...
                </p>
              </div>
            </Card>
          </div>
        )}
      </Suspense>
    </ErrorBoundary>
  );
}
