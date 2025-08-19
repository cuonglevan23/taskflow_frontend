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
  description?: string;
  assignees: TaskAssignee[];
  dueDate?: string;
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
  actionTime?: TaskActionTime; // Personal action time bucket (không ảnh hưởng deadline)
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';
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