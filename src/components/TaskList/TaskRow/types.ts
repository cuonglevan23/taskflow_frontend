import { TaskListItem } from '../types';

export interface TaskRowProps {
  task: TaskListItem;
  onTaskClick?: (task: TaskListItem) => void;
  onMoveTask?: (taskId: string, newBucket: string) => void;
  onTaskEdit?: (task: TaskListItem) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: string) => void;
  onTaskAssign?: (taskId: string, assigneeIdOrEmail: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export interface TaskEditState {
  isEditing: boolean;
  editValue: string;
  showDatePicker: boolean;
  selectedDate: Date | null;
  selectedDates?: Date[]; // For multiple date selection
  startDate?: Date | null; // For date range selection
  endDate?: Date | null;   // For date range selection
  showAssigneeInput: boolean;
  assigneeInputValue: string;
  showUserSuggestions: boolean;
  showProjectInput: boolean;
  projectInputValue: string;
  showProjectSuggestions: boolean;
}

export interface MenuState {
  showMoveMenu: boolean;
  showContextMenu: boolean;
  menuPosition: { x: number; y: number };
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface MockProject {
  id: string;
  name: string;
  color: string;
}