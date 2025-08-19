// Tasks Service - Centralized task operations using lib/api.ts
import { api } from '@/lib/api';
import { 
  safeParseDate, 
  formatDateString, 
  normalizeStatus, 
  normalizePriority,
  toBackendStatus,
  toBackendPriority,
  transformPaginatedResponse 
} from '@/lib/transforms';
import { CookieAuth } from '@/utils/cookieAuth';
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

// Transform backend task to frontend format
export const transformBackendTask = (backendTask: BackendTask): Task => {
  // Use startDate as primary field (REQUIRED)
  let dueDateString = 'No date';
  let dueDateISO = new Date();
  
  // Priority: startDate > deadline > fallback
  const dateSource = backendTask.startDate || backendTask.deadline;
  if (dateSource) {
    dueDateISO = safeParseDate(dateSource);
    dueDateString = formatDateString(dateSource);
  }

  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    dueDate: dueDateString,
    dueDateISO: dueDateISO,
    completed: backendTask.status === 'DONE',
    priority: normalizePriority(backendTask.priority),
    status: normalizeStatus(backendTask.status),
    hasTag: false,
    projectId: backendTask.projectId,
    tags: [],
    createdAt: safeParseDate(backendTask.createdAt),
    updatedAt: safeParseDate(backendTask.updatedAt),
    // Multi-day task support
    startDate: dueDateISO,
    endDate: dueDateISO,
  };
};

// Transform My Tasks Summary Item to Task format
export const transformMyTasksSummary = (item: MyTasksSummaryItem): Task => {
  const taskStartDate = safeParseDate(item.startDate);
  const taskEndDate = safeParseDate(item.deadline);
  const displayDate = item.startDate || item.deadline;
  const taskDueDateISO = safeParseDate(displayDate);

  return {
    id: item.id,
    title: item.title,
    description: item.description || '',
    dueDate: displayDate,
    dueDateISO: taskDueDateISO,
    completed: item.status === 'DONE',
    priority: normalizePriority(item.priority),
    status: normalizeStatus(item.status),
    hasTag: !!item.projectName || !!item.teamName,
    tagText: item.projectName || item.teamName || 'Default Project',
    projectId: undefined,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    // Multi-day task support
    startDate: taskStartDate,
    endDate: taskEndDate,
    // Additional fields from summary
    creatorName: item.creatorName,
    participationType: item.participationType,
    isOverdue: item.isOverdue,
    completionPercentage: item.completionPercentage,
    assigneeCount: item.assigneeCount,
    checklistCount: item.checklistCount,
  };
};

// Transform My Tasks Full Item to Task format  
export const transformMyTasksFull = (item: MyTasksFullItem): Task => {
  const taskDueDateISO = item.deadline ? safeParseDate(item.deadline) : new Date();

  return {
    id: item.id,
    title: item.title,
    description: item.description || '',
    dueDate: item.deadline || 'No deadline',
    dueDateISO: taskDueDateISO,
    completed: item.status === 'DONE',
    priority: normalizePriority(item.priority),
    status: normalizeStatus(item.status),
    hasTag: false,
    projectId: item.projectId,
    tags: [],
    createdAt: safeParseDate(item.createdAt),
    updatedAt: safeParseDate(item.updatedAt),
    // Multi-day task support
    startDate: taskDueDateISO,
    endDate: taskDueDateISO,
  };
};

// Tasks Service - Main CRUD Operations
export const tasksService = {
  // Get task by ID
  getTask: async (id: string): Promise<Task> => {
    try {
      console.log('🔄 Fetching task by ID:', id);
      const response = await api.get<BackendTask>(`/api/tasks/${id}`);
      const backendTask = response.data;
      console.log('✅ Successfully fetched task:', backendTask.title);
      return transformBackendTask(backendTask);
    } catch (error) {
      console.error('❌ Failed to fetch task:', error);
      throw error;
    }
  },

  // Create task
  createTask: async (data: CreateTaskDTO): Promise<Task> => {
    try {
      console.log('🔄 TaskService: Creating new task:', data.title);
      
      // Get current user ID from cookies for creatorId
      const userInfo = CookieAuth.getUserInfo();
      const tokenPayload = CookieAuth.getTokenPayload();
      
      // Generate start_date from calendar click
      let startDate: string;
      let deadline = data.deadline || null;
      
      if (data.dueDateISO) {
        startDate = formatDateString(data.dueDateISO);
      } else if (data.startDate) {
        startDate = data.startDate;
      } else {
        startDate = new Date().toISOString().split('T')[0];
      }
      console.log('Task status:', data.status);

      const backendData = {
        title: data.title,
        description: data.description || '',
        status: data.status || 'TODO',
        priority: toBackendPriority(data.priority || 'MEDIUM'),
        deadline: deadline,
        startDate: startDate,
        groupId: data.groupId || null,
        projectId: data.projectId || null,
        creatorId: data.creatorId || tokenPayload?.userId || parseInt(userInfo.id || '1'),
        assignedToIds: data.assignedToIds || [],
      };

      console.log('📤 TaskService: Sending to backend:', JSON.stringify(backendData, null, 2));
      
      const response = await api.post<BackendTask>('/api/tasks', backendData);
      console.log('✅ TaskService: Backend response:', response.data);
      
      const transformedTask = transformBackendTask(response.data);
      console.log('🔄 TaskService: Transformed task for frontend:', transformedTask);
      
      return transformedTask;
    } catch (error: unknown) {
      console.error('❌ Failed to create task:', error);
      throw error;
    }
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskDTO): Promise<Task> => {
    try {
      const backendData: Record<string, unknown> = {};
      
      if (data.title !== undefined) backendData.title = data.title;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.status !== undefined) backendData.status = toBackendStatus(data.status);
      if (data.priority !== undefined) backendData.priority = toBackendPriority(data.priority);
      
      // Handle date fields for different scenarios
      if (data.startDate !== undefined && data.deadline !== undefined) {
        backendData.startDate = data.startDate;
        backendData.deadline = data.deadline;
      } else if (data.deadline !== undefined) {
        backendData.deadline = data.deadline;
        backendData.startDate = data.deadline;
      } else if (data.startDate !== undefined) {
        backendData.startDate = data.startDate;
      } else if (data.dueDate !== undefined) {
        backendData.deadline = data.dueDate;
        backendData.startDate = data.dueDate;
      }

      const response = await api.put<BackendTask>(`/api/tasks/${id}`, backendData);
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
      await api.delete(`/api/tasks/${id}`);
      console.log('✅ Successfully deleted task:', id);
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      throw error;
    }
  },

  // Update task status
  updateTaskStatus: async (id: string, status: string): Promise<Task> => {
    try {
      console.log('🔄 Updating task status:', id, 'to', status);
      const response = await api.put<BackendTask>(`/api/tasks/${id}`, {
        status: toBackendStatus(status)
      });
      return transformBackendTask(response.data);
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
      throw error;
    }
  },

  // Get Tasks (General) with filters and pagination
  getTasks: async (params?: {
    filter?: any;
    sort?: any;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Task[];
    total: number;
    page: number;
    limit: number;
  }> => {
    try {
      const {
        filter,
        sort,
        page = 0,
        limit = 20
      } = params || {};

      console.log('🔄 Fetching tasks with params:', params);
      
      const response = await api.get<PaginatedResponse<BackendTask>>('/api/tasks/my-tasks', {
        params: { 
          page, 
          size: limit, 
          sortBy: sort?.field || 'updatedAt', 
          sortDir: sort?.direction || 'desc',
          ...filter 
        }
      });

      const { content, totalElements, totalPages, number, size: pageSize } = response.data;
      const tasks = content.map(transformBackendTask);

      console.log(`✅ Successfully fetched ${tasks.length} tasks (page ${number + 1}/${totalPages})`);

      return {
        data: tasks,
        total: totalElements,
        page: number + 1,
        limit: pageSize,
      };
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error);
      throw error;
    }
  },

  // Get Tasks by Project
  getTasksByProject: async (projectId: string, params?: any): Promise<Task[]> => {
    try {
      console.log('🔄 Fetching tasks for project:', projectId);
      const response = await api.get<BackendTask[]>(`/api/projects/${projectId}/tasks`, {
        params
      });
      const tasks = response.data.map(transformBackendTask);
      console.log(`✅ Successfully fetched ${tasks.length} tasks for project ${projectId}`);
      return tasks;
    } catch (error) {
      console.error('❌ Failed to fetch project tasks:', error);
      throw error;
    }
  },

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
      
      const response = await api.get<PaginatedResponse<MyTasksFullItem>>('/api/tasks/my-tasks', {
        params: { page, size, sortBy, sortDir }
      });
      console.log('✅ Successfully fetched my tasks (full data) with pagination:', response.data);

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
      const response = await api.get<PaginatedResponse<MyTasksSummaryItem>>('/api/tasks/my-tasks/summary', {
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
      const status = error?.status;
      console.error(`❌ My Tasks Summary API failed with status ${status}:`, (error as { message?: string })?.message);
      
      if (status === 404) {
        console.warn('🚧 Backend endpoint /api/tasks/my-tasks/summary not implemented yet');
      } else if (status === 500) {
        console.warn('💥 Backend server error on /api/tasks/my-tasks/summary');
      }
      
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
      const response = await api.get<MyTasksStats>('/api/tasks/my-tasks/stats');
      
      console.log('✅ Successfully fetched my tasks stats:', response.data);
      return response.data;
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      console.error(`❌ My Tasks Stats API failed with status ${status}:`, (error as { message?: string })?.message);
      
      if (status === 404) {
        console.warn('🚧 Backend endpoint /api/tasks/my-tasks/stats not implemented yet');
      } else if (status === 500) {
        console.warn('💥 Backend server error on /api/tasks/my-tasks/stats');
      }
      
      const userInfo = CookieAuth.getUserInfo();
      return {
        totalParticipatingTasks: 0,
        userEmail: userInfo.email || 'unknown@example.com',
        userId: parseInt(userInfo.id || '1')
      };
    }
  },

  // Get Task Statistics (general)
  getTaskStats: async (filter?: any): Promise<any> => {
    try {
      console.log('🔄 Fetching task statistics with filter:', filter);
      const response = await api.get('/api/tasks/my-tasks/stats', {
        params: filter
      });
      console.log('✅ Successfully fetched task stats:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch task stats:', error);
      // Return default stats on error
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        overdue: 0
      };
    }
  },

  // Assign task to user
  assignTask: async (id: string, userId: string): Promise<Task> => {
    try {
      console.log('🔄 Assigning task:', id, 'to user:', userId);
      const response = await api.patch<BackendTask>(`/api/tasks/${id}`, {
        assignedToIds: [userId]
      });
      return transformBackendTask(response.data);
    } catch (error) {
      console.error('❌ Failed to assign task:', error);
      throw error;
    }
  },

  // Unassign task from user
  unassignTask: async (id: string): Promise<Task> => {
    try {
      console.log('🔄 Unassigning task:', id);
      const response = await api.patch<BackendTask>(`/api/tasks/${id}`, {
        assignedToIds: []
      });
      return transformBackendTask(response.data);
    } catch (error) {
      console.error('❌ Failed to unassign task:', error);
      throw error;
    }
  },

  // Bulk update tasks
  bulkUpdateTasks: async (updates: Array<{ id: string; data: Partial<UpdateTaskDTO> }>): Promise<Task[]> => {
    try {
      console.log('🔄 Bulk updating tasks:', updates.length, 'tasks');
      const promises = updates.map(({ id, data }) => tasksService.updateTask(id, data));
      const results = await Promise.all(promises);
      console.log('✅ Successfully bulk updated tasks');
      return results;
    } catch (error) {
      console.error('❌ Failed to bulk update tasks:', error);
      throw error;
    }
  },

  // Test authentication
  testAuth: async (): Promise<boolean> => {
    try {
      console.log('🧪 Testing authentication...');
      const response = await api.get('/api/tasks');
      console.log('✅ Authentication test successful');
      return true;
    } catch (error) {
      console.error('❌ Authentication test failed');
      return false;
    }
  }
};