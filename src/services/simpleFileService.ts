// FIXED Simple File Upload Service - Compatible with existing backend
import api from '@/services/api';

// ============================================================================
// TYPE DEFINITIONS - Updated to match backend DTO exactly
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

// ✅ FIXED: Match exact backend DTO structure
export interface PresignedUploadRequest {
  fileName: string;    // ✅ Backend expects "fileName" not "filename"
  contentType: string; // ✅ Backend expects "contentType"
  fileSize: number;    // ✅ Backend expects "fileSize" as number
  taskId: number;      // ✅ Backend expects "taskId"
  folder?: string;     // ✅ Optional field
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

// ✅ FIXED: Match backend UploadSuccessRequest structure
export interface UploadSuccessRequest {
  taskId: number;
  fileKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
}

// ============================================================================
// FIXED SIMPLE FILE SERVICE
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

  /**
   * Clean content-type as recommended by backend documentation
   */
  private getCleanContentType(file: File): string {
    const extension = file.name.toLowerCase().split('.').pop();

    switch (extension) {
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'doc':
        return 'application/msword';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'mp4':
        return 'video/mp4';
      case 'avi':
        return 'video/avi';
      case 'mov':
        return 'video/mov';
      case 'txt':
        return 'text/plain';
      default:
        return file.type || 'application/octet-stream';
    }
  }

  // ============================================================================
  // TASK ATTACHMENTS - FIXED to match backend endpoints
  // ============================================================================

  /**
   * ✅ FIXED: Get task attachments
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
   * ✅ FIXED: Get task attachment stats
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
  // SIMPLE FILE UPLOAD (3 steps) - FIXED with proper DTO structure
  // ============================================================================

  /**
   * ✅ FIXED: Step 1: Get presigned upload URL with correct DTO structure
   * POST /api/files/presigned-upload-url
   */
  async getPresignedUploadUrl(request: PresignedUploadRequest): Promise<PresignedUploadResponse> {
    try {
      console.log('🔗 Getting presigned URL for:', request.fileName);
      console.log('📋 Request payload:', JSON.stringify(request, null, 2));

      // ✅ CRITICAL FIX: Ensure request matches backend DTO exactly
      const requestPayload: PresignedUploadRequest = {
        fileName: request.fileName,        // String - backend expects "fileName"
        contentType: request.contentType,  // String - backend expects "contentType"
        fileSize: Number(request.fileSize), // Long - ensure it's a number
        taskId: Number(request.taskId),     // Long - ensure it's a number
        folder: request.folder || 'documents' // Optional string with default
      };

      console.log('🚀 Sending request to backend:', requestPayload);

      const response = await api.post<PresignedUploadResponse>('/api/files/presigned-upload-url', requestPayload);

      console.log('✅ Got presigned URL response');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get presigned URL:', error);

      // Enhanced error logging for debugging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }

      throw error;
    }
  }

  /**
   * ✅ FIXED: Step 2: Upload file to S3 - Simplified version that works
   */
  async uploadToS3(uploadUrl: string, file: File, normalizedContentType: string): Promise<void> {
    console.log('📤 Uploading to S3:', file.name);
    console.log('🔗 Upload URL (truncated):', uploadUrl.substring(0, 100) + '...');
    console.log('📋 Content-Type from backend:', normalizedContentType);

    // ✅ SIMPLIFIED: Only use Content-Type header
    const headers: Record<string, string> = {
      'Content-Type': normalizedContentType,
    };

    console.log('📋 Upload headers:', headers);

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers,
      });

      console.log('📡 S3 Response status:', response.status);

      if (!response.ok) {
        const responseText = await response.text().catch(() => 'No response body');

        // Parse S3 error details
        let errorCode = 'Unknown error';
        if (responseText.includes('<Error>')) {
          try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(responseText, 'text/xml');
            const errorCodeElement = xmlDoc.getElementsByTagName('Code')[0]?.textContent;
            if (errorCodeElement) {
              errorCode = errorCodeElement;
            }
            console.error('🔍 S3 Error Code:', errorCode);
          } catch (parseError) {
            console.error('Failed to parse S3 error:', parseError);
          }
        }

        throw new Error(`S3 upload failed: ${response.status} ${response.statusText} - ${errorCode}`);
      }

      console.log('✅ S3 upload successful');
    } catch (error) {
      console.error('❌ S3 upload error:', error);
      throw error;
    }
  }

  /**
   * ✅ FIXED: Step 3: Confirm upload success with correct DTO structure
   * POST /api/files/upload-success
   */
  async confirmUploadSuccess(request: UploadSuccessRequest): Promise<void> {
    try {
      console.log('✅ Confirming upload success');
      console.log('📋 Upload success payload:', JSON.stringify(request, null, 2));

      // ✅ ENSURE: All fields are properly typed
      const requestPayload: UploadSuccessRequest = {
        taskId: Number(request.taskId),
        fileKey: String(request.fileKey),
        fileName: String(request.fileName),
        fileSize: Number(request.fileSize),
        contentType: String(request.contentType),
        downloadUrl: String(request.downloadUrl)
      };

      await api.post('/api/files/upload-success', requestPayload);

      console.log('✅ Upload confirmed');
    } catch (error: any) {
      console.error('❌ Failed to confirm upload:', error);

      // Enhanced error logging
      if (error.response) {
        console.error('Confirm upload error - Status:', error.response.status);
        console.error('Confirm upload error - Data:', error.response.data);
      }

      throw error;
    }
  }

  /**
   * ✅ FIXED: Complete upload process with proper error handling
   */
  async uploadFile(file: File, taskId: number, folder: string = 'documents'): Promise<TaskAttachment> {
    // Validate file
    this.validateFile(file);

    console.log('🚀 Starting file upload...');

    const cleanContentType = this.getCleanContentType(file);

    // ✅ CRITICAL FIX: Ensure folder is always a string
    const folderString = typeof folder === 'string' ? folder : 'documents';

    console.log('📋 File details:', {
      name: file.name,
      size: file.size,
      originalType: file.type,
      cleanType: cleanContentType,
      taskId,
      folder: folderString
    });

    try {
      // ✅ Step 1: Get presigned URL with properly structured request
      console.log('🔗 Step 1: Getting presigned URL...');
      const presignedData = await this.getPresignedUploadUrl({
        fileName: file.name,           // ✅ Exact field name from backend DTO
        contentType: cleanContentType, // ✅ Clean content type
        fileSize: file.size,          // ✅ Number type
        taskId: taskId,               // ✅ Number type
        folder: folderString          // ✅ CRITICAL FIX: Use validated string folder
      });

      // Step 2: Upload to S3
      console.log('📤 Step 2: Uploading to S3...');
      await this.uploadToS3(presignedData.uploadUrl, file, presignedData.contentType);

      // Step 3: Confirm upload success
      console.log('✅ Step 3: Confirming upload success...');
      await this.confirmUploadSuccess({
        taskId: taskId,
        fileKey: presignedData.fileKey,
        fileName: file.name,
        fileSize: file.size,
        contentType: presignedData.contentType,
        downloadUrl: presignedData.downloadUrl
      });

      console.log('✅ Upload completed successfully');

      return {
        id: 0, // Will be filled by backend
        taskId,
        fileKey: presignedData.fileKey,
        originalFilename: file.name,
        fileSize: file.size,
        contentType: presignedData.contentType,
        downloadUrl: presignedData.downloadUrl,
        uploadedBy: '',
        uploadedByEmail: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('💥 Upload failed:', error);

      // Enhanced error messaging
      let errorMessage = 'Upload failed';
      if (error.response?.status === 400) {
        errorMessage = 'Invalid file data. Please check file format and size.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // ============================================================================
  // FILE OPERATIONS - FIXED to match backend endpoints
  // ============================================================================

  /**
   * ✅ FIXED: Refresh download URL
   * POST /api/tasks/attachments/{attachmentId}/download-url
   */
  async refreshDownloadUrl(attachmentId: number): Promise<string> {
    try {
      console.log('🔄 Refreshing download URL for attachment:', attachmentId);

      const response = await api.post<{ downloadUrl: string }>(`/api/tasks/attachments/${attachmentId}/download-url`);

      console.log('✅ Download URL refreshed');
      return response.data.downloadUrl;
    } catch (error) {
      console.error('❌ Failed to refresh download URL:', error);
      throw error;
    }
  }

  /**
   * ✅ FIXED: Delete attachment
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
   * ✅ FIXED: Download file with proper error handling
   */
  async downloadFile(attachment: TaskAttachment): Promise<void> {
    try {
      console.log('📥 Downloading file:', attachment.originalFilename);

      // Check if URL might be expired (older than 6 days)
      const currentTime = new Date();
      const urlCreatedTime = new Date(attachment.updatedAt);
      const daysDiff = (currentTime.getTime() - urlCreatedTime.getTime()) / (1000 * 3600 * 24);

      let downloadUrl = attachment.downloadUrl;

      if (daysDiff > 6) {
        console.log('🔄 URL gần hết hạn, đang refresh...');
        try {
          downloadUrl = await this.refreshDownloadUrl(attachment.id);
        } catch (refreshError) {
          console.warn('⚠️ Could not refresh URL, trying with existing URL');
        }
      }

      // Create download link for better browser compatibility
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.originalFilename;
      link.target = '_blank';

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ Download initiated for:', attachment.originalFilename);
    } catch (error) {
      console.error('❌ Download failed:', error);

      // Retry with URL refresh
      try {
        console.log('🔄 Retrying with fresh URL...');
        const newUrl = await this.refreshDownloadUrl(attachment.id);

        const link = document.createElement('a');
        link.href = newUrl;
        link.download = attachment.originalFilename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('✅ Retry download successful');
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
        throw new Error('Không thể tải file. Vui lòng thử lại sau.');
      }
    }
  }

  /**
   * Get preview URL for file (for images and PDFs)
   */
  async getPreviewUrl(attachment: TaskAttachment): Promise<string> {
    try {
      console.log('👁️ Getting preview URL for:', attachment.originalFilename);

      // Check if URL might be expired
      const currentTime = new Date();
      const urlCreatedTime = new Date(attachment.updatedAt);
      const daysDiff = (currentTime.getTime() - urlCreatedTime.getTime()) / (1000 * 3600 * 24);

      let downloadUrl = attachment.downloadUrl;

      if (daysDiff > 6) {
        console.log('🔄 URL gần hết hạn, đang refresh...');
        try {
          downloadUrl = await this.refreshDownloadUrl(attachment.id);
        } catch (refreshError) {
          console.warn('⚠️ Could not refresh URL, using existing URL');
        }
      }

      return downloadUrl;
    } catch (error) {
      console.error('❌ Failed to get preview URL:', error);
      throw error;
    }
  }

  /**
   * Check if file can be previewed
   */
  canPreviewFile(attachment: TaskAttachment): boolean {
    return this.isImageFile(attachment.contentType) ||
        attachment.contentType === 'application/pdf';
  }

  /**
   * ✅ NEW: Preview file - opens file in new tab for preview
   */
  async previewFile(attachment: TaskAttachment): Promise<void> {
    try {
      console.log('👁️ Previewing file:', attachment.originalFilename);

      if (!this.canPreviewFile(attachment)) {
        throw new Error('File type cannot be previewed. Supported types: Images and PDF files.');
      }

      // Get fresh preview URL
      const previewUrl = await this.getPreviewUrl(attachment);

      // Open in new tab for preview
      window.open(previewUrl, '_blank', 'noopener,noreferrer');

      console.log('✅ Preview opened for:', attachment.originalFilename);
    } catch (error) {
      console.error('❌ Preview failed:', error);
      throw error;
    }
  }

  /**
   * Download with retry mechanism
   */
  async downloadWithRetry(attachment: TaskAttachment, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.downloadFile(attachment);
        return;
      } catch (error) {
        console.log(`Download attempt ${i + 1} failed:`, error);
        if (i === maxRetries - 1) throw error;

        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  /**
   * Bulk download files with delay between downloads
   */
  async bulkDownload(attachments: TaskAttachment[]): Promise<void> {
    console.log('🔄 Starting bulk download for', attachments.length, 'files...');

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      try {
        // Add delay between downloads to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await this.downloadFile(attachment);
        console.log(`✅ Downloaded: ${attachment.originalFilename}`);
      } catch (error) {
        console.error(`❌ Failed to download: ${attachment.originalFilename}`, error);
      }
    }

    console.log('✅ Bulk download completed');
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

  /**
   * ✅ Helper method để handle errors properly
   */
  getErrorMessage(error: any): string {
    if (error.response?.status === 404) {
      return 'File không tồn tại hoặc đã bị xóa';
    }
    if (error.response?.status === 403) {
      return 'Bạn không có quyền truy cập file này';
    }
    if (error.message?.includes('expired')) {
      return 'Link download đã hết hạn, đang tự động tạo link mới...';
    }
    return error.message || 'Có lỗi xảy ra khi thao tác với file. Vui lòng thử lại.';
  }
}

// Export singleton instance
const simpleFileService = new SimpleFileService();
export default simpleFileService;
