// Upload Progress Service - Based on MYTASK_FILE_UPLOAD_COMPLETE_GUIDE.md
import api from '@/services/api';

// ============================================================================
// TYPE DEFINITIONS - Upload Progress API
// ============================================================================

export interface CreateUploadSessionRequest {
  taskId: number;
  filename: string;
  fileSize: number;
  contentType: string;
}

export interface UpdateProgressRequest {
  uploadedBytes: number;
  uploadSpeed: number;
}

export interface CompleteUploadRequest {
  s3FileKey: string;
  downloadUrl: string;
}

export interface FailUploadRequest {
  errorMessage: string;
}

export interface UploadSession {
  uploadSessionId: string;
  taskId: number;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  uploadedBytes: number;
  progressPercentage: number;
  uploadSpeed: number;
  status: 'INITIATED' | 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  s3FileKey?: string;
  downloadUrl?: string;
  startedAt: string;
  completedAt?: string;
  uploadedBy: string;
  uploadedByEmail: string;
  errorMessage?: string;
}

export interface UploadStats {
  pendingCount: number;
  uploadingCount: number;
  completedCount: number;
  failedCount: number;
  cancelledCount: number;
  totalCount: number;
  activeCount: number;
}

// ============================================================================
// UPLOAD PROGRESS SERVICE
// ============================================================================

class UploadProgressService {

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * 🚀 Create Upload Session
   * POST /api/upload-progress/create
   */
  async createUploadSession(request: CreateUploadSessionRequest): Promise<UploadSession> {
    try {
      console.log('🚀 Creating upload session for:', request.filename);

      const response = await api.post<UploadSession>('/api/upload-progress/create', request);

      console.log('✅ Upload session created:', response.data.uploadSessionId);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create upload session:', error);
      throw new Error('Failed to create upload session');
    }
  }

  /**
   * 📈 Update Progress
   * PUT /api/upload-progress/{sessionId}
   */
  async updateProgress(sessionId: string, request: UpdateProgressRequest): Promise<{ success: boolean; sessionId: string }> {
    try {
      const response = await api.put(`/api/upload-progress/${sessionId}`, request);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update progress:', error);
      throw new Error('Failed to update progress');
    }
  }

  /**
   * ✅ Mark Complete
   * POST /api/upload-progress/{sessionId}/complete
   */
  async markComplete(sessionId: string, request: CompleteUploadRequest): Promise<{ success: boolean; message: string; sessionId: string }> {
    try {
      console.log('✅ Marking upload as complete:', sessionId);

      const response = await api.post(`/api/upload-progress/${sessionId}/complete`, request);

      console.log('✅ Upload marked as completed');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to mark upload as complete:', error);
      throw new Error('Failed to mark upload as complete');
    }
  }

  /**
   * ❌ Mark Failed
   * POST /api/upload-progress/{sessionId}/failed
   */
  async markFailed(sessionId: string, request: FailUploadRequest): Promise<{ success: boolean; message: string; sessionId: string }> {
    try {
      console.log('❌ Marking upload as failed:', sessionId);

      const response = await api.post(`/api/upload-progress/${sessionId}/failed`, request);

      console.log('✅ Upload marked as failed');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to mark upload as failed:', error);
      throw new Error('Failed to mark upload as failed');
    }
  }

  /**
   * 🚫 Cancel Upload
   * POST /api/upload-progress/{sessionId}/cancel
   */
  async cancelUpload(sessionId: string): Promise<{ success: boolean; message: string; sessionId: string }> {
    try {
      console.log('🚫 Cancelling upload:', sessionId);

      const response = await api.post(`/api/upload-progress/${sessionId}/cancel`);

      console.log('✅ Upload cancelled');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to cancel upload:', error);
      throw new Error('Failed to cancel upload');
    }
  }

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  /**
   * 📋 Get Progress by Session
   * GET /api/upload-progress/{sessionId}
   */
  async getProgress(sessionId: string): Promise<UploadSession> {
    try {
      const response = await api.get<UploadSession>(`/api/upload-progress/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get progress:', error);
      throw new Error('Failed to get progress');
    }
  }

  /**
   * 📋 Get Task Progress
   * GET /api/upload-progress/task/{taskId}
   */
  async getTaskProgress(taskId: number): Promise<UploadSession[]> {
    try {
      console.log('📋 Getting upload progress for task:', taskId);

      const response = await api.get<UploadSession[]>(`/api/upload-progress/task/${taskId}`);

      console.log('✅ Got task upload progress:', response.data.length, 'sessions');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get task progress:', error);
      throw new Error('Failed to get task progress');
    }
  }

  /**
   * 📋 Get Active Uploads
   * GET /api/upload-progress/my-active
   */
  async getActiveUploads(): Promise<UploadSession[]> {
    try {
      console.log('📋 Getting active uploads');

      const response = await api.get<UploadSession[]>('/api/upload-progress/my-active');

      console.log('✅ Got active uploads:', response.data.length, 'uploads');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get active uploads:', error);
      throw new Error('Failed to get active uploads');
    }
  }

  /**
   * 📊 Get Upload Statistics
   * GET /api/upload-progress/stats
   */
  async getUploadStats(): Promise<UploadStats> {
    try {
      console.log('📊 Getting upload statistics');

      const response = await api.get<UploadStats>('/api/upload-progress/stats');

      console.log('✅ Got upload stats');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get upload stats:', error);
      throw new Error('Failed to get upload stats');
    }
  }

  // ============================================================================
  // REAL-TIME PROGRESS TRACKING
  // ============================================================================

  /**
   * 🔄 Start real-time progress tracking for a session
   */
  startProgressTracking(
    sessionId: string,
    onProgress: (progress: UploadSession) => void,
    onComplete: (finalProgress: UploadSession) => void,
    onError: (error: Error) => void,
    intervalMs: number = 1000
  ): () => void {
    console.log('🔄 Starting real-time progress tracking for:', sessionId);

    const interval = setInterval(async () => {
      try {
        const progress = await this.getProgress(sessionId);
        onProgress(progress);

        // Stop tracking if upload is complete or failed
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(progress.status)) {
          clearInterval(interval);
          onComplete(progress);
        }
      } catch (error) {
        clearInterval(interval);
        onError(error instanceof Error ? error : new Error('Progress tracking failed'));
      }
    }, intervalMs);

    // Return cleanup function
    return () => {
      clearInterval(interval);
      console.log('🛑 Stopped progress tracking for:', sessionId);
    };
  }

  /**
   * 📊 Track multiple upload sessions
   */
  startMultipleProgressTracking(
    sessionIds: string[],
    onProgress: (sessionId: string, progress: UploadSession) => void,
    onComplete: (sessionId: string, finalProgress: UploadSession) => void,
    onError: (sessionId: string, error: Error) => void,
    intervalMs: number = 1000
  ): () => void {
    console.log('🔄 Starting multi-progress tracking for:', sessionIds.length, 'sessions');

    const activeSessionIds = new Set(sessionIds);

    const interval = setInterval(async () => {
      const promises = Array.from(activeSessionIds).map(async (sessionId) => {
        try {
          const progress = await this.getProgress(sessionId);
          onProgress(sessionId, progress);

          // Remove from active tracking if complete
          if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(progress.status)) {
            activeSessionIds.delete(sessionId);
            onComplete(sessionId, progress);
          }
        } catch (error) {
          activeSessionIds.delete(sessionId);
          onError(sessionId, error instanceof Error ? error : new Error('Progress tracking failed'));
        }
      });

      await Promise.allSettled(promises);

      // Stop interval if no active sessions
      if (activeSessionIds.size === 0) {
        clearInterval(interval);
        console.log('✅ All progress tracking completed');
      }
    }, intervalMs);

    // Return cleanup function
    return () => {
      clearInterval(interval);
      console.log('🛑 Stopped multi-progress tracking');
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate upload speed in human-readable format
   */
  formatUploadSpeed(bytesPerSecond: number): string {
    if (bytesPerSecond === 0) return '0 B/s';

    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));

    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Calculate estimated time remaining
   */
  calculateTimeRemaining(uploadedBytes: number, totalBytes: number, uploadSpeed: number): string {
    if (uploadSpeed === 0 || uploadedBytes >= totalBytes) return 'Unknown';

    const remainingBytes = totalBytes - uploadedBytes;
    const remainingSeconds = remainingBytes / uploadSpeed;

    if (remainingSeconds < 60) {
      return `${Math.ceil(remainingSeconds)}s`;
    } else if (remainingSeconds < 3600) {
      const minutes = Math.ceil(remainingSeconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.ceil((remainingSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: UploadSession['status']): string {
    const colorMap: Record<UploadSession['status'], string> = {
      'INITIATED': '#6B7280', // gray
      'UPLOADING': '#3B82F6', // blue
      'COMPLETED': '#10B981', // green
      'FAILED': '#EF4444',    // red
      'CANCELLED': '#F59E0B'  // amber
    };

    return colorMap[status];
  }

  /**
   * Get status icon for UI
   */
  getStatusIcon(status: UploadSession['status']): string {
    const iconMap: Record<UploadSession['status'], string> = {
      'INITIATED': '⏳',
      'UPLOADING': '📤',
      'COMPLETED': '✅',
      'FAILED': '❌',
      'CANCELLED': '🚫'
    };

    return iconMap[status];
  }
}

// Export singleton instance
const uploadProgressService = new UploadProgressService();
export default uploadProgressService;
