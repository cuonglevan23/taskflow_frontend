// Task Attachment Service - Based on MYTASK_FILE_UPLOAD_COMPLETE_GUIDE.md
import api from '@/services/api';
import fileUploadService, { TaskAttachment, FileUploadResult } from '@/services/fileUploadService';
import uploadProgressService, { UploadSession } from '@/services/uploadProgressService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AttachmentWithProgress extends TaskAttachment {
  isUploading?: boolean;
  uploadProgress?: number;
  uploadSessionId?: string;
  uploadError?: string;
}

export interface UploadOptions {
  method: 'server' | 'presigned';
  folder?: string;
  onProgress?: (progress: number) => void;
  onComplete?: (result: FileUploadResult) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// TASK ATTACHMENT SERVICE
// ============================================================================

class TaskAttachmentService {

  // ============================================================================
  // ATTACHMENT MANAGEMENT
  // ============================================================================

  /**
   * 📎 Get all attachments for a task
   */
  async getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
    try {
      console.log('📎 Getting attachments for task:', taskId);
      return await fileUploadService.getTaskAttachments(taskId);
    } catch (error) {
      console.error('❌ Failed to get task attachments:', error);
      throw error;
    }
  }

  /**
   * 📎 Get attachments with upload progress
   */
  async getTaskAttachmentsWithProgress(taskId: number): Promise<AttachmentWithProgress[]> {
    try {
      console.log('📎 Getting attachments with progress for task:', taskId);

      // Get attachments and upload progress in parallel
      const [attachments, uploadSessions] = await Promise.all([
        this.getTaskAttachments(taskId),
        uploadProgressService.getTaskProgress(taskId)
      ]);

      // Merge attachments with upload progress
      const attachmentsWithProgress: AttachmentWithProgress[] = attachments.map(attachment => {
        const uploadSession = uploadSessions.find(session =>
          session.originalFilename === attachment.originalFilename &&
          session.status === 'UPLOADING'
        );

        return {
          ...attachment,
          isUploading: !!uploadSession,
          uploadProgress: uploadSession?.progressPercentage,
          uploadSessionId: uploadSession?.uploadSessionId,
        };
      });

      // Add ongoing uploads that haven't become attachments yet
      const ongoingUploads = uploadSessions.filter(session =>
        session.status === 'UPLOADING' &&
        !attachments.some(att => att.originalFilename === session.originalFilename)
      );

      for (const session of ongoingUploads) {
        attachmentsWithProgress.push({
          id: -1, // Temporary ID for ongoing uploads
          taskId,
          fileKey: session.s3FileKey || '',
          originalFilename: session.originalFilename,
          fileSize: session.fileSize,
          contentType: session.contentType,
          downloadUrl: session.downloadUrl || '',
          uploadedBy: session.uploadedBy,
          uploadedByEmail: session.uploadedByEmail,
          createdAt: session.startedAt,
          fileSizeFormatted: fileUploadService.formatFileSize(session.fileSize),
          isUploading: true,
          uploadProgress: session.progressPercentage,
          uploadSessionId: session.uploadSessionId,
        });
      }

      console.log('✅ Got attachments with progress:', attachmentsWithProgress.length);
      return attachmentsWithProgress;
    } catch (error) {
      console.error('❌ Failed to get attachments with progress:', error);
      throw error;
    }
  }

  /**
   * 🗑️ Delete task attachment
   */
  async deleteAttachment(taskId: number, attachmentId: number): Promise<void> {
    try {
      console.log('🗑️ Deleting attachment:', attachmentId);
      await fileUploadService.deleteTaskAttachment(taskId, attachmentId);
      console.log('✅ Attachment deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete attachment:', error);
      throw error;
    }
  }

  // ============================================================================
  // FILE UPLOAD WITH PROGRESS TRACKING
  // ============================================================================

  /**
   * 🚀 Upload file with progress tracking
   */
  async uploadFile(
    file: File,
    taskId: number,
    options: UploadOptions = { method: 'presigned' }
  ): Promise<FileUploadResult> {
    try {
      console.log('🚀 Starting file upload with progress tracking:', file.name);

      const { method = 'presigned', folder = 'documents', onProgress, onComplete, onError } = options;

      let uploadSession: UploadSession | null = null;
      let progressCleanup: (() => void) | null = null;

      try {
        // Create upload session for progress tracking
        uploadSession = await uploadProgressService.createUploadSession({
          taskId,
          filename: file.name,
          fileSize: file.size,
          contentType: file.type
        });

        // Start progress tracking
        if (onProgress) {
          progressCleanup = uploadProgressService.startProgressTracking(
            uploadSession.uploadSessionId,
            (progress) => onProgress(progress.progressPercentage),
            (finalProgress) => {
              console.log('📊 Upload progress tracking completed:', finalProgress.status);
            },
            (error) => {
              console.error('❌ Progress tracking error:', error);
            }
          );
        }

        // Upload file using selected method
        let result: FileUploadResult;

        if (method === 'server') {
          result = await fileUploadService.uploadFileServerSide(
            file,
            taskId,
            folder,
            (progress) => {
              // Update progress in backend
              if (uploadSession) {
                uploadProgressService.updateProgress(uploadSession.uploadSessionId, {
                  uploadedBytes: Math.round((file.size * progress) / 100),
                  uploadSpeed: 0 // Will be calculated by backend
                }).catch(console.error);
              }
              onProgress?.(progress);
            }
          );
        } else {
          result = await fileUploadService.uploadFileWithPresignedUrl(
            file,
            taskId,
            folder,
            (progress) => {
              // Update progress in backend
              if (uploadSession) {
                uploadProgressService.updateProgress(uploadSession.uploadSessionId, {
                  uploadedBytes: Math.round((file.size * progress) / 100),
                  uploadSpeed: 0 // Will be calculated by backend
                }).catch(console.error);
              }
              onProgress?.(progress);
            }
          );
        }

        // Mark upload as complete
        if (uploadSession && result.uploadStatus === 'SUCCESS') {
          await uploadProgressService.markComplete(uploadSession.uploadSessionId, {
            s3FileKey: result.fileKey,
            downloadUrl: result.downloadUrl
          });
        }

        // Mark upload as failed
        if (uploadSession && result.uploadStatus === 'FAILED') {
          await uploadProgressService.markFailed(uploadSession.uploadSessionId, {
            errorMessage: result.message
          });
        }

        onComplete?.(result);
        return result;

      } catch (uploadError) {
        // Mark upload as failed
        if (uploadSession) {
          await uploadProgressService.markFailed(uploadSession.uploadSessionId, {
            errorMessage: uploadError instanceof Error ? uploadError.message : 'Upload failed'
          }).catch(console.error);
        }

        onError?.(uploadError instanceof Error ? uploadError : new Error('Upload failed'));
        throw uploadError;
      } finally {
        // Cleanup progress tracking
        if (progressCleanup) {
          progressCleanup();
        }
      }

    } catch (error) {
      console.error('💥 File upload failed:', error);
      throw error;
    }
  }

  /**
   * 🚀 Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    taskId: number,
    options: UploadOptions = { method: 'presigned' }
  ): Promise<FileUploadResult[]> {
    try {
      console.log('🚀 Starting multiple file upload:', files.length, 'files');

      const results: FileUploadResult[] = [];
      const errors: Error[] = [];

      // Upload files in parallel with progress tracking
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await this.uploadFile(file, taskId, options);
          results.push(result);
          return result;
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error(`Failed to upload ${file.name}`));
          throw error;
        }
      });

      await Promise.allSettled(uploadPromises);

      if (errors.length > 0) {
        console.warn('⚠️ Some uploads failed:', errors.length, 'out of', files.length);
      }

      console.log('✅ Multiple upload completed:', results.length, 'successful,', errors.length, 'failed');
      return results;

    } catch (error) {
      console.error('💥 Multiple upload failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  /**
   * 📥 Download file
   */
  async downloadFile(fileKey: string, filename: string): Promise<void> {
    try {
      console.log('📥 Downloading file:', filename);

      const downloadUrl = await fileUploadService.getDownloadUrl(fileKey);

      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ File download initiated');
    } catch (error) {
      console.error('❌ Failed to download file:', error);
      throw error;
    }
  }

  /**
   * 👁️ Preview file (for images and PDFs)
   */
  async previewFile(fileKey: string): Promise<string> {
    try {
      console.log('👁️ Getting preview URL for file:', fileKey);
      return await fileUploadService.getDownloadUrl(fileKey);
    } catch (error) {
      console.error('❌ Failed to get preview URL:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if file can be previewed
   */
  canPreviewFile(fileName: string): boolean {
    return fileUploadService.isImageFile(fileName) || fileName.toLowerCase().endsWith('.pdf');
  }

  /**
   * Get file icon
   */
  getFileIcon(fileName: string): string {
    return fileUploadService.getFileIcon(fileName);
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    return fileUploadService.formatFileSize(bytes);
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    try {
      fileUploadService.validateFile(file);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'File validation failed'
      };
    }
  }

  /**
   * Validate multiple files
   */
  validateFiles(files: File[]): { validFiles: File[]; invalidFiles: Array<{ file: File; error: string }> } {
    const validFiles: File[] = [];
    const invalidFiles: Array<{ file: File; error: string }> = [];

    files.forEach(file => {
      const validation = this.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, error: validation.error || 'Validation failed' });
      }
    });

    return { validFiles, invalidFiles };
  }
}

// Export singleton instance
const taskAttachmentService = new TaskAttachmentService();
export default taskAttachmentService;
