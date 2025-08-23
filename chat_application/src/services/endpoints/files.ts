import { apiClient } from '../apiClient';
import { FileMeta } from '../../types';
import { devConfig } from '../../config/devConfig';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadOptions {
  channelId?: string;
  onProgress?: UploadProgressCallback;
}

export interface UploadResult {
  file: FileMeta;
  cancel: () => void;
}

/**
 * Uploads a file with optional progress tracking
 */
export const uploadFile = async (
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const { channelId, onProgress } = options;
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', file);
  if (channelId) {
    formData.append('channelId', channelId);
  }

  // In development mode, simulate upload with progress
  if (devConfig.enable_mock_data) {
    return new Promise((resolve) => {
      let progress = 0;
      let cancelled = false;
      
      const interval = setInterval(() => {
        if (cancelled) {
          clearInterval(interval);
          return;
        }
        
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        onProgress?.(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Create mock file metadata
          const mockFile: FileMeta = {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            url: URL.createObjectURL(file), // Use object URL for preview
            uploadedBy: 'current_user',
            uploadedAt: new Date().toISOString(),
          };
          
          resolve({
            file: mockFile,
            cancel: () => {
              cancelled = true;
            }
          });
        }
      }, 100 + Math.random() * 200); // Random interval for realistic feel
      
      const cancel = () => {
        cancelled = true;
        clearInterval(interval);
      };
    });
  }

  // Production upload
  try {
    const response = await apiClient.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });

    return {
      file: response.data,
      cancel: () => {
        // In production, this would cancel the actual request
        // Implementation depends on the HTTP client being used
      }
    };
  } catch (error) {
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Lists files for a specific channel
 */
export const listFiles = async (channelId?: string): Promise<FileMeta[]> => {
  try {
    const params = channelId ? { channelId } : {};
    const response = await apiClient.get('/api/files', { params });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Deletes a file by ID
 */
export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/files/${fileId}`);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Gets file metadata by ID
 */
export const getFile = async (fileId: string): Promise<FileMeta> => {
  try {
    const response = await apiClient.get(`/api/files/${fileId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
