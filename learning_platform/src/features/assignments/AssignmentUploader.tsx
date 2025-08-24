import { useState, useRef } from 'react';
import { useMutationApi } from '../../shared/hooks/useApi';
import { Button } from '../../shared/components/Button';
import { Assignment, AssignmentSubmission } from '../../types';

interface AssignmentUploaderProps {
  assignmentId: string;
  assignment: Assignment;
  onUploaded: (submission: AssignmentSubmission) => void;
}

export function AssignmentUploader({ assignmentId, assignment, onUploaded }: AssignmentUploaderProps) {
  const [submissionType, setSubmissionType] = useState<'text' | 'file'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: submitAssignment, isPending: isLoading } = useMutationApi(
    async (data: FormData | { content: string }) => {
      const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit assignment');
      }
      
      return response.json();
    },
    {
      onSuccess: (submission: AssignmentSubmission) => {
        setTextContent('');
        setSelectedFile(null);
        setValidationError(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onUploaded(submission);
      },
      onError: (error: any) => {
        setValidationError(error instanceof Error ? error.message : 'Submission failed');
        setUploadProgress(0);
      }
    }
  );

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload PDF, Word document, text file, or image.';
    }

    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setValidationError(null);
      return;
    }

    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setValidationError(null);
  };

  const handleTextSubmit = () => {
    if (!textContent.trim()) {
      setValidationError('Please enter your assignment content');
      return;
    }

    if (textContent.length < 10) {
      setValidationError('Assignment content must be at least 10 characters long');
      return;
    }

    setValidationError(null);
    submitAssignment({ content: textContent.trim() });
  };

  const handleFileSubmit = () => {
    if (!selectedFile) {
      setValidationError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('assignmentId', assignmentId);

    setValidationError(null);
    setUploadProgress(10); // Simulate progress
    submitAssignment(formData);
  };

  const handleSubmit = () => {
    if (submissionType === 'text') {
      handleTextSubmit();
    } else {
      handleFileSubmit();
    }
  };

  const canSubmit = submissionType === 'text' 
    ? textContent.trim().length >= 10
    : selectedFile !== null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Submit Assignment: {assignment.title}
      </h3>

      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setSubmissionType('text')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              submissionType === 'text'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            aria-pressed={submissionType === 'text'}
          >
            Text Submission
          </button>
          <button
            type="button"
            onClick={() => setSubmissionType('file')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              submissionType === 'file'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            aria-pressed={submissionType === 'file'}
          >
            File Upload
          </button>
        </div>

        {submissionType === 'text' && (
          <div className="space-y-4">
            <label htmlFor="assignment-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Assignment Content
            </label>
            <textarea
              id="assignment-text"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-vertical"
              placeholder="Enter your assignment content here..."
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Minimum 10 characters required. Current: {textContent.length}
            </p>
          </div>
        )}

        {submissionType === 'file' && (
          <div className="space-y-4">
            <label htmlFor="assignment-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload File
            </label>
            <input
              ref={fileInputRef}
              id="assignment-file"
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-300"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported formats: PDF, Word documents, text files, images. Maximum size: 10MB
            </p>
            {selectedFile && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </div>
            )}
          </div>
        )}
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
        </div>
      )}

      {isLoading && uploadProgress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          className="px-6 py-2"
        >
          {isLoading ? 'Submitting...' : 'Submit Assignment'}
        </Button>
      </div>

      {assignment.dueDate && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Due: {new Date(assignment.dueDate).toLocaleDateString()} at {new Date(assignment.dueDate).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
