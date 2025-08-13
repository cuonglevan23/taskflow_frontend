// Dynamic Task Color Management Utility
import type { Task } from '@/types/task';
import type { BackendTaskColor } from '@/hooks/useTaskConfig';

export interface TaskColors {
  backgroundColor: string;
  borderColor: string;
  textColor?: string;
}

/**
 * Get task colors dynamically based on backend configuration
 * @param task - Task object with status, priority, and completion info
 * @param colors - Dynamic color configuration from backend
 * @param priorities - Dynamic priority configuration from backend
 * @returns TaskColors object with backgroundColor and borderColor
 */
export const getTaskColors = (
  task: Pick<Task, 'completed' | 'status' | 'priority' | 'isOverdue'>,
  colors: BackendTaskColor[],
  priorities: { code: string; color: string; }[]
): TaskColors => {
  const isCompleted = task.completed || task.status === 'completed';
  const isOverdue = task.isOverdue === true;
  
  // Priority logic: completed > overdue > status-based > priority > default
  
  // 1. Completed tasks - find completed status color
  if (isCompleted) {
    const completedColor = colors.find(c => c.group === 'completed');
    if (completedColor) {
      return {
        backgroundColor: completedColor.backgroundColor,
        borderColor: completedColor.borderColor,
        textColor: completedColor.textColor
      };
    }
  }
  
  // 2. Overdue tasks - use red color or find from config
  if (isOverdue) {
    return {
      backgroundColor: '#dc2626', // Red for overdue
      borderColor: '#991b1b',
      textColor: '#ffffff'
    };
  }
  
  // 3. Status-based colors (primary)
  const statusColor = colors.find(c => c.status === task.status);
  if (statusColor) {
    return {
      backgroundColor: statusColor.backgroundColor,
      borderColor: statusColor.borderColor,
      textColor: statusColor.textColor
    };
  }
  
  // 4. Priority-based colors (fallback)
  const priorityConfig = priorities.find(p => p.code === task.priority);
  if (priorityConfig) {
    return {
      backgroundColor: priorityConfig.color,
      borderColor: priorityConfig.color,
      textColor: '#ffffff'
    };
  }
  
  // 5. Default color
  return {
    backgroundColor: '#6b7280', // Gray
    borderColor: '#4b5563',
    textColor: '#ffffff'
  };
};

/**
 * Get only background color (for simple usage)
 */
export const getTaskBackgroundColor = (
  task: Pick<Task, 'completed' | 'status' | 'priority' | 'isOverdue'>,
  colors: BackendTaskColor[],
  priorities: { code: string; color: string; }[]
): string => {
  return getTaskColors(task, colors, priorities).backgroundColor;
};

/**
 * Get only border color (for simple usage)  
 */
export const getTaskBorderColor = (
  task: Pick<Task, 'completed' | 'status' | 'priority' | 'isOverdue'>,
  colors: BackendTaskColor[],
  priorities: { code: string; color: string; }[]
): string => {
  return getTaskColors(task, colors, priorities).borderColor;
};

/**
 * Get CSS style object for easy React styling
 */
export const getTaskColorStyle = (
  task: Pick<Task, 'completed' | 'status' | 'priority' | 'isOverdue'>,
  colors: BackendTaskColor[],
  priorities: { code: string; color: string; }[]
) => {
  const taskColors = getTaskColors(task, colors, priorities);
  return {
    backgroundColor: taskColors.backgroundColor,
    borderColor: taskColors.borderColor,
    color: taskColors.textColor || '#ffffff'
  };
};