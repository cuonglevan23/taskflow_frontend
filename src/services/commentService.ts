import { api } from '@/lib/api';
import { logAxiosError } from '@/utils/errorHandlers';
import type { 
  TaskComment, 
  CreateCommentRequest, 
  UpdateCommentRequest, 
  CommentListResponse
} from '@/types/comment';

// Strict TypeScript interfaces for API responses
interface ApiErrorResponse {
  message: string;
  validationErrors?: Record<string, string>;
}

interface PaginatedApiResponse<T> {
  content: T[];
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
}

interface CommentCountResponse {
  commentCount: number;
}

// API Endpoints with proper typing
const API_ENDPOINTS = {
  TASK_COMMENTS: '/api/task-comments',

  TASK_COMMENTS_BY_TASK: (taskId: number): string =>
    `/api/task-comments/task/${taskId}`,

  TASK_COMMENTS_COUNT: (taskId: number): string =>
    `/api/task-comments/task/${taskId}/count`,

  TASK_COMMENTS_PAGINATED: (taskId: number): string =>
    `/api/task-comments/task/${taskId}/paginated`,

  TASK_COMMENT_BY_ID: (commentId: number): string =>
    `/api/task-comments/${commentId}`,
} as const;

// Utility function for safe number conversion
function toSafeNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return parsed;
}

// Type guard for API error response
function isApiErrorResponse(error: unknown): error is { response: { data: ApiErrorResponse; status: number } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response: unknown }).response !== null
  );
}

export class CommentService {
  // Get comments for a task with strict typing
  static async getTaskComments(taskId: string | number, page = 0, size = 10): Promise<CommentListResponse> {
    try {
      const numericTaskId = toSafeNumber(taskId);
      const endpoint = API_ENDPOINTS.TASK_COMMENTS_BY_TASK(numericTaskId);

      const response = await api.get<TaskComment[]>(endpoint, {
        params: { page, size }
      });

      // Type guard for array response
      if (Array.isArray(response.data)) {
        return {
          comments: response.data,
          total: response.data.length,
          page,
          size
        };
      }

      // Handle unexpected response format
      throw new Error('Invalid response format from comments API');

    } catch (error) {
      if (isApiErrorResponse(error)) {
        const { status } = error.response;
        switch (status) {
          case 403:
            throw new Error('Access denied: You do not have permission to view comments for this task');
          case 404:
            throw new Error('Task not found or you do not have access to it');
          case 401:
            throw new Error('Authentication required: Please log in again');
        }
      }

      logAxiosError(error);

      // Return safe fallback
      return {
        comments: [],
        total: 0,
        page,
        size
      };
    }
  }

  // Get paginated comments with strict typing
  static async getPaginatedComments(
    taskId: string | number,
    page = 0,
    size = 10
  ): Promise<PaginatedApiResponse<TaskComment>> {
    try {
      const numericTaskId = toSafeNumber(taskId);
      const endpoint = API_ENDPOINTS.TASK_COMMENTS_PAGINATED(numericTaskId);

      const response = await api.get<PaginatedApiResponse<TaskComment>>(endpoint, {
        params: { page, size }
      });

      return response.data;

    } catch (error) {
      logAxiosError(error);
      
      // Return typed fallback response
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
        size,
        number: page,
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: 0,
        first: true,
        empty: true
      };
    }
  }
  
  // Get comment count with strict typing
  static async getCommentCount(taskId: string | number): Promise<CommentCountResponse> {
    try {
      const numericTaskId = toSafeNumber(taskId);
      const endpoint = API_ENDPOINTS.TASK_COMMENTS_COUNT(numericTaskId);

      const response = await api.get<CommentCountResponse>(endpoint);
      return response.data;

    } catch (error) {
      logAxiosError(error);
      return { commentCount: 0 };
    }
  }

  // Create comment with strict typing and validation
  static async createComment(data: CreateCommentRequest): Promise<TaskComment> {
    // Input validation
    if (!data.content?.trim()) {
      throw new Error('Comment content is required');
    }

    if (!data.taskId || data.taskId <= 0) {
      throw new Error('Valid task ID is required');
    }

    try {
      const requestBody: CreateCommentRequest = {
        content: data.content.trim(),
        taskId: data.taskId
      };
      
      const response = await api.post<TaskComment>(API_ENDPOINTS.TASK_COMMENTS, requestBody);
      return response.data;

    } catch (error) {
      if (isApiErrorResponse(error)) {
        const { status, data: errorData } = error.response;

        switch (status) {
          case 403:
            throw new Error('Access denied: You do not have permission to comment on this task');
          case 404:
            throw new Error('Task not found or you do not have access to it');
          case 401:
            throw new Error('Authentication required: Please log in again');
          case 400:
            if (errorData.validationErrors) {
              const errors = Object.values(errorData.validationErrors).join(', ');
              throw new Error(`Validation error: ${errors}`);
            }
            throw new Error('Invalid comment data');
        }
      }
      
      logAxiosError(error);
      throw new Error('Failed to create comment');
    }
  }

  // Update comment with strict typing
  static async updateComment(data: UpdateCommentRequest): Promise<TaskComment> {
    if (!data.content?.trim()) {
      throw new Error('Comment content is required');
    }

    if (!data.id || data.id <= 0) {
      throw new Error('Valid comment ID is required');
    }

    try {
      const endpoint = API_ENDPOINTS.TASK_COMMENT_BY_ID(data.id);
      const requestBody = { content: data.content.trim() };

      const response = await api.put<TaskComment>(endpoint, requestBody);
      return response.data;

    } catch (error) {
      logAxiosError(error);
      throw new Error('Failed to update comment');
    }
  }

  // Delete comment with proper error handling
  static async deleteComment(commentId: number): Promise<void> {
    if (!commentId || commentId <= 0) {
      throw new Error('Valid comment ID is required');
    }

    try {
      const endpoint = API_ENDPOINTS.TASK_COMMENT_BY_ID(commentId);
      await api.delete<void>(endpoint);

    } catch (error) {
      logAxiosError(error);
      throw new Error('Failed to delete comment');
    }
  }
}
