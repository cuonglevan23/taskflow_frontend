// Custom hook for file upload functionality - Updated to use new services
import { useState, useCallback } from 'react';
import taskAttachmentService, { AttachmentWithProgress, UploadOptions } from '@/services/taskAttachmentService';
import { FileUploadResult, TaskAttachment } from '@/services/fileUploadService';
import uploadProgressService, { UploadSession } from '@/services/uploadProgressService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UploadProgress {
  completed: number;
  total: number;
  currentFile: string;
  percentage: number;
  uploadSpeed?: number;
  timeRemaining?: string;
}

export interface UseFileUploadReturn {
  // State
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  uploadResults: FileUploadResult[];
  attachments: AttachmentWithProgress[];
  activeUploads: UploadSession[];

  // Upload Actions
  uploadFiles: (files: File[], taskId: number, options?: UploadOptions) => Promise<FileUploadResult[]>;
  uploadSingleFile: (file: File, taskId: number, options?: UploadOptions) => Promise<FileUploadResult>;

  // File Management
  getAttachments: (taskId: number) => Promise<AttachmentWithProgress[]>;
  downloadFile: (fileKey: string, fileName: string) => Promise<void>;
  deleteAttachment: (taskId: number, attachmentId: number) => Promise<void>;
  previewFile: (fileKey: string) => Promise<string>;

  // Progress Tracking
  getActiveUploads: () => Promise<UploadSession[]>;
  cancelUpload: (sessionId: string) => Promise<void>;

  // Summary and Statistics
  getUploadSummary: () => {
    totalFiles: number;
    successfulUploads: number;
    failedUploads: number;
    uploadingCount: number;
    totalSize: number;
    averageProgress: number;
  };

  // Utilities
  validateFiles: (files: File[]) => { validFiles: File[]; invalidFiles: Array<{ file: File; error: string }> };
  clearResults: () => void;
  refreshAttachments: (taskId: number) => Promise<void>;
}

// ============================================================================
// FILE UPLOAD HOOK
// ============================================================================

export const useFileUpload = (): UseFileUploadReturn => {
  // State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadResults, setUploadResults] = useState<FileUploadResult[]>([]);
  const [attachments, setAttachments] = useState<AttachmentWithProgress[]>([]);
  const [activeUploads, setActiveUploads] = useState<UploadSession[]>([]);

  // ============================================================================
  // UPLOAD FUNCTIONS
  // ============================================================================

  const uploadSingleFile = useCallback(async (
    file: File,
    taskId: number,
    options: UploadOptions = { method: 'presigned' }
  ): Promise<FileUploadResult> => {
    try {
      setIsUploading(true);
      setUploadProgress({
        completed: 0,
        total: 1,
        currentFile: file.name,
        percentage: 0
      });

      const result = await taskAttachmentService.uploadFile(file, taskId, {
        ...options,
        onProgress: (progress) => {
          setUploadProgress(prev => prev ? {
            ...prev,
            percentage: progress
          } : null);
        },
        onComplete: (result) => {
          console.log('✅ Upload completed:', result.fileName);
        },
        onError: (error) => {
          console.error('❌ Upload failed:', error);
        }
      });

      setUploadResults(prev => [...prev, result]);
      return result;

    } catch (error) {
      console.error('💥 Single file upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, []);

  const uploadFiles = useCallback(async (
    files: File[],
    taskId: number,
    options: UploadOptions = { method: 'presigned' }
  ): Promise<FileUploadResult[]> => {
    try {
      setIsUploading(true);
      setUploadResults([]);

      const results: FileUploadResult[] = [];
      let completed = 0;

      for (const file of files) {
        setUploadProgress({
          completed,
          total: files.length,
          currentFile: file.name,
          percentage: 0
        });

        try {
          const result = await taskAttachmentService.uploadFile(file, taskId, {
            ...options,
            onProgress: (progress) => {
              setUploadProgress({
                completed,
                total: files.length,
                currentFile: file.name,
                percentage: progress
              });
            }
          });

          results.push(result);
          completed++;

        } catch (error) {
          console.error('❌ Failed to upload:', file.name, error);
          results.push({
            fileKey: '',
            fileName: file.name,
            downloadUrl: '',
            fileSize: file.size,
            contentType: file.type,
            uploadedAt: new Date().toISOString(),
            taskId,
            uploadStatus: 'FAILED',
            message: error instanceof Error ? error.message : 'Upload failed'
          });
        }
      }

      setUploadResults(results);
      return results;

    } catch (error) {
      console.error('💥 Multiple file upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, []);

  // ============================================================================
  // FILE MANAGEMENT
  // ============================================================================

  const getAttachments = useCallback(async (taskId: number): Promise<AttachmentWithProgress[]> => {
    try {
      const attachments = await taskAttachmentService.getTaskAttachmentsWithProgress(taskId);
      setAttachments(attachments);
      return attachments;
    } catch (error) {
      console.error('❌ Failed to get attachments:', error);
      throw error;
    }
  }, []);

  const refreshAttachments = useCallback(async (taskId: number): Promise<void> => {
    await getAttachments(taskId);
  }, [getAttachments]);

  const downloadFile = useCallback(async (fileKey: string, fileName: string): Promise<void> => {
    try {
      await taskAttachmentService.downloadFile(fileKey, fileName);
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }, []);

  const deleteAttachment = useCallback(async (taskId: number, attachmentId: number): Promise<void> => {
    try {
      await taskAttachmentService.deleteAttachment(taskId, attachmentId);
      // Refresh attachments after deletion
      await refreshAttachments(taskId);
    } catch (error) {
      console.error('❌ Delete failed:', error);
      throw error;
    }
  }, [refreshAttachments]);

  const previewFile = useCallback(async (fileKey: string): Promise<string> => {
    try {
      return await taskAttachmentService.previewFile(fileKey);
    } catch (error) {
      console.error('❌ Preview failed:', error);
      throw error;
    }
  }, []);

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  const getActiveUploads = useCallback(async (): Promise<UploadSession[]> => {
    try {
      const uploads = await uploadProgressService.getActiveUploads();
      setActiveUploads(uploads);
      return uploads;
    } catch (error) {
      console.error('❌ Failed to get active uploads:', error);
      throw error;
    }
  }, []);

  const cancelUpload = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await uploadProgressService.cancelUpload(sessionId);
      // Refresh active uploads
      await getActiveUploads();
    } catch (error) {
      console.error('❌ Cancel upload failed:', error);
      throw error;
    }
  }, [getActiveUploads]);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const validateFiles = useCallback((files: File[]) => {
    return taskAttachmentService.validateFiles(files);
  }, []);

  const clearResults = useCallback(() => {
    setUploadResults([]);
    setUploadProgress(null);
  }, []);

  const getUploadSummary = useCallback(() => {
    const totalFiles = uploadResults.length;
    const successfulUploads = uploadResults.filter(result => result.uploadStatus === 'SUCCESS').length;
    const failedUploads = uploadResults.filter(result => result.uploadStatus === 'FAILED').length;
    const uploadingCount = activeUploads.length;
    const totalSize = uploadResults.reduce((sum, result) => sum + result.fileSize, 0);
    const averageProgress = totalFiles > 0 ? (successfulUploads / totalFiles) * 100 : 0;

    return {
      totalFiles,
      successfulUploads,
      failedUploads,
      uploadingCount,
      totalSize,
      averageProgress
    };
  }, [uploadResults, activeUploads]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    isUploading,
    uploadProgress,
    uploadResults,
    attachments,
    activeUploads,

    // Upload Actions
    uploadFiles,
    uploadSingleFile,

    // File Management
    getAttachments,
    downloadFile,
    deleteAttachment,
    previewFile,

    // Progress Tracking
    getActiveUploads,
    cancelUpload,

    // Summary and Statistics
    getUploadSummary,

    // Utilities
    validateFiles,
    clearResults,
    refreshAttachments,
  };
};

export default useFileUpload;
