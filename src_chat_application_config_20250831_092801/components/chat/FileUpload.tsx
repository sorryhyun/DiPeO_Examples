import React, { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileText, Image, Video, Music } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { filesService } from '@/services/files.service';
import { FileMetadata, ApiResult } from '@/core/contracts';
import { appConfig } from '@/app/config';
import { debugLog } from '@/core/utils';
import { events } from '@/core/events';

// File upload types
interface FileUploadProps {
  onFilesUploaded?: (files: FileMetadata[]) => void;
  onUploadStart?: (files: File[]) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  onUploadError?: (error: Error) => void;
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

interface UploadingFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  result?: FileMetadata;
}

// File type detection
const getFileIcon = (fileType: string, fileName: string) => {
  if (fileType.startsWith('image/')) {
    return <Image className="h-4 w-4" />;
  } else if (fileType.startsWith('video/')) {
    return <Video className="h-4 w-4" />;
  } else if (fileType.startsWith('audio/')) {
    return <Music className="h-4 w-4" />;
  } else {
    return <FileText className="h-4 w-4" />;
  }
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUpload({
  onFilesUploaded,
  onUploadStart,
  onUploadProgress,
  onUploadError,
  accept = '*/*',
  maxFiles = 10,
  maxFileSize = appConfig.upload.maxFileSize || 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className = ''
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  // Validate files
  const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return { valid, errors };
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File size exceeds ${formatFileSize(maxFileSize)} limit`);
        continue;
      }

      // Check file type if accept is specified
      if (accept !== '*/*') {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const isAccepted = acceptedTypes.some(acceptedType => {
          if (acceptedType.includes('*')) {
            const baseType = acceptedType.split('/')[0];
            return file.type.startsWith(baseType);
          }
          return file.type === acceptedType;
        });

        if (!isAccepted) {
          errors.push(`${file.name}: File type not accepted`);
          continue;
        }
      }

      valid.push(file);
    }

    return { valid, errors };
  }, [accept, maxFiles, maxFileSize]);

  // Generate unique file ID
  const generateFileId = useCallback((): string => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Upload single file
  const uploadFile = useCallback(async (file: File, uploadId: string): Promise<void> => {
    try {
      debugLog('debug', 'Starting file upload', { fileName: file.name, size: file.size });

      const result: ApiResult<FileMetadata> = await filesService.uploadFile(file, {
        onProgress: (progress: number) => {
          setUploadingFiles(prev => 
            prev.map(uf => 
              uf.id === uploadId 
                ? { ...uf, progress }
                : uf
            )
          );
          onUploadProgress?.(uploadId, progress);
          events.emit('file:upload_progress', { fileId: uploadId, progress });
        }
      });

      if (result.ok && result.data) {
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.id === uploadId 
              ? { ...uf, status: 'completed', progress: 100, result: result.data }
              : uf
          )
        );

        debugLog('info', 'File upload completed', { fileName: file.name, fileId: result.data.id });
        events.emit('file:upload_completed', { file: result.data });
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploadingFiles(prev => 
        prev.map(uf => 
          uf.id === uploadId 
            ? { ...uf, status: 'error', error: errorMessage }
            : uf
        )
      );

      debugLog('error', 'File upload failed', { fileName: file.name, error });
      onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
      events.emit('file:upload_error', { fileId: uploadId, error: errorMessage });
    }
  }, [onUploadProgress, onUploadError]);

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const { valid, errors } = validateFiles(fileArray);

    // Show validation errors
    if (errors.length > 0) {
      const error = new Error(errors.join('\n'));
      onUploadError?.(error);
      return;
    }

    if (valid.length === 0) return;

    // Create upload entries
    const newUploads: UploadingFile[] = valid.map(file => ({
      file,
      id: generateFileId(),
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);
    onUploadStart?.(valid);

    // Start uploads
    const uploadPromises = newUploads.map(upload => 
      uploadFile(upload.file, upload.id)
    );

    // Wait for all uploads to complete
    await Promise.allSettled(uploadPromises);

    // Collect completed uploads
    setTimeout(() => {
      setUploadingFiles(current => {
        const completed = current
          .filter(uf => uf.status === 'completed' && uf.result)
          .map(uf => uf.result!);
        
        if (completed.length > 0) {
          onFilesUploaded?.(completed);
        }
        
        // Remove completed uploads after a delay
        return current.filter(uf => uf.status !== 'completed');
      });
    }, 1000);
  }, [disabled, validateFiles, generateFileId, uploadFile, onUploadStart, onFilesUploaded, onUploadError]);

  // Remove uploading file
  const removeUploadingFile = useCallback((uploadId: string) => {
    setUploadingFiles(prev => prev.filter(uf => uf.id !== uploadId));
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCountRef.current++;
    if (dragCountRef.current === 1) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCountRef.current = 0;
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  // File input change handler
  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  // Click to select files
  const handleSelectFiles = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  // Keyboard handler for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectFiles();
    }
  }, [handleSelectFiles]);

  const hasActiveUploads = uploadingFiles.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${isDragOver && !disabled 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
            : 'hover:border-blue-400 cursor-pointer'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleSelectFiles}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Upload files by clicking or dragging and dropping"
        aria-disabled={disabled}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-hidden="true"
        />

        {/* Drop zone content */}
        <div className="flex flex-col items-center text-center">
          <Upload className={`h-8 w-8 mb-2 ${disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`} />
          <p className={`text-sm font-medium mb-1 ${disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {isDragOver ? 'Drop files here' : 'Drag files here or click to select'}
          </p>
          <p className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
            Max {maxFiles} files, up to {formatFileSize(maxFileSize)} each
          </p>
        </div>
      </div>

      {/* Upload progress */}
      {hasActiveUploads && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Uploading Files
          </h4>
          {uploadingFiles.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {/* File icon */}
              <div className="flex-shrink-0 text-gray-400">
                {getFileIcon(upload.file.type, upload.file.name)}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {upload.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(upload.file.size)}
                </p>

                {/* Progress bar */}
                {upload.status === 'uploading' && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full transition-all duration-200"
                        style={{ width: `${upload.progress}%` }}
                        role="progressbar"
                        aria-valuenow={upload.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Upload progress: ${upload.progress}%`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {upload.progress.toFixed(0)}%
                    </span>
                  </div>
                )}

                {/* Error message */}
                {upload.status === 'error' && upload.error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {upload.error}
                  </p>
                )}

                {/* Completed message */}
                {upload.status === 'completed' && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Upload completed
                  </p>
                )}
              </div>

              {/* Remove button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeUploadingFile(upload.id);
                }}
                className="flex-shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={`Remove ${upload.file.name} from uploads`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
