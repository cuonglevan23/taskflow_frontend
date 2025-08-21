// ===== Project Types - API & Frontend =====

// ===== Enums =====
export enum ProjectStatus {
  PLANNED = "PLANNED",                 // Initial planning phase
  PLANNING = "PLANNING",               // Active planning
  IN_PROGRESS = "IN_PROGRESS",         // Currently being worked on
  ON_HOLD = "ON_HOLD",                // Temporarily paused
  COMPLETED = "COMPLETED",             // Successfully finished
  CANCELLED = "CANCELLED",             // Cancelled/abandoned
  ARCHIVED = "ARCHIVED"                // Completed and archived
}

export enum ProjectPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM", 
  HIGH = "HIGH",
  URGENT = "URGENT"
}

// ===== API Response Types (from backend) =====
export interface ProjectResponseDto {
  id: number;                          // Primary key, auto-generated
  name: string;                        // Required, max 255 chars
  description?: string | null;         // Optional, max 2000 chars
  status: ProjectStatus;               // Required enum value
  startDate: string;                   // Required, ISO date format (YYYY-MM-DD)
  endDate: string;                     // Required, ISO date format (YYYY-MM-DD)
  ownerId: number;                     // Required FK to User.id
  organizationId?: number | null;      // Optional FK to Organization.id
  teamId?: number | null;              // Optional FK to Team.id
  createdById: number;                 // Required FK to User.id who created
  isPersonal: boolean;                 // Default: false
  createdAt: string;                   // ISO 8601 datetime
  updatedAt: string;                   // ISO 8601 datetime
  priority?: ProjectPriority;          // Optional priority
  budget?: number | null;              // Optional budget
  actualBudget?: number | null;        // Actual spent budget
  emailPm?: string | null;             // Project manager email
  taskCount?: number;                  // Total tasks
  completedTaskCount?: number;         // Completed tasks
  memberCount?: number;                // Team member count
  teamIds?: number[];                  // Associated team IDs
}

// ===== API Request Types (to backend) =====
export interface CreateProjectRequestDto {
  name: string;                        // Required, min 3 chars, max 255
  description?: string;                // Optional, max 2000 chars
  startDate: string;                   // Required, format: YYYY-MM-DD
  endDate: string;                     // Required, format: YYYY-MM-DD, must be after startDate
  status?: ProjectStatus;              // Optional, default: PLANNED
  priority?: ProjectPriority;          // Optional, default: MEDIUM
  ownerId?: number;                    // Optional, default: current user
  organizationId?: number;             // Optional FK to Organization.id
  teamId?: number;                     // Optional FK to Team.id
  isPersonal?: boolean;                // Optional, default: false
  emailPm?: string;                    // Optional project manager email
  budget?: number;                     // Optional budget
  teamIds?: number[];                  // Optional team IDs array
}

export interface UpdateProjectRequestDto {
  name?: string;                       // Optional, min 3 chars, max 255
  description?: string;                // Optional, max 2000 chars
  startDate?: string;                  // Optional, format: YYYY-MM-DD
  endDate?: string;                    // Optional, format: YYYY-MM-DD
  status?: ProjectStatus;              // Optional enum value
  priority?: ProjectPriority;          // Optional priority
  ownerId?: number;                    // Optional FK to User.id
  organizationId?: number;             // Optional FK to Organization.id
  teamId?: number;                     // Optional FK to Team.id
  isPersonal?: boolean;                // Optional boolean
  emailPm?: string;                    // Optional PM email
  budget?: number;                     // Optional budget
}

// ===== Frontend Types =====
export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date;
  endDate: Date;
  startDateString: string;             // Formatted date string
  endDateString: string;               // Formatted date string
  ownerId: number;
  organizationId?: number | null;
  teamIds: number[];
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  duration: number;                    // Days between start and end
  isOverdue: boolean;                  // Is project overdue
  daysRemaining: number;               // Days until end date
  progress: number;                    // Completion percentage
  
  // Additional fields
  budget?: number | null;
  actualBudget?: number | null;
  emailPm?: string;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  
  // UI helpers
  statusColor: string;
  priorityColor: string;
  progressColor: string;
}

// ===== Form Data Types =====
export interface CreateProjectFormData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isPersonal: boolean;
  teamId?: number | null;
}

export interface UpdateProjectFormData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  emailPm?: string;
  budget?: number;
  isPersonal?: boolean;
  teamId?: number | null;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  emailPm: string;
  budget?: number;
  isPersonal: boolean;
  teamId?: number | null;
}

// ===== Summary & Progress Types =====
export interface ProjectSummary {
  id: number;
  name: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  memberCount: number;
  taskCount: number;
  daysRemaining: number;
  isOverdue: boolean;
  statusColor: string;
  priorityColor: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalBudget: number;
  actualBudget: number;
  averageProgress: number;
  projectsByStatus: Record<ProjectStatus, number>;
  projectsByPriority: Record<ProjectPriority, number>;
}

export interface ProjectProgress {
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  onTimePercentage: number;
  timeline: {
    startDate: string;
    endDate: string;
    currentDate: string;
    daysElapsed: number;
    daysRemaining: number;
    totalDays: number;
    timeProgress: number;
    isOnTrack: boolean;
    isOverdue: boolean;
  };
  milestones: ProjectMilestone[];
  teamPerformance: {
    totalMembers: number;
    activeMembers: number;
    averageTasksPerMember: number;
    topPerformers: TeamMemberProgress[];
  };
  recentActivity: ProjectActivity[];
  progressTrend: ProgressDataPoint[];
}

export interface ProjectMilestone {
  id: number;
  name: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  completionDate?: string;
  progress: number;
}

export interface TeamMemberProgress {
  userId: number;
  name: string;
  email: string;
  assignedTasks: number;
  completedTasks: number;
  completionRate: number;
  onTimeRate: number;
}

export interface ProjectActivity {
  id: number;
  type: 'TASK_CREATED' | 'TASK_COMPLETED' | 'MEMBER_ADDED' | 'STATUS_CHANGED';
  description: string;
  userId: number;
  userName: string;
  timestamp: string;
}

export interface ProgressDataPoint {
  date: string;
  tasksCompleted: number;
  cumulativeProgress: number;
  plannedProgress: number;
}

// ===== Task Related Types =====
export interface ProjectTask {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: ProjectPriority;
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTasksResponse {
  projectId: number;
  tasks: ProjectTask[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
}

// ===== API Response Wrappers =====
export interface PaginatedProjectsResponse {
  content: ProjectResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ProjectsApiResponse {
  projects: Project[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ===== Query & Filter Types =====
export interface ProjectQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  ownerId?: number;
  organizationId?: number;
  teamId?: number;
  isPersonal?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  ownerId?: number;
  teamId?: number;
  isPersonal?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// ===== Validation Types =====
export interface ProjectValidationError {
  field: string;
  message: string;
}

export interface ProjectFormErrors {
  nameError?: string;
  descriptionError?: string;
  startDateError?: string;
  endDateError?: string;
  statusError?: string;
  priorityError?: string;
  emailPmError?: string;
  budgetError?: string;
  generalError?: string;
}

// ===== Constants =====
export const PROJECT_STATUSES = Object.values(ProjectStatus);
export const PROJECT_PRIORITIES = Object.values(ProjectPriority);

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNED]: '#6B7280',
  [ProjectStatus.PLANNING]: '#3B82F6', 
  [ProjectStatus.IN_PROGRESS]: '#F59E0B',
  [ProjectStatus.ON_HOLD]: '#EF4444',
  [ProjectStatus.COMPLETED]: '#10B981',
  [ProjectStatus.CANCELLED]: '#6B7280',
  [ProjectStatus.ARCHIVED]: '#6B7280'
};

export const PROJECT_PRIORITY_COLORS: Record<ProjectPriority, string> = {
  [ProjectPriority.LOW]: '#10B981',
  [ProjectPriority.MEDIUM]: '#F59E0B',
  [ProjectPriority.HIGH]: '#EF4444', 
  [ProjectPriority.URGENT]: '#DC2626'
};

// ===== Utility Types =====
export interface ProjectApiResponse<T = any> {
  data?: T;
  message?: string;
  timestamp: string;
  status: number;
}

export interface ProjectMember {
  id: number;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}