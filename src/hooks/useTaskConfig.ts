// Dynamic Task Configuration Hook - Fetch from Backend
import useSWR from 'swr';
import { api } from '@/services/api';

// Backend response interfaces
export interface BackendTaskColor {
  status: string;
  backgroundColor: string;
  borderColor: string;
  textColor?: string;
  group: 'todo' | 'in_progress' | 'completed' | 'other';
}

export interface BackendTaskStatus {
  code: string;
  label: string;
  group: 'todo' | 'in_progress' | 'completed' | 'other';
  order: number;
  isDefault?: boolean;
}

export interface TaskConfigResponse {
  colors: BackendTaskColor[];
  statuses: BackendTaskStatus[];
  priorities: {
    code: string;
    label: string;
    color: string;
    order: number;
  }[];
}

// API service functions
const taskConfigService = {
  getTaskConfig: (): Promise<TaskConfigResponse> => api.get('/api/tasks/config'),
};

// Fallback configurations (if backend fails)
const FALLBACK_COLORS: BackendTaskColor[] = [
  {
    status: 'pending',
    backgroundColor: '#6b7280',
    borderColor: '#4b5563',
    textColor: '#ffffff',
    group: 'todo'
  },
  {
    status: 'in-progress',
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff',
    group: 'in_progress'
  },
  {
    status: 'testing',
    backgroundColor: '#3b82f6',
    borderColor: '#1d4ed8',
    textColor: '#ffffff',
    group: 'in_progress'
  },
  {
    status: 'review',
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
    textColor: '#ffffff',
    group: 'in_progress'
  },
  {
    status: 'blocked',
    backgroundColor: '#dc2626',
    borderColor: '#991b1b',
    textColor: '#ffffff',
    group: 'other'
  },
  {
    status: 'completed',
    backgroundColor: '#10b981',
    borderColor: '#059669',
    textColor: '#ffffff',
    group: 'completed'
  }
];

const FALLBACK_STATUSES: BackendTaskStatus[] = [
  { code: 'TODO', label: 'To Do', group: 'todo', order: 1, isDefault: true },
  { code: 'IN_PROGRESS', label: 'In Progress', group: 'in_progress', order: 2 },
  { code: 'TESTING', label: 'Testing', group: 'in_progress', order: 3 },
  { code: 'REVIEW', label: 'In Review', group: 'in_progress', order: 4 },
  { code: 'BLOCKED', label: 'Blocked', group: 'other', order: 5 },
  { code: 'DONE', label: 'Completed', group: 'completed', order: 6 }
];

const FALLBACK_PRIORITIES = [
  { code: 'low', label: 'Low', color: '#3b82f6', order: 1 },
  { code: 'medium', label: 'Medium', color: '#f59e0b', order: 2 },
  { code: 'high', label: 'High', color: '#ef4444', order: 3 }
];

/**
 * Hook to get dynamic task configuration from backend
 */
export const useTaskConfig = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'task-config',
    taskConfigService.getTaskConfig,
    {
      fallbackData: {
        colors: FALLBACK_COLORS,
        statuses: FALLBACK_STATUSES,
        priorities: FALLBACK_PRIORITIES
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes cache
    }
  );

  // Use fallback if API fails
  const config = error ? {
    colors: FALLBACK_COLORS,
    statuses: FALLBACK_STATUSES,
    priorities: FALLBACK_PRIORITIES
  } : data;

  // Helper functions
  const getColorByStatus = (status: string) => {
    return config?.colors.find(c => c.status === status.toLowerCase()) || FALLBACK_COLORS[0];
  };

  const getStatusByCode = (code: string) => {
    return config?.statuses.find(s => s.code === code.toUpperCase()) || FALLBACK_STATUSES[0];
  };

  const getPriorityByCode = (code: string) => {
    return config?.priorities.find(p => p.code === code.toLowerCase()) || FALLBACK_PRIORITIES[1];
  };

  // Status mapping functions
  const backendToFrontendStatus = (backendStatus: string): string => {
    const statusConfig = getStatusByCode(backendStatus);
    return statusConfig.code.toLowerCase().replace('_', '-');
  };

  const frontendToBackendStatus = (frontendStatus: string): string => {
    const normalizedStatus = frontendStatus.replace('-', '_').toUpperCase();
    const statusConfig = config?.statuses.find(s => 
      s.code === normalizedStatus || 
      s.label.toLowerCase().replace(' ', '-') === frontendStatus
    );
    return statusConfig?.code || 'TODO';
  };

  // Group tasks by status
  const getTaskCountsByGroup = <T extends { status: string }>(tasks: T[]) => {
    const groups = {
      todo: 0,
      in_progress: 0,
      completed: 0,
      other: 0,
      total: tasks.length
    };

    tasks.forEach(task => {
      const statusConfig = getStatusByCode(frontendToBackendStatus(task.status));
      groups[statusConfig.group]++;
    });

    return groups;
  };

  const isCompletedStatus = (status: string): boolean => {
    const statusConfig = getStatusByCode(frontendToBackendStatus(status));
    return statusConfig.group === 'completed';
  };

  return {
    // Data
    config,
    colors: config?.colors || FALLBACK_COLORS,
    statuses: config?.statuses || FALLBACK_STATUSES,
    priorities: config?.priorities || FALLBACK_PRIORITIES,
    
    // State
    isLoading,
    error,
    
    // Helper functions
    getColorByStatus,
    getStatusByCode,
    getPriorityByCode,
    backendToFrontendStatus,
    frontendToBackendStatus,
    getTaskCountsByGroup,
    isCompletedStatus,
    
    // Actions
    refreshConfig: mutate,
  };
};