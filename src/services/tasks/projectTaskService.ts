// Project Task Service - API integration for project tasks
import { api } from '@/lib/api';

// TypeScript interfaces based on API documentation
export interface CreateProjectTaskRequest {
  title: string;
  description?: string;
  projectId: number;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'TESTING' | 'BLOCKED' | 'REVIEW';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string; // YYYY-MM-DD
  deadline?: string; // YYYY-MM-DD
  estimatedHours?: number;
  actualHours?: number;
  progressPercentage?: number; // 0-100
  assigneeId?: number;
  additionalAssigneeIds?: number[];
  parentTaskId?: number;
}

export interface UpdateProjectTaskRequest extends Partial<CreateProjectTaskRequest> {}

export interface ProjectTaskResponseDto {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  deadline: string;
  estimatedHours: number;
  actualHours: number;
  progressPercentage: number;
  projectId: number;
  projectName: string;
  creatorId: number;
  creatorName: string;
  creatorEmail: string;
  assigneeId?: number;
  assigneeName?: string;
  assigneeEmail?: string;
  additionalAssignees: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  subtasks: any[];
  subtaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  projectId?: number;
  status?: string;
  priority?: string;
  assigneeId?: number;
  creatorId?: number;
}

export interface PaginatedProjectTasksResponse {
  content: ProjectTaskResponseDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Project Task Service Implementation
export const projectTaskService = {
  // Create new project task
  createTask: async (taskData: CreateProjectTaskRequest): Promise<ProjectTaskResponseDto> => {
    try {
      const response = await api.post<ProjectTaskResponseDto>('/api/project-tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create project task:', error);
      throw error;
    }
  },

  // Get all project tasks with filtering
  getTasks: async (filters: ProjectTaskFilters = {}): Promise<PaginatedProjectTasksResponse> => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<PaginatedProjectTasksResponse>(`/api/project-tasks?${params}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch project tasks:', error);
      throw error;
    }
  },

  // Get tasks by specific project
  getTasksByProject: async (projectId: number, page = 0, size = 20): Promise<PaginatedProjectTasksResponse> => {
    try {

      
      const response = await api.get<PaginatedProjectTasksResponse>(
        `/api/project-tasks/project/${projectId}?page=${page}&size=${size}`
      );
      

      return response.data;
    } catch (error: any) {
      // Check if endpoint not found - try alternative approach
      if (error?.response?.status === 404) {
        console.warn('⚠️ Project-specific endpoint not available, trying general endpoint with projectId filter');
        
        try {
          // Try using general tasks endpoint with projectId filter
          const response = await api.get<PaginatedProjectTasksResponse>(
            `/api/project-tasks?projectId=${projectId}&page=${page}&size=${size}`
          );
          

          return response.data;
        } catch (fallbackError) {
          console.warn('⚠️ Both project task endpoints unavailable, backend may not be fully implemented yet');
          throw error; // Throw original 404 error for hook to handle
        }
      }
      
      console.error('❌ Failed to fetch tasks for project:', projectId, error);
      throw error;
    }
  },

  // Get single task by ID
  getTaskById: async (taskId: number): Promise<ProjectTaskResponseDto> => {
    try {
      const response = await api.get<ProjectTaskResponseDto>(`/api/project-tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch project task:', taskId, error);
      throw error;
    }
  },

  // Update existing task
  updateTask: async (taskId: number, updates: UpdateProjectTaskRequest): Promise<ProjectTaskResponseDto> => {
    try {
      console.log('📤 Updating project task:', taskId, 'with data:', JSON.stringify(updates, null, 2));
      
      // Validate updates object
      if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid updates object');
      }
      
      // Clean up undefined values that might cause backend issues
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
      );
      
      console.log('📤 Cleaned updates:', JSON.stringify(cleanUpdates, null, 2));
      
      const response = await api.put<ProjectTaskResponseDto>(`/api/project-tasks/${taskId}`, cleanUpdates);
      
      console.log('✅ Project task updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update project task:', taskId);
      console.error('Error details:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url,
        method: error?.config?.method,
        requestData: error?.config?.data
      });
      throw error;
    }
  },

  // Delete task
  deleteTask: async (taskId: number): Promise<void> => {
    try {
      await api.delete(`/api/project-tasks/${taskId}`);
    } catch (error) {
      console.error('❌ Failed to delete project task:', taskId, error);
      throw error;
    }
  },

  // Update task status
  updateTaskStatus: async (taskId: number, status: string): Promise<ProjectTaskResponseDto> => {
    return projectTaskService.updateTask(taskId, { status: status as any });
  },

  // Update task progress
  updateTaskProgress: async (taskId: number, progressPercentage: number): Promise<void> => {
    try {
      await api.put(`/api/project-tasks/${taskId}/progress?progressPercentage=${progressPercentage}`);
    } catch (error) {
      console.error('❌ Failed to update task progress:', taskId, error);
      throw error;
    }
  },

  // Assign task to user
  assignTask: async (taskId: number, userId: number): Promise<void> => {
    try {
      await api.put(`/api/project-tasks/${taskId}/assign/${userId}`);
    } catch (error) {
      console.error('❌ Failed to assign task:', taskId, error);
      throw error;
    }
  },

  // Get project task statistics
  getProjectTaskStats: async (projectId: number): Promise<any> => {
    try {
      const response = await api.get(`/api/project-tasks/project/${projectId}/stats`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch project task stats:', projectId, error);
      throw error;
    }
  },

  // Get overdue tasks by project
  getOverdueTasks: async (projectId: number): Promise<ProjectTaskResponseDto[]> => {
    try {
      const response = await api.get<ProjectTaskResponseDto[]>(`/api/project-tasks/project/${projectId}/overdue`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch overdue tasks:', projectId, error);
      throw error;
    }
  },

  // Get subtasks
  getSubtasks: async (taskId: number): Promise<ProjectTaskResponseDto[]> => {
    try {
      const response = await api.get<ProjectTaskResponseDto[]>(`/api/project-tasks/${taskId}/subtasks`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch subtasks:', taskId, error);
      throw error;
    }
  }
};

export default projectTaskService;