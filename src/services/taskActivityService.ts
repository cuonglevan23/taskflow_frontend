import { BaseApiClient } from '@/lib/baseApiClient';

// Type definitions based on API documentation
export interface UserProfileDto {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  jobTitle?: string;
  department?: string;
  aboutMe?: string;
  status: string;
  avatarUrl?: string;
  upgraded: boolean;
  displayName: string;
  initials: string;
}

export interface TaskActivityResponseDto {
  id: number;
  taskId: number;
  activityType: string;
  description: string;
  fieldName?: string;
  formattedMessage: string;
  newValue?: string;
  oldValue?: string;
  timeAgo: string;
  createdAt: string;
  user: UserProfileDto; // Backend uses 'user' not 'actorProfile'
}

export interface PaginatedTaskActivitiesDto {
  content: TaskActivityResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export type TaskActivityType = 
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'DEADLINE_CHANGED'
  | 'START_DATE_CHANGED'
  | 'TITLE_CHANGED'
  | 'DESCRIPTION_CHANGED'
  | 'COMMENT_CHANGED'
  | 'FILE_CHANGED'
  | 'ASSIGNEE_ADDED'
  | 'ASSIGNEE_REMOVED'
  | 'TASK_COMPLETED'
  | 'TASK_REOPENED'
  | 'COMMENT_ADDED'
  | 'CHECKLIST_ADDED'
  | 'CHECKLIST_REMOVED'
  | 'CHECKLIST_COMPLETED'
  | 'TEAM_CHANGED'
  | 'PROJECT_CHANGED';

export interface PaginatedActivitiesResponse {
  content: TaskActivityResponseDto[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Activity icon and color mapping for UI
export const getActivityConfig = (activityType: TaskActivityType) => {
  const configs: Record<TaskActivityType, { icon: string; color: string; bgColor: string }> = {
    'TASK_CREATED': { icon: 'Plus', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    'TASK_UPDATED': { icon: 'Edit', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    'STATUS_CHANGED': { icon: 'CheckCircle', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    'PRIORITY_CHANGED': { icon: 'AlertTriangle', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    'DEADLINE_CHANGED': { icon: 'Calendar', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    'START_DATE_CHANGED': { icon: 'Calendar', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    'TITLE_CHANGED': { icon: 'Type', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
    'DESCRIPTION_CHANGED': { icon: 'FileText', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
    'COMMENT_CHANGED': { icon: 'MessageSquare', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    'FILE_CHANGED': { icon: 'Paperclip', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    'ASSIGNEE_ADDED': { icon: 'UserPlus', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    'ASSIGNEE_REMOVED': { icon: 'UserMinus', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    'TASK_COMPLETED': { icon: 'CheckCircle2', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    'TASK_REOPENED': { icon: 'RotateCcw', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    'COMMENT_ADDED': { icon: 'MessageSquare', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    'CHECKLIST_ADDED': { icon: 'ListPlus', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    'CHECKLIST_REMOVED': { icon: 'ListMinus', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    'CHECKLIST_COMPLETED': { icon: 'CheckSquare', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    'TEAM_CHANGED': { icon: 'Users', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    'PROJECT_CHANGED': { icon: 'FolderOpen', color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
  };
  
  return configs[activityType] || { icon: 'Circle', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
};

// Group activities by date for timeline display
export const groupActivitiesByDate = (activities: TaskActivityResponseDto[] = []): {
  TODAY: TaskActivityResponseDto[];
  YESTERDAY: TaskActivityResponseDto[];
  EARLIER: TaskActivityResponseDto[];
} => {
  // Guard against undefined or null activities
  if (!activities || !Array.isArray(activities)) {
    return {
      TODAY: [],
      YESTERDAY: [],
      EARLIER: []
    };
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const groups: {
    TODAY: TaskActivityResponseDto[];
    YESTERDAY: TaskActivityResponseDto[];
    EARLIER: TaskActivityResponseDto[];
  } = {
    TODAY: [],
    YESTERDAY: [],
    EARLIER: []
  };

  activities.forEach(activity => {
    const activityDate = new Date(activity.createdAt);
    activityDate.setHours(0, 0, 0, 0);
    
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === todayStart.getTime()) {
      groups.TODAY.push(activity);
    } else if (activityDate.getTime() === yesterdayStart.getTime()) {
      groups.YESTERDAY.push(activity);
    } else {
      groups.EARLIER.push(activity);
    }
  });

  return groups;
};

// API Service functions
export class TaskActivityService {
  private static readonly BASE_URL = '/api/tasks';

  /**
   * Get paginated activities for a specific task
   * @param taskId - ID of the task
   * @param page - Page number (0-based)
   * @param size - Number of items per page
   * @returns Promise<PaginatedTaskActivitiesDto>
   */
  static async getActivities(
    taskId: string | number,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedTaskActivitiesDto> {
    try {
      const response = await BaseApiClient.get<PaginatedTaskActivitiesDto>(
        `${this.BASE_URL}/${taskId}/activities`,
        { page, size }
      );

      return response;
    } catch (error: unknown) {
      console.error('❌ TaskActivityService.getActivities: Error occurred', {
        taskId,
        page,
        size,
        error
      });
      throw error;
    }
  }

  /**
   * Get total count of activities for a task
   * @param taskId - ID of the task
   * @returns Promise<number>
   */
  static async getActivitiesCount(taskId: string | number): Promise<number> {
    try {
      const response = await BaseApiClient.get<{ count: number }>(`${this.BASE_URL}/${taskId}/activities/count`);

      return response.count;
    } catch (error: unknown) {
      console.error('❌ Error fetching task activities count:', error);

      // Handle 401/404 gracefully - API might not be implemented yet
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('Authentication required') || errorMessage.includes('Resource not found')) {
          console.warn('Task activities count API not available - returning 0');
          return 0;
        }
      }

      throw error;
    }
  }
}

export default TaskActivityService;
