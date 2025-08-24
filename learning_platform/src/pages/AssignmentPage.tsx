import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../shared/components/Layout';
import { Card } from '../shared/components/Card';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { AssignmentUploader } from '../features/assignments/AssignmentUploader';
import { useApi } from '../shared/hooks/useApi';
import { Assignment, AssignmentSubmission } from '../types';

export const AssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  if (!assignmentId) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-red-600 dark:text-red-400">
            Assignment ID is required
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <AssignmentContent assignmentId={assignmentId} />
      </Suspense>
    </Layout>
  );
};

interface AssignmentContentProps {
  assignmentId: string;
}

const AssignmentContent: React.FC<AssignmentContentProps> = ({ assignmentId }) => {
  const { data: assignment } = useApi<Assignment>(
    ['assignment', assignmentId],
    () => fetch(`/assignments/${assignmentId}`).then(res => res.json())
  );

  const { data: submission, refetch: refetchSubmission } = useApi<AssignmentSubmission>(
    ['assignment-submission', assignmentId],
    () => fetch(`/assignments/${assignmentId}/submission`).then(res => res.json())
  );

  const handleUploadSuccess = () => {
    refetchSubmission();
  };

  if (!assignment) {
    return (
      <div className="p-6">
        <div className="text-red-600 dark:text-red-400">
          Assignment not found
        </div>
      </div>
    );
  }

  const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null;
  const now = new Date();
  const isOverdue = dueDate ? now > dueDate : false;
  const timeRemaining = dueDate ? dueDate.getTime() - now.getTime() : 0;
  const daysRemaining = dueDate ? Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {assignment.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          <span>Course: {assignment.courseName}</span>
          <span>•</span>
          <span>Points: {assignment.maxPoints}</span>
          <span>•</span>
          {dueDate && (
            <span className={isOverdue ? 'text-red-600 dark:text-red-400' : ''}>
              Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <Card className="p-4">
        {isOverdue ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Assignment Overdue
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  This assignment was due {Math.abs(daysRemaining)} days ago.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Assignment Active
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {daysRemaining > 0 
                    ? `${daysRemaining} days remaining until due date`
                    : 'Due today'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Assignment Description */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Instructions
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {assignment.description}
          </p>
        </div>
      </Card>

      {/* Submission Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Submission
        </h2>
        
        {submission ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Submitted
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Submitted on {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Files:
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {submission.files.length} file(s)
                </span>
              </div>
              <ul className="space-y-1">
                {submission.files.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {file.name} ({Math.round(file.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            </div>

            {submission.grade !== undefined && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Grade:
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {submission.grade}/{assignment.maxPoints}
                  </span>
                </div>
                {submission.feedback && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Feedback:</span> {submission.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You can resubmit your assignment if needed. Your latest submission will be graded.
              </p>
              <AssignmentUploader
                assignmentId={assignmentId}
                onUploaded={handleUploadSuccess}
              />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You haven't submitted this assignment yet. Upload your files below to submit.
            </p>
            <AssignmentUploader
              assignmentId={assignmentId}
              onUploaded={handleUploadSuccess}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
