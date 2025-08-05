import { useCallback } from "react";
import { TaskListItem, TaskListActions, TaskStatus } from "@/components/TaskList";
import { TaskManagementActions } from "./useTaskManagement";

interface UseTaskActionsProps {
  taskActions: TaskManagementActions;
}

/**
 * Enterprise-grade Task Actions Hook
 * Provides standardized task action handlers for List, Board, and other views
 */
export const useTaskActions = ({ taskActions }: UseTaskActionsProps): TaskListActions => {
  
  // Create task handler with enhanced calendar support
  const handleCreateTask = useCallback((taskData: string | {
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
  } = "New task") => {
    // Handle both string and object formats for backward compatibility
    let taskName = "New task";
    let taskDueDate: string | undefined;
    let taskStartDate: string | undefined;
    let taskEndDate: string | undefined;
    let taskStartTime: string | undefined;
    let taskEndTime: string | undefined;
    let hasStartTime: boolean = false;
    let hasEndTime: boolean = false;
    let taskProject: string | undefined;
    let taskStatus: TaskStatus = "todo";

    if (typeof taskData === 'string') {
      taskName = taskData;
    } else {
      taskName = taskData.name;
      taskDueDate = taskData.dueDate;
      taskStartDate = taskData.startDate;
      taskEndDate = taskData.endDate;
      taskStartTime = taskData.startTime;
      taskEndTime = taskData.endTime;
      hasStartTime = taskData.hasStartTime || false;
      hasEndTime = taskData.hasEndTime || false;
      taskProject = taskData.project;
      taskStatus = taskData.status || "todo";
    }

    // Create task with enhanced calendar data
    const newTaskData = {
      name: taskName,
      description: "",
      assignees: [],
      dueDate: taskDueDate,
      startDate: taskStartDate,
      endDate: taskEndDate,
      startTime: taskStartTime,
      endTime: taskEndTime,
      hasStartTime,
      hasEndTime,
      priority: "medium" as const,
      status: taskStatus,
      project: taskProject,
      tags: [],
    };

    taskActions.addTask(newTaskData);
  }, [taskActions]);

  const handleTaskEdit = useCallback((task: TaskListItem) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Edit task:", task.name);
    }
    // Open task detail panel for editing
    taskActions.openTaskPanel(task);
  }, [taskActions]);

  const handleTaskDelete = useCallback((taskId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Delete task:", taskId);
    }
    taskActions.deleteTask(taskId);
  }, [taskActions]);

  const handleTaskStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Change task status:", taskId, status);
    }
    taskActions.updateTask(taskId, { status });
  }, [taskActions]);

  const handleTaskAssign = useCallback((taskId: string, assigneeId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Assign task:", taskId, assigneeId);
    }
    // In real app, this would handle assignee logic
    // For now, we'll just log it
  }, []);

  const handleBulkAction = useCallback((taskIds: string[], action: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Bulk action:", action, taskIds);
    }
    
    switch (action) {
      case 'delete':
        taskActions.bulkDeleteTasks(taskIds);
        break;
      case 'complete':
        taskActions.bulkUpdateTasks(taskIds, { status: 'done' });
        break;
      case 'archive':
        // Handle archive action
        taskActions.bulkUpdateTasks(taskIds, { status: 'done' }); // For now, treat as complete
        break;
      default:
        console.warn("Unknown bulk action:", action);
    }
  }, [taskActions]);

  // Return the standardized TaskListActions interface
  return {
    onTaskClick: taskActions.openTaskPanel,
    onTaskEdit: handleTaskEdit,
    onTaskDelete: handleTaskDelete,
    onTaskStatusChange: handleTaskStatusChange,
    onTaskAssign: handleTaskAssign,
    onCreateTask: handleCreateTask,
    onBulkAction: handleBulkAction,
  };
};