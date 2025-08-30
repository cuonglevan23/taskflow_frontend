// hooks/useFileDownload.ts
import { useCallback } from 'react';
import { api } from '@/lib/api';

export interface FileInfo {
  fileKey: string;
  contentType: string;
  contentLength: number;
  lastModified: string;
  metadata: {
    'original-filename': string;
    'task-id': string;
    'uploaded-by': string;
    'upload-timestamp': string;
  };
}

export interface UseFileDownloadReturn {
  downloadFile: (fileKey: string, fileName?: string) => Promise<void>;
  getFileInfo: (fileKey: string) => Promise<FileInfo>;
  deleteFile: (fileKey: string) => Promise<void>;
}

export const useFileDownload = (): UseFileDownloadReturn => {
  const downloadFile = useCallback(async (fileKey: string, fileName?: string) => {
    try {
      // Get presigned download URL
      const response = await api.get(`/api/files/download/${encodeURIComponent(fileKey)}`);
      const downloadUrl = response.data;

      // Download file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }, []);

  const getFileInfo = useCallback(async (fileKey: string): Promise<FileInfo> => {
    try {
      const response = await api.get(`/api/files/info/${encodeURIComponent(fileKey)}`);
      return response.data;
    } catch (error) {
      console.error('Get file info failed:', error);
      throw error;
    }
  }, []);

  const deleteFile = useCallback(async (fileKey: string) => {
    try {
      await api.delete(`/api/files/${encodeURIComponent(fileKey)}`);
    } catch (error) {
      console.error('Delete file failed:', error);
      throw error;
    }
  }, []);

  return {
    downloadFile,
    getFileInfo,
    deleteFile,
  };
};
