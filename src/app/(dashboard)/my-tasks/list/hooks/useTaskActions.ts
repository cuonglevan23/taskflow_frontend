import { TaskListItem, TaskListActions, TaskStatus } from "@/components/TaskList";

interface UseTaskActionsProps {
  onTaskClick: (task: TaskListItem) => void;
  onCreateTask: (taskData: string | {
    name: string;
    dueDate?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    hasStartTime?: boolean;
    hasEndTime?: boolean;
    project?: string;
    status?: TaskStatus;
  }) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<TaskListItem>) => void;
  onTaskDelete?: (taskId: string) => void;
  onBulkUpdate?: (taskIds: string[], updates: Partial<TaskListItem>) => void;
  onBulkDelete?: (taskIds: string[]) => void;
}

/**
 * Custom hook for managing task actions
 * Handles: all task operations like edit, delete, status change, assign, bulk actions
 */
export const useTaskActions = ({
  onTaskClick,
  onCreateTask,
  onTaskUpdate,
  onTaskDelete,
  onBulkUpdate,
  onBulkDelete,
}: UseTaskActionsProps): TaskListActions => {
  
  const handleTaskEdit = (task: TaskListItem) => {
    console.log("Edit task:", task.name);
    // In real app, this could open an edit modal or inline editing
    // For now, we'll use the task detail panel
    onTaskClick(task);
  };

  const handleTaskDelete = (taskId: string) => {
    console.log("Delete task:", taskId);
    if (onTaskDelete) {
      onTaskDelete(taskId);
    }
    // In real app, this would call API to delete task
  };

  const handleTaskStatusChange = (taskId: string, status: TaskStatus) => {
    console.log("Change task status:", taskId, status);
    if (onTaskUpdate) {
      onTaskUpdate(taskId, { status, updatedAt: new Date().toISOString() });
    }
    // In real app, this would call API to update task status
  };

  const handleTaskAssign = (taskId: string, assigneeId: string) => {
    console.log("Assign task:", taskId, assigneeId);
    // In real app, this would update task assignees
    // For now, we'll just log it
  };

  const handleBulkAction = (taskIds: string[], action: string) => {
    console.log("Bulk action:", action, taskIds);
    
    switch (action) {
      case 'delete':
        if (onBulkDelete) {
          onBulkDelete(taskIds);
        }
        break;
      case 'complete':
        if (onBulkUpdate) {
          onBulkUpdate(taskIds, { status: 'done', updatedAt: new Date().toISOString() });
        }
        break;
      case 'archive':
        // Handle archive action
        break;
      default:
        console.log("Unknown bulk action:", action);
    }
    
    // In real app, these would call API endpoints
  };

  // Return the TaskListActions object
  return {
    onTaskClick,
    onTaskEdit: handleTaskEdit,
    onTaskDelete: handleTaskDelete,
    onTaskStatusChange: handleTaskStatusChange,
    onTaskAssign: handleTaskAssign,
    // onCreateTask,
    onBulkAction: handleBulkAction,
  };
};