// File Upload Service - Complete implementation based on MYTASK_FILE_UPLOAD_COMPLETE_GUIDE.md
import api from '@/services/api';

// ============================================================================
// TYPE DEFINITIONS - Based on API Documentation
// ============================================================================

export interface FileUploadRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
  taskId: number;
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

export interface FileUploadResult {
  fileKey: string;
  fileName: string;
  downloadUrl: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  taskId: number;
  uploadStatus: 'SUCCESS' | 'FAILED';
  message: string;
  progressSessionId?: string;
}

export interface UploadSuccessRequest {
  taskId: number;
  fileKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
}

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
  fileSizeFormatted: string;
}

// ============================================================================
// FILE UPLOAD SERVICE - Complete Implementation
// ============================================================================

class FileUploadService {

  // Supported file extensions from API docs
  private readonly ALLOWED_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.doc', '.docx', '.txt',
    '.xls', '.xlsx',
    '.mp4', '.avi', '.mov'
  ];

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // ============================================================================
  // FILE VALIDATION
  // ============================================================================

  validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error(`File type not supported. Allowed types: ${this.ALLOWED_EXTENSIONS.join(', ')}`);
    }
  }

  // ============================================================================
  // PRESIGNED URL UPLOAD FLOW
  // ============================================================================

  /**
   * 1️⃣ Generate presigned upload URL
   * POST /api/files/presigned-upload-url
   */
  async getPresignedUploadUrl(request: FileUploadRequest): Promise<PresignedUploadResponse> {
    try {
      console.log('🔗 Requesting presigned URL for:', request.fileName);

      const response = await api.post<PresignedUploadResponse>('/api/files/presigned-upload-url', request);

      console.log('✅ Got presigned URL:', response.data.fileKey);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get presigned URL:', error);
      throw new Error('Failed to get upload URL from server');
    }
  }

  /**
   * 2️⃣ Upload file directly to S3 using presigned URL
   */
  async uploadToS3(
    uploadUrl: string,
    file: File,
    contentType: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      console.log('📤 Uploading to S3:', file.name, `(${file.size} bytes)`);

      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              onProgress(percentComplete);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            console.log('✅ S3 upload successful');
            resolve();
          } else {
            reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('S3 upload failed: Network error'));
        };

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.send(file);
      });
    } catch (error) {
      console.error('❌ S3 upload failed:', error);
      throw error;
    }
  }

  /**
   * 3️⃣ Confirm upload success
   * POST /api/files/upload-success
   */
  async confirmUploadSuccess(request: UploadSuccessRequest): Promise<{ success: boolean; message: string }> {
    try {
      console.log('✅ Confirming upload success for:', request.fileName);

      const response = await api.post('/api/files/upload-success', request);

      console.log('✅ Upload success confirmed');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to confirm upload success:', error);
      throw new Error('Failed to confirm upload success');
    }
  }

  /**
   * 🚀 Complete presigned URL upload process
   */
  async uploadFileWithPresignedUrl(
    file: File,
    taskId: number,
    folder: string = 'documents',
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    try {
      console.log('🚀 Starting presigned URL upload process:', file.name);

      // Validate file
      this.validateFile(file);

      // Step 1: Get presigned URL
      const presignedData = await this.getPresignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        taskId,
        folder
      });

      // Step 2: Upload to S3
      await this.uploadToS3(presignedData.uploadUrl, file, file.type, onProgress);

      // Step 3: Confirm upload success
      await this.confirmUploadSuccess({
        taskId,
        fileKey: presignedData.fileKey,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        downloadUrl: presignedData.downloadUrl
      });

      // Return success result
      const result: FileUploadResult = {
        fileKey: presignedData.fileKey,
        fileName: file.name,
        downloadUrl: presignedData.downloadUrl,
        fileSize: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
        taskId,
        uploadStatus: 'SUCCESS',
        message: 'File uploaded successfully'
      };

      console.log('🎉 Upload process completed:', result);
      return result;

    } catch (error) {
      console.error('💥 Upload process failed:', error);

      return {
        fileKey: '',
        fileName: file.name,
        downloadUrl: '',
        fileSize: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
        taskId,
        uploadStatus: 'FAILED',
        message: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * 🚀 Server-side upload with multipart/form-data
   * POST /api/files/upload
   */
  async uploadFileServerSide(
    file: File,
    taskId: number,
    folder: string = 'documents',
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    try {
      console.log('🚀 Starting server-side upload process:', file.name);

      // Validate file
      this.validateFile(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId.toString());
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await api.post<FileUploadResult>('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });

      console.log('🎉 Server-side upload completed:', response.data);
      return response.data;

    } catch (error) {
      console.error('💥 Server-side upload failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Upload failed');
    }
  }

  /**
   * 📥 Get download URL for file
   * GET /api/files/download/{fileKey}
   */
  async getDownloadUrl(fileKey: string): Promise<string> {
    try {
      console.log('🔗 Getting download URL for:', fileKey);

      const encodedFileKey = encodeURIComponent(fileKey);
      const response = await api.get(`/api/files/download/${encodedFileKey}`);

      console.log('✅ Got download URL');
      return typeof response.data === 'string' ? response.data : response.data.url;
    } catch (error) {
      console.error('❌ Failed to get download URL:', error);
      throw new Error('Failed to get download URL');
    }
  }

  /**
   * 🗑️ Delete file from S3
   * DELETE /api/files/{fileKey}
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      console.log('🗑️ Deleting file:', fileKey);

      const encodedFileKey = encodeURIComponent(fileKey);
      await api.delete(`/api/files/${encodedFileKey}`);

      console.log('✅ File deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * 📊 Get file info/metadata
   * GET /api/files/info/{fileKey}
   */
  async getFileInfo(fileKey: string): Promise<FileInfo> {
    try {
      console.log('📊 Getting file info for:', fileKey);

      const encodedFileKey = encodeURIComponent(fileKey);
      const response = await api.get<FileInfo>(`/api/files/info/${encodedFileKey}`);

      console.log('✅ Got file info');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get file info:', error);
      throw new Error('Failed to get file info');
    }
  }

  /**
   * 📎 Get task attachments
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
      throw new Error('Failed to get task attachments');
    }
  }

  /**
   * 🗑️ Delete task attachment
   * DELETE /api/tasks/{taskId}/attachments/{attachmentId}
   */
  async deleteTaskAttachment(taskId: number, attachmentId: number): Promise<void> {
    try {
      console.log('🗑️ Deleting attachment:', attachmentId, 'from task:', taskId);

      await api.delete(`/api/tasks/${taskId}/attachments/${attachmentId}`);

      console.log('✅ Task attachment deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete task attachment:', error);
      throw new Error('Failed to delete task attachment');
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type icon based on file extension
   */
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const iconMap: Record<string, string> = {
      // Images
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'webp': '🖼️',
      // Documents
      'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📄',
      // Spreadsheets
      'xls': '📊', 'xlsx': '📊',
      // Videos
      'mp4': '🎥', 'avi': '🎥', 'mov': '🎥'
    };

    return iconMap[extension || ''] || '📎';
  }

  /**
   * Check if file is an image
   */
  isImageFile(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  }
}

// Export singleton instance
const fileUploadService = new FileUploadService();
export default fileUploadService;
