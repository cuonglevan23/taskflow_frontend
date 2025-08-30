// Simple File Upload Service - No Progress Tracking
import api from '@/services/api';

// ============================================================================
// TYPE DEFINITIONS - Simplified without progress tracking
// ============================================================================

export interface TaskAttachment {
  id: number;
  taskId: number;
  fileKey: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
  uploadedBy: string;
  uploadedByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentStats {
  taskId: number;
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
}

export interface PresignedUploadRequest {
  taskId: number;
  fileName: string;
  fileSize: number;
  contentType: string;
  folder?: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  downloadUrl: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  expiresAt: string;
  taskId: number;
  bucketName: string;
  expirationSeconds: number;
}

export interface UploadSuccessRequest {
  taskId: number;
  fileKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
}

// ============================================================================
// SIMPLE FILE SERVICE
// ============================================================================

class SimpleFileService {

  // Supported file types
  private readonly ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // ============================================================================
  // FILE VALIDATION
  // ============================================================================

  validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of 10MB`);
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File type not supported. Allowed types: PDF, Images, Documents, Videos`);
    }
  }

  // ============================================================================
  // TASK ATTACHMENTS
  // ============================================================================

  /**
   * Get task attachments
   * GET /api/tasks/{taskId}/attachments
   */
  async getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
    try {
      console.log('📎 Getting attachments for task:', taskId);

      const response = await api.get<TaskAttachment[]>(`/api/tasks/${taskId}/attachments`);

      console.log('✅ Got task attachments:', response.data.length, 'files');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get task attachments:', error);
      throw error;
    }
  }

  /**
   * Get task attachment stats
   * GET /api/tasks/{taskId}/attachments/stats
   */
  async getTaskAttachmentStats(taskId: number): Promise<AttachmentStats> {
    try {
      console.log('📊 Getting attachment stats for task:', taskId);

      const response = await api.get<AttachmentStats>(`/api/tasks/${taskId}/attachments/stats`);

      console.log('✅ Got attachment stats');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get attachment stats:', error);
      throw error;
    }
  }

  // ============================================================================
  // SIMPLE FILE UPLOAD (2 steps)
  // ============================================================================

  /**
   * Step 1: Get presigned upload URL
   * POST /api/files/presigned-upload-url
   */
  async getPresignedUploadUrl(request: PresignedUploadRequest): Promise<PresignedUploadResponse> {
    try {
      console.log('🔗 Getting presigned URL for:', request.fileName);

      const response = await api.post<PresignedUploadResponse>('/api/files/presigned-upload-url', request);

      console.log('✅ Got presigned URL');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get presigned URL:', error);
      throw error;
    }
  }

  /**
   * Step 2: Upload file to S3
   */
  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    try {
      console.log('📤 Uploading to S3:', file.name);
      console.log('🔗 Upload URL:', uploadUrl);

      // Parse URL to extract required headers from signed headers
      const url = new URL(uploadUrl);
      const signedHeaders = url.searchParams.get('X-Amz-SignedHeaders');

      console.log('🔑 Signed headers required:', signedHeaders);

      // Build headers that match exactly what was signed
      const headers: Record<string, string> = {
        'Content-Type': file.type || 'application/octet-stream',
      };

      // Add all the metadata headers that were signed
      if (signedHeaders?.includes('x-amz-meta-original-filename')) {
        headers['x-amz-meta-original-filename'] = encodeURIComponent(file.name);
      }
      if (signedHeaders?.includes('x-amz-meta-task-id')) {
        // Extract task ID from the file path in URL
        const pathParts = url.pathname.split('/');
        const taskPart = pathParts.find(part => part.startsWith('task_'));
        if (taskPart) {
          headers['x-amz-meta-task-id'] = taskPart.replace('task_', '');
        }
      }
      if (signedHeaders?.includes('x-amz-meta-upload-timestamp')) {
        headers['x-amz-meta-upload-timestamp'] = new Date().toISOString();
      }
      if (signedHeaders?.includes('x-amz-meta-uploaded-by')) {
        // Extract from URL path if available
        const pathParts = url.pathname.split('/');
        const userPart = pathParts.find(part => part.includes('@') || part.includes('_gmail'));
        if (userPart) {
          headers['x-amz-meta-uploaded-by'] = userPart.replace(/_/g, '@');
        }
      }

      // Note: Content-Length will be set automatically by browser
      // Host header will be set automatically by browser

      console.log('📋 Upload headers (matching signed headers):', headers);

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers,
      });

      console.log('📡 S3 Response status:', response.status);

      if (!response.ok) {
        const responseText = await response.text().catch(() => 'No response body');
        console.error('❌ S3 upload response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
          sentHeaders: headers,
          requiredSignedHeaders: signedHeaders
        });
        throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ S3 upload successful');
    } catch (error) {
      console.error('❌ S3 upload failed:', error);
      throw error;
    }
  }

  /**
   * Step 3: Confirm upload success
   * POST /api/files/upload-success
   */
  async confirmUploadSuccess(request: UploadSuccessRequest): Promise<void> {
    try {
      console.log('✅ Confirming upload success');

      await api.post('/api/files/upload-success', request);

      console.log('✅ Upload confirmed');
    } catch (error) {
      console.error('❌ Failed to confirm upload:', error);
      throw error;
    }
  }

  /**
   * Complete upload process with fallback to server upload
   */
  async uploadFile(file: File, taskId: number, folder: string = 'documents'): Promise<TaskAttachment> {
    try {
      // Validate file
      this.validateFile(file);

      // Try direct S3 upload first
      try {
        console.log('🚀 Attempting direct S3 upload...');

        // Step 1: Get presigned URL
        const presignedData = await this.getPresignedUploadUrl({
          taskId,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          folder
        });

        // Step 2: Upload to S3
        await this.uploadToS3(presignedData.uploadUrl, file);

        // Step 3: Confirm success
        await this.confirmUploadSuccess({
          taskId,
          fileKey: presignedData.fileKey,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          downloadUrl: presignedData.downloadUrl
        });

        console.log('✅ Direct S3 upload successful');

        return {
          id: 0,
          taskId,
          fileKey: presignedData.fileKey,
          originalFilename: file.name,
          fileSize: file.size,
          contentType: file.type,
          downloadUrl: presignedData.downloadUrl,
          uploadedBy: '',
          uploadedByEmail: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

      } catch (s3Error) {
        console.warn('⚠️ Direct S3 upload failed, trying server upload fallback:', s3Error);

        // Fallback to server upload
        return await this.uploadFileViaServer(file, taskId, folder);
      }

    } catch (error) {
      console.error('💥 Upload failed completely:', error);
      throw error;
    }
  }

  /**
   * Fallback: Server-side upload
   * POST /api/files/upload
   */
  async uploadFileViaServer(file: File, taskId: number, folder: string = 'documents'): Promise<TaskAttachment> {
    try {
      console.log('🔄 Attempting server-side upload fallback...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId.toString());
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await api.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Server-side upload successful');

      // Convert response to TaskAttachment format
      const result = response.data;
      return {
        id: result.id || 0,
        taskId,
        fileKey: result.fileKey,
        originalFilename: file.name,
        fileSize: file.size,
        contentType: file.type,
        downloadUrl: result.downloadUrl,
        uploadedBy: result.uploadedBy || '',
        uploadedByEmail: result.uploadedByEmail || '',
        createdAt: result.uploadedAt || new Date().toISOString(),
        updatedAt: result.uploadedAt || new Date().toISOString()
      };

    } catch (error) {
      console.error('💥 Server upload fallback also failed:', error);
      throw new Error(`Both S3 and server upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  /**
   * Refresh download URL
   * POST /api/tasks/attachments/{attachmentId}/download-url
   */
  async refreshDownloadUrl(attachmentId: number): Promise<string> {
    try {
      console.log('🔄 Refreshing download URL for attachment:', attachmentId);

      const response = await api.post(`/api/tasks/attachments/${attachmentId}/download-url`);

      console.log('✅ Download URL refreshed');
      return response.data.downloadUrl;
    } catch (error) {
      console.error('❌ Failed to refresh download URL:', error);
      throw error;
    }
  }

  /**
   * Delete attachment
   * DELETE /api/tasks/attachments/{attachmentId}
   */
  async deleteAttachment(attachmentId: number): Promise<void> {
    try {
      console.log('🗑️ Deleting attachment:', attachmentId);

      await api.delete(`/api/tasks/attachments/${attachmentId}`);

      console.log('✅ Attachment deleted');
    } catch (error) {
      console.error('❌ Failed to delete attachment:', error);
      throw error;
    }
  }

  /**
   * Download file
   */
  async downloadFile(attachment: TaskAttachment): Promise<void> {
    try {
      let downloadUrl = attachment.downloadUrl;

      // Try to refresh URL if needed
      try {
        downloadUrl = await this.refreshDownloadUrl(attachment.id);
      } catch (refreshError) {
        console.warn('⚠️ Could not refresh URL, using existing URL');
      }

      // Open download
      window.open(downloadUrl, '_blank');
      console.log('✅ Download initiated');
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(contentType: string): string {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('image')) return '🖼️';
    if (contentType.includes('video')) return '🎥';
    if (contentType.includes('word')) return '📝';
    if (contentType.includes('excel') || contentType.includes('sheet')) return '📊';
    return '📎';
  }

  isImageFile(contentType: string): boolean {
    return contentType.startsWith('image/');
  }
}

// Export singleton instance
const simpleFileService = new SimpleFileService();
export default simpleFileService;
