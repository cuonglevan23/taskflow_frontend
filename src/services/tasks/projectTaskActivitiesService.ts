// Project Task Activities Service - API integration for task activities
import { BaseApiClient } from '@/lib/baseApiClient';

// Interface for user information in activities
export interface ActivityUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string; // Add missing avatar field
}

// Interface for activity response
export interface ProjectTaskActivityDto {
  id: number;
  taskId: number;
  activityType: string;
  description: string;
  oldValue?: string | null;
  newValue?: string | null;
  fieldName?: string | null;
  createdAt: string;
  user: ActivityUser;
  formattedMessage: string;
  timeAgo: string;
}

// Interface for creating activity (if needed for manual activity creation)
export interface CreateActivityRequest {
  taskId: number;
  activityType: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  fieldName?: string;
}

// Interface for paginated activities response
export interface PaginatedActivitiesResponse {
  content: ProjectTaskActivityDto[];
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

// Project Task Activities Service Class
export class ProjectTaskActivitiesService {
  private static readonly BASE_URL = '/api/project-task-activities';

  // 24. Get Project Task Activities
  static async getTaskActivities(projectTaskId: number): Promise<ProjectTaskActivityDto[]> {
    try {
      const response = await BaseApiClient.get<ProjectTaskActivityDto[]>(`${this.BASE_URL}/project-task/${projectTaskId}`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching task activities:', error);
      throw error;
    }
  }

  // 25. Get Task Activities with Pagination
  static async getTaskActivitiesPaginated(
    projectTaskId: number,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedActivitiesResponse> {
    try {
      const queryParams = { page, size };
      const response = await BaseApiClient.get<PaginatedActivitiesResponse>(
        `${this.BASE_URL}/project-task/${projectTaskId}/paginated`,
        queryParams
      );
      return response;
    } catch (error) {
      console.error('❌ Error fetching paginated activities:', error);
      throw error;
    }
  }

  // 26. Get Recent Task Activities (last 10)
  static async getRecentTaskActivities(projectTaskId: number): Promise<ProjectTaskActivityDto[]> {
    try {
      const response = await BaseApiClient.get<ProjectTaskActivityDto[]>(`${this.BASE_URL}/project-task/${projectTaskId}/recent`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching recent activities:', error);
      throw error;
    }
  }

  // 27. Get Activities by Activity Type
  static async getActivitiesByType(
    projectTaskId: number,
    activityType: string
  ): Promise<ProjectTaskActivityDto[]> {
    try {
      const queryParams = { activityType };
      const response = await BaseApiClient.get<ProjectTaskActivityDto[]>(
        `${this.BASE_URL}/project-task/${projectTaskId}/by-type`,
        queryParams
      );
      return response;
    } catch (error) {
      console.error('❌ Error fetching activities by type:', error);
      throw error;
    }
  }

  // 28. Get Activities by User
  static async getActivitiesByUser(
    projectTaskId: number,
    userId: number
  ): Promise<ProjectTaskActivityDto[]> {
    try {
      const queryParams = { userId };
      const response = await BaseApiClient.get<ProjectTaskActivityDto[]>(
        `${this.BASE_URL}/project-task/${projectTaskId}/by-user`,
        queryParams
      );
      return response;
    } catch (error) {
      console.error('❌ Error fetching activities by user:', error);
      throw error;
    }
  }

  // 29. Get Activities Count
  static async getActivitiesCount(projectTaskId: number): Promise<number> {
    try {
      const response = await BaseApiClient.get<number>(`${this.BASE_URL}/project-task/${projectTaskId}/count`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching activities count:', error);
      throw error;
    }
  }

  // 30. Create Manual Activity (if supported by backend)
  static async createActivity(data: CreateActivityRequest): Promise<ProjectTaskActivityDto> {
    try {
      const response = await BaseApiClient.post<ProjectTaskActivityDto>(this.BASE_URL, data);
      return response;
    } catch (error) {
      console.error('❌ Error creating activity:', error);
      throw error;
    }
  }

  // 31. Delete Activity (if supported by backend)
  static async deleteActivity(activityId: number): Promise<void> {
    try {
      await BaseApiClient.delete<void>(`${this.BASE_URL}/${activityId}`);
    } catch (error) {
      console.error('❌ Error deleting activity:', error);
      throw error;
    }
  }

  // 32. Get Activity by ID
  static async getActivityById(activityId: number): Promise<ProjectTaskActivityDto> {
    try {
      const response = await BaseApiClient.get<ProjectTaskActivityDto>(`${this.BASE_URL}/${activityId}`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching activity:', error);
      throw error;
    }
  }
}

// Export default for compatibility
export default ProjectTaskActivitiesService;
