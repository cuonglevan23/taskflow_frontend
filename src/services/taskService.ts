// Task Service - Task-related API operations with SWR integration
import { api } from './api';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '@/types';

// Mock data for development
const MOCK_TASKS: Task[] = [
  {
    id: 1,
    title: "Complete project proposal",
    description: "Finalize Q1 project proposal document",
    dueDate: "Today",
    dueDateISO: new Date(),
    completed: false,
    priority: 'High',
    status: 'pending',
    hasTag: false,
    projectId: 1,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 2,
    title: "Review design mockups",
    description: "Review and provide feedback on new design mockups",
    dueDate: "Today",
    dueDateISO: new Date(),
    completed: false,
    priority: 'medium',
    status: 'pending',
    hasTag: false,
    projectId: 1,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 3,
    title: "Update project documentation",
    description: "Update technical documentation for the project",
    dueDate: "Tomorrow",
    dueDateISO: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false,
    priority: 'low',
    status: 'pending',
    hasTag: false,
    projectId: 2,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 4,
    title: "Prepare presentation slides",
    description: "Create slides for client presentation",
    dueDate: "Thursday",
    dueDateISO: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    completed: false,
    priority: 'high',
    status: 'pending',
    hasTag: false,
    projectId: 3,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  }
];

// Development mode check - always use mock data in development unless explicitly disabled
const isDevelopment = process.env.NODE_ENV === 'development';
const useMockData = isDevelopment; // Always use mock data in development

// Task Filter and Sort types
export interface TaskFilter {
  status?: string[];
  priority?: string[];
  assigneeId?: string;
  projectId?: string;
  dueDate?: {
    from?: string;
    to?: string;
  };
  search?: string;
}

export interface TaskSort {
  field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  direction: 'asc' | 'desc';
}

export interface TasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

// Service layer - Pure API calls (no caching logic)
export const taskService = {
  // Get all tasks with filters and pagination
  getTasks: async (params?: {
    filter?: TaskFilter;
    sort?: TaskSort;
    page?: number;
    limit?: number;
  }): Promise<TasksResponse> => {
    // Use mock data in development when no backend is available
    if (useMockData) {
      console.log('🔧 Using mock data for getTasks');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredTasks = [...MOCK_TASKS];
      
      // Apply filters
      if (params?.filter) {
        if (params.filter.status?.length) {
          filteredTasks = filteredTasks.filter(task => 
            params.filter.status!.includes(task.status)
          );
        }
        if (params.filter.priority?.length) {
          filteredTasks = filteredTasks.filter(task => 
            params.filter.priority!.includes(task.priority)
          );
        }
        if (params.filter.search) {
          const search = params.filter.search.toLowerCase();
          filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(search) ||
            task.description?.toLowerCase().includes(search)
          );
        }
      }
      
      // Apply sorting
      if (params?.sort) {
        filteredTasks.sort((a, b) => {
          const field = params.sort!.field;
          const direction = params.sort!.direction === 'asc' ? 1 : -1;
          
          if (field === 'createdAt' || field === 'updatedAt') {
            return (new Date(a[field]).getTime() - new Date(b[field]).getTime()) * direction;
          }
          if (field === 'title') {
            return a.title.localeCompare(b.title) * direction;
          }
          return 0;
        });
      }
      
      return {
        data: filteredTasks,
        total: filteredTasks.length,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    }
    
    // Real API call
    const searchParams = new URLSearchParams();
    
    if (params?.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue) searchParams.append(`${key}.${subKey}`, subValue);
            });
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    if (params?.sort) {
      searchParams.append('sortBy', params.sort.field);
      searchParams.append('sortOrder', params.sort.direction);
    }
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await api.get<TasksResponse>(`/tasks?${searchParams.toString()}`);
    return response.data;
  },

  // Get task by ID
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (data: CreateTaskDTO): Promise<Task> => {
    // Use mock data in development when no backend is available
    if (useMockData) {
      console.log('🔧 Using mock data for createTask', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTask: Task = {
        id: Math.max(...MOCK_TASKS.map(t => t.id), 0) + 1,
        title: data.title,
        description: data.description || '',
        dueDate: data.dueDate || 'Today',
        dueDateISO: data.dueDateISO || new Date(),
        completed: false,
        priority: data.priority || 'medium',
        status: data.status || 'pending',
        hasTag: false,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        tags: data.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      MOCK_TASKS.push(newTask);
      return newTask;
    }
    
    // Real API call
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskDTO): Promise<Task> => {
    // Use mock data in development when no backend is available
    if (useMockData) {
      console.log('🔧 Using mock data for updateTask', { id, data });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const taskIndex = MOCK_TASKS.findIndex(task => task.id.toString() === id);
      if (taskIndex === -1) {
        throw new Error(`Task with id ${id} not found`);
      }
      
      const updatedTask = {
        ...MOCK_TASKS[taskIndex],
        ...data,
        updatedAt: new Date(),
      };
      
      MOCK_TASKS[taskIndex] = updatedTask;
      return updatedTask;
    }
    
    // Real API call
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    // Use mock data in development when no backend is available
    if (useMockData) {
      console.log('🔧 Using mock data for deleteTask', { id });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const taskIndex = MOCK_TASKS.findIndex(task => task.id.toString() === id);
      if (taskIndex === -1) {
        throw new Error(`Task with id ${id} not found`);
      }
      
      MOCK_TASKS.splice(taskIndex, 1);
      return;
    }
    
    // Real API call
    await api.delete(`/tasks/${id}`);
  },

  // Get tasks by project
  getTasksByProject: async (projectId: string, params?: {
    filter?: Omit<TaskFilter, 'projectId'>;
    sort?: TaskSort;
  }): Promise<Task[]> => {
    const searchParams = new URLSearchParams();
    
    if (params?.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    if (params?.sort) {
      searchParams.append('sortBy', params.sort.field);
      searchParams.append('sortOrder', params.sort.direction);
    }
    
    const response = await api.get<Task[]>(`/projects/${projectId}/tasks?${searchParams.toString()}`);
    return response.data;
  },

  // Update task status
  updateTaskStatus: async (id: string, status: string): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Assign task to user
  assignTask: async (id: string, userId: string): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/assign`, { userId });
    return response.data;
  },

  // Unassign task
  unassignTask: async (id: string): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/unassign`, {});
    return response.data;
  },

  // Bulk update tasks
  bulkUpdateTasks: async (updates: Array<{ id: string; data: Partial<UpdateTaskDTO> }>): Promise<Task[]> => {
    const response = await api.patch<Task[]>('/tasks/bulk', { updates });
    return response.data;
  },

  // Get task statistics
  getTaskStats: async (filter?: TaskFilter): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    overdue: number;
    dueToday: number;
  }> => {
    // Use mock data in development when no backend is available
    if (useMockData) {
      console.log('🔧 Using mock data for getTaskStats');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let tasks = [...MOCK_TASKS];
      
      // Apply filter if provided
      if (filter?.status?.length) {
        tasks = tasks.filter(task => filter.status!.includes(task.status));
      }
      
      const today = new Date().toDateString();
      
      const stats = {
        total: tasks.length,
        byStatus: tasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byPriority: tasks.reduce((acc, task) => {
          acc[task.priority] = (acc[task.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        overdue: tasks.filter(task => 
          task.dueDateISO && task.dueDateISO < new Date() && !task.completed
        ).length,
        dueToday: tasks.filter(task => 
          task.dueDateISO?.toDateString() === today
        ).length,
      };
      
      return stats;
    }
    
    // Real API call
    const searchParams = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await api.get(`/tasks/stats?${searchParams.toString()}`);
    return response.data;
  },
};