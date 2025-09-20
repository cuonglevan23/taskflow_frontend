// Custom hook for project task operations management
import { useMemo, useCallback } from 'react';
import { TaskListItem, TaskPriority, TaskStatus } from '@/components/TaskList/types';
import { useProjectTasksContext } from '@/app/(dashboard)/projects/[id]/context/ProjectTasksProvider';

interface UseProjectTaskOperationsProps {
  task: TaskListItem | null;
}

export const useProjectTaskOperations = ({ task }: UseProjectTaskOperationsProps) => {
  const {
    updateTask,
    updateTaskStatus,
    deleteTask,
    refreshTasks,
    tasks
  } = useProjectTasksContext();

  // Get project ID from task data
  const projectId = useMemo(() => {
    if (!task) return null;

    // Try multiple sources for project ID
    let id = task.projectId;

    // If still no ID, try to get from URL
    if (!id) {
      const urlProjectId = window.location.pathname.split('/projects/')[1]?.split('/')[0];
      if (urlProjectId && !isNaN(Number(urlProjectId))) {
        id = Number(urlProjectId); // Convert to number immediately
      }
    }

    // Convert to number if it's a string
    return typeof id === 'string' && !isNaN(Number(id)) ? Number(id) :
           typeof id === 'number' ? id :
           null;
  }, [task]);

  // Get the latest task data from ProjectTasksProvider for real-time updates
  const latestTask = useMemo(() => {
    if (!task) return null;

    // Find the latest version of this task from ProjectTasksProvider
    const updatedTask = tasks.find(t => t.id === Number(task.id));

    if (updatedTask) {
      // Convert ProjectTaskResponseDto to TaskListItem format for compatibility
      return {
        ...task,
        priority: updatedTask.priority as TaskPriority,
        status: updatedTask.status as TaskStatus,
        name: updatedTask.title,
        description: updatedTask.description,
        deadline: updatedTask.deadline,
        startDate: updatedTask.startDate,
        // Keep other fields from original task object
      } as TaskListItem;
    }

    // Fallback to original task if not found in provider
    return task;
  }, [task, tasks]);

  // Task update handlers
  const handleTaskUpdate = useCallback(async (updates: any) => {
    if (!task?.id) return;

    try {
      await updateTask(Number(task.id), updates);
      // Optionally refresh tasks to get latest data
      refreshTasks();
    } catch (error) {
      console.error('Failed to update project task:', error);
      throw error;
    }
  }, [task?.id, updateTask, refreshTasks]);

  const handleTaskStatusUpdate = useCallback(async (newStatus: string) => {
    if (!task?.id) return;

    try {
      await updateTaskStatus(Number(task.id), newStatus);
      refreshTasks();
    } catch (error) {
      console.error('Failed to update project task status:', error);
      throw error;
    }
  }, [task?.id, updateTaskStatus, refreshTasks]);

  const handleTaskDelete = useCallback(async () => {
    if (!task?.id) return;

    try {
      await deleteTask(Number(task.id));
      refreshTasks();
    } catch (error) {
      console.error('Failed to delete project task:', error);
      throw error;
    }
  }, [task?.id, deleteTask, refreshTasks]);

  const handleTaskRefresh = useCallback(() => {
    refreshTasks();
  }, [refreshTasks]);

  // File upload handlers (placeholder - can be extended)
  const handleFileUploadComplete = useCallback((files: any[]) => {
    // Handle file upload completion
    console.log('Files uploaded:', files);
    // Refresh task data after file upload
    refreshTasks();
  }, [refreshTasks]);

  const handleRemoveAttachment = useCallback(async (attachmentId: string) => {
    // Handle attachment removal
    console.log('Remove attachment:', attachmentId);
    // Refresh task data after attachment removal
    refreshTasks();
  }, [refreshTasks]);

  return {
    // Data
    projectId,
    latestTask,

    // Actions
    handleTaskUpdate,
    handleTaskStatusUpdate,
    handleTaskDelete,
    handleTaskRefresh,
    handleFileUploadComplete,
    handleRemoveAttachment,
  };
};
