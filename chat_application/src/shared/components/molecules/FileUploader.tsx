import React, { useState, useRef, useCallback } from 'react';
import { uploadFile } from '../../services/endpoints/files';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Spinner } from '../atoms/Spinner';

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  id: string;
}

interface FileMeta {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface FileUploaderProps {
  onUpload: (fileMeta: FileMeta) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  className?: string;
}

export default function FileUploader({
  onUpload,
  accept = '*/*',
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = ''
}: FileUploaderProps) {
  const [uploadStates, setUploadStates] = useState<FileUploadState[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
    }
    return null;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    const fileId = generateId();
    const uploadState: FileUploadState = {
      file,
      progress: 0,
      status: 'pending',
      id: fileId
    };

    setUploadStates(prev => [...prev, uploadState]);

    try {
      // Update to uploading status
      setUploadStates(prev =>
        prev.map(state =>
          state.id === fileId ? { ...state, status: 'uploading' as const } : state
        )
      );

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadStates(prev =>
          prev.map(state =>
            state.id === fileId && state.status === 'uploading'
              ? { ...state, progress: Math.min(state.progress + Math.random() * 30, 90) }
              : state
          )
        );
      }, 200);

      const fileMeta = await uploadFile(file);

      clearInterval(progressInterval);

      // Update to completed status
      setUploadStates(prev =>
        prev.map(state =>
          state.id === fileId
            ? { ...state, status: 'completed' as const, progress: 100 }
            : state
        )
      );

      // Call onUpload callback
      onUpload(fileMeta);

      // Remove from upload states after a delay
      setTimeout(() => {
        setUploadStates(prev => prev.filter(state => state.id !== fileId));
      }, 2000);

    } catch (error) {
      setUploadStates(prev =>
        prev.map(state =>
          state.id === fileId ? { ...state, status: 'error' as const } : state
        )
      );
      console.error('Upload failed:', error);
    }
  }, [onUpload]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        console.error(`File validation failed for ${file.name}: ${error}`);
        return;
      }
      handleFileUpload(file);
    });
  }, [handleFileUpload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input value to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const removeUploadState = (id: string) => {
    setUploadStates(prev => prev.filter(state => state.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`file-uploader ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200 focus-within:outline-none focus-within:ring-2 
          focus-within:ring-blue-500 focus-within:border-transparent
          ${isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Upload files"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
          aria-hidden="true"
        />
        
        <Icon 
          name="upload" 
          size="lg" 
          className={`mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} 
        />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {isDragOver ? 'Drop files here' : 'Click to upload files'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            or drag and drop files here
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Max file size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>

      {/* Upload Progress List */}
      {uploadStates.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadStates.map((uploadState) => (
            <div
              key={uploadState.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {uploadState.status === 'uploading' && <Spinner size="sm" />}
                  {uploadState.status === 'completed' && (
                    <Icon name="check-circle" className="text-green-500" />
                  )}
                  {uploadState.status === 'error' && (
                    <Icon name="x-circle" className="text-red-500" />
                  )}
                  {uploadState.status === 'pending' && (
                    <Icon name="document" className="text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {uploadState.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(uploadState.file.size)}
                  </p>
                  
                  {uploadState.status === 'uploading' && (
                    <div className="mt-1">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadState.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.round(uploadState.progress)}% uploaded
                      </p>
                    </div>
                  )}
                  
                  {uploadState.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">
                      Upload failed
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeUploadState(uploadState.id)}
                className="flex-shrink-0 ml-2"
                aria-label={`Remove ${uploadState.file.name}`}
              >
                <Icon name="x" size="sm" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
