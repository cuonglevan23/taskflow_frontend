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
  
  // Create task handler with enhanced calendar support - ASYNC
  const handleCreateTask = useCallback(async (taskData: string | {
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

    try {
      await taskActions.addTask(newTaskData);
      console.log('✅ Task created successfully');
    } catch (error) {
      console.error('❌ Failed to create task:', error);
    }
  }, [taskActions]);

  const handleTaskEdit = useCallback((task: TaskListItem) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Edit task:", task.name);
    }
    // Open task detail panel for editing
    taskActions.openTaskPanel(task);
  }, [taskActions]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Delete task:", taskId);
    }
    try {
      await taskActions.deleteTask(taskId);
      console.log('✅ Task deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
    }
  }, [taskActions]);

  const handleTaskStatusChange = useCallback(async (taskId: string, status: TaskStatus) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Change task status:", taskId, status);
    }
    try {
      // Update both status and completed for proper synchronization
      await taskActions.updateTask(taskId, { 
        status,
        // Set completed field based on status for home page sync
        ...(status === 'done' && { completed: true }),
        ...(status !== 'done' && { completed: false })
      });
      console.log('✅ Task status updated successfully');
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
    }
  }, [taskActions]);

  const handleTaskAssign = useCallback((taskId: string, assigneeId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Assign task:", taskId, assigneeId);
    }
    // In real app, this would handle assignee logic
    // For now, we'll just log it
  }, []);

  const handleBulkAction = useCallback(async (taskIds: string[], action: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Bulk action:", action, taskIds);
    }
    
    try {
      switch (action) {
        case 'delete':
          await taskActions.bulkDeleteTasks(taskIds);
          console.log('✅ Bulk delete completed successfully');
          break;
        case 'complete':
          await taskActions.bulkUpdateTasks(taskIds, { status: 'done' });
          console.log('✅ Bulk complete completed successfully');
          break;
        case 'archive':
          // Handle archive action
          await taskActions.bulkUpdateTasks(taskIds, { status: 'done' }); // For now, treat as complete
          console.log('✅ Bulk archive completed successfully');
          break;
        default:
          console.warn("Unknown bulk action:", action);
      }
    } catch (error) {
      console.error('❌ Failed to execute bulk action:', action, error);
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