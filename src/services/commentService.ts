import { api } from '@/lib/api';
import type { 
  TaskComment, 
  CreateCommentRequest, 
  UpdateCommentRequest, 
  CommentListResponse,
  UpdateTaskDescriptionRequest,
  UpdateTaskCommentRequest
} from '@/types/comment';

export class CommentService {
  // Get comments for a task - using the dedicated task comments API
  static async getTaskComments(taskId: string, page = 0, size = 10): Promise<CommentListResponse> {
    try {
      const response = await api.get(`/api/task-comments/task/${taskId}`, {
        params: { page, size }
      });
      
      // Check if response is already in the expected format or needs transformation
      if (Array.isArray(response.data)) {
        // API returns array directly
        return {
          comments: response.data,
          total: response.data.length,
          page: page,
          size: size
        };
      } else if (response.data.content) {
        // API returns paginated format
        return {
          comments: response.data.content,
          total: response.data.totalElements || response.data.content.length,
          page: response.data.number || 0,
          size: response.data.size || 10
        };
      } else {
        // Direct format
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch task comments:', error);
      throw error;
    }
  }
  
  // Get comment count for a task
  static async getCommentCount(taskId: string): Promise<number> {
    try {
      const response = await api.get(`/api/task-comments/task/${taskId}/count`);
      
      // Handle different response formats
      if (typeof response.data === 'number') {
        return response.data;
      } else if (response.data.commentCount !== undefined) {
        return response.data.commentCount;
      } else if (response.data.count !== undefined) {
        return response.data.count;
      } else {
        // Fallback: get all comments and count them
        const comments = await this.getTaskComments(taskId, 0, 1000);
        return comments.total || comments.comments.length;
      }
    } catch (error) {
      console.error('Failed to fetch comment count:', error);
      // Fallback to getting all comments
      try {
        const comments = await this.getTaskComments(taskId, 0, 1000);
        return comments.total || comments.comments.length;
      } catch (e) {
        console.error('Failed to fetch comment count fallback:', e);
        return 0;
      }
    }
  }

  // Create a new comment
  static async createComment(data: CreateCommentRequest): Promise<TaskComment> {
    try {
      const response = await api.post(`/api/task-comments`, {
        taskId: data.taskId,
        content: data.content
      });
      return response.data as TaskComment;
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  }

  // Update an existing comment
  static async updateComment(data: UpdateCommentRequest): Promise<TaskComment> {
    try {
      const response = await api.put(`/api/task-comments/${data.id}`, {
        content: data.content
      });
      return response.data as TaskComment;
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  }

  // Delete a comment
  static async deleteComment(commentId: string): Promise<void> {
    try {
      await api.delete(`/api/task-comments/${commentId}`);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  }

  // Update task description
  static async updateTaskDescription(data: UpdateTaskDescriptionRequest): Promise<void> {
    try {
      await api.put(`/api/tasks/${data.taskId}`, {
        description: data.description
      });
    } catch (error) {
      console.error('Failed to update task description:', error);
      throw error;
    }
  }
  
  // Update task comment field
  static async updateTaskComment(data: UpdateTaskCommentRequest): Promise<void> {
    try {
      await api.put(`/api/tasks/${data.taskId}`, {
        comment: data.comment
      });
    } catch (error) {
      console.error('Failed to update task comment:', error);
      throw error;
    }
  }
  
  // Get task comment and description
  static async getTaskCommentAndDescription(taskId: string): Promise<{description: string, comment: string}> {
    try {
      const response = await api.get(`/api/tasks/${taskId}`);
      return {
        description: response.data.description || '',
        comment: response.data.comment || ''
      };
    } catch (error) {
      console.error('Failed to get task comment and description:', error);
      throw error;
    }
  }
}
