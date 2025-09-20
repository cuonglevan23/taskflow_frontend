// Custom hook for project task list operations
import { useCallback, useMemo } from 'react';
import { useProject } from '@/app/(dashboard)/projects/[id]/components/DynamicProjectProvider';
import { useProjectTasksContext } from '@/app/(dashboard)/projects/[id]/context/ProjectTasksProvider';
import { useProjectTaskCreation } from '@/hooks/tasks/useProjectTaskCreation';
import { TaskListItem } from '@/components/TaskList/types';
import { ProjectTaskResponseDto } from '@/services/tasks/projectTaskService';

// Utility functions for data transformation
const mapStatusToBackend = (status: string): 'TODO' | 'IN_PROGRESS' | 'DONE' => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'done':
      return 'DONE';
    case 'in_progress':
    case 'in-progress':
    case 'inprogress':
      return 'IN_PROGRESS';

    case 'todo':
    default:
      return 'TODO';
  }
};

const mapPriorityToBackend = (priority: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  switch (priority.toUpperCase()) {
    case 'HIGH':
      return 'HIGH';
    case 'LOW':
      return 'LOW';
    case 'CRITICAL':
    case 'URGENT':
      return 'CRITICAL';
    case 'MEDIUM':
    default:
      return 'MEDIUM';
  }
};

const convertProjectTaskToTaskListItem = (task: ProjectTaskResponseDto, projectName?: string): TaskListItem => {
  return {
    id: task.id.toString(),
    name: task.title,
    description: task.description || '',
    assignees: [
      ...(task.assigneeName ? [{
        id: task.assigneeId?.toString() || '',
        name: task.assigneeName,
        email: task.assigneeEmail || '',
        avatar: undefined, // Changed from null to undefined to match TaskAssignee type
        avatarUrl: undefined
      }] : []),
      ...(task.additionalAssignees || []).map(assignee => ({
        id: assignee.id.toString(), // Convert number to string to match TaskAssignee type
        name: assignee.name,
        email: assignee.email,
        avatar: undefined, // Changed from null to undefined to match TaskAssignee type
        avatarUrl: undefined
      }))
    ],
    // Include these fields for ProjectTaskDetailPanel's fallback mechanism
    assigneeId: task.assigneeId,
    assigneeName: task.assigneeName,
    assigneeEmail: task.assigneeEmail,
    additionalAssignees: task.additionalAssignees,
    dueDate: task.deadline,
    deadline: task.deadline,
    startDate: task.startDate,
    endDate: task.deadline,
    priority: task.priority as any || 'MEDIUM',
    status: task.status as any || 'TODO',
    tags: [],
    project: task.projectName || projectName || '',
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completed: task.status === 'DONE',
    progressPercentage: task.progressPercentage || 0,
    estimatedHours: task.estimatedHours || 0,
    actualHours: task.actualHours || 0,
  };
};

export const useProjectTaskList = () => {
  const { project } = useProject();
  const projectId = project?.id ? Number(project.id) : null;

  const { createTask: createTaskWithHook } = useProjectTaskCreation(projectId);

  const {
    tasks: projectTasks,
    loading,
    error,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
  } = useProjectTasksContext();

  // Convert project tasks to TaskListItem format
  const taskListItems = useMemo((): TaskListItem[] => {
    if (!projectTasks || !Array.isArray(projectTasks)) return [];

    return projectTasks.map((task: ProjectTaskResponseDto) =>
      convertProjectTaskToTaskListItem(task, project?.name)
    );
  }, [projectTasks, project?.name]);

  // Task operations
  const handleTaskCreate = useCallback(async (taskData: {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    deadline?: string;
    projectId?: string;
    assigneeIds?: string[];
    estimatedHours?: number;
    parentTaskId?: string | number;
  }) => {
    await createTaskWithHook(taskData);
  }, [createTaskWithHook]);

  const handleTaskEdit = useCallback(async (task: TaskListItem) => {
    const taskId = Number(task.id);
    if (isNaN(taskId)) {
      throw new Error(`Invalid task ID: ${task.id}`);
    }

    const updateRequest = {
      title: task.name,
      description: task.description || '',
      status: mapStatusToBackend(task.status),
      priority: mapPriorityToBackend(task.priority),
      startDate: task.startDate || undefined,
      deadline: task.deadline || undefined,
      progressPercentage: task.progressPercentage || 0,
    };

    await updateTask(taskId, updateRequest);
  }, [updateTask]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    const numericTaskId = Number(taskId);
    if (isNaN(numericTaskId)) {
      throw new Error(`Invalid task ID for delete: ${taskId}`);
    }
    await deleteTask(numericTaskId);
  }, [deleteTask]);

  const handleTaskStatusChange = useCallback(async (taskId: string, status: string) => {
    const numericTaskId = Number(taskId);
    if (isNaN(numericTaskId)) {
      throw new Error(`Invalid task ID for status change: ${taskId}`);
    }

    const backendStatus = mapStatusToBackend(status);
    await updateTaskStatus(numericTaskId, backendStatus);
  }, [updateTaskStatus]);

  const handleTaskMove = useCallback(async (taskId: string, bucketId: string) => {
    const statusMapping: { [key: string]: string } = {
      'backlog': 'TODO',
      'todo': 'TODO',
      'in-progress': 'IN_PROGRESS',
      'review': 'REVIEW',
      'done': 'DONE',
      'blocked': 'BLOCKED',
      'testing': 'TESTING'
    };

    const newStatus = statusMapping[bucketId] || bucketId;
    await handleTaskStatusChange(taskId, newStatus);
  }, [handleTaskStatusChange]);

  const handleTaskAssign = useCallback(async (taskId: string, assigneeData: {
    id: string;
    name: string;
    email: string;
  }) => {
    await assignTask(Number(taskId), Number(assigneeData.id));
  }, [assignTask]);

  const handleBulkAction = useCallback(async (taskIds: string[], action: 'delete' | 'complete' | 'archive') => {
    // Implement bulk actions based on project requirements
    switch (action) {
      case 'delete':
        await Promise.all(taskIds.map(id => handleTaskDelete(id)));
        break;
      case 'complete':
        await Promise.all(taskIds.map(id => handleTaskStatusChange(id, 'DONE')));
        break;
      case 'archive':
        // Implement archive logic when needed
        break;
    }
  }, [handleTaskDelete, handleTaskStatusChange]);

  return {
    // Data
    taskListItems,
    loading,
    error,
    project,

    // Operations
    handleTaskCreate,
    handleTaskEdit,
    handleTaskDelete,
    handleTaskStatusChange,
    handleTaskMove,
    handleTaskAssign,
    handleBulkAction,
  };
};
