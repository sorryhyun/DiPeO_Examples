import React, { useState } from 'react';
import { Button } from '../../shared/components/Button';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { useMutationApi } from '../../shared/hooks/useApi';
import { Quiz, QuizQuestion } from '../../types';
import { validateRequired } from '../../utils/validators';

export interface QuizFormProps {
  quiz?: Quiz;
  quizId?: string;
  onSubmitComplete?: (result: any) => void;
}

export const QuizForm: React.FC<QuizFormProps> = ({
  quiz,
  quizId,
  onSubmitComplete
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { mutate: submitQuiz, isPending: isLoading, error } = useMutationApi(
    async (answers: Record<string, string | string[]>) => {
      const endpoint = quiz ? `/api/quizzes/${quiz.id}/submit` : `/api/quizzes/${quizId}/submit`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      
      return response.json();
    },
    {
      onSuccess: (result: any) => {
        onSubmitComplete?.(result);
      }
    }
  );

  if (!quiz && !quizId) {
    return <div className="text-red-600">Quiz not found</div>;
  }

  const handleAnswerChange = (questionId: string, answerId: string, isMultiple: boolean) => {
    setSelectedAnswers(prev => {
      if (isMultiple) {
        const currentAnswers = (prev[questionId] as string[]) || [];
        const newAnswers = currentAnswers.includes(answerId)
          ? currentAnswers.filter(id => id !== answerId)
          : [...currentAnswers, answerId];
        return { ...prev, [questionId]: newAnswers };
      } else {
        return { ...prev, [questionId]: answerId };
      }
    });

    // Clear validation error when user selects an answer
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    quiz?.questions?.forEach((question: QuizQuestion) => {
      if (question.required) {
        const answer = selectedAnswers[question.id];
        const validationError = validateRequired(typeof answer === 'string' ? answer : '');
        if (validationError) {
          errors[question.id] = 'This question is required';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    submitQuiz(selectedAnswers);
  };

  const renderQuestion = (question: QuizQuestion) => {
    const isMultiple = question.type === 'multiple-choice' && Array.isArray(question.correctAnswer);
    const selectedAnswer = selectedAnswers[question.id];
    const hasError = validationErrors[question.id];

    return (
      <div key={question.id} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
          {question.text || question.question}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        
        <div className="space-y-2" role="radiogroup" aria-labelledby={`question-${question.id}`}>
          {(question.answers || question.options)?.map((answer: any, index: number) => (
            <label
              key={answer.id || index}
              className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <input
                type={isMultiple ? 'checkbox' : 'radio'}
                name={`question-${question.id}`}
                value={typeof answer === 'string' ? answer : answer.id || answer}
                checked={
                  isMultiple
                    ? ((selectedAnswer as string[]) || []).includes(typeof answer === 'string' ? answer : answer.id || answer)
                    : selectedAnswer === (typeof answer === 'string' ? answer : answer.id || answer)
                }
                onChange={() => handleAnswerChange(question.id, typeof answer === 'string' ? answer : answer.id || answer, isMultiple)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                aria-describedby={hasError ? `error-${question.id}` : undefined}
              />
              <span className="text-gray-700 dark:text-gray-300">{typeof answer === 'string' ? answer : answer.text || answer}</span>
            </label>
          ))}
        </div>
        
        {hasError && (
          <div
            id={`error-${question.id}`}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {hasError}
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {quiz?.title || 'Quiz'}
        </h2>
        {quiz?.description && (
          <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
        )}
      </div>

      <div className="space-y-6 mb-8">
        {quiz?.questions?.map(renderQuestion)}
      </div>

      {error && (
        <div
          className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <p className="text-red-800 dark:text-red-200">
            {error instanceof Error ? error.message : 'Failed to submit quiz. Please try again.'}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px]"
          aria-describedby="submit-status"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Quiz'
          )}
        </Button>
      </div>

      <div id="submit-status" className="sr-only" aria-live="polite">
        {isLoading && 'Submitting quiz...'}
      </div>
    </form>
  );
};
