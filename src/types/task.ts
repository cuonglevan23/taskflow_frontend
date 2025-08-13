// Task Domain Types - Clean Type Definitions

// Backend Task interface (matches Spring Boot exactly)
export interface BackendTask {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'TESTING' | 'BLOCKED' | 'REVIEW';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string; // LocalDate format: YYYY-MM-DD (optional)
  start_date?: string; // LocalDate format: YYYY-MM-DD (backend uses snake_case)
  startDate?: string; // LocalDate format: YYYY-MM-DD (legacy camelCase support)
  createdAt: string; // Only for creation timestamp
  updatedAt: string;
  groupId?: number;
  projectId?: number;
  creatorId: number;
  assignedToIds?: number[];
  checklists?: ChecklistItem[];
}

// New My Tasks Response interfaces
export interface MyTasksSummaryItem {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'TESTING' | 'BLOCKED' | 'REVIEW';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string; // Optional
  startDate: string; // REQUIRED for calendar display - camelCase to match backend
  creatorName: string;
  projectName?: string;
  teamName?: string;
  checklistCount: number;
  assigneeCount: number;
  participationType: 'ASSIGNEE' | 'TEAM_MEMBER' | 'PROJECT_MEMBER';
  isOverdue: boolean;
  completionPercentage: number;
}

export interface MyTasksFullItem {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'TESTING' | 'BLOCKED' | 'REVIEW';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  projectId?: number;
  teamId?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface MyTasksStats {
  totalParticipatingTasks: number;
  userEmail: string;
  userId: number;
}

// Frontend Task interface (transformed for UI)
export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  dueDateISO?: Date;
  completed: boolean;
  priority: string;
  status: string;
  hasTag?: boolean;
  tagText?: string;
  projectId?: number;
  assigneeId?: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Multi-day task support for calendar rendering
  startDate?: Date;
  endDate?: Date;
  
  // Additional fields from My Tasks Summary API
  creatorName?: string;
  participationType?: 'ASSIGNEE' | 'TEAM_MEMBER' | 'PROJECT_MEMBER';
  isOverdue?: boolean;
  completionPercentage?: number;
  assigneeCount?: number;
  checklistCount?: number;
}

// Data Transfer Objects (DTOs)
export interface CreateTaskDTO {
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string; // Optional
  startDate: string; // REQUIRED - Primary field for calendar (camelCase for backend)
  groupId?: number;
  projectId?: number;
  creatorId: number;
  assignedToIds?: number[];
  tags?: string[];
  dueDate?: string;
  dueDateISO?: Date;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  deadline?: string; // LocalDate format: YYYY-MM-DD
  startDate?: string; // LocalDate format: YYYY-MM-DD - for calendar operations
  dueDate?: string; // LocalDate format: YYYY-MM-DD - legacy support
  tags?: string[];
  assigneeId?: number;
  projectId?: number;
  groupId?: number;
  assignedToIds?: number[];
}

// API Response interfaces
export interface TasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface TaskStatsResponse {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  testing: number;
  blocked: number;
  review: number;
  high: number;
  medium: number;
  low: number;
  overdue: number;
}

// Filter and Sort interfaces
export interface TaskFilter {
  status?: string[];
  priority?: string[];
  assignee?: string;
  projectId?: number;
  teamId?: number;
  search?: string;
  tags?: string[];
  dueDate?: {
    start?: string;
    end?: string;
  };
}

export interface TaskSort {
  field: string;
  direction: 'asc' | 'desc';
}

// Pagination interface
export interface TaskPagination {
  page?: number;
  limit?: number;
  offset?: number;
}

// Task query parameters (combines filter, sort, pagination)
export interface TaskQueryParams extends TaskPagination {
  filter?: TaskFilter;
  sort?: TaskSort;
}

// Bulk operations
export interface BulkTaskUpdate {
  id: string;
  data: Partial<UpdateTaskDTO>;
}

export interface BulkTaskResponse {
  updated: Task[];
  failed: Array<{
    id: string;
    error: string;
  }>;
}

// Task assignment
export interface TaskAssignment {
  taskId: string;
  userId: string;
  assignedAt: Date;
  assignedBy: string;
}

// Task status transitions
export type TaskStatusTransition = {
  from: BackendTask['status'];
  to: BackendTask['status'];
  allowedRoles?: string[];
  requiresApproval?: boolean;
};

// Task priority levels with display info
export interface TaskPriorityInfo {
  value: BackendTask['priority'];
  label: string;
  color: string;
  weight: number;
}

// Task status info with display properties
export interface TaskStatusInfo {
  value: BackendTask['status'];
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon?: string;
}

// Task validation rules
export interface TaskValidationRules {
  title: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  description: {
    maxLength: number;
    required: boolean;
  };
  deadline: {
    minDate?: Date;
    maxDate?: Date;
    required: boolean;
  };
  assignee: {
    required: boolean;
    allowMultiple: boolean;
  };
}

// Task permissions
export interface TaskPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canChangeStatus: boolean;
  canComment: boolean;
}

// Task activity/history
export interface TaskActivity {
  id: string;
  taskId: number;
  userId: string;
  userName: string;
  action: 'created' | 'updated' | 'assigned' | 'unassigned' | 'commented' | 'status_changed';
  description: string;
  oldValue?: unknown;
  newValue?: unknown;
  createdAt: Date;
}

// Export utility type for task transformation
export type TaskTransformer = (backendTask: BackendTask) => Task;

// Export constants for task-related enums
export const TASK_STATUSES: BackendTask['status'][] = [
  'TODO',
  'IN_PROGRESS', 
  'DONE',
  'TESTING',
  'BLOCKED',
  'REVIEW'
];

export const TASK_PRIORITIES: BackendTask['priority'][] = [
  'LOW',
  'MEDIUM',
  'HIGH'
];

// Task status display configuration
export const TASK_STATUS_CONFIG: Record<BackendTask['status'], TaskStatusInfo> = {
  'TODO': {
    value: 'TODO',
    label: 'To Do',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    textColor: '#374151',
    icon: '📋'
  },
  'IN_PROGRESS': {
    value: 'IN_PROGRESS',
    label: 'In Progress',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    textColor: '#1E40AF',
    icon: '🔄'
  },
  'DONE': {
    value: 'DONE',
    label: 'Done',
    color: '#10B981',
    bgColor: '#D1FAE5',
    textColor: '#065F46',
    icon: '✅'
  },
  'TESTING': {
    value: 'TESTING',
    label: 'Testing',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: '#92400E',
    icon: '🧪'
  },
  'BLOCKED': {
    value: 'BLOCKED',
    label: 'Blocked',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    textColor: '#991B1B',
    icon: '🚫'
  },
  'REVIEW': {
    value: 'REVIEW',
    label: 'Review',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    textColor: '#5B21B6',
    icon: '👀'
  }
};

// Task priority display configuration
export const TASK_PRIORITY_CONFIG: Record<BackendTask['priority'], TaskPriorityInfo> = {
  'LOW': {
    value: 'LOW',
    label: 'Low',
    color: '#6B7280',
    weight: 1
  },
  'MEDIUM': {
    value: 'MEDIUM', 
    label: 'Medium',
    color: '#F59E0B',
    weight: 2
  },
  'HIGH': {
    value: 'HIGH',
    label: 'High', 
    color: '#EF4444',
    weight: 3
  }
};