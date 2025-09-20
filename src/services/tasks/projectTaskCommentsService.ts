// Project Task Comments Service - API integration for task comments
import { BaseApiClient } from '@/lib/baseApiClient';

// Interface for API response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Interface for comment response - updated to match actual API response
export interface ProjectTaskCommentDto {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy field mappings for compatibility
  authorId?: number;
  authorName?: string;
  authorEmail?: string;
  authorUsername?: string;
  authorAvatar?: string;
  authorPremiumBadge?: string;
}

// Interface for creating a comment
export interface CreateCommentRequest {
  taskId: number;
  content: string;
}

// Interface for updating a comment
export interface UpdateCommentRequest {
  content: string;
}

// Interface for paginated comments response
export interface PaginatedCommentsResponse {
  content: ProjectTaskCommentDto[];
  pageable: {
    sort: {
      sorted: boolean;
      direction: string;
      property: string;
    };
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// Project Task Comments Service Class
export class ProjectTaskCommentsService {
  private static readonly BASE_URL = '/api/project-task-comments';

  // 14. Create Task Comment
  static async createComment(data: CreateCommentRequest): Promise<ProjectTaskCommentDto> {
    try {
      console.log('💬 Creating project task comment: ', data);
      const response = await BaseApiClient.post<ProjectTaskCommentDto>(this.BASE_URL, data);
      console.log('✅ Comment created successfully: ', response);
      console.log('🔍 Raw create response structure: ', response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // 15. Get Comments by Project Task
  static async getCommentsByTask(projectTaskId: number): Promise<ProjectTaskCommentDto[]> {
    try {
      const response = await BaseApiClient.get<ProjectTaskCommentDto[]>(`${this.BASE_URL}/project-task/${projectTaskId}`);
      console.log('✅ Comments fetched successfully:', response.length, 'comments');
      console.log('🔍 Raw response structure: ', response);

      // Handle both wrapped and direct array responses
      if (Array.isArray(response)) {
        return response;
      } else if (response && (response as any).data && Array.isArray((response as any).data)) {
        return (response as any).data;
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  }

  // 16. Get Comments with Pagination
  static async getCommentsPaginated(
      projectTaskId: number,
      page: number = 0,
      size: number = 10
  ): Promise<PaginatedCommentsResponse> {
    try {
      const queryParams = { page, size };
      const response = await BaseApiClient.get<PaginatedCommentsResponse>(
          `${this.BASE_URL}/project-task/${projectTaskId}/paginated`,
          queryParams
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // 17. Get Comment Count
  static async getCommentCount(projectTaskId: number): Promise<number> {
    try {
      const response = await BaseApiClient.get<number>(`${this.BASE_URL}/project-task/${projectTaskId}/count`);
      return response;
    } catch (error: any) {
      // Silent handling for comment count errors to prevent UI crashes
      // This is not critical functionality that should break the task display

      if (error?.response?.status === 404) {
        // Project task not found or no comments - silently return 0
        return 0;
      }

      if (error?.response?.status === 500) {
        // Backend error - log but don't crash UI
        return 0;
      }

      // Network or other errors
      if (!error?.response) {
        return 0;
      }

      // Only throw in development for debugging
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }

      return 0;
    }
  }

  // 18. Get Comment by ID
  static async getCommentById(commentId: number): Promise<ProjectTaskCommentDto> {
    try {
      const response = await BaseApiClient.get<ProjectTaskCommentDto>(`${this.BASE_URL}/${commentId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // 19. Update Comment
  static async updateComment(commentId: number, data: UpdateCommentRequest): Promise<ProjectTaskCommentDto> {
    try {
      const response = await BaseApiClient.put<ProjectTaskCommentDto>(`${this.BASE_URL}/${commentId}`, data);
      return response;
    } catch (error) {
      console.error('❌ Error updating comment:', error);
      throw error;
    }
  }

  // 20. Delete Comment
  static async deleteComment(commentId: number): Promise<void> {
    try {
      await BaseApiClient.delete<void>(`${this.BASE_URL}/${commentId}`);
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }
  }

  // 21. Get Recent Comments
  static async getRecentComments(projectTaskId: number): Promise<ProjectTaskCommentDto[]> {
    try {
      const response = await BaseApiClient.get<ProjectTaskCommentDto[]>(`${this.BASE_URL}/project-task/${projectTaskId}/recent`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching recent comments:', error);
      throw error;
    }
  }

  // 22. Get Current User's Comments
  static async getMyComments(projectTaskId: number): Promise<ProjectTaskCommentDto[]> {
    try {
      const response = await BaseApiClient.get<ProjectTaskCommentDto[]>(`${this.BASE_URL}/project-task/${projectTaskId}/my-comments`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching my comments:', error);
      throw error;
    }
  }

  // 23. Search Comments
  static async searchComments(projectTaskId: number, keyword: string): Promise<ProjectTaskCommentDto[]> {
    try {
      const queryParams = { keyword };
      const response = await BaseApiClient.get<ProjectTaskCommentDto[]>(
          `${this.BASE_URL}/project-task/${projectTaskId}/search`,
          queryParams
      );

      return response;
    } catch (error) {
      console.error('❌ Error searching comments:', error);
      throw error;
    }
  }
}

// Export default for compatibility
export default ProjectTaskCommentsService;
