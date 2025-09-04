// Task List Component Types
export interface TaskListConfig {
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  enableGrouping?: boolean;
  defaultGroupBy?: TaskGroupBy;
  showSelection?: boolean;
  columns?: TaskTableColumn[];
}

export interface TaskTableColumn {
  key: keyof TaskListItem | 'actions';
  label: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (task: TaskListItem) => React.ReactNode;
}

export interface TaskListItem {
  id: string;
  name: string;
  title?: string; // Alternative field for task name used in some components
  description?: string;
  assignees: TaskAssignee[];
  assigneeName?: string; // For simple display without full assignee object
  assignedEmails?: string[]; // Email addresses for email-based assignment
  dueDate?: string;
  deadline?: string; // Deadline date for task completion
  startDate?: string; // ISO date string for enhanced calendar
  endDate?: string; // ISO date string for enhanced calendar
  startTime?: string; // Time string like "10:00"
  endTime?: string; // Time string like "10:30"
  hasStartTime?: boolean; // Whether start time is enabled
  hasEndTime?: boolean; // Whether end time is enabled
  priority: TaskPriority;
  status: TaskStatus;
  tags?: string[];
  project?: string;
  projectName?: string; // Project name for display in detail panel
  projectId?: number; // Project ID for linking
  teamId?: string; // Team ID for context
  teamName?: string; // Team name for display
  actionTime?: TaskActionTime; // Personal action time bucket (không ảnh hưởng deadline)
  createdAt: string;
  updatedAt: string;
  completed?: boolean; // Whether task is completed
  commentCount?: number; // Number of comments for this task
  attachments?: TaskAttachment[]; // List of file attachments

  // ✅ NEW: Google Calendar Integration Fields
  googleCalendarEventId?: string; // Google Calendar Event ID để tracking
  googleCalendarEventUrl?: string; // Direct link để user click vào Calendar
  googleMeetLink?: string; // Google Meet link nếu event có meeting
  isSyncedToCalendar?: boolean; // Trạng thái đã sync với calendar
  calendarSyncedAt?: string; // Thời gian sync lần cuối
}

export interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // file size in bytes
  uploadedAt: string; // ISO date string
  uploadedBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'TESTING' | 'BLOCKED' | 'CANCELLED';
export type TaskActionTime = 'recently-assigned' | 'do-today' | 'do-next-week' | 'do-later';
export type TaskGroupBy = 'status' | 'priority' | 'assignee' | 'project' | 'dueDate' | 'assignmentDate' | 'actionTime';

export interface TaskSection {
  id: string;
  title: string;
  tasks: TaskListItem[];
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface TaskListFilters {
  search?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
  project?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface TaskListSort {
  field: keyof TaskListItem;
  direction: 'asc' | 'desc';
}

export interface TaskListActions {
  onTaskClick?: (task: TaskListItem) => void;
  onTaskEdit?: (task: TaskListItem) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
  onTaskAssign?: (taskId: string, assigneeId: string) => void;
  onTaskActionTimeChange?: (taskId: string, actionTime: TaskActionTime) => void;
  onCreateTask?: (taskData?: string | { 
    title: string,
    description: string,
    status: string,
    priority: 'NORMAL',
    startDate: string,
    deadline: string,
    creatorId: string,
    assignedToIds: string[],
    tags: string[],
    actionTime?: TaskActionTime,
  }) => void;
  onBulkAction?: (taskIds: string[], action: string) => void;
}

// Legacy compatibility types
export interface NewTaskDataType {
  name: string;
  assignee: string[];
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
}