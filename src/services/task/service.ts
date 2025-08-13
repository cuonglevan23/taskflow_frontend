// Task Service - DEPRECATED - Use @/services/tasks instead
// This file is kept for backward compatibility only

import { CookieAuth } from '@/utils/cookieAuth';
import { api as taskApi } from '@/lib/api';
import { transformBackendTask, transformMyTasksSummary, transformMyTasksFull } from '@/services/tasks';
import type { 
  BackendTask, 
  Task, 
  CreateTaskDTO, 
  UpdateTaskDTO, 
  TasksResponse,
  MyTasksFullItem,
  MyTasksSummaryItem,
  PaginatedResponse,
  MyTasksStats
} from '@/types/task';

// Service layer - Reliable API calls with safe error handling
export const taskService = {
  // DEPRECATED: Old generic tasks endpoint - Use getMyTasks() instead
  getTasks: async (params?: Record<string, unknown>): Promise<TasksResponse> => {
    // Return empty data to force migration to new endpoints
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20
    };
  },

  // Get task by ID
  getTask: async (id: string): Promise<Task> => {
    try {
      console.log('🔄 Fetching task by ID:', id);
      const response = await taskApi.get<BackendTask>(`/api/tasks/${id}`);
      const backendTask = response.data;
      console.log('✅ Successfully fetched task:', backendTask.title);
      return transformBackendTask(backendTask);
    } catch (error) {
      console.error('❌ Failed to fetch task:', error);
      throw error;
    }
  },

  // Create task - Enhanced debugging
  createTask: async (data: CreateTaskDTO): Promise<Task> => {
    try {
      console.log('🔄 TaskService: Creating new task:', data.title);
      console.log('🔍 TaskService: Input data from frontend:', data);
      
      // Get current user ID from cookies for creatorId
      const userInfo = CookieAuth.getUserInfo();
      const tokenPayload = CookieAuth.getTokenPayload();
      
      // REQUIRED: Generate start_date from calendar click
      let startDate: string;
      let deadline = data.deadline || null;
      
      if (data.dueDateISO) {
        // Convert dueDateISO to YYYY-MM-DD format for backend
        startDate = `${data.dueDateISO.getFullYear()}-${String(data.dueDateISO.getMonth() + 1).padStart(2, '0')}-${String(data.dueDateISO.getDate()).padStart(2, '0')}`;
      } else if (data.startDate) {
        startDate = data.startDate;
      } else {
        // Fallback to today if no date provided
        const today = new Date();
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      }

      const backendData = {
        title: data.title,
        description: data.description || '',  // Backend might not accept null
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM', 
        deadline: deadline, // Optional
        startDate: startDate, // REQUIRED - Primary field for calendar (camelCase for backend)
        groupId: data.groupId || null,
        projectId: data.projectId || null,
        creatorId: data.creatorId || tokenPayload?.userId || parseInt(userInfo.id || '1'),
        assignedToIds: data.assignedToIds || [],
      };

      console.log('📤 TaskService: Sending to backend:', JSON.stringify(backendData, null, 2));
      
      const response = await taskApi.post<BackendTask>('/api/tasks', backendData);
      console.log('✅ TaskService: Backend response:', response.data);
      
      const transformedTask = transformBackendTask(response.data);
      console.log('🔄 TaskService: Transformed task for frontend:', transformedTask);
      
      return transformedTask;
    } catch (error: any) {
      console.error('❌ Failed to create task:');
      console.error('  Request data:', JSON.stringify(data, null, 2));
      console.error('  Error response:', error.response?.data);
      console.error('  Error status:', error.response?.status);
      console.error('  Error message:', error.message);
      throw error;
    }
  },

  // Update task - Enhanced to handle both deadline and startDate
  updateTask: async (id: string, data: UpdateTaskDTO): Promise<Task> => {
    try {
      const backendData: Record<string, unknown> = {};
      if (data.title !== undefined) backendData.title = data.title;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.status !== undefined) backendData.status = data.status.toUpperCase();
      if (data.priority !== undefined) backendData.priority = data.priority.toUpperCase();
      
      // Handle date fields for different scenarios
      
      // Scenario 1: Resize operation (both startDate and deadline provided)
      if (data.startDate !== undefined && data.deadline !== undefined) {
        backendData.startDate = data.startDate;   // Start date for multi-day task
        backendData.deadline = data.deadline;     // End date for multi-day task
      }
      // Scenario 2: Simple drag-drop (only deadline provided) 
      else if (data.deadline !== undefined) {
        backendData.deadline = data.deadline;
        backendData.startDate = data.deadline;    // Same day for single-day task
      }
      // Scenario 3: Explicit startDate only
      else if (data.startDate !== undefined) {
        backendData.startDate = data.startDate;
      }
      // Scenario 4: Legacy dueDate field
      else if (data.dueDate !== undefined) {
        backendData.deadline = data.dueDate;
        backendData.startDate = data.dueDate;
      }

      const response = await taskApi.put<BackendTask>(`/api/tasks/${id}`, backendData);
      return transformBackendTask(response.data);
    } catch (error) {
      console.error('❌ Failed to update task:', error);
      throw error;
    }
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    try {
      console.log('🔄 Deleting task:', id);
      await taskApi.delete(`/api/tasks/${id}`);
      console.log('✅ Successfully deleted task:', id);
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      throw error;
    }
  },

  // DEPRECATED: Old task statistics - Use getMyTasksStats() instead
  getTaskStats: async (filter?: Record<string, unknown>): Promise<Record<string, unknown>> => {
    // Return empty stats to force migration to new endpoint
    return {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      testing: 0,
      blocked: 0,
      review: 0,
      high: 0,
      medium: 0,
      low: 0,
      overdue: 0
    };
  },

  // Update task status
  updateTaskStatus: async (id: string, status: string): Promise<Task> => {
    try {
      console.log('🔄 Updating task status:', id, 'to', status);
      const response = await taskApi.patch<BackendTask>(`/api/tasks/${id}/status`,
          { status: status.toUpperCase() }
      );

      return transformBackendTask(response.data);
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
      throw error;
    }
  },

  // Test authentication - Simple
  testAuth: async (): Promise<boolean> => {
    try {
      console.log('🧪 Testing authentication...');
      const response = await taskApi.get('/api/tasks');
      console.log('✅ Authentication test successful');
      return true;
    } catch (error) {
      console.error('❌ Authentication test failed');
      return false;
    }
  },

  // NEW API METHODS - My Tasks with Pagination

  // Get My Tasks (Full Data) with pagination
  getMyTasks: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<{
    tasks: Task[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    try {
      const {
        page = 0,
        size = 10,
        sortBy = 'updatedAt',
        sortDir = 'desc'
      } = params || {};

      console.log('🔄 Fetching my tasks (full data) with pagination...');
      
      const response = await taskApi.get<PaginatedResponse<MyTasksFullItem>>('/api/tasks/my-tasks', {
        params: { page, size, sortBy, sortDir }
      });

      const { content, totalElements, totalPages, number, size: pageSize } = response.data;
      const tasks = content.map(transformMyTasksFull);

      console.log(`✅ Successfully fetched ${tasks.length} my tasks (page ${number + 1}/${totalPages})`);

      return {
        tasks,
        totalElements,
        totalPages,
        currentPage: number,
        pageSize,
      };
    } catch (error) {
      console.error('❌ Failed to fetch my tasks:', error);
      throw error;
    }
  },

  // Get My Tasks Summary (Lightweight) with pagination
  getMyTasksSummary: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<{
    tasks: Task[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }> => {
    const {
      page = 0,
      size = 20,
      sortBy = 'priority',
      sortDir = 'asc'
    } = params || {};

    try {
      const response = await taskApi.get<PaginatedResponse<MyTasksSummaryItem>>('/api/tasks/my-tasks/summary', {
        params: { page, size, sortBy, sortDir }
      });

      const { content, totalElements, totalPages, number, size: pageSize } = response.data;
      const tasks = content.map(transformMyTasksSummary);

      return {
        tasks,
        totalElements,
        totalPages,
        currentPage: number,
        pageSize,
      };
    } catch (error: any) {
      const status = error?.response?.status;
      console.error(`❌ My Tasks Summary API failed with status ${status}:`, error?.response?.data || error.message);
      
      if (status === 404) {
        console.warn('🚧 Backend endpoint /api/tasks/my-tasks/summary not implemented yet');
      } else if (status === 500) {
        console.warn('💥 Backend server error on /api/tasks/my-tasks/summary');
      }
      
      // Return empty data instead of fallback - forces backend implementation
      return {
        tasks: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: size,
      };
    }
  },

  // Get My Tasks Statistics
  getMyTasksStats: async (): Promise<MyTasksStats> => {
    console.log('🔄 Fetching my tasks statistics...');
    
    try {
      const response = await taskApi.get<MyTasksStats>('/api/tasks/my-tasks/stats');
      
      console.log('✅ Successfully fetched my tasks stats:', response.data);
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      console.error(`❌ My Tasks Stats API failed with status ${status}:`, error?.response?.data || error.message);
      
      if (status === 404) {
        console.warn('🚧 Backend endpoint /api/tasks/my-tasks/stats not implemented yet');
      } else if (status === 500) {
        console.warn('💥 Backend server error on /api/tasks/my-tasks/stats');
      }
      
      // Return empty stats instead of fallback - forces backend implementation
      const userInfo = CookieAuth.getUserInfo();
      return {
        totalParticipatingTasks: 0,
        userEmail: userInfo.email || 'unknown@example.com',
        userId: parseInt(userInfo.id || '1')
      };
    }
  }
};