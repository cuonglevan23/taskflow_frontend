// Task Types - Based on TASK_API_FRONTEND_INTEGRATION.md

// ===== Enums =====
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS", 
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH", 
  CRITICAL = "CRITICAL"
}

export enum ParticipationType {
  CREATOR = "CREATOR",
  ASSIGNEE = "ASSIGNEE",
  PROJECT_MEMBER = "PROJECT_MEMBER",
  TEAM_MEMBER = "TEAM_MEMBER",
  OTHER = "OTHER"
}

// ===== API Request Types =====
export interface CreateTaskRequestDto {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string; // YYYY-MM-DD format
  deadline: string; // YYYY-MM-DD format
  creatorId: number;
  projectId?: number; // Optional - for project tasks
  groupId?: number;   // Optional - for team tasks (team ID)
  assignedToIds: number[]; // Array of user IDs
}

export interface UpdateTaskRequestDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  deadline?: string;
  groupId?: number; // Can change team assignment
}

// ===== API Response Types =====
export interface TaskResponseDto {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  deadline: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  creatorId: number;
  projectId: number | null;
  groupId: number | null; // Team ID
  checklists: TaskChecklistResponseDto[] | null;
}

export interface TaskChecklistResponseDto {
  id: number;
  item: string;
  isCompleted: boolean;
  createdAt: string;
  taskId: number;
}

export interface MyTaskSummaryDto {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  creatorName: string;
  projectId: number | null;
  projectName: string | null;
  teamId: number | null;
  teamName: string | null;
  checklistCount: number;
  assigneeCount: number;
  participationType: ParticipationType;
}

export interface TaskParticipationStats {
  totalParticipatingTasks: number; // Total tasks user participates in
  userEmail: string;
  userId: number;
}

// ===== Pagination =====
export interface Page<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      ascending: boolean;
    };
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ===== Frontend Types =====
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date;
  deadline: Date;
  startDateString: string;
  deadlineString: string;
  createdAt: Date;
  updatedAt: Date;
  creatorId: number;
  projectId: number | null;
  groupId: number | null;
  checklists: TaskChecklist[];
  
  // Computed fields
  isOverdue: boolean;
  daysRemaining: number;
  statusColor: string;
  priorityColor: string;
}

export interface TaskChecklist {
  id: number;
  item: string;
  isCompleted: boolean;
  createdAt: Date;
  taskId: number;
}

export interface TaskSummary {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  creatorName: string;
  projectId: number | null;
  projectName: string | null;
  teamId: number | null;
  teamName: string | null;
  checklistCount: number;
  assigneeCount: number;
  participationType: ParticipationType;
  
  // UI helpers
  isOverdue: boolean;
  daysRemaining: number;
  statusColor: string;
  priorityColor: string;
}

// ===== Form Data Types =====
export interface CreateTaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline: string;
  taskType: 'personal' | 'team' | 'project' | 'project-team';
  projectId?: number;
  teamId?: number;
  assigneeIds: number[];
}

export interface UpdateTaskFormData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string;
  teamId?: number;
}

// ===== Task Creation Helpers =====
export interface CreatePersonalTaskData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  deadline: string;
  currentUserId: number;
}

export interface CreateTeamTaskData {
  title: string;
  description?: string;
  teamId: number;
  assigneeIds: number[];
  priority?: TaskPriority;
  deadline: string;
  currentUserId: number;
}

export interface CreateProjectTaskData {
  title: string;
  description?: string;
  projectId: number;
  assigneeIds: number[];
  priority?: TaskPriority;
  deadline: string;
  currentUserId: number;
}

export interface CreateProjectTeamTaskData {
  title: string;
  description?: string;
  projectId: number;
  teamId: number;
  assigneeIds: number[];
  priority?: TaskPriority;
  deadline: string;
  currentUserId: number;
}

// ===== Query & Filter Types =====
export interface TaskQueryParams extends PaginationParams {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: number;
  teamId?: number;
  assigneeId?: number;
  creatorId?: number;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: number;
  teamId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

// ===== Constants =====
export const TASK_STATUSES = Object.values(TaskStatus);
export const TASK_PRIORITIES = Object.values(TaskPriority);
export const PARTICIPATION_TYPES = Object.values(ParticipationType);

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: '#6B7280',
  [TaskStatus.IN_PROGRESS]: '#F59E0B',
  [TaskStatus.COMPLETED]: '#10B981',
  [TaskStatus.CANCELLED]: '#EF4444'
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: '#10B981',
  [TaskPriority.MEDIUM]: '#F59E0B',
  [TaskPriority.HIGH]: '#EF4444',
  [TaskPriority.CRITICAL]: '#DC2626'
};

// ===== API Response Wrappers =====
export interface TasksApiResponse {
  tasks: Task[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface TaskSummariesApiResponse {
  taskSummaries: TaskSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ===== Validation =====
export interface TaskValidationError {
  field: string;
  message: string;
}

export interface TaskFormErrors {
  titleError?: string;
  descriptionError?: string;
  priorityError?: string;
  deadlineError?: string;
  assigneeError?: string;
  projectError?: string;
  teamError?: string;
  generalError?: string;
}