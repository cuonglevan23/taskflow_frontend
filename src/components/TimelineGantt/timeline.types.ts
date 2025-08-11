/**
 * Timeline Gantt Types - Centralized type definitions
 */

export interface GanttTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  assignees: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  section: string;
  dependencies?: string[]; // Array of task IDs this task depends on
}

export interface TimelineSection {
  id: string;
  title: string;
  collapsed: boolean;
}

export interface WorkflowConnectionConfig {
  enableConnections: boolean;
  connectionTypes: ('finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish')[];
  allowCycles: boolean;
  autoLayout: boolean;
}

export interface TaskConnection {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag?: number; // Days
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineGanttProps {
  tasks: GanttTask[];
  tasksBySection: Record<string, GanttTask[]>;
  onTaskClick?: (task: GanttTask) => void;
  onTaskMove?: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  onSectionToggle?: (sectionId: string) => void;
  
  // Workflow system props
  enableWorkflow?: boolean;
  initialConnections?: TaskConnection[];
  workflowConfig?: WorkflowConnectionConfig;
  onConnectionCreate?: (connection: TaskConnection) => Promise<void>;
  onConnectionDelete?: (connectionId: string) => Promise<void>;
  onConnectionUpdate?: (connectionId: string, updates: Partial<TaskConnection>) => Promise<void>;
  
  loading?: boolean;
  height?: string;
  className?: string;
}

export type ViewMode = 'month' | 'week' | 'day' | 'year';

export interface TimelineViewConfig {
  mode: ViewMode;
  showWeekends: boolean;
  showNonWorkingDays: boolean;
  timeFormat: '12h' | '24h';
  dateFormat: string;
}