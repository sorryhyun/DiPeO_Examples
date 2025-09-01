import { apiClient } from '@/services/apiClient';
import { FileMeta, ApiResult } from '@/core/contracts';

// File upload request types
export interface FileUploadRequest {
  file: File;
  messageId?: string;
  channelId?: string;
  metadata?: Record<string, any>;
}

export interface FileUploadChunkRequest {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  chunk: Blob;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type FileUploadProgressCallback = (progress: FileUploadProgress) => void;

// File download types
export interface FileDownloadRequest {
  fileId: string;
  fileName?: string;
}

export interface FileListQuery {
  channelId?: string;
  messageId?: string;
  mimeType?: string;
  limit?: number;
  cursor?: string;
}

// File validation
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const ALLOWED_MIME_TYPES = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/xml',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
  }

  // Check if MIME type is allowed (using pattern matching for wildcards)
  const isAllowed = ALLOWED_MIME_TYPES.some(allowedType => {
    if (allowedType.endsWith('*')) {
      const prefix = allowedType.slice(0, -1);
      return file.type.startsWith(prefix);
    }
    return file.type === allowedType;
  });

  if (!isAllowed) {
    return `File type ${file.type} is not supported`;
  }

  return null;
}

function createFileChunks(file: File): Blob[] {
  const chunks: Blob[] = [];
  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    chunks.push(chunk);
    offset += CHUNK_SIZE;
  }

  return chunks;
}

/**
 * Upload a single file with progress tracking
 */
export async function uploadFile(
  request: FileUploadRequest,
  onProgress?: FileUploadProgressCallback
): Promise<ApiResult<FileMeta>> {
  try {
    // Validate file
    const validationError = validateFile(request.file);
    if (validationError) {
      return {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationError,
        },
      };
    }

    // For small files, upload directly
    if (request.file.size <= CHUNK_SIZE) {
      return await uploadFileSimple(request, onProgress);
    }

    // For large files, use chunked upload
    return await uploadFileChunked(request, onProgress);
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error instanceof Error ? error.message : 'Upload failed',
        details: error,
      },
    };
  }
}

/**
 * Simple upload for small files
 */
async function uploadFileSimple(
  request: FileUploadRequest,
  onProgress?: FileUploadProgressCallback
): Promise<ApiResult<FileMeta>> {
  const formData = new FormData();
  formData.append('file', request.file);

  if (request.messageId) {
    formData.append('messageId', request.messageId);
  }
  if (request.channelId) {
    formData.append('channelId', request.channelId);
  }
  if (request.metadata) {
    formData.append('metadata', JSON.stringify(request.metadata));
  }

  const xhr = new XMLHttpRequest();
  
  return new Promise<ApiResult<FileMeta>>((resolve) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const fileMeta: FileMeta = JSON.parse(xhr.responseText);
          resolve({ ok: true, data: fileMeta });
        } else {
          const error = JSON.parse(xhr.responseText);
          resolve({ ok: false, error });
        }
      } catch {
        resolve({
          ok: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse response',
          },
        });
      }
    });

    xhr.addEventListener('error', () => {
      resolve({
        ok: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error during upload',
        },
      });
    });

    xhr.open('POST', '/api/files/upload');
    
    // Add auth header if available
    const token = localStorage.getItem('authToken');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  });
}

/**
 * Chunked upload for large files
 */
async function uploadFileChunked(
  request: FileUploadRequest,
  onProgress?: FileUploadProgressCallback
): Promise<ApiResult<FileMeta>> {
  try {
    // Step 1: Initialize upload session
    const initResult = await apiClient.post<{ fileId: string; uploadUrl: string }>('/api/files/init-upload', {
      fileName: request.file.name,
      fileSize: request.file.size,
      mimeType: request.file.type,
      messageId: request.messageId,
      channelId: request.channelId,
      metadata: request.metadata,
    });

    if (!initResult.ok) {
      return initResult;
    }

    const { fileId } = initResult.data!;
    const chunks = createFileChunks(request.file);
    let uploadedBytes = 0;

    // Step 2: Upload chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunkRequest: FileUploadChunkRequest = {
        fileId,
        chunkIndex: i,
        totalChunks: chunks.length,
        chunk: chunks[i],
      };

      const chunkResult = await uploadFileChunk(chunkRequest);
      if (!chunkResult.ok) {
        // Try to cancel the upload session
        await apiClient.delete(`/api/files/upload/${fileId}`).catch(() => {});
        return chunkResult;
      }

      uploadedBytes += chunks[i].size;
      
      if (onProgress) {
        onProgress({
          loaded: uploadedBytes,
          total: request.file.size,
          percentage: Math.round((uploadedBytes / request.file.size) * 100),
        });
      }
    }

    // Step 3: Finalize upload
    const finalizeResult = await apiClient.post<FileMeta>(`/api/files/finalize-upload/${fileId}`);
    return finalizeResult;
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'CHUNKED_UPLOAD_ERROR',
        message: error instanceof Error ? error.message : 'Chunked upload failed',
        details: error,
      },
    };
  }
}

/**
 * Upload a single file chunk
 */
async function uploadFileChunk(request: FileUploadChunkRequest): Promise<ApiResult<void>> {
  const formData = new FormData();
  formData.append('fileId', request.fileId);
  formData.append('chunkIndex', request.chunkIndex.toString());
  formData.append('totalChunks', request.totalChunks.toString());
  formData.append('chunk', request.chunk);

  const xhr = new XMLHttpRequest();
  
  return new Promise<ApiResult<void>>((resolve) => {
    xhr.addEventListener('load', () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ ok: true, data: undefined });
        } else {
          const error = JSON.parse(xhr.responseText);
          resolve({ ok: false, error });
        }
      } catch {
        resolve({
          ok: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse chunk upload response',
          },
        });
      }
    });

    xhr.addEventListener('error', () => {
      resolve({
        ok: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error during chunk upload',
        },
      });
    });

    xhr.open('POST', '/api/files/upload-chunk');
    
    // Add auth header if available
    const token = localStorage.getItem('authToken');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  });
}

/**
 * Download a file by ID
 */
export async function downloadFile(request: FileDownloadRequest): Promise<ApiResult<Blob>> {
  try {
    const response = await fetch(`/api/files/download/${request.fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: 'DOWNLOAD_ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      return { ok: false, error };
    }

    const blob = await response.blob();
    return { ok: true, data: blob };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'DOWNLOAD_ERROR',
        message: error instanceof Error ? error.message : 'Download failed',
        details: error,
      },
    };
  }
}

/**
 * Get file metadata by ID
 */
export async function getFileMetadata(fileId: string): Promise<ApiResult<FileMeta>> {
  return apiClient.get<FileMeta>(`/api/files/${fileId}`);
}

/**
 * List files with optional filtering
 */
export async function listFiles(query: FileListQuery = {}): Promise<ApiResult<FileMeta[]>> {
  const params = new URLSearchParams();
  
  if (query.channelId) params.append('channelId', query.channelId);
  if (query.messageId) params.append('messageId', query.messageId);
  if (query.mimeType) params.append('mimeType', query.mimeType);
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.cursor) params.append('cursor', query.cursor);

  const queryString = params.toString();
  const endpoint = queryString ? `/api/files?${queryString}` : '/api/files';

  return apiClient.get<FileMeta[]>(endpoint);
}

/**
 * Delete a file by ID
 */
export async function deleteFile(fileId: string): Promise<ApiResult<void>> {
  return apiClient.delete(`/api/files/${fileId}`);
}

/**
 * Create a download URL for a file (for direct browser download)
 */
export function createFileDownloadUrl(fileId: string, fileName?: string): string {
  const baseUrl = `/api/files/download/${fileId}`;
  const params = new URLSearchParams();
  
  if (fileName) {
    params.append('filename', fileName);
  }
  
  // Add auth token as query param for direct downloads
  const token = localStorage.getItem('authToken');
  if (token) {
    params.append('token', token);
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const base = 1024;
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(base));
  const size = bytes / Math.pow(base, unitIndex);

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Check if a file type is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if a file type is a video
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Check if a file type is an audio file
 */
export function isAudioFile(mimeType: string): boolean {
  return mimeType.startsWith('audio/');
}

/**
 * Get file icon based on MIME type (returns emoji or CSS class name)
 */
export function getFileIcon(mimeType: string): string {
  if (isImageFile(mimeType)) return '🖼️';
  if (isVideoFile(mimeType)) return '🎥';
  if (isAudioFile(mimeType)) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('json')) return '⚙️';
  if (mimeType.includes('text')) return '📃';
  return '📁'; // default file icon
}
