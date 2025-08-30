// Simple hook for task files - No progress tracking
import { useState, useEffect, useCallback } from 'react';
import simpleFileService, { TaskAttachment, AttachmentStats } from '@/services/simpleFileService';

export interface UseTaskFilesReturn {
  // State
  attachments: TaskAttachment[];
  stats: AttachmentStats | null;
  loading: boolean;
  uploading: boolean;

  // Actions
  uploadFile: (file: File, folder?: string) => Promise<boolean>;
  uploadFiles: (files: File[], folder?: string) => Promise<boolean>;
  deleteFile: (attachmentId: number) => Promise<boolean>;
  downloadFile: (attachment: TaskAttachment) => Promise<void>;
  refetch: () => Promise<void>;

  // Utilities
  formatFileSize: (bytes: number) => string;
  getFileIcon: (contentType: string) => string;
  validateFile: (file: File) => { isValid: boolean; error?: string };
}

export const useTaskFiles = (taskId: number): UseTaskFilesReturn => {
  // State
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [stats, setStats] = useState<AttachmentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ============================================================================
  // FETCH DATA
  // ============================================================================

  const fetchFiles = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      // Try to fetch both files and stats, but don't fail if one fails
      const filesPromise = simpleFileService.getTaskAttachments(taskId).catch((error) => {
        console.warn('⚠️ Failed to fetch attachments, using empty array:', error.message);
        return [];
      });

      const statsPromise = simpleFileService.getTaskAttachmentStats(taskId).catch((error) => {
        console.warn('⚠️ Failed to fetch attachment stats, using null:', error.message);
        return null;
      });

      const [filesResponse, statsResponse] = await Promise.all([filesPromise, statsPromise]);

      setAttachments(filesResponse);
      setStats(statsResponse);

      console.log('✅ Fetched task files:', filesResponse.length, 'files');
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      // Set empty state instead of failing completely
      setAttachments([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const refetch = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  const uploadFile = useCallback(async (file: File, folder = 'documents'): Promise<boolean> => {
    if (!taskId) return false;

    setUploading(true);
    try {
      await simpleFileService.uploadFile(file, taskId, folder);

      // Refresh files list
      await fetchFiles();

      console.log('✅ File uploaded successfully:', file.name);
      return true;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      return false;
    } finally {
      setUploading(false);
    }
  }, [taskId, fetchFiles]);

  const uploadFiles = useCallback(async (files: File[], folder = 'documents'): Promise<boolean> => {
    if (!taskId || files.length === 0) return false;

    setUploading(true);
    let allSuccess = true;

    try {
      for (const file of files) {
        try {
          await simpleFileService.uploadFile(file, taskId, folder);
          console.log('✅ Uploaded:', file.name);
        } catch (error) {
          console.error('❌ Failed to upload:', file.name, error);
          allSuccess = false;
        }
      }

      // Refresh files list
      await fetchFiles();

      if (allSuccess) {
        console.log('✅ All files uploaded successfully');
      } else {
        console.warn('⚠️ Some files failed to upload');
      }

      return allSuccess;
    } catch (error) {
      console.error('❌ Upload process failed:', error);
      return false;
    } finally {
      setUploading(false);
    }
  }, [taskId, fetchFiles]);

  const deleteFile = useCallback(async (attachmentId: number): Promise<boolean> => {
    try {
      await simpleFileService.deleteAttachment(attachmentId);

      // Refresh files list
      await fetchFiles();

      console.log('✅ File deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Delete failed:', error);
      return false;
    }
  }, [fetchFiles]);

  const downloadFile = useCallback(async (attachment: TaskAttachment): Promise<void> => {
    try {
      await simpleFileService.downloadFile(attachment);
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }, []);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const formatFileSize = useCallback((bytes: number): string => {
    return simpleFileService.formatFileSize(bytes);
  }, []);

  const getFileIcon = useCallback((contentType: string): string => {
    return simpleFileService.getFileIcon(contentType);
  }, []);

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    try {
      simpleFileService.validateFile(file);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'File validation failed'
      };
    }
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    attachments,
    stats,
    loading,
    uploading,

    // Actions
    uploadFile,
    uploadFiles,
    deleteFile,
    downloadFile,
    refetch,

    // Utilities
    formatFileSize,
    getFileIcon,
    validateFile,
  };
};

export default useTaskFiles;
