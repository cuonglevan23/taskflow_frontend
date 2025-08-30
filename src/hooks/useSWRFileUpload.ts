// SWR-based File Upload Hook - Updated to use simpleFileService
import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import simpleFileService, { TaskAttachment, AttachmentStats } from '@/services/simpleFileService';

// ============================================================================
// SWR KEYS - Standardized across the app
// ============================================================================

export const getAttachmentsKey = (taskId: number) => `/api/tasks/${taskId}/attachments`;
export const getAttachmentStatsKey = (taskId: number) => `/api/tasks/${taskId}/attachments/stats`;

// ============================================================================
// TYPE DEFINITIONS - Simplified
// ============================================================================

export interface UploadProgress {
  completed: number;
  total: number;
  currentFile: string;
  percentage: number;
}

export interface UseSWRFileUploadReturn {
  // SWR Data
  attachments: TaskAttachment[];
  stats: AttachmentStats | null;
  isLoading: boolean;
  error: any;

  // Upload State
  isUploading: boolean;
  uploadProgress: UploadProgress | null;

  // Upload Actions
  uploadFiles: (files: File[], taskId: number, folder?: string) => Promise<boolean>;
  uploadSingleFile: (file: File, taskId: number, folder?: string) => Promise<boolean>;

  // File Management
  deleteAttachment: (taskId: number, attachmentId: number) => Promise<void>;
  downloadFile: (attachment: TaskAttachment) => Promise<void>;
  previewFile: (attachment: TaskAttachment) => Promise<void>; // ✅ ADDED: Missing previewFile function

  // Cache Management
  mutateAttachments: () => Promise<any>;
  refreshAttachments: () => Promise<void>;

  // Utilities
  validateFiles: (files: File[]) => { validFiles: File[]; invalidFiles: Array<{ file: File; error: string }> };
  clearResults: () => void;
}

// ============================================================================
// SWR FILE UPLOAD HOOK - Simplified
// ============================================================================

export const useSWRFileUpload = (taskId: number): UseSWRFileUploadReturn => {
  // SWR Data for attachments
  const {
    data: attachments = [],
    error,
    isLoading,
    mutate: mutateAttachments
  } = useSWR<TaskAttachment[]>(
    taskId ? getAttachmentsKey(taskId) : null,
    () => simpleFileService.getTaskAttachments(taskId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds dedup
    }
  );

  // SWR Data for stats
  const {
    data: stats = null,
  } = useSWR<AttachmentStats>(
    taskId ? getAttachmentStatsKey(taskId) : null,
    () => simpleFileService.getTaskAttachmentStats(taskId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute dedup for stats
    }
  );

  // Local upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  // ============================================================================
  // UPLOAD FUNCTIONS - Simplified
  // ============================================================================

  const uploadSingleFile = useCallback(async (
    file: File,
    taskId: number,
    folder: string = 'documents'
  ): Promise<boolean> => {
    try {
      setIsUploading(true);
      setUploadProgress({
        completed: 0,
        total: 1,
        currentFile: file.name,
        percentage: 0
      });

      console.log('📤 Starting single file upload:', file.name);

      await simpleFileService.uploadFile(file, taskId, folder);

      setUploadProgress({
        completed: 1,
        total: 1,
        currentFile: file.name,
        percentage: 100
      });

      // Mutate SWR cache to update all components
      await mutateAttachments();
      mutate(getAttachmentStatsKey(taskId));

      console.log('✅ Single file upload completed and cache updated');
      return true;

    } catch (error) {
      console.error('❌ Single file upload failed:', error);
      return false;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 1000); // Clear progress after 1 second
    }
  }, [mutateAttachments, taskId]);

  const uploadFiles = useCallback(async (
    files: File[],
    taskId: number,
    folder: string = 'documents'
  ): Promise<boolean> => {
    if (files.length === 0) return true;

    try {
      setIsUploading(true);
      console.log('📤 Starting bulk file upload:', files.length, 'files');

      let successCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        setUploadProgress({
          completed: i,
          total: files.length,
          currentFile: file.name,
          percentage: Math.round((i / files.length) * 100)
        });

        try {
          await simpleFileService.uploadFile(file, taskId, folder);
          successCount++;
          console.log(`✅ File ${i + 1}/${files.length} uploaded:`, file.name);
        } catch (error) {
          console.error(`❌ File ${i + 1}/${files.length} failed:`, file.name, error);
        }

        // Small delay between uploads
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setUploadProgress({
        completed: files.length,
        total: files.length,
        currentFile: 'Completed',
        percentage: 100
      });

      // Mutate SWR cache
      await mutateAttachments();
      mutate(getAttachmentStatsKey(taskId));

      console.log(`✅ Bulk upload completed: ${successCount}/${files.length} files successful`);
      return successCount === files.length;

    } catch (error) {
      console.error('❌ Bulk upload failed:', error);
      return false;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 2000); // Clear progress after 2 seconds
    }
  }, [mutateAttachments, taskId]);

  // ============================================================================
  // FILE MANAGEMENT FUNCTIONS
  // ============================================================================

  const deleteAttachment = useCallback(async (taskId: number, attachmentId: number) => {
    try {
      await simpleFileService.deleteAttachment(attachmentId);

      // Mutate SWR cache
      await mutateAttachments();
      mutate(getAttachmentStatsKey(taskId));

      console.log('✅ File deleted and cache updated');
    } catch (error) {
      console.error('❌ Delete attachment failed:', error);
      throw error;
    }
  }, [mutateAttachments]);

  const downloadFile = useCallback(async (attachment: TaskAttachment) => {
    try {
      await simpleFileService.downloadFile(attachment);
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }, []);

  const previewFile = useCallback(async (attachment: TaskAttachment) => {
    try {
      await simpleFileService.previewFile(attachment);
    } catch (error) {
      console.error('❌ Preview failed:', error);
      throw error;
    }
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const validateFiles = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: Array<{ file: File; error: string }> = [];

    files.forEach(file => {
      try {
        simpleFileService.validateFile(file);
        validFiles.push(file);
      } catch (error) {
        invalidFiles.push({
          file,
          error: error instanceof Error ? error.message : 'Invalid file'
        });
      }
    });

    return { validFiles, invalidFiles };
  }, []);

  const refreshAttachments = useCallback(async () => {
    await mutateAttachments();
    mutate(getAttachmentStatsKey(taskId));
  }, [mutateAttachments, taskId]);

  const clearResults = useCallback(() => {
    setUploadProgress(null);
  }, []);

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    // SWR Data
    attachments,
    stats,
    isLoading,
    error,

    // Upload State
    isUploading,
    uploadProgress,

    // Upload Actions
    uploadFiles,
    uploadSingleFile,

    // File Management
    deleteAttachment,
    downloadFile,
    previewFile, // ✅ ADDED: Include previewFile in the return interface

    // Cache Management
    mutateAttachments,
    refreshAttachments,

    // Utilities
    validateFiles,
    clearResults,
  };
};

export default useSWRFileUpload;
