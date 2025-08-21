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
      console.log('🚀 Creating project task:', taskData);
      
      const response = await api.post<ProjectTaskResponseDto>('/api/project-tasks', taskData);
      
      console.log('✅ Project task created:', response.data);
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

      console.log('📋 Fetching project tasks with filters:', filters);
      
      const response = await api.get<PaginatedProjectTasksResponse>(`/api/project-tasks?${params}`);
      
      console.log('✅ Project tasks fetched:', response.data.content.length, 'tasks');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch project tasks:', error);
      throw error;
    }
  },

  // Get tasks by specific project
  getTasksByProject: async (projectId: number, page = 0, size = 20): Promise<PaginatedProjectTasksResponse> => {
    try {
      console.log('📋 Fetching tasks for project:', projectId);
      
      const response = await api.get<PaginatedProjectTasksResponse>(
        `/api/project-tasks/project/${projectId}?page=${page}&size=${size}`
      );
      
      console.log('✅ Project tasks fetched for project:', projectId, '- Count:', response.data.content.length);
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
          
          console.log('✅ Project tasks fetched via general endpoint for project:', projectId, '- Count:', response.data.content.length);
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
      console.log('📋 Fetching project task:', taskId);
      
      const response = await api.get<ProjectTaskResponseDto>(`/api/project-tasks/${taskId}`);
      
      console.log('✅ Project task fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch project task:', taskId, error);
      throw error;
    }
  },

  // Update existing task
  updateTask: async (taskId: number, updates: UpdateProjectTaskRequest): Promise<ProjectTaskResponseDto> => {
    try {
      console.log('🔄 Updating project task:', taskId, updates);
      
      const response = await api.put<ProjectTaskResponseDto>(`/api/project-tasks/${taskId}`, updates);
      
      console.log('✅ Project task updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update project task:', taskId, error);
      throw error;
    }
  },

  // Delete task
  deleteTask: async (taskId: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting project task:', taskId);
      
      await api.delete(`/api/project-tasks/${taskId}`);
      
      console.log('✅ Project task deleted:', taskId);
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
      console.log('📊 Updating task progress:', taskId, progressPercentage);
      
      await api.put(`/api/project-tasks/${taskId}/progress?progressPercentage=${progressPercentage}`);
      
      console.log('✅ Task progress updated:', taskId, progressPercentage);
    } catch (error) {
      console.error('❌ Failed to update task progress:', taskId, error);
      throw error;
    }
  },

  // Assign task to user
  assignTask: async (taskId: number, userId: number): Promise<void> => {
    try {
      console.log('👤 Assigning task:', taskId, 'to user:', userId);
      
      await api.put(`/api/project-tasks/${taskId}/assign/${userId}`);
      
      console.log('✅ Task assigned:', taskId, 'to user:', userId);
    } catch (error) {
      console.error('❌ Failed to assign task:', taskId, error);
      throw error;
    }
  },

  // Get project task statistics
  getProjectTaskStats: async (projectId: number): Promise<any> => {
    try {
      console.log('📊 Fetching project task stats:', projectId);
      
      const response = await api.get(`/api/project-tasks/project/${projectId}/stats`);
      
      console.log('✅ Project task stats fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch project task stats:', projectId, error);
      throw error;
    }
  },

  // Get overdue tasks by project
  getOverdueTasks: async (projectId: number): Promise<ProjectTaskResponseDto[]> => {
    try {
      console.log('⏰ Fetching overdue tasks for project:', projectId);
      
      const response = await api.get<ProjectTaskResponseDto[]>(`/api/project-tasks/project/${projectId}/overdue`);
      
      console.log('✅ Overdue tasks fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch overdue tasks:', projectId, error);
      throw error;
    }
  },

  // Get subtasks
  getSubtasks: async (taskId: number): Promise<ProjectTaskResponseDto[]> => {
    try {
      console.log('📋 Fetching subtasks for task:', taskId);
      
      const response = await api.get<ProjectTaskResponseDto[]>(`/api/project-tasks/${taskId}/subtasks`);
      
      console.log('✅ Subtasks fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch subtasks:', taskId, error);
      throw error;
    }
  }
};

export default projectTaskService;