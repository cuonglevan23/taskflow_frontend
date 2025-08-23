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
  // Debug log to see backend data
  console.log('🔍 Backend Task Data:', {
    id: backendTask.id,
    title: backendTask.title,
    assignedToEmails: backendTask.assignedToEmails,
    assignedToIds: backendTask.assignedToIds
  });

  // Use startDate as primary field (REQUIRED)
  let dueDateString = 'No date';
  let dueDateISO = new Date();
  
  // Priority: startDate > deadline > fallback
  const dateSource = backendTask.startDate || backendTask.deadline;
  if (dateSource) {
    dueDateISO = safeParseDate(dateSource);
    dueDateString = formatDateString(dateSource);
  }

  // Transform assignees from backend emails 
  const assignees: Task['assignees'] = [];
  
  // Use assignedToEmails to create assignee objects
  if (backendTask.assignedToEmails && Array.isArray(backendTask.assignedToEmails) && backendTask.assignedToEmails.length > 0) {
    assignees.push(...backendTask.assignedToEmails.map(email => ({
      id: email, // Use email as ID
      name: email.split('@')[0], // Use email prefix as name
      email: email,
      avatar: undefined
    })));
  }

  console.log('✅ Transformed assignees:', assignees);
  
  // Add assignedEmails field for backward compatibility
  const assignedEmails = backendTask.assignedToEmails || [];

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
    assignees: assignees.length > 0 ? assignees : undefined,
    assignedEmails: assignedEmails.length > 0 ? assignedEmails : undefined,
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
  // Debug method for authentication checking
  debugAuth: (): void => {
    CookieAuth.debugAuth();
  },

  // Get task by ID
  getTask: async (id: string): Promise<Task> => {
    try {

      const response = await api.get<BackendTask>(`/api/tasks/my-tasks/${id}`);
      const backendTask = response.data;

      return transformBackendTask(backendTask);
    } catch (error) {
      console.error('❌ Failed to fetch task:', error);
      throw error;
    }
  },

  // Create task (My Tasks)
  createTask: async (data: CreateTaskDTO): Promise<Task> => {
    try {
      // Check authentication first
      const token = CookieAuth.getAccessToken();
      if (!token) {
        console.error('❌ No access token found in cookies');
        throw new Error('Authentication required: No access token found');
      }
      console.log('✅ Access token found:', token.substring(0, 20) + '...');
      
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
      
      const response = await api.post<BackendTask>('/api/tasks/my-tasks', backendData);
      const transformedTask = transformBackendTask(response.data);
      return transformedTask;
    } catch (error: unknown) {
      console.error('❌ Failed to create task:', error);
      throw error;
    }
  },

    // Update task (My Tasks)
  updateTask: async (id: string, data: UpdateTaskDTO): Promise<Task> => {
    try {
      // Check authentication first
      const token = CookieAuth.getAccessToken();
      if (!token) {
        console.error('❌ No access token found in cookies');
        throw new Error('Authentication required: No access token found');
      }
      console.log('✅ Access token found for update:', token.substring(0, 20) + '...');
      
      const backendData: Record<string, unknown> = {};
      
      if (data.title !== undefined) backendData.title = data.title;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.status !== undefined) backendData.status = toBackendStatus(data.status);
      if (data.priority !== undefined) backendData.priority = toBackendPriority(data.priority);
      
      // Handle assignee emails - Support 3 modes from docs
      if (data.assignedToEmails !== undefined) {
        backendData.assignedToEmails = data.assignedToEmails; // Replace all
      }
      if (data.addAssigneeEmails !== undefined) {
        backendData.addAssigneeEmails = data.addAssigneeEmails; // Add new
      }
      if (data.removeAssigneeEmails !== undefined) {
        backendData.removeAssigneeEmails = data.removeAssigneeEmails; // Remove specific
      }
      
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

      console.log('🔍 Updating task:', id, 'with data:', backendData);

      const response = await api.put<BackendTask>(`/api/tasks/my-tasks/${id}`, backendData);
      return transformBackendTask(response.data);
    } catch (error) {
      console.error('❌ Failed to update task:', error);
      throw error;
    }
  },

  // Delete task (My Tasks)
  deleteTask: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/tasks/my-tasks/${id}`);
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      throw error;
    }
  },

  // Update task status (My Tasks)
  updateTaskStatus: async (id: string, status: string): Promise<Task> => {
    try {
      const response = await api.put<BackendTask>(`/api/tasks/my-tasks/${id}`, {
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

      const response = await api.get<BackendTask[]>(`/api/projects/${projectId}/tasks`, {
        params
      });
      const tasks = response.data.map(transformBackendTask);

      return tasks;
    } catch (error) {
      console.error('❌ Failed to fetch project tasks:', error);
      throw error;
    }
  },

  // Get My Tasks (Full Data) with pagination - Uses /api/tasks/my-tasks endpoint
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

      console.log('🔍 Fetching my tasks from /api/tasks/my-tasks:', { page, size, sortBy, sortDir });
      
      const response = await api.get<PaginatedResponse<BackendTask>>('/api/tasks/my-tasks', {
        params: { page, size, sortBy, sortDir }
      });

      console.log('✅ My tasks response:', response.data);

      const { content, totalElements, totalPages, number, size: pageSize } = response.data;
      const tasks = content.map(transformBackendTask);

      console.log('✅ Transformed tasks:', tasks.length);

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

  // Get My Tasks Summary (Lightweight) with pagination - Updated to use main endpoint
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
      size = 10,
      sortBy = 'createdAt',
      sortDir = 'desc'
    } = params || {};

    try {
      // Use the main my-tasks endpoint as documented
      const response = await api.get<PaginatedResponse<MyTasksSummaryItem>>('/api/tasks/my-tasks', {
        params: { page, size, sortBy, sortDir }
      });

      const { content, totalElements, totalPages, number, size: pageSize } = response.data;
      
      // Safety check for content field
      if (!Array.isArray(content)) {
        console.warn('⚠️ API response missing or invalid content field, using empty array');
        return {
          tasks: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 10,
        };
      }
      
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
      console.error(`❌ My Tasks API failed with status ${status}:`, (error as { message?: string })?.message);
      
      if (status === 404) {
        console.warn('🚧 Backend endpoint /api/tasks not found');
      } else if (status === 500) {
        console.warn('💥 Backend server error on /api/tasks');
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

    
    try {
      const response = await api.get<MyTasksStats>('/api/tasks/my-tasks/stats');
      
  
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

      const response = await api.get('/api/tasks/my-tasks/stats', {
        params: filter
      });

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

  // Assign task to user by email
  assignTask: async (id: string, email: string): Promise<Task> => {
    try {

      const response = await api.put<BackendTask>(`/api/tasks/my-tasks/${id}`, {
        assignedToEmails: [email]
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

      const response = await api.put<BackendTask>(`/api/tasks/my-tasks/${id}`, {
        assignedToEmails: []
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

      const promises = updates.map(({ id, data }) => tasksService.updateTask(id, data));
      const results = await Promise.all(promises);

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
      
      // First check if we have token
      const token = CookieAuth.getAccessToken();
      if (!token) {
        console.error('❌ No access token found');
        return false;
      }
      
      console.log('✅ Token found:', token.substring(0, 20) + '...');
      CookieAuth.debugAuth();
      
      const response = await api.get('/api/tasks/my-tasks');
      console.log('✅ Authentication test successful');
      return true;
    } catch (error) {
      console.error('❌ Authentication test failed:', error);
      return false;
    }
  }
};