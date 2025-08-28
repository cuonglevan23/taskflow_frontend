import { api } from '@/lib/api';
import { logAxiosError } from '@/utils/errorHandlers';
import type { 
  TaskComment, 
  CreateCommentRequest, 
  UpdateCommentRequest, 
  CommentListResponse,
  UpdateTaskDescriptionRequest,
  UpdateTaskCommentRequest
} from '@/types/comment';

// API Endpoints
const API_ENDPOINTS = {
  // Base URL
  TASK_COMMENTS: '/api/task-comments',
  
  // Task comments by task ID
  TASK_COMMENTS_BY_TASK: (taskId: number | string) => {
    // Make sure taskId is always a number without decimals
    const numericId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    // Return the exact endpoint
    return `/api/task-comments/task/${numericId}`;
  },
  
  // Comment count by task ID
  TASK_COMMENTS_COUNT: (taskId: number | string) => {
    const numericId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    return `/api/task-comments/task/${numericId}/count`;
  },
  
  // Paginated comments by task ID
  TASK_COMMENTS_PAGINATED: (taskId: number | string) => {
    const numericId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    return `/api/task-comments/task/${numericId}/paginated`;
  },
  
  // Comment by ID
  TASK_COMMENT_BY_ID: (commentId: number | string) => {
    const numericId = typeof commentId === 'string' ? parseInt(commentId, 10) : commentId;
    return `/api/task-comments/${numericId}`;
  },
};

export class CommentService {
  // Get comments for a task - using the dedicated task comments API
  static async getTaskComments(taskId: string | number, page = 0, size = 10): Promise<CommentListResponse> {
    try {
      // Make sure taskId is a valid number
      const numericTaskId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
      if (isNaN(numericTaskId)) {
        return { comments: [], total: 0, page, size };
      }
      
      // Get the endpoint from our constant
      const endpoint = API_ENDPOINTS.TASK_COMMENTS_BY_TASK(numericTaskId);
      
      // Ensure we send the numeric ID
      const response = await api.get(endpoint, {
        params: { page, size }
      });
      
      // API returns array directly as per documentation
      if (Array.isArray(response.data)) {
        return {
          comments: response.data,
          total: response.data.length,
          page: page,
          size: size
        };
      } else {
        // Fallback for unexpected response format
        return {
          comments: response.data.content || response.data || [],
          total: response.data.totalElements || response.data.length || 0,
          page: page,
          size: size
        };
      }
    } catch (error) {
      // Enhanced error handling for debugging
      const axiosError = error as any;
      
      // Check for specific error types
      if (axiosError?.response?.status === 403) {
        // User doesn't have permission to view comments for this task
        throw new Error('Access denied: You do not have permission to view comments for this task');
      } else if (axiosError?.response?.status === 404) {
        // Task not found
        throw new Error('Task not found or you do not have access to it');
      } else if (axiosError?.response?.status === 401) {
        // Authentication error
        throw new Error('Authentication required: Please log in again');
      }
      
      logAxiosError(error);
      
      // Provide a default response to prevent UI crashes
      return {
        comments: [],
        total: 0,
        page: page,
        size: size
      };
    }
  }
  
  // Get paginated comments for a task
  static async getPaginatedComments(taskId: string | number, page = 0, size = 10): Promise<{
    content: TaskComment[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  }> {
    try {
      // Make sure taskId is a valid number
      const numericTaskId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
      if (isNaN(numericTaskId)) {
        console.error('Invalid taskId for paginated comments:', taskId);
        return {
          content: [],
          pageable: {
            pageNumber: page,
            pageSize: size,
            sort: { empty: true, sorted: false, unsorted: true },
            offset: 0,
            paged: true,
            unpaged: false
          },
          totalElements: 0,
          totalPages: 0,
          last: true,
          size: size,
          number: page,
          sort: { empty: true, sorted: false, unsorted: true },
          numberOfElements: 0,
          first: true,
          empty: true
        };
      }
      
      const response = await api.get(API_ENDPOINTS.TASK_COMMENTS_PAGINATED(numericTaskId), {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch paginated comments:');
      logAxiosError(error);
      
      // Return a default object with empty data
      return {
        content: [],
        pageable: {
          pageNumber: page,
          pageSize: size,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: 0,
          paged: true,
          unpaged: false
        },
        totalElements: 0,
        totalPages: 0,
        last: true,
        size: size,
        number: page,
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: 0,
        first: true,
        empty: true
      };
    }
  }
  
  // Get comment count for a task
  static async getCommentCount(taskId: string | number): Promise<{ commentCount: number }> {
    try {
      // Make sure taskId is a valid number
      const numericTaskId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
      if (isNaN(numericTaskId)) {
        console.error('Invalid taskId for comment count:', taskId);
        return { commentCount: 0 };
      }
      
      const response = await api.get(API_ENDPOINTS.TASK_COMMENTS_COUNT(numericTaskId));
      return response.data;
    } catch (error) {
      console.error('Failed to fetch comment count:');
      logAxiosError(error);
      
      // Return a default object to prevent UI crashes
      return { commentCount: 0 };
    }
  }

  // Create a new comment
  static async createComment(data: CreateCommentRequest): Promise<TaskComment> {
    try {
      // Ensure taskId is a number
      const numericTaskId = typeof data.taskId === 'string' ? parseInt(data.taskId as string, 10) : data.taskId;
      
      // Validate required fields
      if (!data.content || !data.content.trim()) {
        throw new Error('Comment content is required');
      }
      
      if (!numericTaskId || isNaN(numericTaskId)) {
        throw new Error('Valid task ID is required');
      }
      
      const requestBody = {
        content: data.content.trim(),
        taskId: numericTaskId
      };
      
      const response = await api.post(API_ENDPOINTS.TASK_COMMENTS, requestBody);
      return response.data as TaskComment;
    } catch (error) {
      // Enhanced error handling for comment creation
      const axiosError = error as any;
      
      if (axiosError?.response?.status === 403) {
        throw new Error('Access denied: You do not have permission to comment on this task');
      } else if (axiosError?.response?.status === 404) {
        throw new Error('Task not found or you do not have access to it');
      } else if (axiosError?.response?.status === 401) {
        throw new Error('Authentication required: Please log in again');
      } else if (axiosError?.response?.status === 400) {
        const errorData = axiosError?.response?.data;
        if (errorData?.validationErrors) {
          const errors = Object.values(errorData.validationErrors).join(', ');
          throw new Error(`Validation error: ${errors}`);
        }
        throw new Error('Invalid comment data');
      }
      
      logAxiosError(error);
      
      // Return a mock comment as fallback for UI
      const fallbackComment: TaskComment = {
        id: Math.floor(Math.random() * -1000), // Negative ID to indicate it's temporary
        content: data.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskId: data.taskId,
        userId: 0,
        userEmail: 'current.user@example.com',
        userName: 'Current User',
        userAvatar: null,
        isEdited: false
      };
      return fallbackComment; // Return fallback for optimistic UI updates
    }
  }

  // Update an existing comment
  static async updateComment(data: UpdateCommentRequest): Promise<TaskComment> {
    try {
      const response = await api.put(API_ENDPOINTS.TASK_COMMENT_BY_ID(data.id), {
        content: data.content
      });
      
      return response.data as TaskComment;
    } catch (error) {
      console.error('Failed to update comment:');
      logAxiosError(error);
      
      // Return a mock updated comment for UI
      const fallbackComment: TaskComment = {
        id: data.id,
        content: data.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskId: 0, // We don't have the taskId here
        userId: 0,
        userEmail: 'current.user@example.com',
        userName: 'Current User',
        userAvatar: null,
        isEdited: true
      };
      return fallbackComment;
    }
  }

  // Delete a comment
  static async deleteComment(commentId: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.TASK_COMMENT_BY_ID(commentId));
    } catch (error) {
      console.error('Failed to delete comment:');
      logAxiosError(error);
      // We don't need to return anything for delete, but we should log the error
    }
  }

  // Update task description
  static async updateTaskDescription(data: UpdateTaskDescriptionRequest): Promise<void> {
    try {
      await api.put(`/api/tasks/${data.taskId}`, {
        description: data.description
      });
    } catch (error) {
      console.error('Failed to update task description:');
      logAxiosError(error);
      // No need to throw, we'll just log the error
    }
  }
  
  // Update task comment field
  static async updateTaskComment(data: UpdateTaskCommentRequest): Promise<void> {
    try {
      console.log('Updating task comment field:', data);
      await api.put(`/api/tasks/${data.taskId}`, {
        comment: data.comment
      });
      console.log('Task comment updated successfully');
    } catch (error) {
      console.error('Failed to update task comment:');
      logAxiosError(error);
      // No need to throw, we'll just log the error
    }
  }
  
  // Get task comment and description
  static async getTaskCommentAndDescription(taskId: string): Promise<{description: string, comment: string}> {
    try {
      const response = await api.get(`/api/tasks/${taskId}`);
      
      return {
        description: (response.data as any).description || '',
        comment: (response.data as any).comment || ''
      };
    } catch (error) {
      console.error('Failed to fetch task comment and description:');
      logAxiosError(error);
      
      // Return default values to prevent UI crashes
      return {
        description: '',
        comment: ''
      };
    }
  }
}
