"use client";

import { useCallback } from 'react';
import { TaskListActions, TaskListItem } from '@/components/TaskList';
import { useProjectTasks } from '../context/ProjectTasksContext';

/**
 * Custom hook providing task actions for project task list
 * Integrates with ProjectTasksContext for project-specific operations
 */
export function useProjectTaskActions(): TaskListActions {
  const {
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    openTaskPanel,
    addTask,
  } = useProjectTasks();

  const handleTaskClick = useCallback((task: TaskListItem) => {
    openTaskPanel(task);
  }, [openTaskPanel]);

  const handleTaskEdit = useCallback((task: TaskListItem) => {
    openTaskPanel(task);
  }, [openTaskPanel]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  }, [deleteTask]);

  const handleTaskStatusChange = useCallback(async (taskId: string, status: string) => {
    await updateTask(taskId, { status: status as any });
  }, [updateTask]);

  const handleTaskPriorityChange = useCallback(async (taskId: string, priority: string) => {
    await updateTask(taskId, { priority: priority as any });
  }, [updateTask]);

  const handleTaskAssign = useCallback(async (taskId: string, assignedTo: string) => {
    await updateTask(taskId, { assignedTo, assigneeAvatar: assignedTo.substring(0, 2).toUpperCase() });
  }, [updateTask]);

  const handleTaskDueDateChange = useCallback(async (taskId: string, dueDate: string) => {
    const dueDateISO = new Date(dueDate).toISOString();
    await updateTask(taskId, { dueDate, dueDateISO });
  }, [updateTask]);

  const handleBulkStatusChange = useCallback(async (taskIds: string[], status: string) => {
    await bulkUpdateTasks(taskIds, { status: status as any });
  }, [bulkUpdateTasks]);

  const handleBulkPriorityChange = useCallback(async (taskIds: string[], priority: string) => {
    await bulkUpdateTasks(taskIds, { priority: priority as any });
  }, [bulkUpdateTasks]);

  const handleBulkAssign = useCallback(async (taskIds: string[], assignedTo: string) => {
    await bulkUpdateTasks(taskIds, { 
      assignedTo, 
      assigneeAvatar: assignedTo.substring(0, 2).toUpperCase() 
    });
  }, [bulkUpdateTasks]);

  const handleBulkDelete = useCallback(async (taskIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${taskIds.length} tasks?`)) {
      // Delete each task individually (in a real app, you'd have a bulk delete API)
      for (const taskId of taskIds) {
        await deleteTask(taskId);
      }
    }
  }, [deleteTask]);

  const handleTaskCreate = useCallback(async (taskData: Omit<TaskListItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addTask(taskData);
  }, [addTask]);

  return {
    onTaskClick: handleTaskClick,
    onTaskEdit: handleTaskEdit,
    onTaskDelete: handleTaskDelete,
    onTaskStatusChange: handleTaskStatusChange,
    onTaskPriorityChange: handleTaskPriorityChange,
    onTaskAssign: handleTaskAssign,
    onTaskDueDateChange: handleTaskDueDateChange,
    onBulkStatusChange: handleBulkStatusChange,
    onBulkPriorityChange: handleBulkPriorityChange,
    onBulkAssign: handleBulkAssign,
    onBulkDelete: handleBulkDelete,
    onTaskCreate: handleTaskCreate,
  };
}