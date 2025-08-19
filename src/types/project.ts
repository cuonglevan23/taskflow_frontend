// Project Types - Comprehensive TypeScript definitions
export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Backend Project Interface (API Response)
export interface BackendProject {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  ownerId: number;
  emailPm: string;
  organizationId: number;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
  priority?: ProjectPriority;
  progress?: number; // 0-100
  budget?: number;
  actualBudget?: number;
  teamIds?: number[];
  memberCount?: number;
  taskCount?: number;
  completedTaskCount?: number;
}

// Frontend Project Interface (Transformed for UI)
export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date;
  endDate: Date;
  startDateString: string; // Display format
  endDateString: string; // Display format
  ownerId: number;
  emailPm: string;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  duration: number; // days
  isOverdue: boolean;
  daysRemaining: number;
  progress: number; // 0-100
  
  // Additional fields
  budget?: number;
  actualBudget?: number;
  teamIds: number[];
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  
  // UI helpers
  statusColor: string;
  priorityColor: string;
  progressColor: string;
}

// Create Project DTO (Request Body)
export interface CreateProjectDTO {
  name: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status?: ProjectStatus;
  ownerId: number;
  emailPm: string;
  organizationId: number;
  priority?: ProjectPriority;
  budget?: number;
  teamIds?: number[];
}

// Update Project DTO (Request Body)
export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  ownerId?: number;
  emailPm?: string;
  organizationId?: number;
  priority?: ProjectPriority;
  budget?: number;
  actualBudget?: number;
  teamIds?: number[];
}

// Project Form Data (for forms/modals)
export interface ProjectFormData {
  name: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: ProjectStatus;
  priority: ProjectPriority;
  emailPm: string;
  budget?: number;
  teamIds: number[];
}

// Project Summary (for lists/cards)
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

// Project Statistics
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

// Project Progress (detailed progress tracking)
export interface ProjectProgress {
  projectId: number;
  projectName: string;
  
  // Task statistics
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  
  // Progress metrics
  completionPercentage: number;
  onTimePercentage: number;
  qualityScore?: number;
  
  // Timeline information
  timeline: {
    startDate: string;
    endDate: string;
    currentDate: string;
    daysElapsed: number;
    daysRemaining: number;
    totalDays: number;
    timeProgress: number; // percentage of time elapsed
    isOnTrack: boolean;
    isOverdue: boolean;
  };
  
  // Milestones
  milestones: ProjectMilestone[];
  
  // Team performance
  teamPerformance: {
    totalMembers: number;
    activeMembers: number;
    averageTasksPerMember: number;
    topPerformers: TeamMemberProgress[];
  };
  
  // Recent activity
  recentActivity: ProjectActivity[];
  
  // Progress trend (last 30 days)
  progressTrend: ProgressDataPoint[];
}

// Project Milestone
export interface ProjectMilestone {
  id: number;
  name: string;
  description?: string;
  targetDate: string;
  completedDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  progress: number; // 0-100
  tasksCount: number;
  completedTasksCount: number;
  isOverdue: boolean;
}

// Team Member Progress
export interface TeamMemberProgress {
  userId: number;
  userName: string;
  userEmail: string;
  avatar?: string;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  averageTaskDuration: number; // in days
  onTimeDeliveryRate: number;
}

// Project Activity
export interface ProjectActivity {
  id: number;
  type: 'TASK_COMPLETED' | 'MILESTONE_REACHED' | 'MEMBER_ADDED' | 'STATUS_CHANGED' | 'DEADLINE_UPDATED';
  description: string;
  performedBy: {
    userId: number;
    userName: string;
  };
  timestamp: string;
  relatedEntityId?: number;
  relatedEntityType?: 'TASK' | 'MILESTONE' | 'MEMBER';
}

// Progress Data Point (for trend charts)
export interface ProgressDataPoint {
  date: string; // YYYY-MM-DD
  completionPercentage: number;
  tasksCompleted: number;
  tasksAdded: number;
  totalTasks: number;
}

// Project Tasks Response
export interface ProjectTask {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  deadline?: string;
  assigneeIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTasksResponse {
  projectId: number;
  projectName: string;
  tasks: ProjectTask[];
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

// Paginated Projects Response
export interface PaginatedProjectsResponse {
  content: BackendProject[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number; // page size
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// Project Filter/Search Parameters
export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  ownerId?: number;
  organizationId?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string; // search in name/description
  isOverdue?: boolean;
}

// Project Query Parameters
export interface ProjectQueryParams extends ProjectFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// Validation Error
export interface ProjectValidationError {
  field: string;
  message: string;
  code: string;
}

// API Response wrapper
export interface ProjectApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ProjectValidationError[];
}

// Project Member
export interface ProjectMember {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  permissions: string[];
}

// Export all status and priority options for UI
export const PROJECT_STATUSES: ProjectStatus[] = [
  'PLANNED',
  'IN_PROGRESS', 
  'COMPLETED',
  'ON_HOLD',
  'CANCELLED'
];

export const PROJECT_PRIORITIES: ProjectPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH', 
  'URGENT'
];

// Status colors for UI
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  PLANNED: 'blue',
  IN_PROGRESS: 'yellow',
  COMPLETED: 'green',
  ON_HOLD: 'orange',
  CANCELLED: 'red'
};

// Priority colors for UI
export const PROJECT_PRIORITY_COLORS: Record<ProjectPriority, string> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red'
};